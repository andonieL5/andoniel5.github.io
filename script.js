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
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN DE FIREBASE
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
console.log("Firebase appId:", firebaseConfig.appId);


// ==========================================
// INICIALIZAR FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// FIREBASE AUTH
// ==========================================

const auth = getAuth(app);


// ==========================================
// PROVEEDOR GOOGLE
// ==========================================

const proveedorGoogle = new GoogleAuthProvider();


// ==========================================
// FIRESTORE
// ==========================================

const db = getFirestore(app);


// ==========================================
// IDENTIFICADOR DE LA FAMILIA
// ==========================================

const FAMILIA_ID = "familia-andoni";


// ==========================================
// COLECCIÓN DE LA LISTA
// ==========================================

const listaRef = collection(
    db,
    "familias",
    FAMILIA_ID,
    "listaCompra"
);


// ==========================================
// ELEMENTOS HTML
// ==========================================

const botones = document.querySelectorAll(".anadir");

const miLista = document.getElementById("miLista");

const loginGoogle = document.getElementById("loginGoogle");

const usuarioActual = document.getElementById("usuarioActual");


// ==========================================
// LISTA LOCAL
// ==========================================

const listaCompra = {};


// ==========================================
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";

    for (const producto in listaCompra) {

        const informacion = listaCompra[producto];


        // ======================================
        // ELEMENTO
        // ======================================

        const nuevoProducto =
            document.createElement("li");


        // ======================================
        // NOMBRE
        // ======================================

        const nombre =
            document.createElement("span");

        nombre.textContent =
            informacion.emoji + " " + producto;


        // ======================================
        // BOTÓN MENOS
        // ======================================

        const botonMenos =
            document.createElement("button");

        botonMenos.textContent = "−";


        // ======================================
        // CANTIDAD
        // ======================================

        const cantidad =
            document.createElement("span");

        cantidad.textContent =
            informacion.cantidad;


        // ======================================
        // BOTÓN MÁS
        // ======================================

        const botonMas =
            document.createElement("button");

        botonMas.textContent = "+";


        // ======================================
        // BOTÓN ELIMINAR
        // ======================================

        const botonEliminar =
            document.createElement("button");

        botonEliminar.textContent = "Ezabatu";


        // ======================================
        // EVENTO MENOS
        // ======================================

        botonMenos.addEventListener(
            "click",
            async () => {

                await cambiarCantidad(
                    producto,
                    -1
                );

            }
        );


        // ======================================
        // EVENTO MÁS
        // ======================================

        botonMas.addEventListener(
            "click",
            async () => {

                await cambiarCantidad(
                    producto,
                    1
                );

            }
        );


        // ======================================
        // EVENTO ELIMINAR
        // ======================================

        botonEliminar.addEventListener(
            "click",
            async () => {

                await eliminarProducto(
                    producto
                );

            }
        );


        // ======================================
        // CONSTRUIR ELEMENTO
        // ======================================

        nuevoProducto.appendChild(nombre);

        nuevoProducto.appendChild(botonMenos);

        nuevoProducto.appendChild(cantidad);

        nuevoProducto.appendChild(botonMas);

        nuevoProducto.appendChild(botonEliminar);


        miLista.appendChild(nuevoProducto);
    }
}


// ==========================================
// AÑADIR PRODUCTO
// ==========================================

async function añadirProducto(
    producto,
    emoji
) {

    const referencia = doc(
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


                // PRODUCTO NUEVO

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


                // PRODUCTO EXISTENTE

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

    const referencia = doc(
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


                // SI LLEGA A CERO

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

    const referencia = doc(
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

function convertirId(producto) {

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
    (boton) => {

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
// FIRESTORE EN TIEMPO REAL
// ==========================================

onSnapshot(
    listaRef,

    (snapshot) => {

        // Limpiar lista local

        for (const producto in listaCompra) {

            delete listaCompra[producto];

        }


        // Cargar productos

        snapshot.forEach(
            (documento) => {

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


        // Mostrar lista

        mostrarLista();

    },

    (error) => {

        console.error(
            "Errorea zerrenda kargatzean:",
            error
        );

    }
);


// ==========================================
// LOGIN CON GOOGLE
// ==========================================

loginGoogle.addEventListener(
    "click",
    async () => {

        console.log(
            "Google bidezko saioa hasten..."
        );


        try {

            const resultado =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );


            const usuario =
                resultado.user;


            console.log(
                "Google bidez saioa hasita:",
                usuario.email
            );


            console.log(
                "Erabiltzailearen IDa:",
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
// CONTROLAR ESTADO DE AUTENTICACIÓN
// ==========================================

onAuthStateChanged(
    auth,

    (usuario) => {

        if (usuario) {

            // ==================================
            // USUARIO CONECTADO
            // ==================================

            console.log(
                "Erabiltzailea autentifikatuta:",
                usuario.email
            );


            console.log(
                "Erabiltzailearen IDa:",
                usuario.uid
            );


            // TEXTO VISIBLE

            usuarioActual.textContent =
                "Konektatuta: " +
                usuario.email;


            loginGoogle.textContent =
                "Saioa hasita ✓";


            loginGoogle.disabled =
                true;

        }

        else {

            // ==================================
            // USUARIO NO CONECTADO
            // ==================================

            console.log(
                "Ez dago erabiltzaile autentifikaturik"
            );


            // TEXTO VISIBLE

            usuarioActual.textContent =
                "Ez duzu saiorik hasi";


            loginGoogle.textContent =
                "Google-rekin sartu";


            loginGoogle.disabled =
                false;

        }

    }
);
