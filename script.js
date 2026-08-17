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
    runTransaction
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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

const modalConfirmacion =
    document.getElementById("modalConfirmacion");

const confirmarCompra =
    document.getElementById("confirmarCompra");

const cancelarCompra =
    document.getElementById("cancelarCompra");


// ==========================================
// LISTA LOCAL
// ==========================================

const listaCompra = {};


// ==========================================
// LISTENER DE FIRESTORE
// ==========================================

let cancelarListener = null;


// ==========================================
// CATEGORÍAS DESPLEGABLES
// ==========================================

document
    .querySelectorAll(".kategoria-btn")
    .forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const contenido =
                        boton.parentElement
                            .querySelector(
                                ".kategoria-edukia"
                            );

                    contenido.classList.toggle(
                        "abierta"
                    );

                    boton.classList.toggle(
                        "abierta"
                    );

                }
            );

        }
    );


// ==========================================
// SUBCATEGORÍAS DESPLEGABLES
// ==========================================

document
    .querySelectorAll(".azpikategoria-btn")
    .forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const contenido =
                        boton.parentElement
                            .querySelector(
                                ".azpikategoria-edukia"
                            );

                    contenido.classList.toggle(
                        "abierta"
                    );

                    boton.classList.toggle(
                        "abierta"
                    );

                }
            );

        }
    );


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    const productos =
        Object.entries(listaCompra);


    if (productos.length === 0) {

        const vacia =
            document.createElement("p");

        vacia.className =
            "lista-vacia";

        vacia.textContent =
            "Zerrenda hutsik dago.";

        miLista.appendChild(
            vacia
        );

        return;

    }


    // ======================================
    // SECCIONES
    // ======================================

    const secciones = {

        "Despentsa": [
            "Pasta",
            "Galletak",
            "Arroza",
            "Kontserbak",
            "Olioak eta ozpinak",
            "Nesquik",
            "Colacao"
        ],

        "Esnekiak": [
            "Esne osoa",
            "Esne erdigaingabetua",
            "Yogur",
            "Gazta",
            "Gurina"
        ],

        "Frutak eta Barazkiak": [
            "Sagarra",
            "Platanoa",
            "Laranja",
            "Udarea",
            "Tomatea",
            "Ahuakatea",
            "Letxuga",
            "Azenarioa",
            "Patata"
        ],

        "Haragia eta Arraina": [
            "Oilaskoa",
            "Txerri-haragia",
            "Behi-haragia",
            "Izokina",
            "Legatza"
        ],

        "Izoztuak": [
            "Sandwich izozkia",
            "Magnum",
            "Pizza"
        ],

        "Edariak": [
            "Esnea",
            "Koka-kola",
            "Fanta",
            "Sprite"
        ],

        "Garbiketa": [
            "Komuneko papera",
            "Sukaldeko papera",
            "Ontzi-garbigailua",
            "Garbigarria"
        ]

    };


    // ======================================
    // ORDENATU PRODUKTUAK
    // ======================================

    for (
        const [seccion, nombres]
        of Object.entries(secciones)
    ) {

        const productosSeccion =
            productos.filter(
                ([nombre]) =>
                    nombres.includes(nombre)
            );


        if (
            productosSeccion.length === 0
        ) {
            continue;
        }


        const seccionElemento =
            document.createElement("div");

        seccionElemento.className =
            "lista-sekzioa";


        const titulo =
            document.createElement("div");

        titulo.className =
            "lista-sekzioa-titulua";

        titulo.textContent =
            seccion.toUpperCase();


        seccionElemento.appendChild(
            titulo
        );


        productosSeccion.forEach(
            function ([producto, informacion]) {

                crearProductoLista(
                    seccionElemento,
                    producto,
                    informacion
                );

            }
        );


        miLista.appendChild(
            seccionElemento
        );

    }


    // ======================================
    // PRODUCTOS NO CLASIFICADOS
    // ======================================

    const productosClasificados =
        Object.values(secciones)
            .flat();


    const otros =
        productos.filter(
            ([nombre]) =>
                !productosClasificados
                    .includes(nombre)
        );


    if (otros.length > 0) {

        const seccionElemento =
            document.createElement("div");

        seccionElemento.className =
            "lista-sekzioa";


        const titulo =
            document.createElement("div");

        titulo.className =
            "lista-sekzioa-titulua";

        titulo.textContent =
            "BESTELAKOAK";


        seccionElemento.appendChild(
            titulo
        );


        otros.forEach(
            function ([producto, informacion]) {

                crearProductoLista(
                    seccionElemento,
                    producto,
                    informacion
                );

            }
        );


        miLista.appendChild(
            seccionElemento
        );

    }

}


// ==========================================
// CREAR PRODUCTO EN LISTA
// ==========================================

function crearProductoLista(
    contenedor,
    producto,
    informacion
) {

    const elemento =
        document.createElement("div");

    elemento.className =
        "lista-produktua";


    // Nombre

    const nombre =
        document.createElement("span");

    nombre.className =
        "lista-izena";

    nombre.textContent =
        informacion.emoji +
        " " +
        producto;


    // Botón -

    const menos =
        document.createElement("button");

    menos.textContent =
        "−";

    menos.addEventListener(
        "click",
        async function () {

            await cambiarCantidad(
                producto,
                -1
            );

        }
    );


    // Cantidad

    const cantidad =
        document.createElement("span");

    cantidad.className =
        "lista-kopurua";

    cantidad.textContent =
        informacion.cantidad;


    // Botón +

    const mas =
        document.createElement("button");

    mas.textContent =
        "+";

    mas.addEventListener(
        "click",
        async function () {

            await cambiarCantidad(
                producto,
                1
            );

        }
    );


    // Botón eliminar

    const eliminar =
        document.createElement("button");

    eliminar.className =
        "ezabatu-btn";

    eliminar.textContent =
        "Ezabatu";

    eliminar.addEventListener(
        "click",
        async function () {

            await eliminarProducto(
                producto
            );

        }
    );


    elemento.appendChild(
        nombre
    );

    elemento.appendChild(
        menos
    );

    elemento.appendChild(
        cantidad
    );

    elemento.appendChild(
        mas
    );

    elemento.appendChild(
        eliminar
    );


    contenedor.appendChild(
        elemento
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
            async function (transaction) {

                const documento =
                    await transaction.get(
                        referencia
                    );


                if (!documento.exists()) {

                    transaction.set(
                        referencia,
                        {
                            nombre: producto,
                            emoji: emoji,
                            cantidad: 1
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
// CONVERTIR NOMBRE EN ID
// ==========================================

function convertirId(
    producto
) {

    return producto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

}


// ==========================================
// BOTONES +
// ==========================================

botones.forEach(
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
                    emoji
                );

            }
        );

    }
);


// ==========================================
// ESCUCHAR FIRESTORE
// ==========================================

function iniciarListenerFirestore() {

    if (cancelarListener) {

        cancelarListener();

    }


    const listaRef =
        collection(
            db,
            "familias",
            FAMILIA_ID,
            "listaCompra"
        );


    cancelarListener =
        onSnapshot(
            listaRef,

            function (snapshot) {

                for (
                    const producto in listaCompra
                ) {

                    delete listaCompra[
                        producto
                    ];

                }


                snapshot.forEach(
                    function (documento) {

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

            function (error) {

                console.error(
                    "Errorea zerrenda kargatzean:",
                    error
                );

            }
        );

}


// ==========================================
// LOGIN GOOGLE
// ==========================================

loginGoogle.addEventListener(
    "click",
    async function () {

        try {

            loginGoogle.disabled =
                true;


            const resultado =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );


            console.log(
                "Usuario conectado:",
                resultado.user.email
            );

        }

        catch (error) {

            console.error(
                "Errorea saioa hastean:",
                error
            );


            loginGoogle.disabled =
                false;

        }

    }
);


// ==========================================
// ESTADO DE AUTENTICACIÓN
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
                "🟢 Konektatuta: " +
                usuario.email;


            loginGoogle.textContent =
                "Saioa hasita";


            loginGoogle.disabled =
                true;


            // Iniciar Firestore
            iniciarListenerFirestore();

        }

        else {

            console.log(
                "Ez dago erabiltzailerik konektatuta"
            );


            usuarioActual.textContent =
                "Ez duzu saiorik hasi";


            loginGoogle.textContent =
                "Google-rekin sartu";


            loginGoogle.disabled =
                false;


            // Parar listener
            if (cancelarListener) {

                cancelarListener();

                cancelarListener =
                    null;

            }


            // Limpiar pantalla

            for (
                const producto in listaCompra
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
// MODAL: EROSKETA EGINDA
// ==========================================

compraHecha.addEventListener(
    "click",
    function () {

        modalConfirmacion.classList.add(
            "visible"
        );

    }
);


// ==========================================
// MODAL: EZ
// ==========================================

cancelarCompra.addEventListener(
    "click",
    function () {

        modalConfirmacion.classList.remove(
            "visible"
        );

    }
);


// ==========================================
// MODAL: BAI
// ==========================================

confirmarCompra.addEventListener(
    "click",
    async function () {

        try {

            const productos =
                Object.keys(listaCompra);


            for (
                const producto of productos
            ) {

                await eliminarProducto(
                    producto
                );

            }


            modalConfirmacion.classList.remove(
                "visible"
            );

        }

        catch (error) {

            console.error(
                "Errorea erosketa amaitzean:",
                error
            );

        }

    }
);


// ==========================================
// CERRAR MODAL AL PULSAR FUERA
// ==========================================

modalConfirmacion.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target ===
            modalConfirmacion
        ) {

            modalConfirmacion.classList.remove(
                "visible"
            );

        }

    }
);
