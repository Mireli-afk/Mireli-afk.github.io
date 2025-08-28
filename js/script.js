// Espera a que todo el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- CÓDIGO PARA LA CALCULADORA DE PLANOS Y PRECIOS (SOLO EN INDEX.HTML) ---

    const inputManzana = document.getElementById('manzana');
    const inputLote = document.getElementById('lote');
    const displayPrecio = document.getElementById('precio-final');
    const displayArea = document.getElementById('area-lote');

    if (inputManzana && inputLote && displayPrecio && displayArea) {

        const formatoMoneda = (valor) => new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);

        function calcularPrecio() {
            const manzana = inputManzana.value.trim().toUpperCase();
            const lote = inputLote.value.trim();

            if (!manzana || !lote) {
                displayPrecio.textContent = '-';
                displayArea.textContent = '-';
                return;
            }

            const claveLote = `${manzana}-${lote}`;

            if (typeof datosLotes !== 'undefined' && datosLotes[claveLote]) {
                // --- CORRECCIÓN AQUÍ ---
                // 1. Guardamos el objeto completo del lote en 'infoLote'.
                const infoLote = datosLotes[claveLote];

                // 2. Usamos 'infoLote.precio' para el precio y 'infoLote.area' para el área.
                displayPrecio.textContent = formatoMoneda(infoLote.precio);
                displayArea.textContent = `${infoLote.area} m²`;
                
            } else {
                displayPrecio.textContent = 'Lote no disponible';
                displayArea.textContent = '-';
            }
        }

        inputManzana.addEventListener('input', calcularPrecio);
        inputLote.addEventListener('input', calcularPrecio);
    }


    // --- (El resto de tu código para el menú y el zoom se mantiene igual) ---
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

    const mapaLotesZoom = document.getElementById('mapaLotesZoom');
    
    if (mapaLotesZoom) {
        const zoomContainer = mapaLotesZoom.closest('.mapa-zoom-container');

        if (zoomContainer) {
            zoomContainer.addEventListener('click', () => {
                zoomContainer.classList.toggle('zoomed');
            });

            zoomContainer.addEventListener('mousemove', (e) => {
                if (zoomContainer.classList.contains('zoomed')) {
                    const rect = zoomContainer.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    
                    mapaLotesZoom.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                } else {
                    mapaLotesZoom.style.transformOrigin = 'center center';
                }
            });

            zoomContainer.addEventListener('mouseleave', () => {
                if (!zoomContainer.classList.contains('zoomed')) {
                    mapaLotesZoom.style.transformOrigin = 'center center';
                }
            });
        }
    }
});