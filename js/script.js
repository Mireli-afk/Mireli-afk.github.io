// --- BASE DE DATOS DE LOTES (Manzana-Lote: Metros Cuadrados) ---
// ¡Esto es un ejemplo! Debes llenarlo con los datos reales de tus lotes.
const datosLotes = {
    // Manzana A
    "A-20": 120, "A-21": 125, "A-22": 130, "A-23": 130,
    // Manzana B
    "B-19": 110, "B-32": 115, "B-34": 118,
    // Manzana E
    "E-20": 150, "E-21": 155, "E-14": 160, "E-24": 160, "E-43": 160,
    // Manzana F
    "F-1": 150, "F-11": 155, "F-12": 160, "F-13": 160, "F-14": 160,
    "F-15": 150, "F-16": 155, "F-17": 160, "F-18": 160, "F-19": 160,
    "F-21": 160, "F-25": 160, "F-26": 160,
    // Manzana G
    "G-1": 150, "G-11": 155, "G-12": 160,
    // Manzana G
    "H-11": 150, "H-12": 155, "H-14": 160, "H-21": 160,
    // Manzana I
    "I-5": 150, "I-6": 155, "I-7": 160, "I-12": 160,
    // Manzana J
    "J-19": 150, "J-20": 155, "J-21": 160, "J-22": 160,
};

const PRECIO_POR_METRO = 547; 

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