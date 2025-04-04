import axios from "axios";

export const inscripcionCompetidor = async (formulario) =>
  await axios.post(
    "http://localhost:8000/api/inscripcion/competidor",
    formulario
  );

export const inscripcionTutor = async (formularioTutor) =>
  await axios.post(
    "http://localhost:8000/api/inscripcion/tutor",
    formularioTutor
  );
