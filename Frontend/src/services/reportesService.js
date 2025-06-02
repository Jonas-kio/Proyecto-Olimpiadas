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
