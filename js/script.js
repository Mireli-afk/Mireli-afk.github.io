// Espera a que todo el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- CÓDIGO PARA LA CALCULADORA DE PLANOS Y PRECIOS (SOLO EN INDEX.HTML) ---

    // Primero, buscamos los elementos del formulario.
    const inputManzana = document.getElementById('manzana');
    const inputLote = document.getElementById('lote');
    const displayPrecio = document.getElementById('precio-final');

    // Esta función solo se ejecutará si los 3 elementos de arriba existen.
    if (inputManzana && inputLote && displayPrecio) {

        // Función para formatear un número a moneda local (Soles)
        const formatoMoneda = (valor) => new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);

        // Función principal para buscar y mostrar el precio del lote
        function calcularPrecio() {
            const manzana = inputManzana.value.trim().toUpperCase();
            const lote = inputLote.value.trim();

            if (!manzana || !lote) {
                displayPrecio.textContent = '-';
                return;
            }

            const claveLote = `${manzana}-${lote}`;

            // Verificamos que la base de datos 'datosLotes' exista (cargada desde datos.js)
            if (typeof datosLotes !== 'undefined' && datosLotes[claveLote]) {
                const precioTotal = datosLotes[claveLote].precio;
                displayPrecio.textContent = formatoMoneda(precioTotal);
            } else {
                displayPrecio.textContent = 'Lote no disponible';
            }
        }

        // Asignamos los "Event Listeners" para que la calculadora funcione en tiempo real
        inputManzana.addEventListener('input', calcularPrecio);
        inputLote.addEventListener('input', calcularPrecio);
    }


    // --- CÓDIGO PARA EL MENÚ DE HAMBURGUESA (FUNCIONA EN TODAS LAS PÁGINAS) ---

    const menuHamburguesa = document.querySelector('.menu-hamburguesa');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');

    if (menuHamburguesa && nav) {
        // Evento para abrir/cerrar el menú al hacer clic en el botón
        menuHamburguesa.addEventListener('click', () => {
            nav.classList.toggle('activo');
        });
    }

    // Evento para cerrar el menú automáticamente al hacer clic en un enlace
    // (muy útil para la navegación en la misma página en móviles)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('activo')) {
                nav.classList.remove('activo');
            }
        });
    });
    
});