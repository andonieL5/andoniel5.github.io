const botones = document.querySelectorAll(".anadir");

const miLista = document.getElementById("miLista");


botones.forEach(function(boton) {

    boton.addEventListener("click", function() {

        const producto = boton.dataset.producto;
        const emoji = boton.dataset.emoji;

        const nuevoProducto = document.createElement("li");

        nuevoProducto.textContent = emoji + " " + producto;

        miLista.appendChild(nuevoProducto);

    });

});
