import api from "./apiConfig";

//FUNCIONES DE INSCRIPCIÓN INDIVIDUAL

export const iniciarProceso = async (olimpiadaId, tipo) => {
  //ya ta
  return await api.post(`/inscripcion/olimpiada/${olimpiadaId}/iniciar`, {
    tipo,
  });
};

export const inscripcionCompetidor = async (procesoId, formulario) => {
  //ya ta
  return await api.post(
    `/inscripcion/proceso/${procesoId}/competidor`,
    formulario
  );
};

export const inscripcionTutor = async (procesoId, formularioTutor) => {
  //ya ta
  return await api.post(
    `/inscripcion/proceso/${procesoId}/tutor`,
    formularioTutor
  );
};
export const obtenerAreasPorOlimpiada = async (id) => {
  //ya ta
  const response = await api.get(`/libre/olimpiadas/${id}`);

  console.log("Respuesta cruda del backend:", response.data);
  const areas = response.data?.data?.olimpiada?.areas || [];

  console.log("Áreas extraídas correctamente:", areas);

  return areas;
};

export const obtenerCategoriasPorArea = async (areaId) => {
  //ya ta
  return await api.get(`/user/categoryLevel/area/${areaId}`);
};

export const guardarSeleccionArea = async (procesoId, payload) => {
  //ya ta
  return await api.post(`/inscripcion/proceso/${procesoId}/area`, payload);
};

export const guardarSeleccionNivel = async (procesoId, payload) => {
  //ya ta
  return await api.post(`/inscripcion/proceso/${procesoId}/nivel`, payload);
};

export const obtenerResumenInscripcion = async (procesoId) => {
  //ya ta
  return await api.get(`/inscripcion/proceso/${procesoId}/resumen`);
};

// export const inscripcionArea = async () => {
//   return await api.get("/inscripcion/area");
// };

export const inscripcionCategoryLevel = async () => {//ya ta
  return await api.get("/categoryLevelUser");
};
