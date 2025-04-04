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

      const processedData = response.data.data
        .filter(level => level && (level.id !== undefined && level.id !== null))
        .map(level => {
          if (!level.id) {
            console.warn('⚠️ Nivel sin ID:', level);
          }

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
    if (id === undefined || id === null) {
      throw new Error('Se requiere un ID para actualizar el nivel/categoría');
    }
    
    const levelId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(levelId)) {
      throw new Error(`ID inválido: "${id}"`);
    }
    
    console.log(`Enviando solicitud de actualización para nivel ID: ${levelId}`, levelData);
    
    const backendData = {
      name: levelData.name,
      description: levelData.description,
      grade_min: levelData.gradeMin,
      grade_max: levelData.gradeMax
    };
    
    Object.keys(backendData).forEach(key => 
      (backendData[key] === undefined || backendData[key] === null) && delete backendData[key]
    );

    const response = await api.put(`/categoryLevel/${levelId}`, backendData);
    
    console.log('Respuesta de actualización:', response.data);
    
    if (response.data.success) {
      const updatedLevel = response.data.data;
      
      return {
        id: updatedLevel.id,
        areaId: updatedLevel.area_id,
        name: updatedLevel.name,
        description: updatedLevel.description,
        gradeName: updatedLevel.grade_name,
        gradeMin: updatedLevel.grade_min,
        gradeMax: updatedLevel.grade_max,
        participants: updatedLevel.participants || 0,
        area: updatedLevel.area ? {
          id: updatedLevel.area.id,
          name: updatedLevel.area.nombre || updatedLevel.area.name || 'N/A',
          description: updatedLevel.area.descripcion || updatedLevel.area.description || ''
        } : null
      };
    } else {
      throw new Error(response.data.message || `Error al actualizar el nivel/categoría con ID ${levelId}`);
    }
  } catch (error) {
    // El manejo de errores no cambia
    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.message || 'Error desconocido';
      
      if (statusCode === 404) {
        throw new Error(`No se encontró el nivel/categoría con ID ${id}`);
      } else if (statusCode === 403) {
        throw new Error('No tiene permisos para actualizar este nivel/categoría');
      } else if (statusCode === 422) {
        throw new Error(`Error de validación: ${message}`);
      } else {
        throw new Error(`Error del servidor (${statusCode}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor');
    } else {
      throw error;
    }
  }
};

export const deleteLevel = async (id) => {

  if (id === undefined || id === null) {
    throw new Error('Se requiere un ID para eliminar el nivel');
  }
  

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