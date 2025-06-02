import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Función para mapear estado legible
const mapEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case "approved": return "Verificado";
    case "pending": return "Pendiente";
    case "rejected": return "Rechazado";
    default: return estado || "";
  }
};

export const exportToPDF = (data, resumen = {}, fileName = "reporte.pdf") => {
  const doc = new jsPDF("p", "mm", "a4");
  const fechaActual = new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" });

  doc.setFontSize(18).setTextColor(0, 51, 102);
  doc.text("Reporte de Participantes - Olimpiadas", 105, 20, { align: "center" });
  doc.setFontSize(10).setTextColor(100);
  doc.text(`Fecha de generación: ${fechaActual}`, 105, 28, { align: "center" });

  let currentY = 40;

  const noData = (!data || data.length === 0);
  const noResumen = (!resumen?.resumen_por_area?.length) && 
                    (!resumen?.estado_pagos || (
                      resumen.estado_pagos.total_recaudado === 0 &&
                      resumen.estado_pagos.total_pendiente === 0 &&
                      resumen.estado_pagos.porcentaje_verificado === 0
                    ));

  if (noData && noResumen) {
    // Mostrar confirmación
    const confirmar = window.confirm("No hay registros disponibles. ¿Estás seguro que quieres descargar el PDF?");
    if (!confirmar) {
      // Usuario canceló, salir sin descargar
      return;
    }

    // Si acepta, mostrar mensaje y guardar
    doc.setFontSize(12).setTextColor(150);
    doc.text("No hay registros disponibles.", 105, currentY, { align: "center" });
    doc.save(fileName);
    return;  // Detener aquí
  }

  // 🔹 Si hay datos, generar el PDF normalmente
  if (data.length) {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.Olimpiada]) acc[item.Olimpiada] = [];
      acc[item.Olimpiada].push(item);
      return acc;
    }, {});

    Object.keys(groupedData).forEach(olimpiada => {
      const participants = groupedData[olimpiada];
      doc.setFontSize(11).setTextColor(33, 33, 33).setFont(undefined, 'bold');
      doc.text(`${olimpiada}`, 14, currentY);
      doc.setFontSize(10).setTextColor(33, 33, 33).setFont(undefined, 'normal');
      doc.text(`${participants.length} Participante(s)`, 170, currentY);
      currentY += 6;

      autoTable(doc, {
        head: [["Participante", "Área", "Nivel", "Estado", "Fecha"]],
        body: participants.map(item => [
          item.Participante, item.Área, item.Nivel, mapEstado(item.Estado), item.Fecha
        ]),
        startY: currentY,
        styles: { fontSize: 9, cellPadding: 4, halign: 'center', lineWidth: 0.1, lineColor: [100, 100, 100] },
        headStyles: { fillColor: [25, 74, 138], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [230, 240, 255] },
        margin: { left: 14, right: 14 },
        theme: 'striped'
      });

      currentY = doc.lastAutoTable.finalY + 12;
    });
  }

  if (resumen?.resumen_por_area?.length || (resumen?.estado_pagos && (
    resumen.estado_pagos.total_recaudado > 0 ||
    resumen.estado_pagos.total_pendiente > 0 ||
    resumen.estado_pagos.porcentaje_verificado > 0
  ))) {
    doc.setDrawColor(120).setLineWidth(0.3);
    for (let x = 14; x < 196; x += 4) {
      doc.line(x, currentY, x + 2, currentY);
    }
    currentY += 10;

    const resumenX = 14;
    const estadoX = 140;
    const resumenWidth = 90;

    if (resumen?.resumen_por_area?.length) {
      doc.setFontSize(12).setFont(undefined, 'bold').setTextColor(0, 51, 102);
      doc.text("Resumen por Área", resumenX, currentY);
      autoTable(doc, {
        head: [["Área", "Participantes"]],
        body: resumen.resumen_por_area.map(item => [item.area, item.total_participantes]),
        startY: currentY + 5,
        margin: { left: resumenX },
        styles: { fontSize: 9, cellPadding: 3, halign: 'center', lineWidth: 0.1, lineColor: [120, 120, 120] },
        headStyles: { fillColor: [25, 74, 138], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        tableWidth: resumenWidth,
        theme: 'grid'
      });
    }

    if (resumen?.estado_pagos && (
      resumen.estado_pagos.total_recaudado > 0 ||
      resumen.estado_pagos.total_pendiente > 0 ||
      resumen.estado_pagos.porcentaje_verificado > 0
    )) {
      const estadoY = resumen?.resumen_por_area?.length ? doc.lastAutoTable.finalY + 2 : currentY;
      doc.setFontSize(12).setFont(undefined, 'bold').setTextColor(0, 51, 102);
      doc.text("Estado de Pagos", estadoX, estadoY - 22);
      doc.setFontSize(10).setFont(undefined, 'normal').setTextColor(80, 80, 80);
      doc.text(`Total Recaudado: Bs. ${resumen.estado_pagos.total_recaudado}`, estadoX, estadoY - 15);
      doc.text(`Pagos Pendientes: Bs. ${resumen.estado_pagos.total_pendiente}`, estadoX, estadoY - 10);
      doc.text(`Pagos Verificados: ${resumen.estado_pagos.porcentaje_verificado}%`, estadoX, estadoY - 5);
    }
  }

  doc.save(fileName);
};
