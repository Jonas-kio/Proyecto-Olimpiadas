import api from './apiConfig';

// Servicio para obtener olimpiadas - intenta ambas rutas posibles
export const getOlimpiadas = async () => {
  try {
    // Primero intentar con la ruta pública que parece ser la que funciona
    const response = await api.get('/libre/olimpiadas');
    return response;
  } catch (error) {
    console.log("Error en ruta pública, intentando ruta admin...", error.message);
    // Si falla la ruta pública, intentar con la ruta admin
    try {
      const adminResponse = await api.get('/olimpiadas');
      return adminResponse;
    } catch (secondError) {
      console.error("Error en ambas rutas:", secondError.message);
      throw secondError;
    }
  }
};

export const getOlimpiadaDetail = async (id) => {
  try {
    // Primero intentar con la ruta pública
    const response = await api.get(`/libre/olimpiadas/${id}`);
    return response;
  } catch (error) {
    // Si falla, intentar con la ruta admin
    console.log("Error en ruta pública, intentando ruta admin...", error.message);
    const adminResponse = await api.get(`/olimpiadas/${id}`);
    return adminResponse;
  }
};

export const inscribirEnOlimpiada = async (olimpiadaId, datos) => {
  const response = await api.post(`/user/olimpiadas/${olimpiadaId}/inscribir`, datos);
  return response;
};

export const getInscripciones = async () => {
  const response = await api.get(`/user/olimpiadas/inscripciones`);
  return response;
};

// Exportamos también las funciones del admin para mantener compatibilidad
export const crearOlimpiada = async (olimpiada) => {
  return await api.post("/olimpiadas", olimpiada);
};

export const eliminarOlimpiada = async (id) => {
  return await api.delete(`/olimpiadas/${id}`);
};

export const actualizarOlimpiada = async (id, newOlimpiada) => {
  return await api.put(`/olimpiadas/${id}`, newOlimpiada);
};

export const obtenerAreas = async () => {
  try {
    const response = await api.get("/areas");
    return response.data;
  } catch (error) {
    // Si falla, intentar con la ruta alternativa
    console.error("Error al obtener áreas:", error.message);
    const altResponse = await api.get("/inscripcion/area");
    return altResponse.data;
  }
};

export const obtenerBoletasPorOlimpiadas= async () => {
  try {
    const response = await api.get('boletas/olimpiada');
    return response.data;
  } catch (error) {
    console.error('Error al obtener boletas por olimpiada:', error);
    throw error;
  }
};