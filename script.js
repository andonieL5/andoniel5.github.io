const botones = document.querySelectorAll(".anadir");

const miLista = document.getElementById("miLista");


// Recuperamos la lista guardada anteriormente
const listaGuardada = localStorage.getItem("listaCompra");


// Si existe una lista guardada,
// la convertimos de texto a objeto
const listaCompra = listaGuardada
    ? JSON.parse(listaGuardada)
    : {};


// Guardamos la lista en el navegador
function guardarLista() {

    localStorage.setItem(
        "listaCompra",
        JSON.stringify(listaCompra)
    );

}


// Dibujamos la lista en pantalla
function mostrarLista() {

    miLista.innerHTML = "";


    for (const producto in listaCompra) {

        const informacion = listaCompra[producto];

        const nuevoProducto = document.createElement("li");


        // Nombre del producto
        const nombre = document.createElement("span");

        nombre.textContent =
            informacion.emoji + " " + producto;


        // Botón -
        const botonMenos = document.createElement("button");

        botonMenos.textContent = "−";


        // Cantidad
        const cantidad = document.createElement("span");

        cantidad.textContent = informacion.cantidad;


        // Botón +
        const botonMas = document.createElement("button");

        botonMas.textContent = "+";


        // Botón eliminar
        const botonEliminar = document.createElement("button");

        botonEliminar.textContent = "Eliminar";


        // BOTÓN -
        botonMenos.addEventListener("click", function() {

            informacion.cantidad--;


            if (informacion.cantidad <= 0) {

                delete listaCompra[producto];

            }


            guardarLista();

            mostrarLista();

        });


        // BOTÓN +
        botonMas.addEventListener("click", function() {

            informacion.cantidad++;

            guardarLista();

            mostrarLista();

        });


        // BOTÓN ELIMINAR
        botonEliminar.addEventListener("click", function() {

            delete listaCompra[producto];

            guardarLista();

            mostrarLista();

        });


        nuevoProducto.appendChild(nombre);

        nuevoProducto.appendChild(botonMenos);

        nuevoProducto.appendChild(cantidad);

        nuevoProducto.appendChild(botonMas);

        nuevoProducto.appendChild(botonEliminar);


        miLista.appendChild(nuevoProducto);

    }

}


// Botones de productos habituales
botones.forEach(function(boton) {

    boton.addEventListener("click", function() {

        const producto = boton.dataset.producto;

        const emoji = boton.dataset.emoji;


        if (!listaCompra[producto]) {

            listaCompra[producto] = {

                emoji: emoji,

                cantidad: 1

            };

        }

        else {

            listaCompra[producto].cantidad++;

        }


        guardarLista();

        mostrarLista();

    });

});


// Mostrar la lista al abrir la página
mostrarLista();
