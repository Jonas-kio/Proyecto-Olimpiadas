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
export const obtenerAreasPorOlimpiada = async (olimpiadaId) => {
  try {
    const response = await api.get(`/user/olimpiadas/${olimpiadaId}/areas`);
    const areasObtenidas = response.data;
    console.log("Areas obtenidas correctamente: ", areasObtenidas);

    return areasObtenidas;
  } catch (error) {
    console.error(
      `Error al obtener las áreas de la olimpiada ${olimpiadaId}:`,
      error
    );
    throw error;
  }
};

export const obtenerCategoriasPorArea = async (areaId) => {
  return await api.get(`/user/categoryLevel/area/${areaId}`);
};

export const guardarSeleccionArea = async (procesoId, payload) => {
  return await api.post(`/inscripcion/proceso/${procesoId}/area`, payload);
};

export const guardarSeleccionNivel = async (procesoId, payload) => {
  return await api.post(`/inscripcion/proceso/${procesoId}/nivel`, payload);
};

// generar boleta
export const generarBoleta = async (procesoId) => {
  return await api.post(`/inscripcion/proceso/${procesoId}/boleta`);
};

export const obtenerResumenInscripcion = async (procesoId) => {
  return await api.get(`/inscripcion/proceso/${procesoId}/resumen`);
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

export const ValidarProcesoOCR = async (payload) => {
  try {
    console.log("Iniciando solicitud OCR con proceso ID:", payload.registration_process_id);
    
    // Ajusta el endpoint según sea necesario
    const response = await api.post('/ocr/procesar-comprobante', {
      texto: payload.texto,
      registration_process_id: payload.registration_process_id,
      comprobante: payload.comprobante
    });
    
    console.log("Respuesta del servidor OCR:", response.status);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(
        response.data.mensaje || response.data.message || "Error al validar el proceso OCR"
      );
    }
  } catch (error) {
    console.error("Error al validar el proceso OCR:", error);
    
    // Mejorar la información de error
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
    
    throw error;
  }
};

export const obtenerAsociadosPagador = async (procesoId) => {
  try {
    const response = await api.get(`/ocr/competidores/${procesoId}`);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(
        response.data.message || "Error al obtener los asociados del pagador"
      );
    }
  } catch (error) {
    console.error("Error al obtener los asociados del pagador:", error);
    throw error;
  }
}

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