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
// PROVEEDOR GOOGLE
// ==========================================

const proveedorGoogle =
    new GoogleAuthProvider();


// ==========================================
// FIRESTORE
// ==========================================

const db =
    getFirestore(app);


// ==========================================
// IDENTIFICADOR DE LA FAMILIA
// ==========================================

const FAMILIA_ID =
    "familia-andoni";


// ==========================================
// COLECCIÓN DE LA LISTA FAMILIAR
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


// Estado de conexión

const puntoConexion =
    document.getElementById("puntoConexion");

const textoConexion =
    document.getElementById("textoConexion");


// ==========================================
// MODAL DE COMPRA
// ==========================================

const modalCompra =
    document.getElementById("modalCompra");

const confirmarCompra =
    document.getElementById("confirmarCompra");

const cancelarCompra =
    document.getElementById("cancelarCompra");

const compraHecha =
    document.getElementById("compraHecha");


// ==========================================
// LISTA LOCAL EN MEMORIA
// ==========================================

const listaCompra = {};


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    for (
        const producto in listaCompra
    ) {

        const informacion =
            listaCompra[producto];


        // ======================================
        // CREAR ELEMENTO
        // ======================================

        const nuevoProducto =
            document.createElement("li");


        // ======================================
        // NOMBRE
        // ======================================

        const nombre =
            document.createElement("span");


        nombre.textContent =
            informacion.emoji +
            " " +
            producto;


        // ======================================
        // BOTÓN -
        // ======================================

        const botonMenos =
            document.createElement("button");


        botonMenos.textContent =
            "−";


        // ======================================
        // CANTIDAD
        // ======================================

        const cantidad =
            document.createElement("span");


        cantidad.textContent =
            informacion.cantidad;


        // ======================================
        // BOTÓN +
        // ======================================

        const botonMas =
            document.createElement("button");


        botonMas.textContent =
            "+";


        // ======================================
        // BOTÓN ELIMINAR
        // ======================================

        const botonEliminar =
            document.createElement("button");


        botonEliminar.textContent =
            "Ezabatu";


        // ======================================
        // BOTÓN MENOS
        // ======================================

        botonMenos.addEventListener(
            "click",
            async function () {

                await cambiarCantidad(
                    producto,
                    -1
                );

            }
        );


        // ======================================
        // BOTÓN MÁS
        // ======================================

        botonMas.addEventListener(
            "click",
            async function () {

                await cambiarCantidad(
                    producto,
                    1
                );

            }
        );


        // ======================================
        // BOTÓN ELIMINAR
        // ======================================

        botonEliminar.addEventListener(
            "click",
            async function () {

                await eliminarProducto(
                    producto
                );

            }
        );


        // ======================================
        // CONSTRUIR PRODUCTO
        // ======================================

        nuevoProducto.appendChild(
            nombre
        );


        nuevoProducto.appendChild(
            botonMenos
        );


        nuevoProducto.appendChild(
            cantidad
        );


        nuevoProducto.appendChild(
            botonMas
        );


        nuevoProducto.appendChild(
            botonEliminar
        );


        miLista.appendChild(
            nuevoProducto
        );

    }

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
            async (transaction) => {

                const documento =
                    await transaction.get(
                        referencia
                    );


                // ==================================
                // PRODUCTO NUEVO
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
                                1
                        }
                    );

                }


                // ==================================
                // PRODUCTO EXISTENTE
                // ==================================

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
            "Errorea produktua gehitzean:",
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
            async (transaction) => {

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


                // ==================================
                // SI LLEGA A CERO
                // ==================================

                if (
                    nuevaCantidad <= 0
                ) {

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
            "Errorea kantitatea aldatzean:",
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
            "Errorea produktua ezabatzean:",
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
        .replaceAll("ñ", "n");

}


// ==========================================
// BOTONES DE PRODUCTOS
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
// ESCUCHAR FIRESTORE EN TIEMPO REAL
// ==========================================

onSnapshot(
    listaRef,

    function (snapshot) {

        // ======================================
        // LIMPIAR LISTA LOCAL
        // ======================================

        for (
            const producto in listaCompra
        ) {

            delete listaCompra[producto];

        }


        // ======================================
        // CARGAR DATOS DE FIRESTORE
        // ======================================

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


        // ======================================
        // ACTUALIZAR PANTALLA
        // ======================================

        mostrarLista();

    },


    function (error) {

        console.error(
            "Errorea Firestore:",
            error
        );

    }
);


// ==========================================
// LOGIN CON GOOGLE
// ==========================================

loginGoogle.addEventListener(
    "click",
    async function () {

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
                "Errorea Google-rekin saioa hastean:",
                error
            );

        }

    }
);


// ==========================================
// ESTADO DE CONEXIÓN
// ==========================================

function ponerConexionOnline() {

    if (puntoConexion) {

        puntoConexion.style.backgroundColor =
            "#22c55e";

        puntoConexion.style.boxShadow =
            "0 0 0 4px rgba(34, 197, 94, 0.12)";

    }


    if (textoConexion) {

        textoConexion.textContent =
            "Linean";

    }

}


function ponerConexionOffline() {

    if (puntoConexion) {

        puntoConexion.style.backgroundColor =
            "#999";

        puntoConexion.style.boxShadow =
            "none";

    }


    if (textoConexion) {

        textoConexion.textContent =
            "Konexiorik gabe";

    }

}


// ==========================================
// DETECTAR INTERNET
// ==========================================

window.addEventListener(
    "online",
    function () {

        ponerConexionOnline();

    }
);


window.addEventListener(
    "offline",
    function () {

        ponerConexionOffline();

    }
);


// Estado inicial

if (navigator.onLine) {

    ponerConexionOnline();

}

else {

    ponerConexionOffline();

}


// ==========================================
// SABER SI HAY UN USUARIO CONECTADO
// ==========================================

onAuthStateChanged(
    auth,

    function (usuario) {

        if (usuario) {

            // ==================================
            // USUARIO AUTENTICADO
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
                "Saioa hasita";


            loginGoogle.disabled =
                true;


            // Punto verde

            ponerConexionOnline();

        }


        else {

            // ==================================
            // NO HAY USUARIO
            // ==================================

            console.log(
                "Ez dago erabiltzaile autentifikaturik"
            );


            usuarioActual.textContent =
                "Ez duzu saioa hasi";


            loginGoogle.textContent =
                "Jarraitu Google-rekin";


            loginGoogle.disabled =
                false;

        }

    }
);


// ==========================================
// ABRIR MODAL DE COMPRA
// ==========================================

if (compraHecha) {

    compraHecha.addEventListener(
        "click",
        function () {

            modalCompra.classList.add(
                "mostrar"
            );

        }
    );

}


// ==========================================
// CERRAR MODAL
// ==========================================

if (cancelarCompra) {

    cancelarCompra.addEventListener(
        "click",
        function () {

            modalCompra.classList.remove(
                "mostrar"
            );

        }
    );

}


// ==========================================
// CONFIRMAR COMPRA
// ==========================================

if (confirmarCompra) {

    confirmarCompra.addEventListener(
        "click",
        async function () {

            try {

                // Obtener todos los productos

                const snapshot =
                    await getDocs(
                        listaRef
                    );


                // ==================================
                // BORRAR TODOS LOS PRODUCTOS
                // ==================================

                const eliminaciones =
                    [];


                snapshot.forEach(
                    function (documento) {

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


                // ==================================
                // CERRAR MODAL
                // ==================================

                modalCompra.classList.remove(
                    "mostrar"
                );


                console.log(
                    "Erosketa baieztatuta. Zerrenda ezabatuta."
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

}
