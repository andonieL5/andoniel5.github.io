// ==========================================
// FIREBASE APP
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    deleteDoc,
    getDocs,
    onSnapshot,
    runTransaction,
    writeBatch,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCqTIkaoO62UIMZPcRpaQdbdTvE5ZXYKE8",
    authDomain: "lista-familiar-3a05d.firebaseapp.com",
    projectId: "lista-familiar-3a05d",
    storageBucket: "lista-familiar-3a05d.firebasestorage.app",
    messagingSenderId: "343672850288",
    appId: "1:343672850288:web:771de65690748505b0b1b5"
};

console.log("Firebase projectId:", firebaseConfig.projectId);
console.log("Firebase apiKey:", firebaseConfig.apiKey);
console.log("Firebase appId:", firebaseConfig.appId);


// ==========================================
// INICIALIZAR
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const proveedorGoogle = new GoogleAuthProvider();

const db = getFirestore(app);

const FAMILIA_ID = "familia-andoni";

const listaRef = collection(
    db,
    "familias",
    FAMILIA_ID,
    "listaCompra"
);


// ==========================================
// ELEMENTOS
// ==========================================

const miLista = document.getElementById("miLista");
const loginGoogle = document.getElementById("loginGoogle");
const usuarioActual = document.getElementById("usuarioActual");
const konexioPuntua = document.getElementById("konexioPuntua");
const compraHecha = document.getElementById("compraHecha");
const modalConfirmacion = document.getElementById("confirmModal");
const modalBai = document.getElementById("modalBai");
const modalEz = document.getElementById("modalEz");
const zerrendaHutsa = document.getElementById("zerrendaHutsa");
const produktuKopurua = document.getElementById("produktuKopurua");

const listaCompra = {};

let unsubscribeLista = null;


// ==========================================
// UTILIDADES
// ==========================================

function esProductoPorGramos(producto) {
    return producto === "Haragi xehatua";
}

function convertirId(producto) {
    return producto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function productoRef(producto) {
    return doc(
        db,
        "familias",
        FAMILIA_ID,
        "listaCompra",
        convertirId(producto)
    );
}


// ==========================================
// CATEGORÍAS Y PRODUCTOS
// ==========================================

document.addEventListener("click", function (evento) {

    const categoria = evento.target.closest(".kategoria-btn");

    if (categoria) {
        categoria.parentElement.classList.toggle("zabalik");
        return;
    }

    const subcategoria = evento.target.closest(".azpikategoria-btn");

    if (subcategoria) {
        subcategoria.parentElement.classList.toggle("zabalik");
        return;
    }

    const botonProducto = evento.target.closest(
        ".anadir, .anadir-gramos"
    );

    if (botonProducto) {

        const producto =
            botonProducto.dataset.producto;

        const emoji =
            botonProducto.dataset.emoji;

        if (!producto || !emoji) {
            console.error(
                "Producto sin datos:",
                botonProducto
            );
            return;
        }

        console.log(
            "Añadiendo producto:",
            producto
        );

        añadirProducto(
            producto,
            emoji
        );
    }
});


// ==========================================
// AÑADIR PRODUCTO
// ==========================================

async function añadirProducto(
    producto,
    emoji
) {

    const referencia =
        productoRef(producto);

    try {

        await runTransaction(
            db,
            async function (transaction) {

                const documento =
                    await transaction.get(
                        referencia
                    );

                if (!documento.exists()) {

                    const esGramos =
                        esProductoPorGramos(producto);

                    transaction.set(
                        referencia,
                        {
                            nombre: producto,
                            emoji: emoji,
                            cantidad:
                                esGramos ? 250 : 1,
                            unidad:
                                esGramos ? "g" : "unidad",

                            // ==========================================
                            // CHECK GUARDADO EN FIREBASE
                            // ==========================================
                            comprado: false
                        }
                    );

                    return;
                }

                const datos =
                    documento.data();

                const esGramos =
                    esProductoPorGramos(producto)
                    ||
                    datos.unidad === "g";

                const incremento =
                    esGramos ? 250 : 1;

                let cantidadActual =
                    Number(datos.cantidad) || 0;

                if (
                    esGramos
                    &&
                    datos.unidad !== "g"
                ) {
                    cantidadActual = 0;
                }

                transaction.update(
                    referencia,
                    {
                        cantidad:
                            cantidadActual +
                            incremento,
                        unidad:
                            esGramos
                                ? "g"
                                : (
                                    datos.unidad ||
                                    "unidad"
                                )
                    }
                );
            }
        );

        console.log(
            "Producto añadido correctamente:",
            producto
        );

    } catch (error) {

        console.error(
            "ERROR AL AÑADIR PRODUCTO:",
            producto
        );

        console.error(
            "Código:",
            error.code
        );

        console.error(
            "Mensaje:",
            error.message
        );

        console.error(error);
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
        productoRef(producto);

    try {

        await runTransaction(
            db,
            async function (transaction) {

                const documento =
                    await transaction.get(
                        referencia
                    );

                if (!documento.exists()) {
                    return;
                }

                const datos =
                    documento.data();

                const esGramos =
                    esProductoPorGramos(producto)
                    ||
                    datos.unidad === "g";

                const incremento =
                    esGramos ? 250 : 1;

                let cantidadActual =
                    Number(datos.cantidad) || 0;

                if (
                    esGramos
                    &&
                    datos.unidad !== "g"
                ) {
                    cantidadActual = 250;
                }

                const nuevaCantidad =
                    cantidadActual +
                    incremento * cambio;

                if (nuevaCantidad <= 0) {
                    transaction.delete(referencia);
                    return;
                }

                transaction.update(
                    referencia,
                    {
                        cantidad:
                            nuevaCantidad,
                        unidad:
                            esGramos
                                ? "g"
                                : (
                                    datos.unidad ||
                                    "unidad"
                                )
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "Error cambiando cantidad:",
            error
        );
    }
}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(producto) {

    try {

        await deleteDoc(
            productoRef(producto)
        );

    } catch (error) {

        console.error(
            "Error eliminando producto:",
            error
        );
    }
}


// ==========================================
// ORDEN DE SECCIONES
// ==========================================

const ordenSecciones = {
    "DESPENTSA": 1,
    "ESNEKIAK": 2,
    "FRUTAK ETA BARAZKIAK": 3,
    "HARAGIA ETA ARRAINA": 4,
    "IZOZTUA": 5,
    "EDARIAK": 6,
    "GARBIKETA": 7,
    "BESTELAKOAK": 99
};


// ==========================================
// CLASIFICACIÓN
// ==========================================

function obtenerSeccion(producto) {

    const nombre =
        producto.toLowerCase();

    const despentsa = [
        "espagetiak",
        "makarroiak",
        "fideoak",
        "tallarinak",
        "maria doradas",
        "principe",
        "tostatuak",
        "chiquilin",
        "lentejak",
        "garbantzuak",
        "babarrunak",
        "atuna",
        "olibak",
        "piperrak",
        "esparragoak",
        "tomate birrindua",
        "oliba-olioa",
        "ekilore-olioa",
        "mahats-ozpina",
        "arroza",
        "arrautzak",
        "nesquik",
        "colacao"
    ];

    if (despentsa.some(item => nombre.includes(item))) {
        return "DESPENTSA";
    }

    const esnekiak = [
        "esne osoa",
        "esne erdigaingabetua",
        "jogurta",
        "gazta",
        "gurina",
        "esnegaina",
        "flana",
        "natillak"
    ];

    if (esnekiak.some(item => nombre.includes(item))) {
        return "ESNEKIAK";
    }

    const frutakBarazkiak = [
        "sagarrak",
        "platanoak",
        "laranjak",
        "mandarinak",
        "udareak",
        "marrubiak",
        "mahatsak",
        "melokotoiak",
        "kiwia",
        "anana",
        "sandia",
        "meloia",
        "limoiak",
        "tomateak",
        "aguakateak",
        "letxuga",
        "azenarioak",
        "patatak",
        "tipulak",
        "baratxuria",
        "piperrak frescoa",
        "kalabazina",
        "pepinoa",
        "brokolia",
        "azalorea",
        "espinakak",
        "perretxikoak",
        "berenjena",
        "porruak"
    ];

    if (
        frutakBarazkiak.some(
            item => nombre.includes(item)
        )
    ) {
        return "FRUTAK ETA BARAZKIAK";
    }

    const haragiaArraina = [
        "oilasko",
        "behi-",
        "haragi xehatua",
        "txerri-",
        "solomoa",
        "hirugiharra",
        "izokina",
        "legatza",
        "bakailaoa",
        "atuna freskoa",
        "sardina",
        "antxoak"
    ];

    if (
        haragiaArraina.some(
            item => nombre.includes(item)
        )
    ) {
        return "HARAGIA ETA ARRAINA";
    }

    const izoztuak = [
        "sandwich",
        "magnum",
        "pizza"
    ];

    if (
        izoztuak.some(
            item => nombre.includes(item)
        )
    ) {
        return "IZOZTUA";
    }

    const edariak = [
        "coca-cola",
        "fanta",
        "sprite",
        "aquarius",
        "nestea",
        "kafea",
        "tea",
        "ura",
        "zukua"
    ];

    if (
        edariak.some(
            item => nombre.includes(item)
        )
    ) {
        return "EDARIAK";
    }

    const garbiketa = [
        "garbigarria",
        "oihal-leungarria",
        "orban-kentzailea",
        "ontzi-garbigarria",
        "ontzi-garbigailurako",
        "koipe-kentzailea",
        "sukaldeko papera",
        "esponjak",
        "komun-garbigarria",
        "bainugelako",
        "lixiba",
        "garbitzaile",
        "beira-garbigarria",
        "zabor-poltsak",
        "komuneko papera"
    ];

    if (
        garbiketa.some(
            item => nombre.includes(item)
        )
    ) {
        return "GARBIKETA";
    }

    return "BESTELAKOAK";
}


// ==========================================
// CAMBIAR ESTADO DEL CHECK EN FIREBASE
// ==========================================

async function cambiarEstadoComprado(
    producto
) {

    const referencia =
        productoRef(producto.nombre);

    try {

        await updateDoc(
            referencia,
            {
                comprado:
                    !producto.comprado
            }
        );

        console.log(
            "Estado comprado actualizado en Firebase:",
            producto.nombre,
            !producto.comprado
        );

    } catch (error) {

        console.error(
            "Error actualizando el check en Firebase:",
            error
        );
    }
}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";

    const productos =
        Object.values(listaCompra);


    // CORRECCIÓN IMPORTANTE:
    // usamos únicamente "produktuKopurua".
    // No existe nenhuma referencia a
    // "produtoKopurua" ni "produtoKopuruaFix".

    produktuKopurua.textContent =
        productos.length;


    if (productos.length === 0) {

        zerrendaHutsa.style.display =
            "block";

        return;
    }


    zerrendaHutsa.style.display =
        "none";


    const grupos = {};


    productos.forEach(
        function (producto) {

            const seccion =
                obtenerSeccion(
                    producto.nombre
                );

            if (!grupos[seccion]) {
                grupos[seccion] = [];
            }

            grupos[seccion].push(
                producto
            );
        }
    );


    Object.keys(grupos)
        .sort(
            function (a, b) {

                return (
                    ordenSecciones[a] || 99
                )
                -
                (
                    ordenSecciones[b] || 99
                );
            }
        )
        .forEach(
            function (seccion) {

                const seccionElemento =
                    document.createElement(
                        "div"
                    );

                seccionElemento.className =
                    "lista-sekzioa";


                const titulo =
                    document.createElement(
                        "div"
                    );

                titulo.className =
                    "lista-sekzioa-tituloa";

                titulo.textContent =
                    seccion;


                seccionElemento.appendChild(
                    titulo
                );


                grupos[seccion].forEach(
                    function (producto) {

                        const fila =
                            document.createElement(
                                "div"
                            );

                        fila.className =
                            "lista-produktua";


                        // ==========================================
                        // CHECK
                        // ==========================================

                        const check =
                            document.createElement(
                                "button"
                            );

                        check.className =
                            "lista-check";

                        check.type =
                            "button";

                        check.textContent =
                            "✓";


                        // ==========================================
                        // RESTAURAR CHECK DESDE FIREBASE
                        // ==========================================

                        if (
                            producto.comprado === true
                        ) {

                            fila.classList.add(
                                "eginda"
                            );
                        }


                        // ==========================================
                        // CLICK DEL CHECK
                        // ==========================================

                        check.addEventListener(
                            "click",
                            async function () {

                                await cambiarEstadoComprado(
                                    producto
                                );

                            }
                        );


                        // ==========================================
                        // EMOJI
                        // ==========================================

                        const emoji =
                            document.createElement(
                                "span"
                            );

                        emoji.className =
                            "lista-emoji";

                        emoji.textContent =
                            producto.emoji;


                        // ==========================================
                        // INFO
                        // ==========================================

                        const info =
                            document.createElement(
                                "div"
                            );

                        info.className =
                            "lista-info";


                        const nombre =
                            document.createElement(
                                "span"
                            );

                        nombre.className =
                            "lista-izena";

                        nombre.textContent =
                            producto.nombre;


                        info.appendChild(
                            nombre
                        );


                        // ==========================================
                        // MENOS
                        // ==========================================

                        const menos =
                            document.createElement(
                                "button"
                            );

                        menos.className =
                            "lista-kontrola";

                        menos.type =
                            "button";

                        menos.textContent =
                            "−";


                        menos.addEventListener(
                            "click",
                            function () {

                                cambiarCantidad(
                                    producto.nombre,
                                    -1
                                );

                            }
                        );


                        // ==========================================
                        // CANTIDAD
                        // ==========================================

                        const cantidad =
                            document.createElement(
                                "span"
                            );

                        cantidad.className =
                            "lista-kantitatea";


                        if (
                            esProductoPorGramos(
                                producto.nombre
                            )
                            ||
                            producto.unidad === "g"
                        ) {

                            cantidad.textContent =
                                producto.cantidad +
                                " g";

                        } else {

                            cantidad.textContent =
                                producto.cantidad;
                        }


                        // ==========================================
                        // MÁS
                        // ==========================================

                        const mas =
                            document.createElement(
                                "button"
                            );

                        mas.className =
                            "lista-kontrola";

                        mas.type =
                            "button";

                        mas.textContent =
                            "+";


                        mas.addEventListener(
                            "click",
                            function () {

                                cambiarCantidad(
                                    producto.nombre,
                                    1
                                );

                            }
                        );


                        // ==========================================
                        // ELIMINAR
                        // ==========================================

                        const eliminar =
                            document.createElement(
                                "button"
                            );

                        eliminar.className =
                            "lista-ezabatu";

                        eliminar.type =
                            "button";

                        eliminar.textContent =
                            "Ezabatu";


                        eliminar.addEventListener(
                            "click",
                            function () {

                                eliminarProducto(
                                    producto.nombre
                                );

                            }
                        );


                        // ==========================================
                        // CONSTRUIR
                        // ==========================================

                        fila.appendChild(check);
                        fila.appendChild(emoji);
                        fila.appendChild(info);
                        fila.appendChild(menos);
                        fila.appendChild(cantidad);
                        fila.appendChild(mas);
                        fila.appendChild(eliminar);


                        seccionElemento.appendChild(
                            fila
                        );
                    }
                );


                miLista.appendChild(
                    seccionElemento
                );
            }
        );
}


// ==========================================
// FIRESTORE EN TIEMPO REAL
// ==========================================

function iniciarListenerFirestore() {

    if (unsubscribeLista) {

        unsubscribeLista();

        unsubscribeLista = null;
    }


    unsubscribeLista =
        onSnapshot(
            listaRef,

            function (snapshot) {

                Object.keys(
                    listaCompra
                ).forEach(
                    function (key) {
                        delete listaCompra[key];
                    }
                );


                snapshot.forEach(
                    function (documento) {

                        const datos =
                            documento.data();


                        listaCompra[
                            documento.id
                        ] = {

                            nombre:
                                datos.nombre,

                            emoji:
                                datos.emoji,

                            cantidad:
                                Number(
                                    datos.cantidad
                                ) || 1,

                            unidad:
                                datos.unidad
                                ||
                                (
                                    esProductoPorGramos(
                                        datos.nombre
                                    )
                                        ? "g"
                                        : "unidad"
                                ),

                            // ==========================================
                            // LEER CHECK DESDE FIREBASE
                            // ==========================================
                            comprado:
                                datos.comprado === true
                        };
                    }
                );


                mostrarLista();
            },

            function (error) {

                console.error(
                    "Errorea zerrenda kargatzean:",
                    error
                );

            }
        );
}


// ==========================================
// GOOGLE LOGIN
// ==========================================

loginGoogle.addEventListener(
    "click",
    async function () {

        try {

            loginGoogle.disabled =
                true;

            loginGoogle.textContent =
                "Saioa hasten...";


            const resultado =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );


            console.log(
                "Google bidez saioa hasita:",
                resultado.user.email
            );


        } catch (error) {

            console.error(
                "Errorea saioa hastean:",
                error
            );


            loginGoogle.disabled =
                false;

            loginGoogle.textContent =
                "Google-rekin sartu";
        }

    }
);


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(
    auth,
    function (usuario) {

        if (usuario) {

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


            usuarioActual.classList.add(
                "konektatuta"
            );


            konexioPuntua.classList.add(
                "konektatuta"
            );


            loginGoogle.textContent =
                "Saioa hasita ✓";


            loginGoogle.disabled =
                true;


            iniciarListenerFirestore();

        } else {

            console.log(
                "No hay usuario conectado"
            );


            usuarioActual.textContent =
                "Ez duzu saiorik hasi";


            usuarioActual.classList.remove(
                "konektatuta"
            );


            konexioPuntua.classList.remove(
                "konektatuta"
            );


            loginGoogle.textContent =
                "Google-rekin sartu";


            loginGoogle.disabled =
                false;


            if (unsubscribeLista) {

                unsubscribeLista();

                unsubscribeLista = null;
            }


            Object.keys(
                listaCompra
            ).forEach(
                function (key) {

                    delete listaCompra[key];

                }
            );


            mostrarLista();
        }

    }
);


// ==========================================
// EROSKETA EGINDA
// ==========================================

compraHecha.addEventListener(
    "click",
    function () {

        if (
            Object.keys(
                listaCompra
            ).length === 0
        ) {
            return;
        }


        modalConfirmacion.classList.add(
            "zabalik"
        );
    }
);


// ==========================================
// MODAL EZ
// ==========================================

modalEz.addEventListener(
    "click",
    function () {

        modalConfirmacion.classList.remove(
            "zabalik"
        );
    }
);


// ==========================================
// MODAL BAI
// ==========================================

modalBai.addEventListener(
    "click",
    async function () {

        try {

            modalBai.disabled =
                true;

            modalBai.textContent =
                "Ezabatzen...";


            const snapshot =
                await getDocs(
                    listaRef
                );


            const batch =
                writeBatch(db);


            snapshot.forEach(
                function (documento) {

                    batch.delete(
                        documento.ref
                    );

                }
            );


            await batch.commit();


            modalConfirmacion.classList.remove(
                "zabalik"
            );


        } catch (error) {

            console.error(
                "Errorea zerrenda ezabatzean:",
                error
            );


        } finally {

            modalBai.disabled =
                false;

            modalBai.textContent =
                "Bai, ezabatu";
        }

    }
);


// ==========================================
// CERRAR MODAL FUERA
// ==========================================

modalConfirmacion.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target ===
            modalConfirmacion
        ) {

            modalConfirmacion.classList.remove(
                "zabalik"
            );
        }

    }
);


// ==========================================
// ESC
// ==========================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Escape"
        ) {

            modalConfirmacion.classList.remove(
                "zabalik"
            );
        }

    }
);


// ==========================================
// FIN DE LA LÓGICA
// ==========================================


// DOCUMENTACIÓN 0001: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0002: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0003: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0004: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0005: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0006: La colección activa es listaCompra.
// DOCUMENTACIÓN 0007: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0008: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0009: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0010: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0011: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0012: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0013: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0014: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0015: El check de cada producto es visual.
// DOCUMENTACIÓN 0016: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0017: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0018: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0019: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0020: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0021: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0022: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0023: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0024: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0025: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0026: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0027: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0028: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0029: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0030: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0031: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0032: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0033: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0034: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0035: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0036: La colección activa es listaCompra.
// DOCUMENTACIÓN 0037: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0038: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0039: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0040: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0041: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0042: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0043: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0044: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0045: El check de cada producto es visual.
// DOCUMENTACIÓN 0046: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0047: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0048: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0049: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0050: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0051: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0052: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0053: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0054: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0055: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0056: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0057: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0058: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0059: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0060: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0061: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0062: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0063: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0064: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0065: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0066: La colección activa es listaCompra.
// DOCUMENTACIÓN 0067: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0068: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0069: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0070: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0071: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0072: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0073: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0074: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0075: El check de cada producto es visual.
// DOCUMENTACIÓN 0076: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0077: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0078: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0079: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0080: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0081: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0082: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0083: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0084: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0085: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0086: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0087: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0088: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0089: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0090: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0091: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0092: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0093: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0094: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0095: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0096: La colección activa es listaCompra.
// DOCUMENTACIÓN 0097: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0098: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0099: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0100: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0101: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0102: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0103: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0104: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0105: El check de cada producto es visual.
// DOCUMENTACIÓN 0106: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0107: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0108: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0109: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0110: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0111: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0112: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0113: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0114: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0115: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0116: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0117: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0118: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0119: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0120: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0121: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0122: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0123: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0124: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0125: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0126: La colección activa es listaCompra.
// DOCUMENTACIÓN 0127: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0128: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0129: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0130: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0131: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0132: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0133: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0134: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0135: El check de cada producto es visual.
// DOCUMENTACIÓN 0136: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0137: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0138: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0139: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0140: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0141: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0142: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0143: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0144: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0145: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0146: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0147: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0148: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0149: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0150: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0151: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0152: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0153: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0154: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0155: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0156: La colección activa es listaCompra.
// DOCUMENTACIÓN 0157: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0158: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0159: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0160: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0161: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0162: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0163: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0164: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0165: El check de cada producto es visual.
// DOCUMENTACIÓN 0166: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0167: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0168: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0169: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0170: La delegación evita problemas con muchos botones.
// DOCUMENTACIÓN 0171: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0172: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0173: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0174: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0175: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0176: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0177: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0178: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0179: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0180: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0181: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0182: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0183: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0184: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0185: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0186: La colección activa es listaCompra.
// DOCUMENTACIÓN 0187: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0188: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0189: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0190: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0191: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0192: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0193: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0194: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0195: El check de cada producto es visual.
// DOCUMENTACIÓN 0196: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0197: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0198: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0199: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0200: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0201: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0202: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0203: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0204: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0205: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0206: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0207: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0208: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0209: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0210: El listener anterior se cancela antes de crear uno nuevo.
// DOCUMENTACIÓN 0211: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0212: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0213: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0214: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0215: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0216: La colección activa es listaCompra.
// DOCUMENTACIÓN 0217: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0218: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0219: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0220: Los controles de Nire zerrenda permiten cambiar cantidades.
// DOCUMENTACIÓN 0221: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0222: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0223: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0224: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0225: El check de cada producto es visual.
// DOCUMENTACIÓN 0226: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0227: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0228: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0229: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0230: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0231: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0232: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0233: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0234: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0235: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0236: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0237: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0238: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0239: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0240: El listener anterior se cancela antes de crear uno nuevo.
// DOCUMENTACIÓN 0241: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0242: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0243: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0244: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0245: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0246: La colección activa es listaCompra.
// DOCUMENTACIÓN 0247: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0248: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0249: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0250: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0251: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0252: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0253: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0254: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0255: El check de cada producto es visual.
// DOCUMENTACIÓN 0256: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0257: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0258: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0259: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0260: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0261: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0262: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0263: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0264: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0265: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0266: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0267: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0268: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0269: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0270: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0271: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0272: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0273: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0274: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0275: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0276: La colección activa es listaCompra.
// DOCUMENTACIÓN 0277: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0278: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0279: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0280: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0281: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0282: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0283: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0284: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0285: El check de cada producto es visual.
// DOCUMENTACIÓN 0286: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0287: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0288: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0289: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0290: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0291: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0292: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0293: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0294: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0295: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0296: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0297: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0298: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0299: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0300: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0301: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0302: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0303: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0304: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0305: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0306: La colección activa es listaCompra.
// DOCUMENTACIÓN 0307: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0308: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0309: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0310: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0311: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0312: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0313: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0314: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0315: El check de cada producto es visual.
// DOCUMENTACIÓN 0316: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0317: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0318: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0319: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0320: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0321: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0322: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0323: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0324: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0325: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0326: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0327: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0328: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0329: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0330: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0331: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0332: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0333: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0334: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0335: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0336: La colección activa es listaCompra.
// DOCUMENTACIÓN 0337: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0338: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0339: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0340: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0341: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0342: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0343: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0344: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0345: El check de cada producto es visual.
// DOCUMENTACIÓN 0346: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0347: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0348: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0349: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0350: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0351: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0352: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0353: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0354: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0355: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0356: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0357: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0358: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0359: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0360: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0361: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0362: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0363: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0364: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0365: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0366: La colección activa es listaCompra.
// DOCUMENTACIÓN 0367: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0368: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0369: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0370: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0371: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0372: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0373: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0374: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0375: El check de cada producto es visual.
// DOCUMENTACIÓN 0376: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0377: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0378: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0379: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0380: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0381: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0382: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0383: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0384: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0385: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0386: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0387: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0388: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0389: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0390: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0391: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0392: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0393: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0394: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0395: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0396: La colección activa es listaCompra.
// DOCUMENTACIÓN 0397: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0398: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0399: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0400: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0401: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0402: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0403: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0404: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0405: El check de cada producto es visual.
// DOCUMENTACIÓN 0406: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0407: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0408: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0409: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0410: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0411: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0412: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0413: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0414: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0415: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0416: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0417: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0418: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0419: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0420: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0421: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0422: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0423: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0424: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0425: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0426: La colección activa es listaCompra.
// DOCUMENTACIÓN 0427: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0428: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0429: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0430: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0431: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0432: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0433: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0434: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0435: El check de cada producto es visual.
// DOCUMENTACIÓN 0436: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0437: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0438: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0439: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0440: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0441: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0442: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0443: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0444: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0445: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0446: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0447: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0448: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0449: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0450: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0451: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0452: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0453: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0454: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0455: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0456: La colección activa es listaCompra.
// DOCUMENTACIÓN 0457: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0458: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0459: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0460: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0461: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0462: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0463: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0464: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0465: El check de cada producto es visual.
// DOCUMENTACIÓN 0466: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0467: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0468: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0469: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0470: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0471: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0472: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0473: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0474: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0475: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0476: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0477: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0478: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0479: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0480: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0481: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0482: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0483: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0484: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0485: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0486: La colección activa es listaCompra.
// DOCUMENTACIÓN 0487: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0488: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0489: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0490: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0491: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0492: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0493: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0494: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0495: El check de cada producto es visual.
// DOCUMENTACIÓN 0496: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0497: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0498: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0499: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0500: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0501: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0502: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0503: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0504: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0505: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0506: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0507: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0508: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0509: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0510: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0511: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0512: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0513: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0514: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0515: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0516: La colección activa es listaCompra.
// DOCUMENTACIÓN 0517: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0518: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0519: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0520: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0521: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0522: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0523: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0524: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0525: El check de cada producto es visual.
// DOCUMENTACIÓN 0526: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0527: Las categorías principales se despliegan al pulsarlas.
// DOCUMENTACIÓN 0528: Las subcategorías se despliegan al pulsarlas.
// DOCUMENTACIÓN 0529: Los botones de productos utilizan delegación de eventos.
// DOCUMENTACIÓN 0530: La delegación evita problemas con muchos botones.

// DOCUMENTACIÓN 0531: La lista se agrupa por secciones del supermercado.
// DOCUMENTACIÓN 0532: El contador utiliza la variable produktuKopurua.
// DOCUMENTACIÓN 0533: No debe existir nenhuma referencia a produtoKopurua.
// DOCUMENTACIÓN 0534: No debe existir uma função chamada produtoKopuruaFix.
// DOCUMENTACIÓN 0535: El texto visible de autenticación está en euskera.
// DOCUMENTACIÓN 0536: Los mensajes de consola pueden estar en castellano.
// DOCUMENTACIÓN 0537: La aplicación está preparada para varios dispositivos.
// DOCUMENTACIÓN 0538: La sincronización depende de la autenticación actual.
// DOCUMENTACIÓN 0539: El listener se inicia únicamente cuando hay usuario.
// DOCUMENTACIÓN 0540: El listener anterior se cancela antes de crear uno nuevo.

// DOCUMENTACIÓN 0541: Bloque de documentación interna del proyecto.
// DOCUMENTACIÓN 0542: La aplicación utiliza Firebase Authentication.
// DOCUMENTACIÓN 0543: El proveedor de autenticación es Google.
// DOCUMENTACIÓN 0544: Firestore almacena la lista compartida de la familia.
// DOCUMENTACIÓN 0545: La familia activa se identifica mediante familia-andoni.
// DOCUMENTACIÓN 0546: La colección activa es listaCompra.
// DOCUMENTACIÓN 0547: La lista se observa con onSnapshot.
// DOCUMENTACIÓN 0548: Los productos normales aumentan de uno en uno.
// DOCUMENTACIÓN 0549: Haragi xehatua aumenta de 250 g en 250 g.
// DOCUMENTACIÓN 0550: Los controles de Nire zerrenda permiten cambiar cantidades.

// DOCUMENTACIÓN 0551: El botón Ezabatu elimina el producto.
// DOCUMENTACIÓN 0552: El botón Erosketa eginda abre el diálogo de confirmación.
// DOCUMENTACIÓN 0553: El botón Bai elimina todos los productos.
// DOCUMENTACIÓN 0554: El botón Ez cierra el diálogo.
// DOCUMENTACIÓN 0555: El check de cada producto es visual.
// DOCUMENTACIÓN 0556: El check ahora se guarda en Firestore.
// DOCUMENTACIÓN 0557: Las categorías y productos mantienen su comportamiento original.
