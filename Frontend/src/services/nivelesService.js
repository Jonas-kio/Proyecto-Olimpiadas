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
      
      const response = await api.post('/nivel', backendData);
      
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
      console.error('Error al crear el nivel/categoría:', error);
      throw error;
    }
  };