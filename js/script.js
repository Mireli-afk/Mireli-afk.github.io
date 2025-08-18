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

    // --- LÓGICA PARA EL CHATBOT FLOTANTE CON N8N ---

    const burbujaChatbot = document.getElementById('chatbot-burbuja');
    const ventanaChatbot = document.getElementById('chatbot-ventana');
    const btnCerrarChatbot = document.getElementById('chatbot-cerrar');
    const cuerpoChatbot = document.getElementById('chatbot-cuerpo');
    const inputChatbot = document.getElementById('chatbot-input');
    const btnEnviarChatbot = document.getElementById('chatbot-enviar');

    // Comprobamos que los elementos existan antes de añadir listeners
    if (burbujaChatbot && ventanaChatbot && btnCerrarChatbot) {
        
        // URL de tu Webhook de n8n
        const N8N_WEBHOOK_URL = 'https://n8n-service-z93e.onrender.com/webhook/agente-terrazas'; // ¡URL que me pasaste!

        // Eventos para mostrar y ocultar la ventana
        burbujaChatbot.addEventListener('click', () => ventanaChatbot.classList.toggle('oculta'));
        btnCerrarChatbot.addEventListener('click', () => ventanaChatbot.classList.add('oculta'));

        // Función para enviar el mensaje al hacer clic o presionar Enter
        const enviarMensaje = async () => {
            const pregunta = inputChatbot.value.trim();
            if (pregunta === '') return;

            agregarMensaje(pregunta, 'usuario');
            inputChatbot.value = '';
            
            const mensajeEscribiendo = agregarMensaje('Asistente está escribiendo...', 'bot escribiendo');

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pregunta: pregunta })
                });

                if (!response.ok) throw new Error('Error en la respuesta de n8n');

                const data = await response.json();
                const textoRespuesta = data.respuesta || "No he podido entender tu pregunta. ¿Puedes reformularla?";
                
                cuerpoChatbot.removeChild(mensajeEscribiendo);
                agregarMensaje(textoRespuesta, 'bot');
            } catch (error) {
                console.error('Error al contactar al asistente de IA:', error);
                cuerpoChatbot.removeChild(mensajeEscribiendo);
                agregarMensaje('Lo siento, estoy teniendo problemas de conexión. Inténtalo más tarde.', 'bot');
            }
        };

        // Función auxiliar para crear y añadir burbujas de mensaje al chat
        const agregarMensaje = (texto, tipo) => {
            const divMensaje = document.createElement('div');
            divMensaje.className = `mensaje-${tipo}`;
            divMensaje.textContent = texto;
            cuerpoChatbot.appendChild(divMensaje);
            cuerpoChatbot.scrollTop = cuerpoChatbot.scrollHeight;
            return divMensaje;
        };

        btnEnviarChatbot.addEventListener('click', enviarMensaje);
        inputChatbot.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensaje();
        });
    }
    
});