import api from "./apiConfig";

//FUNCIONES DE INSCRIPCIÓN GRUPAL

// Registrar múltiples tutores
export const registrarTutoresGrupales = async (procesoId, tutores) => {
  try {
    console.log("📤 Registrando tutores grupales:", { procesoId, tutores });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/tutores`, {
      tutores
    });
    console.log("✅ Tutores grupales registrados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al registrar tutores grupales:", error);
    throw error;
  }
};

// Registrar múltiples competidores
export const registrarCompetidoresGrupales = async (procesoId, competidores) => {
  try {
    console.log("📤 Registrando competidores grupales:", { procesoId, competidores });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/competidores`, {
      competidores
    });
    console.log("✅ Competidores grupales registrados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al registrar competidores grupales:", error);
    
    // Logging mejorado para error 422
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
      
      if (error.response.status === 422) {
        console.error("🔍 Errores de validación:", error.response.data.errors || error.response.data);
        
        // Crear mensaje de error más detallado
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
    }
    
    throw error;
  }
};

// Procesar archivo Excel/CSV para competidores
export const procesarArchivoGrupal = async (procesoId, archivo) => {
  try {
    console.log("📤 Procesando archivo grupal:", { 
      procesoId, 
      archivoNombre: archivo.name, 
      archivoTamaño: archivo.size,
      archivoTipo: archivo.type,
      archivoLastModified: archivo.lastModified
    });
    
    // Validaciones del lado del cliente
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      throw new Error('El archivo debe ser un CSV válido');
    }
    
    if (archivo.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('El archivo es demasiado grande (máximo 5MB)');
    }
    
    const formData = new FormData();
    
    // Crear un nuevo File object con el tipo MIME correcto para CSV
    const archivoConTipoCSV = new File([archivo], archivo.name, {
      type: 'text/csv',
      lastModified: archivo.lastModified
    });
    
    console.log("📤 Archivo CSV normalizado:", {
      nombre: archivoConTipoCSV.name,
      tipo: archivoConTipoCSV.type,
      tamaño: archivoConTipoCSV.size
    });
    
    formData.append('file', archivoConTipoCSV); // Cambio de 'archivo' a 'file' para coincidir con el backend
    
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 segundos de timeout
    });
    
    console.log("✅ Archivo grupal procesado:", response.data);
    
    if (response.data.success && response.data.competidores) {
      console.log(`✅ ${response.data.competidores.length} competidores procesados correctamente`);
    }
    
    return response;  } catch (error) {
    console.error("❌ Error al procesar archivo grupal:", error);
    
    // Mejorar el manejo de errores
    if (error.response) {
      // Error del servidor
      const { status, data } = error.response;
      console.error(`❌ Error del servidor (${status}):`, data);
        if (status === 422) {
        // Errores de validación específicos
        console.error("🔍 Detalles del error 422:", {
          data: data,
          message: data.message || 'No message',
          errors: data.errors || 'No errors'
        });
        
        // Loggear los errores específicos
        console.error("🔍 Errores específicos:", JSON.stringify(data.errors, null, 2));
        
        if (data.errors && typeof data.errors === 'object') {
          const erroresDetallados = Object.entries(data.errors)
            .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(', ') : mensajes}`)
            .join('\n');
          throw new Error(`Errores de validación del archivo:\n${erroresDetallados}`);
        } else if (data.message) {
          // Si no hay errores específicos, usar el mensaje general
          throw new Error(`Error de validación: ${data.message}`);
        } else {
          throw new Error("Error de validación del archivo. Verifique que sea un archivo CSV válido con el formato correcto.");
        }
      } else if (data.mensaje) {
        throw new Error(data.mensaje);
      }
    } else if (error.request) {
      // Error de red
      console.error("❌ Error de red:", error.request);
      throw new Error("Error de conexión. Verifique su conexión a internet.");
    }
    
    throw error;
  }
};

// Asignar áreas y niveles a competidores grupales
export const asignarAreasNivelesGrupales = async (procesoId, asignaciones) => {
  try {
    console.log("📤 Asignando áreas y niveles grupales:", { procesoId, asignaciones });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/areas-niveles`, {
      asignaciones
    });
    console.log("✅ Áreas y niveles asignados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al asignar áreas y niveles:", error);
    console.error("❌ Detalles del error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      errors: error.response?.data?.errors
    });
    throw error;
  }
};

// Crear grupo y finalizar inscripción
export const crearGrupoInscripcion = async (procesoId, datosGrupo) => {
  try {
    console.log("📤 Creando grupo de inscripción:", { procesoId, datosGrupo });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/grupo`, datosGrupo);
    console.log("✅ Grupo de inscripción creado:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al crear grupo de inscripción:", error);
    throw error;
  }
};

// Obtener resumen de inscripción grupal
export const obtenerResumenInscripcionGrupal = async (procesoId) => {
  try {
    console.log("📤 Obteniendo resumen de inscripción grupal:", { procesoId });
    const response = await api.get(`/inscripcion/grupal/proceso/${procesoId}/resumen`);
    console.log("✅ Resumen obtenido:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al obtener resumen grupal:", error);
    throw error;
  }
};

// Generar boleta grupal
export const generarBoletaGrupal = async (procesoId) => {
  try {
    console.log("📤 Generando boleta grupal:", { procesoId });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/boleta`);
    console.log("✅ Boleta grupal generada:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al generar boleta grupal:", error);
    throw error;
  }
};

// Calcular costos preliminares para inscripción grupal
// Esta función usa el endpoint específico para inscripciones grupales que calcula correctamente por área
export const calcularCostosGrupales = async (procesoId, areasIds, nivelesIds) => {
  try {
    console.log("📤 Calculando costos grupales específicos:", { procesoId, areasIds, nivelesIds });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/calcular-costos`, {
      areas_ids: areasIds,
      niveles_ids: nivelesIds
    });
    console.log("✅ Costos grupales calculados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al calcular costos grupales:", error);
    throw error;
  }
};

// Funciones para manejo de archivos Excel (para inscripción grupal)
export const cargarArchivoExcel = async (procesoId, archivo) => {
  try {
    console.log("📤 Cargando archivo Excel:", { procesoId });
    return await procesarArchivoGrupal(procesoId, archivo);
  } catch (error) {
    console.error("❌ Error al cargar archivo Excel:", error);
    throw error;
  }
};

export const descargarPlantillaExcel = async () => {
  try {
    console.log("📤 Descargando plantilla CSV");
    const response = await api.get('/inscripcion/grupal/plantilla-excel', {
      responseType: 'blob',
      timeout: 30000, // 30 segundos de timeout
    });
    
    console.log("✅ Respuesta de plantilla recibida:", {
      size: response.data.size,
      type: response.data.type
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv; charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener fecha actual para nombre único
    const fecha = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `plantilla_inscripcion_grupal_${fecha}.csv`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log("✅ Plantilla CSV descargada exitosamente");
    return { success: true, mensaje: "Plantilla descargada correctamente" };
  } catch (error) {
    console.error("❌ Error al descargar plantilla:", error);
    
    if (error.response) {
      const { status, data } = error.response;
      console.error(`❌ Error del servidor (${status}):`, data);
      
      if (status === 401) {
        throw new Error("No tiene permisos para descargar la plantilla. Inicie sesión nuevamente.");
      } else if (status === 404) {
        throw new Error("La plantilla no está disponible en este momento.");
      }
    } else if (error.request) {
      throw new Error("Error de conexión. Verifique su conexión a internet.");
    }
    
    throw new Error("Error inesperado al descargar la plantilla.");
  }
};

export const categoriasNiveles = async () => {
  try {
    console.log("📤 Obteniendo todas las categorías");
    const response = await api.get('/categoryLevelUser');
    console.log("✅ Categorías obtenidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    throw error;
  }
};

// Verificar competidores existentes
export const verificarCompetidoresExistentes = async (competidores) => {
  try {
    console.log("📤 Verificando competidores existentes:", competidores);
    const response = await api.post('/inscripcion/grupal/verificar-competidores', {
      competidores
    });
    console.log("✅ Verificación completada:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al verificar competidores:", error);
    throw error;
  }
};

// Registrar competidores sin duplicados
export const registrarCompetidoresSinDuplicados = async (procesoId, competidores, indicesOmitir = []) => {
  try {
    console.log("📤 Registrando competidores sin duplicados:", { procesoId, competidores, indicesOmitir });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/competidores-sin-duplicados`, {
      competidores,
      indices_omitir: indicesOmitir
    });
    console.log("✅ Competidores registrados sin duplicados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al registrar competidores sin duplicados:", error);
    throw error;
  }
};

// Asociar competidores existentes
export const asociarCompetidoresExistentes = async (procesoId, competidoresIds) => {
  try {
    console.log("📤 Asociando competidores existentes:", { procesoId, competidoresIds });
    const response = await api.post(`/inscripcion/grupal/proceso/${procesoId}/asociar-competidores`, {
      competidores_ids: competidoresIds
    });
    console.log("✅ Competidores asociados:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error al asociar competidores:", error);
    throw error;
  }
};

// Funciones compartidas que se usan en inscripción grupal

// Obtener áreas por olimpiada (reutilizada de inscripcionService)
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

// Obtener categorías por área (reutilizada de inscripcionService)
export const obtenerCategoriasPorArea = async (areaId) => {
  return await api.get(`/user/categoryLevel/area/${areaId}`);
};

// Función auxiliar para obtener todas las áreas
export const obtenerTodasLasAreas = async () => {
  try {
    const response = await api.get("/libre/areas");
    console.log("✅ Áreas obtenidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener áreas:", error);
    throw error;
  }
};

// Función para obtener áreas de inscripción
export const inscripcionArea = async () => {
  return await api.get("/inscripcion/area");
};

// Función específica para obtener áreas por olimpiada para inscripción grupal
export const obtenerAreasPorOlimpiadaEspecifica = async (olimpiadaId) => {
  try {
    const response = await api.get(`/user/olimpiadas/${olimpiadaId}/areas`);
    console.log("✅ Áreas específicas obtenidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener áreas específicas:", error);
    throw error;
  }
};
