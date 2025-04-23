
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