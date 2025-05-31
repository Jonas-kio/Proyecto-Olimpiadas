import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data, fileName = "reporte.xlsx") => {
  // Agrupar por Olimpiada
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.Olimpiada]) {
      acc[item.Olimpiada] = [];
    }
    acc[item.Olimpiada].push(item);
    return acc;
  }, {});

  const worksheetData = [];
  Object.keys(groupedData).forEach(olimpiada => {
    worksheetData.push({ Olimpiada: olimpiada });
    worksheetData.push({
      Participante: "Participante", Área: "Área", Nivel: "Nivel", Estado: "Estado", Fecha: "Fecha"
    });
    groupedData[olimpiada].forEach(item => {
      worksheetData.push({
        Participante: item.Participante,
        Área: item.Área,
        Nivel: item.Nivel,
        Estado: item.Estado,
        Fecha: item.Fecha
      });
    });
    worksheetData.push({}); // Línea vacía entre secciones
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes por Olimpiada");
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (data, fileName = "reporte.pdf") => {
  const doc = new jsPDF("p", "mm", "a4");
  const fechaActual = new Date().toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(16);
  doc.text("Reporte de Participantes - Olimpiadas 2025", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${fechaActual}`, 105, 28, { align: "center" });

  let currentY = 40;

  // Agrupar por Olimpiada
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.Olimpiada]) {
      acc[item.Olimpiada] = [];
    }
    acc[item.Olimpiada].push(item);
    return acc;
  }, {});

  Object.keys(groupedData).forEach(olimpiada => {
    const participants = groupedData[olimpiada];

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${olimpiada} (${participants.length} Participantes)`, 14, currentY);
    currentY += 6;

    autoTable(doc, {
      head: [["Participante", "Área", "Nivel", "Estado", "Fecha"]],
      body: participants.map(item => [
        item.Participante, item.Área, item.Nivel, item.Estado, item.Fecha
      ]),
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 10, right: 10 },
      theme: 'striped'
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  doc.save(fileName);
};
