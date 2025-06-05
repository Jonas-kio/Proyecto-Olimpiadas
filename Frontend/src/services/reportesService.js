import api from './apiConfig';

//Obtener todos los registros del reporte (detalle de inscripciones)
export const getReporteInscripciones = async (filtros = {}) => {
  try {
    const response = await api.get('/reporte-inscripciones', { params: filtros });
    console.log(response);
    if (response.data.success) {
      return response.data.data; // Aquí retorna solo los datos del reporte
    } else {
      throw new Error(response.data.message || 'Error al obtener el reporte de inscripciones');
    }
  } catch (error) {
    console.error('Error al obtener el reporte de inscripciones:', error);
    throw error;
  }
};

//Obtener resumen del reporte (agrupado por área, pagos, etc.)
export const getResumenInscripciones = async (filtros = {}) => {
  try {
    const response = await api.get('/reporte-inscripciones/resumen', { params: filtros });

    if (response.data.success) {
      return response.data; // Retorna toda la respuesta (incluye resumen_por_area y estado_pagos)
    } else {
      throw new Error(response.data.message || 'Error al obtener el resumen de inscripciones');
    }
  } catch (error) {
    console.error('Error al obtener el resumen de inscripciones:', error);
    throw error;
  }
};


// Obtener resumen general del dashboard (total inscritos, participantes, áreas, instituciones)
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data; // { total_inscritos, participantes_unicos, areas_activas, instituciones }
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    throw error;
  }
};

// Obtener inscripciones recientes
export const getRecentRegistrations = async () => {
  try {
    const response = await api.get('/dashboard/recent-registrations');
    return response.data; // array de registros
  } catch (error) {
    console.error('Error al obtener inscripciones recientes:', error);
    throw error;
  }
};

// Obtener resumen de pagos
export const getPaymentSummary = async () => {
  try {
    const response = await api.get('/dashboard/payment-summary');
    if (response.data.success) {
      return response.data.estado_pagos; // { total_recaudado, total_pendiente, porcentaje_verificado }
    } else {
      throw new Error('Error en la respuesta del backend');
    }
  } catch (error) {
    console.error('Error al obtener resumen de pagos:', error);
    throw error;
  }
};

export const getInscritosPorOlimpiada = async (olimpiadaId) => {
  try {
    const response = await api.get(`/olimpiadas/${olimpiadaId}/inscritos`);
    return response.data.total_inscritos;
  } catch (error) {
    console.error('Error al obtener inscritos por olimpiada:', error);
    throw error;
  }
};
