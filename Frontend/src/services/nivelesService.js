// src/services/areasService.js
import api from './apiConfig';

export const createLevel = async (levelData) => {
  try {
    const backendData = {
      area_id: levelData.areaId,
      name: levelData.name,
      description: levelData.description,
      grade_name: levelData.gradeName,
      grade_min: levelData.gradeMin,
      grade_max: levelData.gradeMax
    };
      
    const response = await api.post('/categoryLevel', backendData);

    console.log('Respuesta API:', response.data);
      
    if (response.data.success) {
      const level = response.data.data;
      return {
        id: level.id,
        areaId: level.area_id,
        name: level.name,
        description: level.description,
        gradeName: level.grade_name,
        gradeMin: level.grade_min,
        gradeMax: level.grade_max,
        participants: level.participants || 0,
        area: level.area ? {
          id: level.area.id,
          name: level.area.nombre,
          description: level.area.descripcion,
          active: level.area.activo === 1 || level.area.activo === true
        } : null
      };

    } else {
      throw new Error(response.data.message || 'Error al crear el nivel/categoría');
    }
  } catch (error) {
    console.error('Error al crear el nivel/categoría:', error.response?.data || error);
    throw error;
  }
};

export const getLevels = async () => {
  try {
    const response = await api.get('/categoryLevel');
    
    console.log('Respuesta API getLevels:', response.data);
    
    if (response.data.success) {
      // Procesar los datos asegurando que cada nivel tenga un ID válido
      const processedData = response.data.data
        .filter(level => level && (level.id !== undefined && level.id !== null))
        .map(level => {
          // Mostrar advertencia si hay propiedades esperadas que faltan
          if (!level.id) {
            console.warn('⚠️ Nivel sin ID:', level);
          }
          
          // Asegurar que la información del área esté completa
          const areaInfo = level.area ? {
            id: level.area.id,
            name: level.area.nombre || level.area.name || 'N/A',
            description: level.area.descripcion || level.area.description || ''
          } : null;
          
          return {
            id: level.id,
            name: level.name || "Sin nombre",
            areaId: level.area_id,
            area: areaInfo,
            description: level.description || '',
            gradeName: level.grade_name,
            gradeMin: level.grade_min,
            gradeMax: level.grade_max,
            participants: level.participants || 0
          };
        });
      
      console.log(`Procesados ${processedData.length} niveles de ${response.data.data.length} recibidos`);
      return processedData;
    } else {
      throw new Error(response.data.message || 'Error al obtener niveles/categorías');
    }
  } catch (error) {
    console.error('Error al obtener niveles/categorías:', error);
    throw error;
  }
};

export const updateLevel = async (id, levelData) => {
  try {
    const backendData = {
      area_id: levelData.areaId,
      name: levelData.name,
      description: levelData.description,
      grade_name: levelData.gradeName,
      grade_min: levelData.gradeMin,
      grade_max: levelData.gradeMax
    };
    
    const response = await api.put(`/categoryLevel/${id}`, backendData);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al actualizar el nivel/categoría');
    }
  } catch (error) {
    console.error(`Error al actualizar nivel/categoría ID ${id}:`, error);
    throw error;
  }
};

export const deleteLevel = async (id) => {
  // Validación básica
  if (id === undefined || id === null) {
    throw new Error('Se requiere un ID para eliminar el nivel');
  }
  
  // Asegurarse de que el ID sea un número si es necesario
  const levelId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(levelId)) {
    throw new Error(`ID inválido: "${id}"`);
  }
  
  console.log(`Enviando solicitud de eliminación para nivel ID: ${levelId}`);
  
  try {
    const response = await api.delete(`/categoryLevel/${levelId}`);
    
    console.log('Respuesta de eliminación:', response.data);
    
    if (response.data.success) {
      return response.data.data || { success: true };
    } else {
      throw new Error(response.data.message || `Error al eliminar el nivel con ID ${levelId}`);
    }
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error de respuesta del servidor
      const statusCode = error.response.status;
      const message = error.response.data?.message || 'Error desconocido';
      
      if (statusCode === 404) {
        throw new Error(`No se encontró el nivel con ID ${levelId}`);
      } else if (statusCode === 403) {
        throw new Error('No tiene permisos para eliminar este nivel');
      } else if (statusCode === 422) {
        throw new Error(`Error de validación: ${message}`);
      } else {
        throw new Error(`Error del servidor (${statusCode}): ${message}`);
      }
    } else if (error.request) {
      // Error de conexión
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Otros errores
      throw error;
    }
  }
};