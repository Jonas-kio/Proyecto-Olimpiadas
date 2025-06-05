import api from "./apiConfig";

//FUNCIONES DE INSCRIPCIÓN INDIVIDUAL

export const iniciarProceso = async (olimpiadaId, tipo) => {
  //ya ta
  return await api.post(`/inscripcion/olimpiada/${olimpiadaId}/iniciar`, {
    tipo
  });
};

export const inscripcionCompetidor = async (procesoId, formulario) => {
  //ya ta
  return await api.post(`/inscripcion/proceso/${procesoId}/competidor`,formulario);
};

export const inscripcionTutor = async (procesoId, formularioTutor) => {
  //ya ta
  return await api.post(
    `/inscripcion/proceso/${procesoId}/tutor`,
    formularioTutor
  );
};

export const guardarSeleccionArea = async (procesoId, payload) => {
  try {
    console.log("📤 Enviando selección de área:", {
      procesoId,
      payload,
      url: `/inscripcion/proceso/${procesoId}/area`
    });
    // Asegúrate de que area_id sea un array, incluso si solo tienes un área
    if (payload.area_id && !Array.isArray(payload.area_id)) {
      payload.area_id = [payload.area_id];
    }
    
    // Añade un parámetro para indicar que quieres reemplazar las áreas existentes
    payload.reemplazar = true;
    
    const response = await api.post(`/inscripcion/proceso/${procesoId}/area`, payload);
    console.log("✅ Áreas guardadas correctamente:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al guardar selección de área:", {
      procesoId,
      payload,
      errorMessage: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
    });
    
    if (error.response && error.response.data) {
      console.error("Detalles del error del servidor:", error.response.data);
      // Mostrar mensaje de error más amigable al usuario
      if (error.response.data.message && 
          error.response.data.message.includes("Ya ha seleccionado")) {
        throw new Error("Ya has alcanzado el máximo de áreas permitidas. Debes eliminar una antes de añadir otra.");
      }
    }
    
    throw error;
  }
};

export const guardarSeleccionNivel = async (procesoId, payload) => {
  return await api.post(`/inscripcion/proceso/${procesoId}/nivel`, payload);
};

export const obtenerResumenInscripcion = async (procesoId) => {
  return await api.get(`/inscripcion/proceso/${procesoId}/resumen`);
};

export const verificarEstadoProceso = async (procesoId) => {
  try {
    const response = await api.get(`/inscripcion/proceso/${procesoId}/estado`);
    if (response.data.success) {
      return response.data; 
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

export const generarBoleta = async (procesoId) => {
  return await api.post(`/inscripcion/proceso/${procesoId}/boleta`);
};

// generar boleta
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

export const obtenerDetallesBoleta = async (procesoId, boletaId) => {
  try {
    const response = await api.get(`/inscripcion/procesos/${procesoId}/boletas/${boletaId}`);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Error al obtener detalles de la boleta");
    }
  } catch (error) {
    console.error("Error al obtener detalles de la boleta:", error);
    throw error;
  }
};

export const obtenerCategoriasPorArea = async (areaId) => {
  return await api.get(`/user/categoryLevel/area/${areaId}`);
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

export const inscripcionDirecta = async (datos) => {
  try {
    console.log("📤 Enviando inscripción directa:", datos);

    if (datos.areas && Array.isArray(datos.areas) && datos.areas.length > 0) {
      if (typeof datos.areas[0] === 'object') {
        datos.areas = datos.areas.map(area => area.id);
      }
    }
    if (datos.niveles && Array.isArray(datos.niveles) && datos.niveles.length > 0) {
      if (typeof datos.niveles[0] === 'object') {
        datos.niveles = datos.niveles.map(nivel => nivel.id);
      }
    }
    const response = await api.post('/inscripcion/proceso/inscripcion-directa', datos);
    console.log("✅ Inscripción directa completada:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error en inscripción directa:", {
      errorMessage: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
    });
    if (error.response && error.response.data) {
      console.error("Detalles del error del servidor:", error.response.data);
    }
    throw error;
  }
};