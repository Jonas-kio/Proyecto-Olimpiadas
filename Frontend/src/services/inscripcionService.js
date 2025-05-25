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

export const inscripcionCategoryLevel = async () => {
  //ya ta
  return await api.get("/categoryLevelUser");
};

// Función para obtener todos los costos
export const getPublicCosts = async () => {
  try {
    const response = await api.get("/public/costs"); // Llamada a tu nueva ruta
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Error al obtener los costos públicos"
      );
    }
  } catch (error) {
    console.error("Error al obtener los costos públicos:", error);
    throw error;
  }
};

export const verificarEstadoProceso = async (procesoId) => {
  try {
    const response = await api.get(`/inscripcion/proceso/${procesoId}/estado`);
    if (response.data.success) {
      return response.data; // Devuelve todo el objeto con estado, label, activo y más
    } else {
      throw new Error(
        response.data.message || "Error al verificar el estado del proceso"
      );
    }
  } catch (error) {
    console.error("Error al verificar el estado del proceso:", error);
    throw error;
  }
};

// Función para obtener diagnóstico del proceso de inscripción
export const diagnosticarProceso = async (procesoId) => {
  try {
    const response = await api.get(
      `/api/inscripcion/proceso/${procesoId}/diagnostico`
    );
    if (response.data.success) {
      console.log("Diagnóstico del proceso:", response.data);
      return response.data;
    } else {
      throw new Error(
        response.data.message || "Error al diagnosticar el proceso"
      );
    }
  } catch (error) {
    console.error("Error al diagnosticar el proceso:", error);
    throw error;
  }
};
