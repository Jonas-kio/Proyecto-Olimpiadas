// services/boletaService.js
import { jsPDF } from 'jspdf';
import api from './apiConfig';

// Genera un número único de boleta
export const generarNumeroBoleta = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const numeroSecuencial = Math.floor(10000 + Math.random() * 90000);
  
  return `OHSA-${año}${mes}${dia}-${numeroSecuencial}`;
};

// Genera la boleta en PDF
export const generarBoletaPDF = async (estudiante, tutores, areasSeleccionadas, numeroBoleta) => {
  try {
    console.log('Generando PDF con datos:', { numeroBoleta, estudiante, areasSeleccionadas });
    
    // Generar el PDF en el frontend
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
    const nivel = estudiante.curso?.includes('Primaria') ? 'Primaria' : 'Secundaria';
    doc.text(`Nivel: ${nivel}`, 15, 130);
    doc.text(`Ciudad: ${estudiante.provincia}`, 15, 136);
    
    // ÁREAS DE COMPETENCIA
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("ÁREAS DE COMPETENCIA", 15, 146);
    
    // Crear tabla manualmente
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
    
    // Instrucciones de pago
    startY += 20;
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("INSTRUCCIONES DE PAGO", 15, startY);
    
    startY += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Por favor, realice el pago mediante transferencia bancaria o depósito a la siguiente cuenta:", 15, startY);
    
    startY += 10;
    doc.text("Banco: Banco Nacional de Bolivia", 15, startY);
    startY += 6;
    doc.text("Cuenta: 1000-456789-001", 15, startY);
    startY += 6;
    doc.text("Titular: Olimpiadas Oh! SanSi", 15, startY);
    startY += 6;
    doc.text(`Concepto: ${numeroBoleta} - ${estudiante.nombres} ${estudiante.apellidos}`, 15, startY);
    
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

// Función para enviar boleta por email usando el backend existente
export const enviarBoletaPorEmail = async (estudiante, tutores, areasSeleccionadas, numeroBoleta, correoDestino) => {
  try {
    // Primero generar el PDF
    const boletaPDF = await generarBoletaPDF(estudiante, tutores, areasSeleccionadas, numeroBoleta);
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('pdf', boletaPDF, `Boleta_${numeroBoleta}.pdf`);
    formData.append('correo_destino', correoDestino);
    formData.append('numero_boleta', numeroBoleta);
    formData.append('nombre_estudiante', `${estudiante.nombres} ${estudiante.apellidos}`);
    
    // Consumir endpoint del backend para enviar el correo - usando la ruta existente
    const response = await api.post('/boleta/email', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      message: response.data?.message || `Boleta enviada correctamente a ${correoDestino}`
    };
  } catch (error) {
    console.error("Error al enviar la boleta por email:", error);
    // En caso de error con el backend, enviar mediante enlaces de correo como fallback
    try {
      console.log("Intentando método alternativo de envío...");
      const enlaces = await generarEnlacesCorreo(estudiante, tutores, areasSeleccionadas, numeroBoleta, correoDestino);
      
      // Abrir el cliente de correo predeterminado
      window.open(enlaces.servicios.predeterminado, '_blank');
      
      return {
        success: true,
        message: `Se ha preparado un correo para enviar a ${correoDestino}. Por favor adjunte el PDF descargado.`
      };
    } catch (fallbackError) {
      console.error("Error en método alternativo:", fallbackError);
      throw new Error("No se pudo enviar la boleta por email. Intente descargando el PDF y enviándolo manualmente.");
    }
  }
};

// Función para generar enlaces para servicios de correo (plan B si no funciona el backend)
// Función para generar enlaces para servicios de correo
export const generarEnlacesCorreo = async (estudiante, tutores, areasSeleccionadas, numeroBoleta, correoDestino) => {
  try {
    // Generar el PDF
    const boletaPDF = await generarBoletaPDF(estudiante, tutores, areasSeleccionadas, numeroBoleta);
    
    // Crear URL para el PDF
    const pdfUrl = URL.createObjectURL(boletaPDF);
    
    // Generar asunto y cuerpo del correo
    const asunto = `Boleta de Pago - Olimpiadas Oh! SanSi #${numeroBoleta}`;
    
    // Preparar un cuerpo de correo más detallado
    const precioArea = 50;
    const totalPago = areasSeleccionadas.length * precioArea;
    const fechaLimite = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('es-BO');

    const cuerpo = `Estimado/a ${estudiante.nombres} ${estudiante.apellidos},

Adjunto encontrará su boleta de pago con número ${numeroBoleta} para su participación en las Olimpiadas Oh! SanSi.

INFORMACIÓN DE LA INSCRIPCIÓN:
- Estudiante: ${estudiante.nombres} ${estudiante.apellidos}
- Documento: ${estudiante.documento_identidad}
- Institución: ${estudiante.colegio}
- Áreas seleccionadas: ${areasSeleccionadas.join(', ')}
- Total a pagar: Bs. ${totalPago}

INSTRUCCIONES DE PAGO:
- Banco: Banco Nacional de Bolivia
- Cuenta: 1000-456789-001
- Titular: Olimpiadas Oh! SanSi
- Concepto: ${numeroBoleta} - ${estudiante.nombres} ${estudiante.apellidos}
- Fecha límite de pago: ${fechaLimite}

Por favor, realice el pago y guarde su comprobante para presentarlo cuando sea requerido.

Saludos cordiales,
Equipo Olimpiadas Oh! SanSi`;
    
    // Crear enlaces para diferentes servicios de correo
    
    // Gmail
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correoDestino)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    
    // Outlook/Hotmail
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(correoDestino)}&subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    
    // Cliente de correo predeterminado (como respaldo)
    const mailtoUrl = `mailto:${encodeURIComponent(correoDestino)}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    
    return {
      success: true,
      pdfUrl: pdfUrl,
      servicios: {
        gmail: gmailUrl,
        outlook: outlookUrl,
        predeterminado: mailtoUrl
      },
      message: "Boleta generada. Seleccione su servicio de correo preferido."
    };
  } catch (error) {
    console.error("Error al generar los enlaces:", error);
    throw new Error("No se pudo preparar la boleta para envío. Intente nuevamente.");
  }
};