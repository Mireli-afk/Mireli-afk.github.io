// Espera a que todo el HTML de la calculadora.html esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- BASE DE DATOS DE PLANES ---
    // La base de datos de lotes (`datosLotes`) se carga desde el archivo `js/datos.js`
    const planesFinanciamiento = {
        "contado": { nombre: "Contado hasta 30 días", cuotas: 1, descuento: 5500, interes: 0, separacionMinima: 1000 },
        "3": { nombre: "3 Cuotas Mensuales", cuotas: 3, descuento: 3500, interes: 0, separacionMinima: 5000 },
        "6": { nombre: "6 Cuotas Mensuales", cuotas: 6, descuento: 2500, interes: 0, separacionMinima: 10000 },
        "12": { nombre: "12 Cuotas Mensuales", cuotas: 12, descuento: 1000, interes: 0, separacionMinima: 10000 },
        "24": { nombre: "24 Cuotas Mensuales", cuotas: 24, descuento: 0, interes: 0, separacionMinima: 10000 },
        "36": { nombre: "36 Cuotas Mensuales", cuotas: 36, descuento: 0, interes: 0.0125, separacionMinima: 10000 },
        "48": { nombre: "48 Cuotas Mensuales", cuotas: 48, descuento: 0, interes: 0.0150, separacionMinima: 1000 }
    };

    // --- ELEMENTOS DEL FORMULARIO ---
    const form = document.getElementById('formulario-calculadora');
    const loteSelect = document.getElementById('lote-select');
    const fechaInput = document.getElementById('fecha');
    const descuentoInteresInput = document.getElementById('descuento-interes');
    const montoSeparacionInput = document.getElementById('monto-separacion');
    const precioSinModInput = document.getElementById('precio-sin-mod');
    const precioModificadoInput = document.getElementById('precio-modificado');
    const numCuotasInput = document.getElementById('num-cuotas');
    const precioEstimadoInput = document.getElementById('precio-estimado');
    
    // --- FUNCIÓN PARA FORMATEAR A MONEDA (Soles) ---
    const formatoMoneda = (valor) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

    // --- INICIALIZACIÓN DE LA PÁGINA ---

    // 1. Obtener el plan seleccionado desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const planSeleccionado = planesFinanciamiento[planId] || Object.values(planesFinanciamiento)[0]; // Plan por defecto si la URL es incorrecta
    
    // 2. Llenar la lista desplegable de lotes desde la base de datos central
    if (typeof datosLotes !== 'undefined') {
        for (const loteKey in datosLotes) {
            const option = document.createElement('option');
            option.value = loteKey;
            const infoLote = datosLotes[loteKey];
            option.textContent = `Manzana ${loteKey.split('-')[0]} - Lote ${loteKey.split('-')[1]} (${infoLote.area} m² - ${formatoMoneda(infoLote.precio)})`;
            loteSelect.appendChild(option);
        }
    } else {
        console.error("La base de datos de lotes (datos.js) no se ha cargado.");
    }

    // 3. Autocompletar campos fijos del formulario
    fechaInput.value = new Date().toLocaleDateString('es-PE');
    numCuotasInput.value = planSeleccionado.cuotas;
    montoSeparacionInput.value = planSeleccionado.separacionMinima;
    montoSeparacionInput.min = planSeleccionado.separacionMinima;
    
    if (planSeleccionado.descuento > 0) {
        descuentoInteresInput.value = `Dcto. ${formatoMoneda(planSeleccionado.descuento)}`;
    } else if (planSeleccionado.interes > 0) {
        descuentoInteresInput.value = `Interés: ${(planSeleccionado.interes * 100).toFixed(2)}% mensual`;
    } else {
        descuentoInteresInput.value = "Sin descuento ni interés";
    }

    // --- FUNCIÓN PRINCIPAL DE CÁLCULO (SE EJECUTA AL CAMBIAR LOTE O MONTO) ---
    function recalcularTodo() {
        const loteKey = loteSelect.value;
        if (!loteKey || typeof datosLotes === 'undefined') {
             // Limpiar campos si no hay lote seleccionado
            precioSinModInput.value = '';
            precioModificadoInput.value = '';
            precioEstimadoInput.value = '';
            return;
        }

        const infoLote = datosLotes[loteKey];
        const precioBase = infoLote.precio;
        const montoSeparacion = parseFloat(montoSeparacionInput.value);

        // Validar que el monto de separación no sea menor al mínimo
        if (montoSeparacion < planSeleccionado.separacionMinima) {
            montoSeparacionInput.style.borderColor = 'red';
        } else {
            montoSeparacionInput.style.borderColor = '#ccc';
        }
        
        precioSinModInput.value = formatoMoneda(precioBase);

        let precioFinal = 0;
        let cuotaMensual = 0;
        const capital = precioBase - montoSeparacion;

        if (planSeleccionado.interes > 0 && capital > 0) { // CÁLCULO CON INTERÉS
            const i = planSeleccionado.interes;
            const n = planSeleccionado.cuotas;
            cuotaMensual = (capital * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            precioFinal = (cuotaMensual * n) + montoSeparacion;
        } else { // CÁLCULO CON DESCUENTO O SIN MODIFICACIÓN
            precioFinal = precioBase - planSeleccionado.descuento;
            const saldoAPagar = precioFinal - montoSeparacion;
            cuotaMensual = planSeleccionado.cuotas > 1 && saldoAPagar > 0 ? saldoAPagar / planSeleccionado.cuotas : 0;
        }

        precioModificadoInput.value = formatoMoneda(precioFinal);
        precioEstimadoInput.value = planSeleccionado.cuotas > 1 ? formatoMoneda(cuotaMensual) : "Pago único";
    }

    // --- FUNCIÓN PARA GENERAR Y ENVIAR ENLACE DE WHATSAPP ---
    function generarEnlaceWhatsapp(e) {
        e.preventDefault();

        // 1. Recopilar datos
        const datos = {
            nombres: document.getElementById('nombres').value,
            lote: loteSelect.options[loteSelect.selectedIndex].text,
            fecha: fechaInput.value,
            plan: planSeleccionado.nombre,
            montoSeparacion: formatoMoneda(montoSeparacionInput.value),
            precioOriginal: precioSinModInput.value,
            precioFinal: precioModificadoInput.value,
            numCuotas: numCuotasInput.value,
            cuotaMensual: precioEstimadoInput.value
        };

        if (!datos.nombres.trim()) {
            alert("Por favor, ingresa tu nombre y apellidos.");
            return;
        }
        if (!loteSelect.value) {
            alert("Por favor, selecciona un lote.");
            return;
        }
        if (parseFloat(montoSeparacionInput.value) < planSeleccionado.separacionMinima) {
            alert(`El monto de separación no puede ser menor a ${formatoMoneda(planSeleccionado.separacionMinima)} para este plan.`);
            return;
        }

        // 2. Codificar datos para la URL
        const datosJSON = JSON.stringify(datos);
        const datosCodificados = btoa(datosJSON);

        // 3. Crear URL de la cotización online
        const urlCotizacion = `https://mireli-afk.github.io/cotizacion.html?data=${datosCodificados}`;

        // 4. Crear mensaje para WhatsApp
        const mensajeTexto = encodeURIComponent(
`Hola, estoy interesado/a en separar un lote.
Aquí está el enlace a mi cotización personalizada y segura:

${urlCotizacion}

Espero su pronta respuesta. ¡Gracias!`
        );

        // 5. Abrir WhatsApp
        const numeroWhatsapp = "51954742266";
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${mensajeTexto}`;
        window.open(urlWhatsapp, '_blank');
    }

    // --- EVENT LISTENERS ---
    loteSelect.addEventListener('change', recalcularTodo);
    montoSeparacionInput.addEventListener('input', recalcularTodo);
    form.addEventListener('submit', generarEnlaceWhatsapp);

    // Llamada inicial para limpiar los campos de precios
    recalcularTodo();
});