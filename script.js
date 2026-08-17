// ==========================================
// FIREBASE APP
// ==========================================

import {
    initializeApp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


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
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN DE FIREBASE
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
    "Firebase apiKey:",
    firebaseConfig.apiKey
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
// FIREBASE AUTH
// ==========================================

const auth =
    getAuth(app);


// ==========================================
// GOOGLE
// ==========================================

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
// REFERENCIA A LA LISTA
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

const compraHecha =
    document.getElementById("compraHecha");

const productosCantidad =
    document.getElementById("produktuKopurua");

const confirmModal =
    document.getElementById("confirmModal");

const confirmBai =
    document.getElementById("confirmBai");

const confirmEz =
    document.getElementById("confirmEz");


// ==========================================
// LISTA LOCAL
// ==========================================

const listaCompra = {};


// ==========================================
// CATEGORÍAS DEL SUPERMERCADO
// ==========================================

const categorias = {

    "DESPENTSA": [

        "Espagetiak",
        "Makarroiak",
        "Fideoak",
        "Maria Doradas",
        "Príncipe",
        "Galleta tostatuak",
        "Chiquilín",
        "Arroza",
        "Lekaleak",
        "Atuna",
        "Olivek",
        "Piperreak",
        "Zainzuriak",
        "Tomate birrindua",
        "Oliba-olioa",
        "Ekilore-olioa",
        "Mahats-ozpina",
        "Nesquik",
        "ColaCao"

    ],


    "ESNEKIAK": [

        "Esnea",
        "Jogurta",
        "Gazta",
        "Gurina",
        "Esnegaina"

    ],


    "FRUTA ETA BARAZKIAK": [

        "Sagarrak",
        "Platanoak",
        "Udareak",
        "Mandarinak",
        "Laranjak",
        "Mahatsak",
        "Tomateak",
        "Aguakateak",
        "Letxuga",
        "Azenarioak",
        "Tipulak",
        "Patatak"

    ],


    "HARAGIA": [

        "Oilaskoa",
        "Txerri-haragia",
        "Behi-haragia",
        "Haragi xehatua"

    ],


    "ARRAINA": [

        "Izokina",
        "Legatza",
        "Atuna freskoa"

    ],


    "IZOZTUAK": [

        "Sandwich izozkia",
        "Magnum",
        "Pizza izoztua"

    ],


    "EDARIAK": [

        "Ura",
        "Coca-Cola",
        "Fanta",
        "Sprite",
        "Aquarius"

    ],


    "GARBIKETA": [

        "Ontzi-garbigarria",
        "Garbigailurako detergentea",
        "Lixiba",
        "Komuneko papera"

    ]

};


// ==========================================
// ENCONTRAR CATEGORÍA
// ==========================================

function obtenerCategoria(producto) {

    for (
        const categoria in categorias
    ) {

        if (
            categorias[categoria].includes(producto)
        ) {

            return categoria;

        }

    }

    return "BESTE BATZUK";

}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    const productos =
        Object.keys(listaCompra);


    // ======================================
    // CONTADOR
    // ======================================

    let total = 0;

    productos.forEach(
        producto => {

            total +=
                listaCompra[producto].cantidad;

        }
    );


    productosCantidad.textContent =
        total;


    // ======================================
    // LISTA VACÍA
    // ======================================

    if (productos.length === 0) {

        const vacia =
            document.createElement("div");

        vacia.className =
            "zerrenda-hutsik";

        vacia.textContent =
            "Zure zerrenda hutsik dago.";

        miLista.appendChild(vacia);

        return;

    }


    // ======================================
    // AGRUPAR POR CATEGORÍA
    // ======================================

    const agrupado = {};


    productos.forEach(
        producto => {

            const categoria =
                obtenerCategoria(producto);


            if (!agrupado[categoria]) {

                agrupado[categoria] = [];

            }


            agrupado[categoria].push(
                producto
            );

        }
    );


    // ======================================
    // ORDEN DE LAS CATEGORÍAS
    // ======================================

    const ordenCategorias = [

        "DESPENTSA",

        "ESNEKIAK",

        "FRUTA ETA BARAZKIAK",

        "HARAGIA",

        "ARRAINA",

        "IZOZTUAK",

        "EDARIAK",

        "GARBIKETA",

        "BESTE BATZUK"

    ];


    // ======================================
    // CREAR SECCIONES
    // ======================================

    ordenCategorias.forEach(
        categoria => {

            if (
                !agrupado[categoria] ||
                agrupado[categoria].length === 0
            ) {

                return;

            }


            const seccion =
                document.createElement("div");

            seccion.className =
                "lista-sekzioa";


            const titulo =
                document.createElement("div");

            titulo.className =
                "lista-sekzioa-titulua";

            titulo.textContent =
                categoria;


            const ul =
                document.createElement("ul");


            agrupado[categoria].forEach(
                producto => {

                    const informacion =
                        listaCompra[producto];


                    const li =
                        document.createElement("li");


                    // ==================================
                    // NOMBRE
                    // ==================================

                    const nombre =
                        document.createElement("span");

                    nombre.className =
                        "nombre";

                    nombre.textContent =
                        informacion.emoji +
                        " " +
                        producto;


                    // ==================================
                    // MENOS
                    // ==================================

                    const botonMenos =
                        document.createElement("button");

                    botonMenos.textContent =
                        "−";


                    botonMenos.addEventListener(
                        "click",
                        () => {

                            cambiarCantidad(
                                producto,
                                -1
                            );

                        }
                    );


                    // ==================================
                    // CANTIDAD
                    // ==================================

                    const cantidad =
                        document.createElement("span");

                    cantidad.className =
                        "cantidad";

                    cantidad.textContent =
                        informacion.cantidad;


                    // ==================================
                    // MÁS
                    // ==================================

                    const botonMas =
                        document.createElement("button");

                    botonMas.textContent =
                        "+";


                    botonMas.addEventListener(
                        "click",
                        () => {

                            cambiarCantidad(
                                producto,
                                1
                            );

                        }
                    );


                    // ==================================
                    // ELIMINAR
                    // ==================================

                    const botonEliminar =
                        document.createElement("button");

                    botonEliminar.className =
                        "ezabatu";

                    botonEliminar.textContent =
                        "Ezabatu";


                    botonEliminar.addEventListener(
                        "click",
                        () => {

                            eliminarProducto(
                                producto
                            );

                        }
                    );


                    // ==================================
                    // AÑADIR ELEMENTOS
                    // ==================================

                    li.appendChild(nombre);

                    li.appendChild(
                        botonMenos
                    );

                    li.appendChild(
                        cantidad
                    );

                    li.appendChild(
                        botonMas
                    );

                    li.appendChild(
                        botonEliminar
                    );


                    ul.appendChild(li);

                }
            );


            seccion.appendChild(
                titulo
            );

            seccion.appendChild(ul);


            miLista.appendChild(
                seccion
            );

        }
    );

}


// ==========================================
// AÑADIR PRODUCTO
// ==========================================

async function añadirProducto(
    producto,
    emoji
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

                    transaction.set(
                        referencia,
                        {

                            nombre:
                                producto,

                            emoji:
                                emoji,

                            cantidad:
                                1

                        }
                    );

                }

                else {

                    const datos =
                        documento.data();


                    transaction.update(
                        referencia,
                        {

                            cantidad:
                                datos.cantidad + 1

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
                    datos.cantidad + cambio;


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
            "Error cambiando cantidad:",
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
// CONVERTIR PRODUCTO EN ID
// ==========================================

function convertirId(
    producto
) {

    return producto
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("á", "a")
        .replaceAll("é", "e")
        .replaceAll("í", "i")
        .replaceAll("ó", "o")
        .replaceAll("ú", "u")
        .replaceAll("ñ", "n")
        .replaceAll("ü", "u");

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


                añadirProducto(
                    producto,
                    emoji
                );

            }
        );

    }
);


// ==========================================
// SUBCATEGORÍAS DESPLEGABLES
// ==========================================

const subcategorias =
    document.querySelectorAll(
        ".subcategoria-boton"
    );


subcategorias.forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                const contenedor =
                    boton.parentElement;


                contenedor.classList.toggle(
                    "abierto"
                );

            }
        );

    }
);


// ==========================================
// FIRESTORE EN TIEMPO REAL
// ==========================================

onSnapshot(
    listaRef,

    snapshot => {

        // Limpiar lista local

        for (
            const producto in listaCompra
        ) {

            delete listaCompra[producto];

        }


        // Cargar productos

        snapshot.forEach(
            documento => {

                const datos =
                    documento.data();


                listaCompra[
                    datos.nombre
                ] = {

                    emoji:
                        datos.emoji,

                    cantidad:
                        datos.cantidad

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


// ==========================================
// LOGIN GOOGLE
// ==========================================

loginGoogle.addEventListener(
    "click",
    async () => {

        try {

            const resultado =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );


            const usuario =
                resultado.user;


            console.log(
                "Usuario conectado:",
                usuario
            );


            console.log(
                "ID del usuario:",
                usuario.uid
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


// ==========================================
// ESTADO DE AUTENTICACIÓN
// ==========================================

onAuthStateChanged(
    auth,

    usuario => {

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
                "🟢 Konektatuta: " +
                usuario.email;


            loginGoogle.textContent =
                "Saioa hasita ✓";


            loginGoogle.disabled =
                true;

        }

        else {

            console.log(
                "No hay usuario conectado"
            );


            usuarioActual.textContent =
                "Ez duzu saiorik hasi";


            loginGoogle.textContent =
                "Google-rekin sartu";


            loginGoogle.disabled =
                false;

        }

    }
);


// ==========================================
// EROSKETA EGINDA
// ==========================================

compraHecha.addEventListener(
    "click",
    () => {

        if (
            Object.keys(listaCompra).length === 0
        ) {

            return;

        }


        confirmModal.classList.add(
            "erakutsi"
        );

    }
);


// ==========================================
// MODALA - EZ
// ==========================================

confirmEz.addEventListener(
    "click",
    () => {

        confirmModal.classList.remove(
            "erakutsi"
        );

    }
);


// ==========================================
// MODALA - BAI
// ==========================================

confirmBai.addEventListener(
    "click",
    async () => {

        try {

            const snapshot =
                await getDocs(listaRef);


            const eliminaciones = [];


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


            confirmModal.classList.remove(
                "erakutsi"
            );


            console.log(
                "Erosketa-zerrenda garbituta."
            );

        }

        catch (error) {

            console.error(
                "Errorea zerrenda ezabatzean:",
                error
            );

        }

    }
);
