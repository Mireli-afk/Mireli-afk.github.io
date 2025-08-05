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
        console.error("La base de datos de lotes (datos.js) no se ha cargado. Asegúrate de que el script se está importando correctamente en calculadora.html.");
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
            precioSinModInput.value = '';
            precioModificadoInput.value = '';
            precioEstimadoInput.value = '';
            return;
        }

        const infoLote = datosLotes[loteKey];
        const precioBase = infoLote.precio;
        const montoSeparacion = parseFloat(montoSeparacionInput.value) || 0;

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

    // --- FUNCIÓN PARA GENERAR Y DESCARGAR LA COTIZACIÓN EN PDF ---
    function descargarCotizacionPDF(e) {
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

        // 2. Validar campos
        if (!datos.nombres.trim()) {
            alert("Por favor, ingresa tu nombre y apellidos para generar la cotización.");
            return;
        }
        if (!loteSelect.value) {
            alert("Por favor, selecciona un lote para generar la cotización.");
            return;
        }
        if (parseFloat(montoSeparacionInput.value) < planSeleccionado.separacionMinima) {
            alert(`El monto de separación no puede ser menor a ${formatoMoneda(planSeleccionado.separacionMinima)} para este plan.`);
            return;
        }

        // 3. Crear el documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Cotización Referencial - Terrazas del Sol", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.text(`Fecha: ${datos.fecha}`, 15, 40);
        doc.text(`Cliente: ${datos.nombres}`, 15, 50);
        doc.text(`Lote seleccionado: ${datos.lote}`, 15, 60);
        doc.line(15, 65, 195, 65);
        
        doc.setFontSize(14);
        doc.text("Detalle del Financiamiento", 15, 75);
        doc.setFontSize(12);
        doc.text(`- Plan de pago: ${datos.plan}`, 15, 85);
        doc.text(`- Precio de lista: ${datos.precioOriginal}`, 15, 95);
        doc.text(`- Monto de separación: ${datos.montoSeparacion}`, 15, 105);
        doc.text(`- Precio final (con dcto./interés): ${datos.precioFinal}`, 15, 115);
        doc.text(`- Número de cuotas: ${datos.numCuotas}`, 15, 125);
        doc.text(`- Monto por cuota: ${datos.cuotaMensual}`, 15, 135);

        doc.setFontSize(10);
        doc.text("Este documento es una cotización referencial y no constituye un contrato.", 105, 160, null, null, "center");
        
        // 4. Guardar y descargar el PDF
        const nombreArchivo = `cotizacion_terrazas_del_sol_${datos.nombres.replace(/\s/g, '_')}.pdf`;
        doc.save(nombreArchivo);
    }

    // --- EVENT LISTENERS ---
    loteSelect.addEventListener('change', recalcularTodo);
    montoSeparacionInput.addEventListener('input', recalcularTodo);
    form.addEventListener('submit', descargarCotizacionPDF);

    // Llamada inicial para limpiar/calcular campos al cargar la página
    recalcularTodo();
});