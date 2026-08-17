// ==========================================
// FIREBASE APP
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// FIRESTORE
// ==========================================

import {
    getFirestore,
    collection,
    doc,
    deleteDoc,
    onSnapshot,
    runTransaction,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN FIREBASE
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCqTIkaoO62UIMZPcRpaQdbdTvE5ZXYKE8",

    authDomain:
        "lista-familiar-3a05d.firebaseapp.com",

    projectId:
        "lista-familiar-3a05d",

    storageBucket:
        "lista-familiar-3a05d.firebasestorage.app",

    messagingSenderId:
        "343672850288",

    appId:
        "1:343672850288:web:771de65690748505b0b1b5"
};


console.log(
    "Firebase projectId:",
    firebaseConfig.projectId
);

console.log(
    "Firebase appId:",
    firebaseConfig.appId
);


// ==========================================
// INICIALIZAR FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);


// ==========================================
// AUTH
// ==========================================

const auth =
    getAuth(app);


const proveedorGoogle =
    new GoogleAuthProvider();


// ==========================================
// FIRESTORE
// ==========================================

const db =
    getFirestore(app);


// ==========================================
// FAMILIA
// ==========================================

const FAMILIA_ID =
    "familia-andoni";


// ==========================================
// REFERENCIA LISTA
// ==========================================

const listaRef =
    collection(
        db,
        "familias",
        FAMILIA_ID,
        "listaCompra"
    );


// ==========================================
// ELEMENTOS HTML
// ==========================================

const botones =
    document.querySelectorAll(".anadir");

const miLista =
    document.getElementById("miLista");

const loginGoogle =
    document.getElementById("loginGoogle");

const usuarioActual =
    document.getElementById("usuarioActual");

const konexioPuntua =
    document.getElementById("konexioPuntua");

const compraHecha =
    document.getElementById("compraHecha");

const modalCompra =
    document.getElementById("modalCompra");

const modalBai =
    document.getElementById("modalBai");

const modalEz =
    document.getElementById("modalEz");

const laburpena =
    document.getElementById("laburpena");


// ==========================================
// LISTA LOCAL
// ==========================================

const listaCompra = {};


// ==========================================
// CATEGORÍAS
// ==========================================

const CATEGORIAS = {

    "fruta-barazkiak": {
        nombre: "🥬 FRUTA ETA BARAZKIAK",
        orden: 1
    },

    "okindegia": {
        nombre: "🍞 OKINDEGIA",
        orden: 2
    },

    "haragia-arraina": {
        nombre: "🥩 HARAGIA ETA ARRAINA",
        orden: 3
    },

    "hozkailua": {
        nombre: "🥛 HOZKAILUA",
        orden: 4
    },

    "despentsa": {
        nombre: "🥫 DESPENTSA",
        orden: 5
    },

    "izoztuak": {
        nombre: "❄️ IZOZTUA",
        orden: 6
    }

};


// ==========================================
// SUBCATEGORÍAS
// ==========================================

const SUBCATEGORIAS = {

    "pasta":
        "🍝 PASTA",

    "lekaleak":
        "🫘 LEKALEAK",

    "olioak":
        "🫒 OLIOAK",

    "gailetak":
        "🍪 GAILETAK"

};


// ==========================================
// CATEGORÍA POR DEFECTO
// Para productos antiguos
// ==========================================

function obtenerCategoriaDefecto(
    producto
) {

    const nombre =
        producto.toLowerCase();


    if (
        nombre.includes("tomate") ||
        nombre.includes("aguacate") ||
        nombre.includes("platano") ||
        nombre.includes("sagar")
    ) {

        return "fruta-barazkiak";

    }


    if (
        nombre.includes("queso") ||
        nombre.includes("gazta") ||
        nombre.includes("leche") ||
        nombre.includes("esnea") ||
        nombre.includes("huevo") ||
        nombre.includes("arrautza") ||
        nombre.includes("yogur")
    ) {

        return "hozkailua";

    }


    if (
        nombre.includes("pan") ||
        nombre.includes("ogi")
    ) {

        return "okindegia";

    }


    if (
        nombre.includes("helado") ||
        nombre.includes("izozki") ||
        nombre.includes("pizza")
    ) {

        return "izoztuak";

    }


    if (
        nombre.includes("pollo") ||
        nombre.includes("oilasko") ||
        nombre.includes("carne") ||
        nombre.includes("haragi") ||
        nombre.includes("pescado") ||
        nombre.includes("arrain")
    ) {

        return "haragia-arraina";

    }


    return "despentsa";
}


// ==========================================
// SUBCATEGORÍA POR DEFECTO
// ==========================================

function obtenerSubcategoriaDefecto(
    producto
) {

    const nombre =
        producto.toLowerCase();


    if (
        nombre.includes("espagueti") ||
        nombre.includes("makarroi") ||
        nombre.includes("fideo")
    ) {

        return "pasta";

    }


    if (
        nombre.includes("dilist") ||
        nombre.includes("garbantz") ||
        nombre.includes("babarr")
    ) {

        return "lekaleak";

    }


    if (
        nombre.includes("olio") ||
        nombre.includes("aceite")
    ) {

        return "olioak";

    }


    if (
        nombre.includes("gaileta") ||
        nombre.includes("galleta")
    ) {

        return "gailetak";

    }


    return "";
}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    const productos =
        Object.values(listaCompra);


    // ======================================
    // LISTA VACÍA
    // ======================================

    if (productos.length === 0) {

        miLista.innerHTML = `

            <div class="lista-hutsa">

                <span>🛒</span>

                <p>
                    Oraindik ez duzu ezer gehitu.
                </p>

            </div>

        `;


        laburpena.textContent =
            "Ez dago produkturik.";

        return;
    }


    // ======================================
    // ORDENAR POR CATEGORÍA
    // ======================================

    productos.sort(
        (a, b) => {

            const ordenA =
                CATEGORIAS[
                    a.categoria
                ]?.orden || 99;

            const ordenB =
                CATEGORIAS[
                    b.categoria
                ]?.orden || 99;

            return ordenA - ordenB;

        }
    );


    // ======================================
    // AGRUPAR
    // ======================================

    const grupos = {};


    productos.forEach(
        producto => {

            if (!grupos[producto.categoria]) {

                grupos[producto.categoria] =
                    [];

            }


            grupos[
                producto.categoria
            ].push(producto);

        }
    );


    // ======================================
    // CONTADORES
    // ======================================

    const totalProductos =
        productos.length;


    const totalUnidades =
        productos.reduce(
            (total, producto) => {

                return total +
                    producto.cantidad;

            },
            0
        );


    laburpena.textContent =
        `${totalProductos} produktu · ${totalUnidades} unitate`;


    // ======================================
    // CREAR CADA CATEGORÍA
    // ======================================

    Object.keys(grupos)
        .sort(
            (a, b) => {

                return (
                    CATEGORIAS[a]?.orden || 99
                ) -
                (
                    CATEGORIAS[b]?.orden || 99
                );

            }
        )
        .forEach(
            categoria => {

                const contenedor =
                    document.createElement("div");

                contenedor.className =
                    "lista-kategoria";


                // ==================================
                // TÍTULO
                // ==================================

                const titulo =
                    document.createElement("div");

                titulo.className =
                    "lista-kategoria-titulo";

                titulo.textContent =
                    CATEGORIAS[
                        categoria
                    ]?.nombre ||
                    "BESTEAK";


                contenedor.appendChild(
                    titulo
                );


                // ==================================
                // PRODUCTOS
                // ==================================

                grupos[categoria].forEach(
                    producto => {

                        const fila =
                            document.createElement("div");

                        fila.className =
                            "lista-produktua";


                        if (
                            producto.comprado
                        ) {

                            fila.classList.add(
                                "comprado"
                            );

                        }


                        // ==========================
                        // CHECK
                        // ==========================

                        const check =
                            document.createElement("button");

                        check.className =
                            "comprado-btn";

                        check.textContent =
                            producto.comprado
                                ? "✓"
                                : "";


                        check.addEventListener(
                            "click",
                            () => {

                                cambiarComprado(
                                    producto
                                );

                            }
                        );


                        // ==========================
                        // NOMBRE
                        // ==========================

                        const nombre =
                            document.createElement("span");

                        nombre.className =
                            "producto-nombre";

                        nombre.textContent =
                            producto.emoji +
                            " " +
                            producto.nombre;


                        // ==========================
                        // MENOS
                        // ==========================

                        const menos =
                            document.createElement("button");

                        menos.className =
                            "cantidad-btn";

                        menos.textContent =
                            "−";


                        menos.addEventListener(
                            "click",
                            () => {

                                cambiarCantidad(
                                    producto.nombre,
                                    -1
                                );

                            }
                        );


                        // ==========================
                        // CANTIDAD
                        // ==========================

                        const cantidad =
                            document.createElement("span");

                        cantidad.className =
                            "cantidad";

                        cantidad.textContent =
                            producto.cantidad;


                        // ==========================
                        // MÁS
                        // ==========================

                        const mas =
                            document.createElement("button");

                        mas.className =
                            "cantidad-btn";

                        mas.textContent =
                            "+";


                        mas.addEventListener(
                            "click",
                            () => {

                                cambiarCantidad(
                                    producto.nombre,
                                    1
                                );

                            }
                        );


                        // ==========================
                        // ELIMINAR
                        // ==========================

                        const eliminar =
                            document.createElement("button");

                        eliminar.className =
                            "eliminar-btn";

                        eliminar.textContent =
                            "Ezabatu";


                        eliminar.addEventListener(
                            "click",
                            () => {

                                eliminarProducto(
                                    producto.nombre
                                );

                            }
                        );


                        // ==========================
                        // AÑADIR
                        // ==========================

                        fila.appendChild(
                            check
                        );

                        fila.appendChild(
                            nombre
                        );

                        fila.appendChild(
                            menos
                        );

                        fila.appendChild(
                            cantidad
                        );

                        fila.appendChild(
                            mas
                        );

                        fila.appendChild(
                            eliminar
                        );


                        contenedor.appendChild(
                            fila
                        );

                    }
                );


                miLista.appendChild(
                    contenedor
                );

            }
        );
}


// ==========================================
// AÑADIR PRODUCTO
// ==========================================

async function añadirProducto(
    producto,
    emoji,
    categoria,
    subcategoria
) {

    const referencia =
        doc(
            db,
            "familias",
            FAMILIA_ID,
            "listaCompra",
            convertirId(producto)
        );


    try {

        await runTransaction(
            db,
            async transaction => {

                const documento =
                    await transaction.get(
                        referencia
                    );


                // ==================================
                // NUEVO
                // ==================================

                if (!documento.exists()) {

                    transaction.set(
                        referencia,
                        {

                            nombre:
                                producto,

                            emoji:
                                emoji,

                            cantidad:
                                1,

                            categoria:
                                categoria ||
                                obtenerCategoriaDefecto(
                                    producto
                                ),

                            subcategoria:
                                subcategoria ||
                                obtenerSubcategoriaDefecto(
                                    producto
                                ),

                            comprado:
                                false

                        }
                    );

                }


                // ==================================
                // EXISTENTE
                // ==================================

                else {

                    const datos =
                        documento.data();


                    transaction.update(
                        referencia,
                        {

                            cantidad:
                                (datos.cantidad || 0) + 1,

                            // Actualizar categoría
                            // si no existía

                            categoria:
                                datos.categoria ||
                                categoria ||
                                obtenerCategoriaDefecto(
                                    producto
                                ),

                            subcategoria:
                                datos.subcategoria ||
                                subcategoria ||
                                obtenerSubcategoriaDefecto(
                                    producto
                                )

                        }
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Error al añadir producto:",
            error
        );

    }
}


// ==========================================
// CAMBIAR CANTIDAD
// ==========================================

async function cambiarCantidad(
    producto,
    cambio
) {

    const referencia =
        doc(
            db,
            "familias",
            FAMILIA_ID,
            "listaCompra",
            convertirId(producto)
        );


    try {

        await runTransaction(
            db,
            async transaction => {

                const documento =
                    await transaction.get(
                        referencia
                    );


                if (!documento.exists()) {

                    return;

                }


                const datos =
                    documento.data();


                const nuevaCantidad =
                    (datos.cantidad || 0) +
                    cambio;


                if (nuevaCantidad <= 0) {

                    transaction.delete(
                        referencia
                    );

                }

                else {

                    transaction.update(
                        referencia,
                        {
                            cantidad:
                                nuevaCantidad
                        }
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Errorea kopurua aldatzean:",
            error
        );

    }
}


// ==========================================
// MARCAR COMO COMPRADO
// ==========================================

async function cambiarComprado(
    producto
) {

    const referencia =
        doc(
            db,
            "familias",
            FAMILIA_ID,
            "listaCompra",
            convertirId(producto.nombre)
        );


    try {

        await runTransaction(
            db,
            async transaction => {

                const documento =
                    await transaction.get(
                        referencia
                    );


                if (!documento.exists()) {

                    return;

                }


                const datos =
                    documento.data();


                transaction.update(
                    referencia,
                    {

                        comprado:
                            !(datos.comprado === true)

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Errorea produktua markatzean:",
            error
        );

    }
}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(
    producto
) {

    const referencia =
        doc(
            db,
            "familias",
            FAMILIA_ID,
            "listaCompra",
            convertirId(producto)
        );


    try {

        await deleteDoc(
            referencia
        );

    }

    catch (error) {

        console.error(
            "Error eliminando producto:",
            error
        );

    }
}


// ==========================================
// BORRAR TODA LA LISTA
// ==========================================

async function borrarTodaLaLista() {

    try {

        const snapshot =
            await getDocs(
                listaRef
            );


        const eliminaciones =
            [];


        snapshot.forEach(
            documento => {

                eliminaciones.push(
                    deleteDoc(
                        documento.ref
                    )
                );

            }
        );


        await Promise.all(
            eliminaciones
        );


        console.log(
            "Erosketa-zerrenda ezabatuta."
        );

    }

    catch (error) {

        console.error(
            "Errorea zerrenda ezabatzean:",
            error
        );

    }
}


// ==========================================
// CONVERTIR PRODUCTO EN ID
// ==========================================

function convertirId(
    producto
) {

    return producto

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


// ==========================================
// BOTONES DE PRODUCTOS
// ==========================================

botones.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                const producto =
                    boton.dataset.producto;

                const emoji =
                    boton.dataset.emoji;

                const categoria =
                    boton.dataset.categoria;

                const subcategoria =
                    boton.dataset.subcategoria;


                añadirProducto(
                    producto,
                    emoji,
                    categoria,
                    subcategoria
                );

            }
        );

    }
);


// ==========================================
// CATEGORÍAS DESPLEGABLES
// ==========================================

document
    .querySelectorAll(".kategoria-burua")
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const categoria =
                        boton.parentElement;


                    categoria.classList.toggle(
                        "irekia"
                    );

                }
            );

        }
    );


// ==========================================
// MODAL COMPRA
// ==========================================

compraHecha.addEventListener(
    "click",
    () => {

        if (
            Object.keys(listaCompra).length === 0
        ) {

            return;

        }


        modalCompra.classList.add(
            "irekia"
        );

    }
);


// ==========================================
// CERRAR MODAL
// ==========================================

modalEz.addEventListener(
    "click",
    () => {

        modalCompra.classList.remove(
            "irekia"
        );

    }
);


// ==========================================
// CONFIRMAR COMPRA
// ==========================================

modalBai.addEventListener(
    "click",
    async () => {

        modalCompra.classList.remove(
            "irekia"
        );


        await borrarTodaLaLista();

    }
);


// ==========================================
// ESTADO DE AUTENTICACIÓN
// ==========================================

let cancelarListener =
    null;


onAuthStateChanged(
    auth,
    usuario => {

        if (usuario) {

            // ==================================
            // USUARIO CONECTADO
            // ==================================

            console.log(
                "Usuario autenticado:",
                usuario.email
            );


            console.log(
                "ID del usuario:",
                usuario.uid
            );


            usuarioActual.textContent =
                "Konektatuta: " +
                usuario.email;


            loginGoogle.textContent =
                "Saioa hasita ✓";


            loginGoogle.disabled =
                true;


            konexioPuntua.classList.add(
                "konektatuta"
            );


            // ==================================
            // LISTENER FIRESTORE
            // ==================================

            if (cancelarListener) {

                cancelarListener();

            }


            cancelarListener =
                onSnapshot(
                    listaRef,

                    snapshot => {

                        // Limpiar

                        for (
                            const producto
                            in listaCompra
                        ) {

                            delete listaCompra[
                                producto
                            ];

                        }


                        // Cargar

                        snapshot.forEach(
                            documento => {

                                const datos =
                                    documento.data();


                                const categoria =
                                    datos.categoria ||
                                    obtenerCategoriaDefecto(
                                        datos.nombre
                                    );


                                const subcategoria =
                                    datos.subcategoria ||
                                    obtenerSubcategoriaDefecto(
                                        datos.nombre
                                    );


                                listaCompra[
                                    datos.nombre
                                ] = {

                                    nombre:
                                        datos.nombre,

                                    emoji:
                                        datos.emoji,

                                    cantidad:
                                        datos.cantidad || 1,

                                    categoria:
                                        categoria,

                                    subcategoria:
                                        subcategoria,

                                    comprado:
                                        datos.comprado === true

                                };

                            }
                        );


                        mostrarLista();

                    },

                    error => {

                        console.error(
                            "Errorea zerrenda kargatzean:",
                            error
                        );

                    }
                );

        }

        else {

            // ==================================
            // SIN USUARIO
            // ==================================

            console.log(
                "Ez dago erabiltzaile autentifikaturik"
            );


            usuarioActual.textContent =
                "Ez duzu saiorik hasi";


            loginGoogle.textContent =
                "Google-rekin sartu";


            loginGoogle.disabled =
                false;


            konexioPuntua.classList.remove(
                "konektatuta"
            );


            // Parar listener

            if (cancelarListener) {

                cancelarListener();

                cancelarListener =
                    null;

            }


            // Vaciar interfaz

            for (
                const producto
                in listaCompra
            ) {

                delete listaCompra[
                    producto
                ];

            }


            mostrarLista();

        }

    }
);


// ==========================================
// LOGIN GOOGLE
// ==========================================

loginGoogle.addEventListener(
    "click",
    async () => {

        console.log(
            "Google bidezko saioa hasten..."
        );


        try {

            await signInWithPopup(
                auth,
                proveedorGoogle
            );


        }

        catch (error) {

            console.error(
                "Errorea saioa hastean:",
                error
            );

        }

    }
);
