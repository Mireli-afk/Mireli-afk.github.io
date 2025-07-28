// --- BASE DE DATOS DE LOTES (Manzana-Lote: Metros Cuadrados) ---
// ¡Esto es un ejemplo! Debes llenarlo con los datos reales de tus lotes.
const datosLotes = {
    // Manzana A
    "A-1": 120, "A-2": 125, "A-3": 130,
    // Manzana B
    "B-1": 110, "B-2": 115, "B-3": 118,
    // Manzana J
    "J-1": 150, "J-2": 155, "J-3": 160,
};

const PRECIO_POR_METRO = 547; // El precio que me indicaste

// --- Obtenemos los elementos del HTML con los que vamos a trabajar ---
const inputManzana = document.getElementById('manzana');
const inputLote = document.getElementById('lote');
const displayPrecio = document.getElementById('precio-final');

// --- Función para calcular y mostrar el precio ---
function calcularPrecio() {
    // 1. Obtenemos los valores de los inputs (y los limpiamos)
    const manzana = inputManzana.value.trim().toUpperCase(); // a -> A
    const lote = inputLote.value.trim();

    // Si alguno de los campos está vacío, no hacemos nada
    if (!manzana || !lote) {
        displayPrecio.textContent = '-';
        return;
    }

    // 2. Creamos la clave para buscar en nuestra "base de datos"
    const claveLote = `${manzana}-${lote}`; // Ej: "B-3"

    // 3. Buscamos el lote en nuestros datos
    const metrosCuadrados = datosLotes[claveLote];

    // 4. Calculamos y mostramos el resultado
    if (metrosCuadrados) {
        // Si encontramos el lote, calculamos el precio
        const precioTotal = metrosCuadrados * PRECIO_POR_METRO;
        
        // Formateamos el número para que se vea como dinero (S/ 123,456.00)
        const formatoMoneda = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(precioTotal);

        displayPrecio.textContent = formatoMoneda;
    } else {
        // Si no encontramos el lote, mostramos un mensaje
        displayPrecio.textContent = 'Lote no disponible';
    }
}

// --- Event Listeners ---
// Hacemos que la función se ejecute cada vez que el usuario escribe en los campos
inputManzana.addEventListener('input', calcularPrecio);
inputLote.addEventListener('input', calcularPrecio);