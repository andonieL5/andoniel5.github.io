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
    getDocs,
    onSnapshot,
    runTransaction,
    writeBatch
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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
    initializeApp(
        firebaseConfig
    );


// ==========================================
// AUTH
// ==========================================

const auth =
    getAuth(
        app
    );


const proveedorGoogle =
    new GoogleAuthProvider();


// ==========================================
// FIRESTORE
// ==========================================

const db =
    getFirestore(
        app
    );


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

const categoriaBotones =
    document.querySelectorAll(
        ".kategoria-btn"
    );

const azpikategoriaBotones =
    document.querySelectorAll(
        ".azpikategoria-btn"
    );

const botonesAnadir =
    document.querySelectorAll(
        ".anadir"
    );

const botonesGramos =
    document.querySelectorAll(
        ".anadir-gramos"
    );

const miLista =
    document.getElementById(
        "miLista"
    );

const loginGoogle =
    document.getElementById(
        "loginGoogle"
    );

const usuarioActual =
    document.getElementById(
        "usuarioActual"
    );

const konexioPuntua =
    document.getElementById(
        "konexioPuntua"
    );

const compraHecha =
    document.getElementById(
        "compraHecha"
    );

const modalConfirmacion =
    document.getElementById(
        "confirmModal"
    );

const modalBai =
    document.getElementById(
        "modalBai"
    );

const modalEz =
    document.getElementById(
        "modalEz"
    );

const zerrendaHutsa =
    document.getElementById(
        "zerrendaHutsa"
    );

const produktuKopurua =
    document.getElementById(
        "produktuKopurua"
    );


// ==========================================
// LISTA LOCAL
// ==========================================

const listaCompra = {};


// ==========================================
// LISTENER FIRESTORE
// ==========================================

let unsubscribeLista =
    null;


// ==========================================
// NORMALIZAR ID
// ==========================================

function convertirId(
    producto
) {

    return producto
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /ñ/g,
            "n"
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
// REFERENCIA PRODUCTO
// ==========================================

function productoRef(
    producto
) {

    return doc(
        db,
        "familias",
        FAMILIA_ID,
        "listaCompra",
        convertirId(
            producto
        )
    );

}


// ==========================================
// CATEGORIAS PRINCIPALES
// ==========================================

categoriaBotones.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const kategoria =
                    boton.parentElement;

                kategoria.classList.toggle(
                    "zabalik"
                );

            }
        );

    }
);


// ==========================================
// AZPITALDEAK
// ==========================================

azpikategoriaBotones.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const azpikategoria =
                    boton.parentElement;

                azpikategoria.classList.toggle(
                    "zabalik"
                );

            }
        );

    }
);


// ==========================================
// AÑADIR PRODUCTOS
// ==========================================

botonesAnadir.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const producto =
                    boton.dataset.producto;

                const emoji =
                    boton.dataset.emoji;


                añadirProducto(
                    producto,
                    emoji,
                    false
                );

            }
        );

    }
);


// ==========================================
// AÑADIR PRODUCTOS POR GRAMOS
// ==========================================

botonesGramos.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const producto =
                    boton.dataset.producto;

                const emoji =
                    boton.dataset.emoji;


                añadirProducto(
                    producto,
                    emoji,
                    true
                );

            }
        );

    }
);


// ==========================================
// AÑADIR PRODUCTO
// ==========================================

async function añadirProducto(
    producto,
    emoji,
    esPorGramos
) {

    const referencia =
        productoRef(
            producto
        );


    try {

        await runTransaction(
            db,
            async function (
                transaction
            ) {

                const documento =
                    await transaction.get(
                        referencia
                    );


                // ==================================
                // NUEVO PRODUCTO
                // ==================================

                if (
                    !documento.exists()
                ) {

                    transaction.set(
                        referencia,
                        {

                            nombre:
                                producto,

                            emoji:
                                emoji,

                            cantidad:
                                esPorGramos
                                    ? 250
                                    : 1,

                            unidad:
                                esPorGramos
                                    ? "g"
                                    : "unidad"

                        }
                    );


                    return;

                }


                // ==================================
                // PRODUCTO EXISTENTE
                // ==================================

                const datos =
                    documento.data();


                const unidad =
                    datos.unidad ||
                    "unidad";


                const incremento =
                    unidad === "g"
                        ? 250
                        : 1;


                const cantidadActual =
                    Number(
                        datos.cantidad
                    ) || 0;


                transaction.update(
                    referencia,
                    {

                        cantidad:
                            cantidadActual +
                            incremento

                    }
                );

            }
        );

    }

    catch (
        error
    ) {

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
        productoRef(
            producto
        );


    try {

        await runTransaction(
            db,
            async function (
                transaction
            ) {

                const documento =
                    await transaction.get(
                        referencia
                    );


                if (
                    !documento.exists()
                ) {

                    return;

                }


                const datos =
                    documento.data();


                const unidad =
                    datos.unidad ||
                    "unidad";


                const incremento =
                    unidad === "g"
                        ? 250
                        : 1;


                const cantidadActual =
                    Number(
                        datos.cantidad
                    ) || 0;


                const nuevaCantidad =
                    cantidadActual +
                    (
                        incremento *
                        cambio
                    );


                // ==================================
                // SI LLEGA A CERO
                // ==================================

                if (
                    nuevaCantidad <= 0
                ) {

                    transaction.delete(
                        referencia
                    );

                    return;

                }


                transaction.update(
                    referencia,
                    {

                        cantidad:
                            nuevaCantidad

                    }
                );

            }
        );

    }

    catch (
        error
    ) {

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

    try {

        await deleteDoc(
            productoRef(
                producto
            )
        );

    }

    catch (
        error
    ) {

        console.error(
            "Error eliminando producto:",
            error
        );

    }

}


// ==========================================
// ORDEN DE LAS SECCIONES
// ==========================================

const ordenSecciones = {

    "DESPENTSA":
        1,

    "ESNEKIAK":
        2,

    "FRUTAK ETA BARAZKIAK":
        3,

    "HARAGIA ETA ARRAINA":
        4,

    "IZOZTUA":
        5,

    "EDARIAK":
        6,

    "GARBIKETA":
        7,

    "BESTELAKOAK":
        99

};


// ==========================================
// CATEGORIA DEL PRODUCTO
// ==========================================

function obtenerSeccion(
    producto
) {

    const nombre =
        producto.toLowerCase();


    // ==================================
    // DESPENTSA
    // ==================================

    const despentsa = [

        "espagetiak",
        "makarroiak",
        "fideoak",
        "tallarinak",
        "maria doradas",
        "principe",
        "tostadas",
        "chiquilin",
        "lentejak",
        "garbantzuak",
        "babarrunak",
        "atuna",
        "olibak",
        "piperrak",
        "esparragoak",
        "tomate birrindua",
        "tomate frijitua",
        "oliba-olioa",
        "ekilore-olioa",
        "mahats-ozpina",
        "arroza",
        "nesquik",
        "colacao"

    ];


    if (
        despentsa
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "DESPENTSA";

    }


    // ==================================
    // ESNEKIAK
    // ==================================

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


    if (
        esnekiak
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "ESNEKIAK";

    }


    // ==================================
    // FRUTA ETA BARAZKIAK
    // ==================================

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
        frutakBarazkiak
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "FRUTAK ETA BARAZKIAK";

    }


    // ==================================
    // HARAGIA ETA ARRAINA
    // ==================================

    const haragiaArraina = [

        "oilasko",
        "behi-",
        "haragi xehatua",
        "haragi gisatua",
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
        haragiaArraina
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "HARAGIA ETA ARRAINA";

    }


    // ==================================
    // IZOZTUA
    // ==================================

    const izoztuak = [

        "sandwich",
        "magnum",
        "pizza"

    ];


    if (
        izoztuak
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "IZOZTUA";

    }


    // ==================================
    // EDARIAK
    // ==================================

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
        edariak
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "EDARIAK";

    }


    // ==================================
    // GARBIKETA
    // ==================================

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
        garbiketa
            .some(
                item =>
                    nombre.includes(
                        item
                    )
            )
    ) {

        return "GARBIKETA";

    }


    return "BESTELAKOAK";

}


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    const productos =
        Object.values(
            listaCompra
        );


    // ======================================
    // CONTADOR
    // ======================================

    const totalUnidades =
        productos.reduce(
            function (
                total,
                producto
            ) {

                if (
                    producto.unidad === "g"
                ) {

                    return total;

                }


                return total +
                    (
                        Number(
                            producto.cantidad
                        ) || 0
                    );

            },
            0
        );


    const totalProductos =
        productos.length;


    produktuKopurua.textContent =
        totalProductos;


    // ======================================
    // VACÍA
    // ======================================

    if (
        productos.length === 0
    ) {

        zerrendaHutsa.style.display =
            "block";

        return;

    }


    zerrendaHutsa.style.display =
        "none";


    // ======================================
    // AGRUPAR
    // ======================================

    const grupos = {};


    productos.forEach(
        function (
            producto
        ) {

            const seccion =
                obtenerSeccion(
                    producto.nombre
                );


            if (
                !grupos[seccion]
            ) {

                grupos[seccion] =
                    [];

            }


            grupos[seccion].push(
                producto
            );

        }
    );


    // ======================================
    // SECCIONES ORDENADAS
    // ======================================

    Object.keys(
        grupos
    )
    .sort(
        function (
            a,
            b
        ) {

            return (
                ordenSecciones[a] ||
                99
            ) -
            (
                ordenSecciones[b] ||
                99
            );

        }
    )
    .forEach(
        function (
            seccion
        ) {

            const contenedor =
                document.createElement(
                    "div"
                );

            contenedor.className =
                "lista-sekzioa";


            const titulo =
                document.createElement(
                    "div"
                );

            titulo.className =
                "lista-sekzioa-tituloa";

            titulo.textContent =
                seccion;


            contenedor.appendChild(
                titulo
            );


            // ==================================
            // PRODUCTOS
            // ==================================

            grupos[seccion].forEach(
                function (
                    producto
                ) {

                    const fila =
                        document.createElement(
                            "div"
                        );

                    fila.className =
                        "lista-produktua";


                    // =================================
                    // EMOJI
                    // =================================

                    const emoji =
                        document.createElement(
                            "span"
                        );

                    emoji.className =
                        "lista-emoji";

                    emoji.textContent =
                        producto.emoji;


                    // =================================
                    // INFO
                    // =================================

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


                    // =================================
                    // MENOS
                    // =================================

                    const menos =
                        document.createElement(
                            "button"
                        );

                    menos.className =
                        "lista-kontrola";

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


                    // =================================
                    // CANTIDAD
                    // =================================

                    const cantidad =
                        document.createElement(
                            "span"
                        );

                    cantidad.className =
                        "lista-kantitatea";


                    if (
                        producto.unidad === "g"
                    ) {

                        cantidad.textContent =
                            producto.cantidad +
                            " g";

                    }

                    else {

                        cantidad.textContent =
                            producto.cantidad;

                    }


                    // =================================
                    // MÁS
                    // =================================

                    const mas =
                        document.createElement(
                            "button"
                        );

                    mas.className =
                        "lista-kontrola";

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


                    // =================================
                    // ELIMINAR
                    // =================================

                    const eliminar =
                        document.createElement(
                            "button"
                        );

                    eliminar.className =
                        "lista-ezabatu";

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


                    // =================================
                    // CONSTRUIR
                    // =================================

                    fila.appendChild(
                        emoji
                    );

                    fila.appendChild(
                        info
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
// ESCUCHAR FIRESTORE
// ==========================================

function iniciarListenerFirestore() {

    if (
        unsubscribeLista
    ) {

        unsubscribeLista();

        unsubscribeLista =
            null;

    }


    unsubscribeLista =
        onSnapshot(
            listaRef,

            function (
                snapshot
            ) {

                // Limpiar

                Object.keys(
                    listaCompra
                ).forEach(
                    function (
                        key
                    ) {

                        delete listaCompra[
                            key
                        ];

                    }
                );


                // Cargar

                snapshot.forEach(
                    function (
                        documento
                    ) {

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
                                datos.unidad ||
                                "unidad"

                        };

                    }
                );


                mostrarLista();

            },

            function (
                error
            ) {

                console.error(
                    "Errorea zerrenda kargatzean:",
                    error
                );

            }
        );

}


// ==========================================
// LOGIN
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


        }

        catch (
            error
        ) {

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

    function (
        usuario
    ) {

        if (
            usuario
        ) {

            console.log(
                "Usuario autenticado:",
                usuario.email
            );


            console.log(
                "ID del usuario:",
                usuario.uid
            );


            // ==================================
            // USUARIO
            // ==================================

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


            // ==================================
            // FIRESTORE
            // ==================================

            iniciarListenerFirestore();

        }

        else {

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


            if (
                unsubscribeLista
            ) {

                unsubscribeLista();

                unsubscribeLista =
                    null;

            }


            Object.keys(
                listaCompra
            ).forEach(
                function (
                    key
                ) {

                    delete listaCompra[
                        key
                    ];

                }
            );


            mostrarLista();

        }

    }
);


// ==========================================
// MODAL EROSKETA EGINDA
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
                writeBatch(
                    db
                );


            snapshot.forEach(
                function (
                    documento
                ) {

                    batch.delete(
                        documento.ref
                    );

                }
            );


            await batch.commit();


            modalConfirmacion.classList.remove(
                "zabalik"
            );


        }

        catch (
            error
        ) {

            console.error(
                "Errorea zerrenda ezabatzean:",
                error
            );

        }

        finally {

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
    function (
        evento
    ) {

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
// ESCAPE
// ==========================================

document.addEventListener(
    "keydown",
    function (
        evento
    ) {

        if (
            evento.key === "Escape"
        ) {

            modalConfirmacion.classList.remove(
                "zabalik"
            );

        }

    }
);
