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


// Estado conexión

const puntoConexion =
    document.getElementById("puntoConexion");

const textoConexion =
    document.getElementById("textoConexion");


// Modal compra

const compraHecha =
    document.getElementById("compraHecha");

const modalCompra =
    document.getElementById("modalCompra");

const cancelarCompra =
    document.getElementById("cancelarCompra");

const confirmarCompra =
    document.getElementById("confirmarCompra");


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


        const nuevoProducto =
            document.createElement("li");


        // Nombre

        const nombre =
            document.createElement("span");


        nombre.textContent =
            informacion.emoji +
            " " +
            producto;


        // Botón -

        const botonMenos =
            document.createElement("button");


        botonMenos.textContent =
            "−";


        // Cantidad

        const cantidad =
            document.createElement("span");


        cantidad.textContent =
            informacion.cantidad;


        // Botón +

        const botonMas =
            document.createElement("button");


        botonMas.textContent =
            "+";


        // Botón eliminar

        const botonEliminar =
            document.createElement("button");


        botonEliminar.textContent =
            "Eliminar";


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
// BORRAR TODA LA LISTA
// ==========================================

async function borrarTodaLaLista() {

    try {

        const snapshot =
            await getDocs(listaRef);


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


        console.log(
            "Compra confirmada. Lista borrada."
        );

    }

    catch (error) {

        console.error(
            "Error borrando la lista:",
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

        .replaceAll("ú", "u");

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

        for (
            const producto in listaCompra
        ) {

            delete listaCompra[producto];

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
            "Error escuchando la lista:",
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
                "Error al iniciar sesión:",
                error
            );

        }

    }
);


// ==========================================
// BOTÓN COMPRA HECHA
// ==========================================

compraHecha.addEventListener(
    "click",
    function () {

        modalCompra.classList.add(
            "visible"
        );

    }
);


// ==========================================
// BOTÓN NO
// ==========================================

cancelarCompra.addEventListener(
    "click",
    function () {

        modalCompra.classList.remove(
            "visible"
        );

    }
);


// ==========================================
// BOTÓN SÍ
// ==========================================

confirmarCompra.addEventListener(
    "click",
    async function () {

        confirmarCompra.disabled = true;

        confirmarCompra.textContent =
            "Borrando...";


        await borrarTodaLaLista();


        modalCompra.classList.remove(
            "visible"
        );


        confirmarCompra.disabled = false;

        confirmarCompra.textContent =
            "Sí, compra hecha";

    }
);


// ==========================================
// CERRAR MODAL AL PULSAR FUERA
// ==========================================

modalCompra.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target === modalCompra
        ) {

            modalCompra.classList.remove(
                "visible"
            );

        }

    }
);


// ==========================================
// SABER SI HAY UN USUARIO CONECTADO
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


            // ==================================
            // PUNTO VERDE
            // ==================================

            puntoConexion.classList.add(
                "conectado"
            );


            textoConexion.textContent =
                "En línea";


            usuarioActual.textContent =
                "Conectado como " +
                usuario.email;


            loginGoogle.textContent =
                "Sesión iniciada";


            loginGoogle.disabled =
                true;

        }

        else {

            console.log(
                "No hay usuario conectado"
            );


            // ==================================
            // PUNTO GRIS
            // ==================================

            puntoConexion.classList.remove(
                "conectado"
            );


            textoConexion.textContent =
                "Sin conexión";


            usuarioActual.textContent =
                "No has iniciado sesión";


            loginGoogle.textContent =
                "Continuar con Google";


            loginGoogle.disabled =
                false;

        }

    }
);
