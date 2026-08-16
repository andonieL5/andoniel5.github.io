const botonTomate = document.getElementById("botonTomate");

const miLista = document.getElementById("miLista");


botonTomate.addEventListener("click", function() {

    const nuevoProducto = document.createElement("li");

    nuevoProducto.textContent = "🍅 Tomate";

    miLista.appendChild(nuevoProducto);

});
