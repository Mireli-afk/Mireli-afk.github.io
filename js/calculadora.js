// Espera a que todo el HTML esté cargado para empezar
document.addEventListener('DOMContentLoaded', function() {

    // --- BASE DE DATOS ---
    const datosLotes = {
        "A-20": 120, "A-21": 120, "A-22": 120, "A-23": 120, "B-19": 120, "B-32": 120, "B-34": 120, "E-20": 120, "E-21": 120, "E-14": 120, "E-24": 120, "E-43": 220, "F-1": 238, "F-11": 200, "F-12": 200, "F-13": 200, "F-14": 221, "F-15": 250, "F-16": 200, "F-17": 200, "F-18": 200, "F-19": 200, "F-21": 370, "F-25": 200, "F-26": 200, "G-1": 259, "G-11": 253, "G-12": 374, "H-11": 389, "H-12": 411, "H-14": 200, "H-21": 200, "I-5": 280, "I-6": 240, "I-7": 200, "I-12": 278, "J-19": 120, "J-20": 120, "J-21": 120, "J-22": 120
    };
    const PRECIO_POR_METRO = 547;
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
    
    // --- FUNCIÓN PARA FORMATEAR A MONEDA ---
    const formatoMoneda = (valor) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);

    // --- INICIALIZACIÓN DE LA PÁGINA ---

    // 1. Obtener el plan de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const planSeleccionado = planesFinanciamiento[planId] || planesFinanciamiento['contado']; // Plan por defecto si la URL es incorrecta
    
    // 2. Llenar la lista desplegable de lotes
    for (const lote in datosLotes) {
        const option = document.createElement('option');
        option.value = lote;
        option.textContent = `Manzana ${lote.split('-')[0]} - Lote ${lote.split('-')[1]} (${datosLotes[lote]} m²)`;
        loteSelect.appendChild(option);
    }

    // 3. Llenar campos por defecto del plan
    fechaInput.value = new Date().toLocaleDateString('es-PE');
    numCuotasInput.value = planSeleccionado.cuotas;
    montoSeparacionInput.value = planSeleccionado.separacionMinima;
    montoSeparacionInput.min = planSeleccionado.separacionMinima; // Establecer el mínimo
    if (planSeleccionado.descuento > 0) {
        descuentoInteresInput.value = `Dcto. ${formatoMoneda(planSeleccionado.descuento)}`;
    } else if (planSeleccionado.interes > 0) {
        descuentoInteresInput.value = `Interés: ${planSeleccionado.interes * 100}% mensual`;
    } else {
        descuentoInteresInput.value = "N/A";
    }

    // --- FUNCIÓN PRINCIPAL DE CÁLCULO ---
    function recalcularTodo() {
        const loteKey = loteSelect.value;
        if (!loteKey) return; // No hacer nada si no hay lote seleccionado

        const metrosCuadrados = datosLotes[loteKey];
        const precioBase = metrosCuadrados * PRECIO_POR_METRO;
        const montoSeparacion = parseFloat(montoSeparacionInput.value) || 0;

        precioSinModInput.value = formatoMoneda(precioBase);

        let precioFinal = 0;
        let cuotaMensual = 0;
        const capital = precioBase - montoSeparacion;

        if (planSeleccionado.interes > 0) { // Cálculo con interés
            const i = planSeleccionado.interes;
            const n = planSeleccionado.cuotas;
            // Fórmula de cuota fija (método francés)
            cuotaMensual = capital > 0 ? (capital * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : 0;
            precioFinal = (cuotaMensual * n) + montoSeparacion;
        } else { // Cálculo con descuento
            precioFinal = precioBase - planSeleccionado.descuento;
            cuotaMensual = planSeleccionado.cuotas > 0 ? (precioFinal - montoSeparacion) / planSeleccionado.cuotas : 0;
        }

        precioModificadoInput.value = formatoMoneda(precioFinal);
        precioEstimadoInput.value = planSeleccionado.cuotas > 1 ? formatoMoneda(cuotaMensual) : "Pago único";
    }

    // --- GENERACIÓN DEL PDF ---
    function generarPDF(e) {
        e.preventDefault(); // Evitar que el formulario se envíe
        
        // Cargar jsPDF desde la variable global
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Datos del formulario
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

        // Diseño del PDF
        doc.setFontSize(20);
        doc.text("Cotización Referencial - Terrazas del Sol", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.text(`Fecha: ${datos.fecha}`, 15, 40);
        doc.text(`Cliente: ${datos.nombres}`, 15, 50);
        doc.text(`Lote seleccionado: ${datos.lote}`, 15, 60);
        doc.line(15, 65, 195, 65); // Línea separadora
        
        doc.setFontSize(14);
        doc.text("Detalle del Financiamiento", 15, 75);
        doc.setFontSize(12);
        doc.text(`Plan de pago: ${datos.plan}`, 15, 85);
        doc.text(`Precio de lista: ${datos.precioOriginal}`, 15, 95);
        doc.text(`Monto de separación: ${datos.montoSeparacion}`, 15, 105);
        doc.text(`Precio final (con dcto./interés): ${datos.precioFinal}`, 15, 115);
        doc.text(`Número de cuotas: ${datos.numCuotas}`, 15, 125);
        doc.text(`Monto por cuota: ${datos.cuotaMensual}`, 15, 135);

        doc.setFontSize(10);
        doc.text("Este documento es una cotización referencial y no constituye un contrato.", 105, 160, null, null, "center");
        
        // Guardar el PDF
        doc.save(`cotizacion-terrazas-del-sol-${datos.nombres.replace(/\s/g, '_')}.pdf`);
    }

    // --- EVENT LISTENERS ---
    loteSelect.addEventListener('change', recalcularTodo);
    montoSeparacionInput.addEventListener('input', recalcularTodo);
    form.addEventListener('submit', generarPDF);

    // Llamada inicial para calcular con los valores por defecto
    recalcularTodo();
});