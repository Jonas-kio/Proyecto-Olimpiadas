// services/boletaService.js
import { jsPDF } from 'jspdf';
// Eliminamos la importación de autoTable ya que causa problemas

// Genera un número único de boleta
export const generarNumeroBoleta = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const numeroSecuencial = Math.floor(10000 + Math.random() * 90000);
  
  return `OHSA-${año}${mes}${dia}-${numeroSecuencial}`;
};

// Genera la boleta en PDF (versión sin autoTable)
export const generarBoletaPDF = async (estudiante, tutores, areasSeleccionadas, numeroBoleta) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Fechas
    const fechaEmision = new Date().toLocaleDateString('es-BO');
    const fechaLimite = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('es-BO');
    
    // Calcular total
    const precioArea = 50;
    const totalPago = areasSeleccionadas.length * precioArea;
    
    // ENCABEZADO
    doc.setFontSize(20);
    doc.setTextColor(26, 78, 142);
    doc.setFont("helvetica", "bold");
    doc.text("Boleta de Pago", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(102, 102, 102);
    doc.text("Olimpiadas Oh! SanSi", pageWidth / 2, 28, { align: "center" });
    
    // Información de la boleta
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nº de Boleta: ${numeroBoleta}`, 15, 40);
    doc.text(`Fecha de Emisión: ${fechaEmision}`, 15, 46);
    doc.text(`Fecha Límite de Pago: ${fechaLimite}`, 15, 52);
    
    // DATOS DEL ESTUDIANTE
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("DATOS DEL ESTUDIANTE", 15, 62);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre completo: ${estudiante.nombres} ${estudiante.apellidos}`, 15, 70);
    doc.text(`Documento: CI: ${estudiante.documento_identidad}`, 15, 76);
    doc.text(`Contacto: ${estudiante.correo_electronico}`, 15, 82);
    
    // DATOS DEL TUTOR
    const tutorPrincipal = tutores[0];
    
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("DATOS DEL TUTOR", 15, 92);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre completo: ${tutorPrincipal.nombres} ${tutorPrincipal.apellidos}`, 15, 100);
    doc.text(`Contacto: ${tutorPrincipal.correo_electronico} / ${tutorPrincipal.telefono}`, 15, 106);
    
    // INFORMACIÓN INSTITUCIONAL
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("INFORMACIÓN INSTITUCIONAL", 15, 116);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Institución: ${estudiante.colegio}`, 15, 124);
    const nivel = estudiante.curso.includes('Primaria') ? 'Primaria' : 'Secundaria';
    doc.text(`Nivel: ${nivel}`, 15, 130);
    doc.text(`Ciudad: ${estudiante.provincia}`, 15, 136);
    
    // ÁREAS DE COMPETENCIA
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("ÁREAS DE COMPETENCIA", 15, 146);
    
    // Crear tabla manualmente en lugar de usar autoTable
    let startY = 152;
    
    // Encabezado de tabla
    doc.setFillColor(233, 238, 246);
    doc.setTextColor(26, 78, 142);
    doc.rect(15, startY, pageWidth - 30, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Área", 20, startY + 6);
    doc.text("Precio", pageWidth/2 - 10, startY + 6);
    doc.text("Subtotal", pageWidth - 40, startY + 6);
    
    startY += 10;
    
    // Cuerpo de la tabla
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    areasSeleccionadas.forEach(area => {
      doc.text(area, 20, startY + 6);
      doc.text(`Bs. ${precioArea}`, pageWidth/2 - 10, startY + 6);
      doc.text(`Bs. ${precioArea}`, pageWidth - 40, startY + 6);
      doc.setDrawColor(220, 220, 220);
      doc.line(15, startY + 8, pageWidth - 15, startY + 8);
      startY += 10;
    });
    
    // Pie de tabla
    doc.setFillColor(233, 238, 246);
    doc.rect(15, startY, pageWidth - 30, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 78, 142);
    doc.text("Total a pagar", pageWidth/2 - 10, startY + 6);
    doc.text(`Bs. ${totalPago}`, pageWidth - 40, startY + 6);
    
    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(`Generado el: ${new Date().toLocaleString('es-BO')}`, 15, doc.internal.pageSize.height - 10);
    
    // Retornar el PDF como blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error al generar la boleta PDF:", error);
    throw error;
  }
};

// Envía la boleta por correo electrónico
export const enviarBoletaPorEmail = async (estudiante, tutores, areasSeleccionadas, numeroBoleta, correoDestino) => {
  try {
    // Generar el PDF de la boleta
    const boletaPDF = await generarBoletaPDF(estudiante, tutores, areasSeleccionadas, numeroBoleta);
    
    // Simulación de envío de correo (aquí iría la llamada a tu API para enviar el correo)
    console.log(`Enviando boleta a ${correoDestino}`);
    
    // Simulamos un tiempo de envío
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Boleta enviada correctamente a ${correoDestino}`
        });
      }, 1500);
    });
  } catch (error) {
    console.error("Error al enviar la boleta:", error);
    throw new Error("No se pudo enviar la boleta por correo. Intente nuevamente.");
  }
};