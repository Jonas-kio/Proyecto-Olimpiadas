import * as XLSX from "xlsx";

// Función para mapear estado legible
const mapEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case "approved": return "Verificado";
    case "pending": return "Pendiente";
    case "rejected": return "Rechazado";
    default: return estado || "";
  }
};

export const exportToExcel = (data, resumen = {}, fileName = "reporte.xlsx") => {
  const workbook = XLSX.utils.book_new();

  const noData = (!data || data.length === 0);
  const noResumen = (!resumen?.resumen_por_area?.length) && 
                    (!resumen?.estado_pagos || (
                      resumen.estado_pagos.total_recaudado === 0 &&
                      resumen.estado_pagos.total_pendiente === 0 &&
                      resumen.estado_pagos.porcentaje_verificado === 0
                    ));

  if (noData && noResumen) {
    // Mostrar confirmación
    const confirmar = window.confirm("No hay registros disponibles. ¿Estás seguro que quieres descargar el archivo?");
    if (!confirmar) {
      // Usuario canceló, salir sin descargar
      return;
    }

    // Si acepta, crear el archivo con mensaje
    const sheetData = [["No hay registros disponibles."]];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Reporte");

    XLSX.writeFile(workbook, fileName);
  } else {
    // Exportar normalmente
    if (data && data.length > 0) {
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.Olimpiada]) acc[item.Olimpiada] = [];
        acc[item.Olimpiada].push(item);
        return acc;
      }, {});

      const participantesData = [];
      Object.keys(groupedData).forEach(olimpiada => {
        participantesData.push({ Olimpiada: olimpiada });
        participantesData.push({
          Participante: "Participante", Área: "Área", Nivel: "Nivel", Estado: "Estado", Fecha: "Fecha"
        });
        groupedData[olimpiada].forEach(item => {
          participantesData.push({
            Participante: item.Participante,
            Área: item.Área,
            Nivel: item.Nivel,
            Estado: mapEstado(item.Estado),
            Fecha: item.Fecha
          });
        });
        participantesData.push({});
      });

      const participantesSheet = XLSX.utils.json_to_sheet(participantesData, { skipHeader: true });
      XLSX.utils.book_append_sheet(workbook, participantesSheet, "Participantes");
    }

    if (resumen?.resumen_por_area?.length > 0) {
      const resumenAreaData = resumen.resumen_por_area.map(item => ({
        Área: item.area,
        Participantes: item.total_participantes
      }));
      const resumenAreaSheet = XLSX.utils.json_to_sheet(resumenAreaData);
      XLSX.utils.book_append_sheet(workbook, resumenAreaSheet, "Resumen por Área");
    }

    if (resumen?.estado_pagos && (
      resumen.estado_pagos.total_recaudado > 0 ||
      resumen.estado_pagos.total_pendiente > 0 ||
      resumen.estado_pagos.porcentaje_verificado > 0
    )) {
      const estadoPagosData = [
        ["Estado de Pagos"],
        ["Total Recaudado", resumen.estado_pagos.total_recaudado],
        ["Pagos Pendientes", resumen.estado_pagos.total_pendiente],
        ["Pagos Verificados (%)", resumen.estado_pagos.porcentaje_verificado]
      ];
      const estadoPagosSheet = XLSX.utils.aoa_to_sheet(estadoPagosData);
      XLSX.utils.book_append_sheet(workbook, estadoPagosSheet, "Estado de Pagos");
    }

    XLSX.writeFile(workbook, fileName);
  }
};
