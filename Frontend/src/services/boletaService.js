// services/boletaService.js
import { jsPDF } from "jspdf";
import api from "./apiConfig";

// Valor predeterminado para el costo por área
const COSTO_POR_AREA_DEFAULT = 50;

// Genera un número único de boleta
export const generarNumeroBoleta = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const dia = fecha.getDate().toString().padStart(2, "0");
  const numeroSecuencial = Math.floor(10000 + Math.random() * 90000);

  return `OHSA-${año}${mes}${dia}-${numeroSecuencial}`;
};

// Genera la boleta en PDF
export const generarBoletaPDF = async (
  estudiante,
  tutores,
  areasSeleccionadas,
  numeroBoleta,
  costoPorArea // este argumento sigue, por si lo envías directo
) => {
  // Si no se proporciona costoPorArea, intenta usar el localStorage
  if (!costoPorArea) {
    const resumen = JSON.parse(localStorage.getItem("costosResumen"));
    costoPorArea = resumen?.monto_unitario ?? COSTO_POR_AREA_DEFAULT;
  }
  try {
    console.log("Generando PDF con datos:", {
      numeroBoleta,
      estudiante,
      areasSeleccionadas,
      costoPorArea,
    });

    // Generar el PDF en el frontend
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Fechas
    const fechaEmision = new Date().toLocaleDateString("es-BO");
    const fechaLimite = new Date(
      new Date().setDate(new Date().getDate() + 7)
    ).toLocaleDateString("es-BO");

    // Calcular total usando el costo proporcionado
    const resumen = JSON.parse(localStorage.getItem("costosResumen"));

    
    const precioArea = costoPorArea;
    const totalPago =
      resumen?.monto_total ?? areasSeleccionadas.length * precioArea;

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
    doc.text(
      `Nombre completo: ${estudiante.nombres} ${estudiante.apellidos}`,
      15,
      70
    );
    doc.text(`Documento: CI: ${estudiante.documento_identidad}`, 15, 76);
    doc.text(`Contacto: ${estudiante.correo_electronico}`, 15, 82);

    // DATOS DE LOS TUTORES
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("DATOS DEL TUTOR", 15, 92);

    let yPos = 100; // posición vertical inicial

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    tutores.forEach((tutor, index) => {
      doc.text(`Tutor ${index + 1}:`, 15, yPos);
      yPos += 6;
      doc.text(
        `Nombre completo: ${tutor.nombres} ${tutor.apellidos}`,
        15,
        yPos
      );
      yPos += 6;
      doc.text(
        `Contacto: ${tutor.correo_electronico} / ${tutor.telefono}`,
        15,
        yPos
      );
      yPos += 10; // separación entre tutores
    });

    // INFORMACIÓN INSTITUCIONAL
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("INFORMACIÓN INSTITUCIONAL", 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Institución: ${estudiante.colegio}`, 15, yPos);
    yPos += 6;
    const nivel = estudiante.curso?.includes("Primaria")
      ? "Primaria"
      : "Secundaria";
    doc.text(`Nivel: ${nivel}`, 15, yPos);
    yPos += 6;
    // INSTITUCIONAL (última línea):
    doc.text(`Ciudad: ${estudiante.provincia}`, 15, yPos);
    yPos += 10;

    // ÁREAS DE COMPETENCIA
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("ÁREAS DE COMPETENCIA", 15, yPos);
    yPos += 6;

    // Tabla
    doc.setFillColor(233, 238, 246);
    doc.setTextColor(26, 78, 142);
    doc.setFont("helvetica", "bold");
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.text("Área", 20, yPos + 6);
    doc.text("Precio", pageWidth / 2 - 10, yPos + 6);
    doc.text("Subtotal", pageWidth - 40, yPos + 6);
    yPos += 10;

    // Filas
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    resumen.desglose_combinaciones.forEach((item) => {
      const nombre = item.area.nombre;
      doc.text(nombre, 20, yPos + 6);
      doc.text(`Bs. ${item.costo_unitario_formateado}`, pageWidth / 2 - 10, yPos + 6);
      doc.text(`Bs. ${item.subtotal_formateado}`, pageWidth - 40, yPos + 6);
      doc.setDrawColor(220, 220, 220);
      doc.line(15, yPos + 8, pageWidth - 15, yPos + 8);
      yPos += 10;
    });

    // Total
    doc.setFillColor(233, 238, 246);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 78, 142);
    doc.rect(15, yPos, pageWidth - 30, 8, "F");
    doc.text("Total a pagar", pageWidth / 2 - 10, yPos + 6);
    doc.text(`Bs. ${totalPago}`, pageWidth - 40, yPos + 6);
    yPos += 20;

    // INFORMACIÓN IMPORTANTE
    doc.setFontSize(14);
    doc.setTextColor(26, 78, 142);
    doc.text("INFORMACIÓN IMPORTANTE", 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "Gracias por su inscripción en las Olimpiadas Oh! SanSi. Conserve esta boleta para sus registros.",
      15,
      yPos
    );

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      `Generado el: ${new Date().toLocaleString("es-BO")}`,
      15,
      doc.internal.pageSize.height - 10
    );

    // Retornar el PDF como blob
    return doc.output("blob");
  } catch (error) {
    console.error("Error al generar la boleta PDF:", error);
    throw error;
  }
};

// Función para enviar boleta por email - Intenta primero usar el backend, luego fallback al cliente de correo
export const enviarBoletaPorEmail = async (
  estudiante,
  tutores,
  areasSeleccionadas,
  numeroBoleta,
  correoDestino,
  costoPorArea
) => {
  if (!costoPorArea) {
    const resumen = JSON.parse(localStorage.getItem("costosResumen"));
    costoPorArea = resumen?.monto_unitario ?? COSTO_POR_AREA_DEFAULT;
  }
  try {
    // Generar el PDF
    const boletaPDF = await generarBoletaPDF(
      estudiante,
      tutores,
      areasSeleccionadas,
      numeroBoleta,
      costoPorArea
    );

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("pdf", boletaPDF, `Boleta_${numeroBoleta}.pdf`);
    formData.append("correo_destino", correoDestino);
    formData.append("numero_boleta", numeroBoleta);
    formData.append(
      "nombre_estudiante",
      `${estudiante.nombres} ${estudiante.apellidos}`
    );

    try {
      // Intentar enviar usando la ruta /boleta/enviar
      const response = await api.post("/boleta/enviar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Correo enviado exitosamente");
      return {
        success: true,
        message:
          response.data?.message ||
          `Boleta enviada correctamente a ${correoDestino}`,
      };
    } catch (error) {
      console.error("Error al enviar boleta:", error);
      // Si falla el envío por el backend, usar método alternativo
      return usarMetodoAlternativo(
        estudiante,
        tutores,
        areasSeleccionadas,
        numeroBoleta,
        correoDestino,
        costoPorArea
      );
    }
  } catch (error) {
    console.error("Error general en enviarBoletaPorEmail:", error);
    return usarMetodoAlternativo(
      estudiante,
      tutores,
      areasSeleccionadas,
      numeroBoleta,
      correoDestino,
      costoPorArea
    );
  }
};

// Método alternativo (cliente de correo)
const usarMetodoAlternativo = async (
  estudiante,
  tutores,
  areasSeleccionadas,
  numeroBoleta,
  correoDestino,
  costoPorArea
) => {
  try {
    console.log("Usando método alternativo de envío (cliente de correo)...");

    // Generar enlaces para servicios de correo
    const resultado = await generarEnlacesCorreo(
      estudiante,
      tutores,
      areasSeleccionadas,
      numeroBoleta,
      correoDestino,
      costoPorArea
    );

    // Abrir el cliente de correo predeterminado
    window.open(resultado.servicios.predeterminado, "_blank");

    return {
      success: true,
      message: `Se ha preparado un correo para enviar a ${correoDestino}. Por favor adjunte el PDF descargado.`,
    };
  } catch (error) {
    console.error("Error en método alternativo:", error);
    throw new Error(
      "No se pudo enviar la boleta por email. Intente descargando el PDF y enviándolo manualmente."
    );
  }
};

// Función para generar enlaces para servicios de correo
export const generarEnlacesCorreo = async (
  estudiante,
  tutores,
  areasSeleccionadas,
  numeroBoleta,
  correoDestino,
  costoPorArea
) => {
  if (!costoPorArea) {
    const resumen = JSON.parse(localStorage.getItem("costosResumen"));
    costoPorArea = resumen?.monto_unitario ?? COSTO_POR_AREA_DEFAULT;
  }
  try {
    // Generar el PDF
    const boletaPDF = await generarBoletaPDF(
      estudiante,
      tutores,
      areasSeleccionadas,
      numeroBoleta,
      costoPorArea
    );

    // Crear URL para el PDF
    const pdfUrl = URL.createObjectURL(boletaPDF);

    // Generar asunto y cuerpo del correo
    const asunto = `Boleta de Pago - Olimpiadas Oh! SanSi #${numeroBoleta}`;

    // Calcular el total a pagar
    const totalPago = areasSeleccionadas.length * costoPorArea;
    const fechaLimite = new Date(
      new Date().setDate(new Date().getDate() + 7)
    ).toLocaleDateString("es-BO");

    const cuerpo = `Estimado/a ${estudiante.nombres} ${estudiante.apellidos},

Adjunto encontrará su boleta de pago con número ${numeroBoleta} para su participación en las Olimpiadas Oh! SanSi.

INFORMACIÓN DE LA INSCRIPCIÓN:
- Estudiante: ${estudiante.nombres} ${estudiante.apellidos}
- Documento: ${estudiante.documento_identidad}
- Institución: ${estudiante.colegio}
- Áreas seleccionadas: ${areasSeleccionadas
      .map((area) => area.nombre)
      .join(", ")}
- Total a pagar: Bs. ${totalPago}
- Fecha límite de pago: ${fechaLimite}

Gracias por su inscripción. Conserve esta boleta para sus registros.

Saludos cordiales,
Equipo CodersSociety.srl`;

    // Crear enlaces para diferentes servicios de correo

    // Gmail
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      correoDestino
    )}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

    // Outlook/Hotmail
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
      correoDestino
    )}&subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      cuerpo
    )}`;

    // Cliente de correo predeterminado (como respaldo)
    const mailtoUrl = `mailto:${encodeURIComponent(
      correoDestino
    )}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      cuerpo
    )}`;

    return {
      success: true,
      pdfUrl: pdfUrl,
      servicios: {
        gmail: gmailUrl,
        outlook: outlookUrl,
        predeterminado: mailtoUrl,
      },
      message: "Boleta generada. Seleccione su servicio de correo preferido.",
    };
  } catch (error) {
    console.error("Error al generar los enlaces:", error);
    throw new Error(
      "No se pudo preparar la boleta para envío. Intente nuevamente."
    );
  }
};
