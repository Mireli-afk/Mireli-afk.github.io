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


    // --- LÓGICA PARA EL MENÚ DE HAMBURGUESA ---
    const menuHamburguesa = document.querySelector('.menu-hamburguesa');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');

    if (menuHamburguesa && nav) {
        menuHamburguesa.addEventListener('click', () => {
            nav.classList.toggle('activo');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('activo')) {
                nav.classList.remove('activo');
            }
        });
    });

        // --- LÓGICA PARA EL ZOOM DEL MAPA DE LOTES ---
    const mapaLotesZoom = document.getElementById('mapaLotesZoom');
    
    if (mapaLotesZoom) {
        const zoomContainer = mapaLotesZoom.closest('.mapa-zoom-container');

        if (zoomContainer) {
            zoomContainer.addEventListener('click', () => {
                zoomContainer.classList.toggle('zoomed');
            });

            // Para que el zoom siga el ratón (más avanzado)
            zoomContainer.addEventListener('mousemove', (e) => {
                if (zoomContainer.classList.contains('zoomed')) {
                    const rect = zoomContainer.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    
                    // Ajusta el origen de la transformación para que siga el ratón
                    mapaLotesZoom.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                } else {
                    mapaLotesZoom.style.transformOrigin = 'center center'; // Restablece cuando no hay zoom
                }
            });

            // Restablecer el origen cuando el ratón sale si no está en zoom
            zoomContainer.addEventListener('mouseleave', () => {
                if (!zoomContainer.classList.contains('zoomed')) {
                    mapaLotesZoom.style.transformOrigin = 'center center';
                }
            });
        }
    }
    
});