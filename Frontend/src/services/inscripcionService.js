
import api from './apiConfig';

export const inscripcionCompetidor = async (formulario) => {
  return await api.post("/inscripcion/competidor", formulario);
};

export const inscripcionTutor = async (formularioTutor) => {
  return await api.post("/inscripcion/tutor", formularioTutor);
};

export const inscripcionArea = async () => {
  return await api.get("/inscripcion/area");
};

export const optenerInscrion = async () => {
  return await api.get(`/user/inscripcion/procesos`);
}

export const optenerInscripcionId = async (procesoId) => {
  try {
    const response = await api.get(`/user/inscripcion/proceso/${procesoId}`);
    return response.data; // Asegúrate de que `response.data` contenga el JSON esperado
  } catch (error) {
    console.error("Error al obtener inscripción por ID:", error);
    throw error; // Lanza el error para que el componente lo maneje
  }
};