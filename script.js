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
    getDocs,
    writeBatch
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

const categoriasContainer =
    document.getElementById(
        "kategoriak"
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

const compraHecha =
    document.getElementById(
        "compraHecha"
    );

const confirmModal =
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
// CATEGORÍAS Y PRODUCTOS
// ==========================================

const kategorienDatuak = [

    // ======================================
    // DESPENTSA
    // ======================================

    {
        id: "despentsa",

        izena: "Despentsa",

        emoji: "🗄️",

        deskribapena:
            "Oinarrizko elikagaiak",

        taldeak: [

            {
                izena: "Pasta",

                emoji: "🍝",

                produktuak: [

                    ["Espagetiak", "🍝"],
                    ["Makarroiak", "🍝"],
                    ["Fideoak", "🍜"],
                    ["Tallarínak", "🍝"],
                    ["Kuskusa", "🍚"]

                ]
            },

            {
                izena: "Galletak",

                emoji: "🍪",

                produktuak: [

                    ["María Doradas", "🍪"],
                    ["Príncipe", "🍪"],
                    ["Galleta txigortuak", "🍪"],
                    ["Chiquilín", "🍪"]

                ]
            },

            {
                izena: "Lekaleak",

                emoji: "🫘",

                produktuak: [

                    ["Lentejak", "🫘"],
                    ["Garbantzuak", "🫘"],
                    ["Babarrunak", "🫘"]

                ]
            },

            {
                izena: "Kontserbak",

                emoji: "🥫",

                produktuak: [

                    ["Atuna", "🐟"],
                    ["Olibak", "🫒"],
                    ["Piperrak", "🌶️"],
                    ["Esparragoak", "🌱"],
                    ["Tomate birrindua", "🍅"],
                    ["Tomate frijitua", "🍅"]

                ]
            },

            {
                izena: "Olioak eta ozpinak",

                emoji: "🫒",

                produktuak: [

                    ["Oliba-olioa", "🫒"],
                    ["Ekilore-olioa", "🌻"],
                    ["Mahats-ozpina", "🍇"]

                ]
            }

        ],

        produktuak: [

            ["Arroza", "🍚"],
            ["Irina", "🌾"],
            ["Azukrea", "🧂"],
            ["Gatza", "🧂"],
            ["Ogia", "🍞"],
            ["Ogi txigortua", "🍞"],
            ["Nesquik", "🥛"],
            ["ColaCao", "🥛"],
            ["Eztia", "🍯"],
            ["Marmelada", "🍓"],
            ["Kakao-hautsa", "🍫"],
            ["Arto-malutak", "🥣"],
            ["Intxaurrak", "🥜"],
            ["Almendrak", "🥜"],
            ["Pistatxoak", "🥜"]

        ]
    },


    // ======================================
    // ESNEKIAK
    // ======================================

    {
        id: "esnekiak",

        izena: "Esnekiak",

        emoji: "🥛",

        deskribapena:
            "Esnea eta esnekiak",

        taldeak: [

            {
                izena: "Esnea",

                emoji: "🥛",

                produktuak: [

                    ["Esne osoa", "🥛"],
                    ["Esne erdigaingabetua", "🥛"]

                ]
            }

        ],

        produktuak: [

            ["Jogurta", "🥛"],
            ["Gazta", "🧀"],
            ["Gurina", "🧈"],
            ["Esnegaina", "🥛"],
            ["Gazta freskoa", "🧀"],
            ["Flanak", "🍮"]

        ]
    },


    // ======================================
    // FRUTAK ETA BARAZKIAK
    // ======================================

    {
        id: "frutak-barazkiak",

        izena: "Frutak eta barazkiak",

        emoji: "🥬",

        deskribapena:
            "Freskoak eta sasoikoak",

        taldeak: [

            {
                izena: "Frutak",

                emoji: "🍎",

                produktuak: [

                    ["Sagarrak", "🍎"],
                    ["Platanoak", "🍌"],
                    ["Laranjak", "🍊"],
                    ["Mandarinak", "🍊"],
                    ["Marrubiak", "🍓"],
                    ["Mahatsak", "🍇"],
                    ["Udareak", "🍐"],
                    ["Melokotoiak", "🍑"],
                    ["Nektarinak", "🍑"],
                    ["Kiwia", "🥝"],
                    ["Anana", "🍍"],
                    ["Meloia", "🍈"],
                    ["Sandia", "🍉"],
                    ["Ahabiak", "🫐"],
                    ["Mugurdia", "🫐"],
                    ["Limoiak", "🍋"]

                ]
            },

            {
                izena: "Barazkiak",

                emoji: "🥕",

                produktuak: [

                    ["Tomateak", "🍅"],
                    ["Letxuga", "🥬"],
                    ["Azenarioak", "🥕"],
                    ["Patatak", "🥔"],
                    ["Tipulak", "🧅"],
                    ["Baratxuria", "🧄"],
                    ["Piperrak", "🫑"],
                    ["Kalabazina", "🥒"],
                    ["Pepinoa", "🥒"],
                    ["Brokolia", "🥦"],
                    ["Azalorea", "🥦"],
                    ["Espinakak", "🌿"],
                    ["Porruak", "🥬"],
                    ["Perretxikoak", "🍄"],
                    ["Berenjena", "🍆"],
                    ["Kalabaza", "🎃"],
                    ["Aguakatea", "🥑"]

                ]
            }

        ]
    },


    // ======================================
    // HARAGIA ETA ARRAINA
    // ======================================

    {
        id: "haragia-arraina",

        izena: "Haragia eta arraina",

        emoji: "🥩",

        deskribapena:
            "Harategia eta arrandegia",

        taldeak: [

            {
                izena: "Oilaskoa",

                emoji: "🍗",

                produktuak: [

                    ["Oilasko-bularkiak", "🍗"],
                    ["Oilasko-izterrak", "🍗"],
                    ["Oilasko-hegoak", "🍗"],
                    ["Oilasko osoa", "🍗"]

                ]
            },

            {
                izena: "Behi-haragia",

                emoji: "🥩",

                produktuak: [

                    ["Behi-fileteak", "🥩"],
                    ["Behi-txuletak", "🥩"],
                    ["Haragi xehatua", "🥩", "gramoak"],
                    ["Haragi gisatua", "🥩"]

                ]
            },

            {
                izena: "Txerria",

                emoji: "🐖",

                produktuak: [

                    ["Txerri-fileteak", "🥩"],
                    ["Solomoa", "🥩"],
                    ["Txerri-saiheskiak", "🥩"],
                    ["Urdaiazpikoa", "🥓"],
                    ["Hirugiharra", "🥓"]

                ]
            },

            {
                izena: "Arraina",

                emoji: "🐟",

                produktuak: [

                    ["Izokina", "🐟"],
                    ["Legatza", "🐟"],
                    ["Bakailaoa", "🐟"],
                    ["Atuna", "🐟"],
                    ["Sardina", "🐟"],
                    ["Antxoak", "🐟"],
                    ["Amuarraina", "🐟"],
                    ["Arrain-xerra", "🐟"]

                ]
            }

        ]
    },


    // ======================================
    // IZOZTUAK
    // ======================================

    {
        id: "izoztuak",

        izena: "Izoztuak",

        emoji: "❄️",

        deskribapena:
            "Izoztutako produktuak",

        taldeak: [

            {
                izena: "Izozkiak",

                emoji: "🍦",

                produktuak: [

                    ["Sandwich", "🍦"],
                    ["Magnum", "🍦"]

                ]
            }

        ],

        produktuak: [

            ["Pizza", "🍕"],
            ["Patata frijituak", "🍟"],
            ["Barazki izoztuak", "🥦"],
            ["Arrain-makilatxoak", "🐟"],
            ["Ilar izoztuak", "🫛"],
            ["Kroketak", "🥟"],
            ["Hanburgesak", "🍔"]

        ]
    },


    // ======================================
    // EDARIAK
    // ======================================

    {
        id: "edariak",

        izena: "Edariak",

        emoji: "🥤",

        deskribapena:
            "Edari hotzak eta beroak",

        taldeak: [

            {
                izena: "Freskagarriak",

                emoji: "🥤",

                produktuak: [

                    ["Coca-Cola", "🥤"],
                    ["Coca-Cola Zero", "🥤"],
                    ["Fanta", "🥤"],
                    ["Fanta Laranja", "🥤"],
                    ["Fanta Limoi", "🥤"],
                    ["Sprite", "🥤"],
                    ["Aquarius", "🥤"],
                    ["Nestea", "🧋"]

                ]
            },

            {
                izena: "Kafea eta tea",

                emoji: "☕",

                produktuak: [

                    ["Kafea", "☕"],
                    ["Tea", "🍵"],
                    ["Infusioak", "🍵"]

                ]
            }

        ],

        produktuak: [

            ["Ura", "💧"],
            ["Esnea", "🥛"],
            ["Zukua", "🧃"],
            ["Laranja-zukua", "🍊"]

        ]
    },


    // ======================================
    // GARBIKETA
    // ======================================

    {
        id: "garbiketa",

        izena: "Garbiketa",

        emoji: "🧽",

        deskribapena:
            "Etxea garbi mantentzeko",

        taldeak: [

            {
                izena: "Arropa garbitzea",

                emoji: "👕",

                produktuak: [

                    ["Garbigarria", "🧴"],
                    ["Oihal-leungarria", "🧴"],
                    ["Orban-kentzailea", "🧴"]

                ]
            },

            {
                izena: "Sukaldea",

                emoji: "🍽️",

                produktuak: [

                    ["Ontzi-garbigarria", "🧴"],
                    ["Ontzi-garbigailurako pilulak", "🧼"],
                    ["Koipe-kentzailea", "🧴"],
                    ["Sukaldeko paperak", "🧻"],
                    ["Esponjak", "🧽"]

                ]
            },

            {
                izena: "Komuna",

                emoji: "🚽",

                produktuak: [

                    ["Komun-garbigarria", "🧴"],
                    ["Bainugelako garbigarria", "🧴"],
                    ["Komuneko pastillak", "🧼"]

                ]
            }

        ],

        produktuak: [

            ["Lixiba", "🧴"],
            ["Garbitzaile orokorra", "🧴"],
            ["Beira-garbigarria", "🪟"],
            ["Zabor-poltsak", "🗑️"],
            ["Komuneko papera", "🧻"],
            ["Paperezko zapiak", "🧻"],
            ["Aluminio-papera", "📦"],
            ["Plastikozko filma", "📦"],
            ["Eskularruak", "🧤"]

        ]
    }

];


// ==========================================
// CATEGORÍAS ABIERTAS
// ==========================================

const kategoriaIrekiak = {};

const azpitaldeIrekiak = {};


// ==========================================
// ID DEL PRODUCTO
// ==========================================

function convertirId(producto) {

    return producto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

}


// ==========================================
// REFERENCIA PRODUCTO
// ==========================================

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
// CREAR CATEGORÍAS
// ==========================================

function renderizarKategorias() {

    categoriasContainer.innerHTML = "";

    kategorienDatuak.forEach(
        (categoria) => {

            const categoriaDiv =
                document.createElement("div");

            categoriaDiv.className =
                "kategoria";

            if (
                kategoriaIrekiak[
                    categoria.id
                ]
            ) {

                categoriaDiv.classList.add(
                    "kategoria-zabalik"
                );

            }


            // ==================================
            // BOTÓN PRINCIPAL
            // ==================================

            const boton =
                document.createElement("button");

            boton.className =
                "kategoria-botoia";

            boton.innerHTML = `

                <span class="kategoria-emoji">
                    ${categoria.emoji}
                </span>

                <span class="kategoria-info">

                    <span class="kategoria-izena">
                        ${categoria.izena}
                    </span>

                    <span class="kategoria-deskribapena">
                        ${categoria.deskribapena}
                    </span>

                </span>

                <span class="gezia">
                   ⌄
                </span>

            `;


            boton.addEventListener(
                "click",
                () => {

                    kategoriaIrekiak[
                        categoria.id
                    ] =
                        !kategoriaIrekiak[
                            categoria.id
                        ];

                    renderizarKategorias();

                }
            );


            categoriaDiv.appendChild(
                boton
            );


            // ==================================
            // CONTENIDO
            // ==================================

            const contenido =
                document.createElement("div");

            contenido.className =
                "kategoria-edukia";


            // ==================================
            // SUBGRUPOS
            // ==================================

            if (categoria.taldeak) {

                categoria.taldeak.forEach(
                    (taldea, index) => {

                        const taldeId =
                            categoria.id +
                            "-" +
                            index;


                        const taldeDiv =
                            document.createElement("div");

                        taldeDiv.className =
                            "azpitaldea";


                        if (
                            azpitaldeIrekiak[
                                taldeId
                            ]
                        ) {

                            taldeDiv.classList.add(
                                "azpitalde-zabalik"
                            );

                        }


                        const taldeBotoia =
                            document.createElement("button");

                        taldeBotoia.className =
                            "azpitalde-botoia";

                        taldeBotoia.innerHTML = `

                            <span class="azpitalde-emoji">
                                ${taldea.emoji}
                            </span>

                            <span class="azpitalde-izena">
                                ${taldea.izena}
                            </span>

                            <span class="azpitalde-gezi">
                                ⌄
                            </span>

                        `;


                        taldeBotoia.addEventListener(
                            "click",
                            () => {

                                azpitaldeIrekiak[
                                    taldeId
                                ] =
                                    !azpitaldeIrekiak[
                                        taldeId
                                    ];

                                renderizarKategorias();

                            }
                        );


                        taldeDiv.appendChild(
                            taldeBotoia
                        );


                        const taldeEdukia =
                            document.createElement("div");

                        taldeEdukia.className =
                            "azpitalde-edukia";


                        const produktuak =
                            document.createElement("div");

                        produktuak.className =
                            "produktuak";


                        taldearenProduktuak(
                            produktuak,
                            taldea.produktuak
                        );


                        taldeEdukia.appendChild(
                            produktuak
                        );

                        taldeDiv.appendChild(
                            taldeEdukia
                        );

                        contenido.appendChild(
                            taldeDiv
                        );

                    }
                );

            }


            // ==================================
            // PRODUKTOS DIRECTOS
            // ==================================

            if (categoria.produktuak) {

                const produktuak =
                    document.createElement("div");

                produktuak.className =
                    "produktuak";


                taldearenProduktuak(
                    produktuak,
                    categoria.produktuak
                );


                contenido.appendChild(
                    produktuak
                );

            }


            categoriaDiv.appendChild(
                contenido
            );


            categoriasContainer.appendChild(
                categoriaDiv
            );

        }
    );

}


// ==========================================
// RENDER PRODUCTOS
// ==========================================

function taldearenProduktuak(
    container,
    produktuak
) {

    produktuak.forEach(
        (produktua) => {

            const izena =
                produktua[0];

            const emoji =
                produktua[1];

            const mota =
                produktua[2];


            const botoia =
                document.createElement("button");

            botoia.className =
                "produktu-botoia";


            if (mota === "gramoak") {

                botoia.innerHTML = `

                    <span class="produktu-emoji">
                        ${emoji}
                    </span>

                    <span class="produktu-izena">
                        ${izena}
                    </span>

                    <span
                        class="produktu-gramoak"
                    >
                        +250 g
                    </span>

                `;

            }

            else {

                botoia.innerHTML = `

                    <span class="produktu-emoji">
                        ${emoji}
                    </span>

                    <span class="produktu-izena">
                        ${izena}
                    </span>

                    <span class="produktu-plus">
                        +
                    </span>

                `;

            }


            botoia.addEventListener(
                "click",
                () => {

                    añadirProducto(
                        izena,
                        emoji,
                        mota
                    );

                }
            );


            container.appendChild(
                botoia
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
    mota = null
) {

    const referencia =
        productoRef(producto);


    try {

        await runTransaction(
            db,
            async (transaction) => {

                const documento =
                    await transaction.get(
                        referencia
                    );


                // ==================================
                // NUEVO
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
                                mota === "gramoak"
                                    ? 250
                                    : 1,

                            unidad:
                                mota === "gramoak"
                                    ? "g"
                                    : "unidad"

                        }
                    );

                }


                // ==================================
                // EXISTENTE
                // ==================================

                else {

                    const datos =
                        documento.data();

                    const incremento =
                        datos.unidad === "g"
                            ? 250
                            : 1;


                    transaction.update(
                        referencia,
                        {

                            cantidad:
                                (
                                    Number(
                                        datos.cantidad
                                    ) || 0
                                ) + incremento

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
        productoRef(producto);


    try {

        await runTransaction(
            db,
            async (transaction) => {

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


                const incremento =
                    datos.unidad === "g"
                        ? 250
                        : 1;


                const nuevaCantidad =
                    (
                        Number(
                            datos.cantidad
                        ) || 0
                    ) +
                    (
                        incremento *
                        cambio
                    );


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
            productoRef(producto)
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
// MOSTRAR LISTA
// ==========================================

function mostrarLista() {

    miLista.innerHTML = "";


    const productos =
        Object.values(
            listaCompra
        );


    // ======================================
    // LISTA VACÍA
    // ======================================

    if (
        productos.length === 0
    ) {

        zerrendaHutsa.style.display =
            "block";

        produktuKopurua.textContent =
            "0";

        return;

    }


    zerrendaHutsa.style.display =
        "none";


    produktuKopurua.textContent =
        productos.length;


    // ======================================
    // ORDENAR
    // ======================================

    productos.sort(
        (a, b) =>
            a.nombre.localeCompare(
                b.nombre,
                "eu"
            )
    );


    // ======================================
    // CREAR ELEMENTOS
    // ======================================

    productos.forEach(
        (informacion) => {

            const producto =
                informacion.nombre;


            const li =
                document.createElement("div");

            li.className =
                "lista-produktua";


            // ==================================
            // EMOJI
            // ==================================

            const emoji =
                document.createElement("span");

            emoji.className =
                "lista-emoji";

            emoji.textContent =
                informacion.emoji;


            // ==================================
            // INFO
            // ==================================

            const info =
                document.createElement("div");

            info.className =
                "lista-info";


            const nombre =
                document.createElement("span");

            nombre.className =
                "lista-izena";

            nombre.textContent =
                producto;


            const categoria =
                document.createElement("span");

            categoria.className =
                "lista-kategoria";

            categoria.textContent =
                "Erosketa zerrenda";


            info.appendChild(
                nombre
            );

            info.appendChild(
                categoria
            );


            // ==================================
            // MENOS
            // ==================================

            const botonMenos =
                document.createElement("button");

            botonMenos.className =
                "lista-kontrola";

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
                "lista-kantitatea";


            if (
                informacion.unidad === "g"
            ) {

                cantidad.textContent =
                    informacion.cantidad +
                    " g";

            }

            else {

                cantidad.textContent =
                    informacion.cantidad;

            }


            // ==================================
            // MÁS
            // ==================================

            const botonMas =
                document.createElement("button");

            botonMas.className =
                "lista-kontrola";

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
                "lista-ezabatu";

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
            // CONSTRUIR
            // ==================================

            li.appendChild(
                emoji
            );

            li.appendChild(
                info
            );

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


            miLista.appendChild(
                li
            );

        }
    );

}


// ==========================================
// FIRESTORE EN TIEMPO REAL
// ==========================================

let unsubscribeLista =
    null;


function escucharLista() {

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

            (snapshot) => {

                // Limpiar lista

                Object.keys(
                    listaCompra
                ).forEach(
                    (key) => {

                        delete listaCompra[key];

                    }
                );


                // Cargar datos

                snapshot.forEach(
                    (documento) => {

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

            (error) => {

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
    async () => {

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


            loginGoogle.disabled =
                false;

            loginGoogle.textContent =
                "Google-rekin sartu";

        }

    }
);


// ==========================================
// ESTADO DE AUTENTICACIÓN
// ==========================================

onAuthStateChanged(
    auth,

    (usuario) => {

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


            // ==============================
            // ESTADO CONECTADO
            // ==============================

            usuarioActual.textContent =
                "Konektatuta: " +
                usuario.email;


            usuarioActual.classList.add(
                "konektatuta"
            );


            loginGoogle.textContent =
                "Saioa hasita";


            loginGoogle.disabled =
                true;


            // ==============================
            // FIRESTORE
            // ==============================

            escucharLista();

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


            // Limpiar lista

            Object.keys(
                listaCompra
            ).forEach(
                (key) => {

                    delete listaCompra[key];

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
    () => {

        if (
            Object.keys(
                listaCompra
            ).length === 0
        ) {

            return;

        }


        confirmModal.classList.add(
            "zabalik"
        );

    }
);


// ==========================================
// CANCELAR
// ==========================================

modalEz.addEventListener(
    "click",
    () => {

        confirmModal.classList.remove(
            "zabalik"
        );

    }
);


// ==========================================
// CONFIRMAR EROSKETA
// ==========================================

modalBai.addEventListener(
    "click",
    async () => {

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
                (documento) => {

                    batch.delete(
                        documento.ref
                    );

                }
            );


            await batch.commit();


            confirmModal.classList.remove(
                "zabalik"
            );


        }

        catch (error) {

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
// CERRAR MODAL AL PULSAR FUERA
// ==========================================

confirmModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            confirmModal
        ) {

            confirmModal.classList.remove(
                "zabalik"
            );

        }

    }
);


// ==========================================
// ESCAPE PARA CERRAR
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            confirmModal.classList.remove(
                "zabalik"
            );

        }

    }
);


// ==========================================
// INICIAR INTERFAZ
// ==========================================

renderizarKategorias();

mostrarLista();
