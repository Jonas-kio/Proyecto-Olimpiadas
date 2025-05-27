import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable"; // ✅ Esto registra autoTable en jspdf@2.5.1

export const exportToExcel = (data, fileName = "reporte.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (data, fileName = "reporte.pdf") => {
  const doc = new jsPDF();

  const fechaActual = new Date().toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Título del reporte
  doc.setFontSize(14);
  doc.text("Reporte de Participantes - Olimpiadas 2025", 105, 20, { align: "center" });

  // Fecha
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${fechaActual}`, 105, 28, { align: "center" });

  // Tabla con datos
  const columns = Object.keys(data[0]);
  const rows = data.map((item) => columns.map((key) => item[key]));

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    theme: "striped",
    margin: { left: 14, right: 14 },
  });

  doc.save(fileName);
};
