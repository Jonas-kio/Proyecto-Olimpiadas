import api from './apiConfig';

// Servicio para gestionar las olimpiadas
export const getOlimpiadas = async () => {
  try {
    const response = await api.get('/Olimpiadas');
    return response;
  } catch (error) {
    console.error('Error al obtener las olimpiadas:', error);
    throw error;
  }
};

export const getOlimpiadaDetail = async (id) => {
  try {
    const response = await api.get(`/olimpiadas/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener la olimpiada con ID ${id}:`, error);
    throw error;
  }
};

export const inscribirEnOlimpiada = async (olimpiadaId, datos) => {
  try {
    const response = await api.post(`/user/olimpiadas/${olimpiadaId}/inscribir`, datos);
    return response;
  } catch (error) {
    console.error('Error al inscribirse en la olimpiada:', error);
    throw error;
  }
};

export const getInscripciones = async () => {
  try {
    const response = await api.get(`/user/olimpiadas/inscripciones`);
    return response;
  } catch (error) {
    console.error('Error al obtener las inscripciones:', error);
    throw error;
  }
};

export const subirComprobante = async (inscripcionId, formData) => {
  try {
    const response = await api.post(
      `/user/olimpiadas/inscripciones/${inscripcionId}/comprobante`,
      formData,
      { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error al subir el comprobante:', error);
    throw error;
  }
};