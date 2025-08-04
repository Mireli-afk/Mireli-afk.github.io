// Espera a que todo el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- Obtenemos los elementos del HTML con los que vamos a trabajar ---
    const inputManzana = document.getElementById('manzana');
    const inputLote = document.getElementById('lote');
    const displayPrecio = document.getElementById('precio-final');

    // --- Función para formatear un número a moneda local (Soles) ---
    const formatoMoneda = (valor) => new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(valor);

    // --- Función principal para buscar y mostrar el precio del lote ---
    function calcularPrecio() {
        // 1. Validamos que los elementos del formulario existan para evitar errores
        if (!inputManzana || !inputLote || !displayPrecio) {
            console.error("No se encontraron los elementos del formulario en la página.");
            return;
        }

        // 2. Obtenemos y limpiamos los valores ingresados por el usuario
        const manzana = inputManzana.value.trim().toUpperCase(); // Convertimos a mayúsculas
        const lote = inputLote.value.trim();

        // Si alguno de los campos está vacío, reseteamos el display
        if (!manzana || !lote) {
            displayPrecio.textContent = '-';
            return;
        }

        // 3. Creamos la clave para buscar en la base de datos (ej: "A-20")
        const claveLote = `${manzana}-${lote}`;

        // 4. Verificamos que la base de datos 'datosLotes' exista (cargada desde datos.js)
        if (typeof datosLotes !== 'undefined' && datosLotes[claveLote]) {
            // Si el lote existe, obtenemos su precio de lista
            const precioTotal = datosLotes[claveLote].precio;
            
            // Mostramos el precio formateado como moneda
            displayPrecio.textContent = formatoMoneda(precioTotal);
        } else {
            // Si el lote no se encuentra en la base de datos
            displayPrecio.textContent = 'Lote no disponible';
        }
    }

    // --- Asignamos los "Event Listeners" ---
    // Hacemos que la función 'calcularPrecio' se ejecute cada vez que el usuario escribe algo
    // en los campos de Manzana o Lote.
    if (inputManzana && inputLote) {
        inputManzana.addEventListener('input', calcularPrecio);
        inputLote.addEventListener('input', calcularPrecio);
    }
});