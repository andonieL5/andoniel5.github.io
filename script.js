const botones = document.querySelectorAll(".anadir");

const miLista = document.getElementById("miLista");


// Aquí guardaremos los productos que hemos añadido
const listaCompra = {};


// Esta función dibuja nuestra lista en pantalla
function mostrarLista() {

    miLista.innerHTML = "";


    // Recorremos todos los productos de la lista
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


        // Cuando pulsamos -
        botonMenos.addEventListener("click", function() {

            informacion.cantidad--;

            if (informacion.cantidad <= 0) {

                delete listaCompra[producto];

            }

            mostrarLista();

        });


        // Cuando pulsamos +
        botonMas.addEventListener("click", function() {

            informacion.cantidad++;

            mostrarLista();

        });


        // Cuando pulsamos eliminar
        botonEliminar.addEventListener("click", function() {

            delete listaCompra[producto];

            mostrarLista();

        });


        // Añadimos todos los elementos a la fila
        nuevoProducto.appendChild(nombre);

        nuevoProducto.appendChild(botonMenos);

        nuevoProducto.appendChild(cantidad);

        nuevoProducto.appendChild(botonMas);

        nuevoProducto.appendChild(botonEliminar);


        // Añadimos la fila a MI LISTA
        miLista.appendChild(nuevoProducto);

    }

}


// Detectamos los botones + de productos habituales
botones.forEach(function(boton) {

    boton.addEventListener("click", function() {

        const producto = boton.dataset.producto;

        const emoji = boton.dataset.emoji;


        // Si el producto todavía no está en la lista
        if (!listaCompra[producto]) {

            listaCompra[producto] = {

                emoji: emoji,

                cantidad: 1

            };

        }

        // Si ya existe, aumentamos la cantidad
        else {

            listaCompra[producto].cantidad++;

        }


        mostrarLista();

    });

});
