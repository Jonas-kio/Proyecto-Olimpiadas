// src/services/areasService.js
import api from './apiConfig';

// Obtener todas las áreas
export const getAllAreas = async (activeOnly = null) => {
  try {
    let url = '/area';

    if (activeOnly !== null) {
      url += `?activo=${activeOnly}`;
    }
    
    const response = await api.get(url);
    
    if (response.data.success) {
      return response.data.data.map(area => ({
        id: area.id,
        name: area.nombre,
        description: area.descripcion,
        levels: 0, 
        participants: 0, 
        active: area.activo === 1 || area.activo === true
      }));
    } else {
      throw new Error(response.data.message || 'Error al obtener áreas');
    }
  } catch (error) {
    console.error('Error al obtener las áreas:', error);
    throw error;
  }
};

export const getActiveAreas = async () => {
  return getAllAreas(true);
};

export const getAreaById = async (id) => {
  try {
    const response = await api.get(`/area/${id}`);
    
    if (response.data.success) {
      const area = response.data.data;
      // Convertir formato backend a frontend
      return {
        id: area.id,
        name: area.nombre,
        description: area.descripcion,
        levels: 0, // Puedes ajustar según los datos reales
        participants: 0, // Puedes ajustar según los datos reales
        active: area.activo === 1 || area.activo === true
      };
    } else {
      throw new Error(response.data.message || `Error al obtener el área ${id}`);
    }
  } catch (error) {
    console.error(`Error al obtener el área con ID ${id}:`, error);
    throw error;
  }
};

// Crear un área nueva
export const createArea = async (areaData) => {
  try {
    // Convertir nombres de campos del frontend al formato del backend
    const backendData = {
      nombre: areaData.name,
      descripcion: areaData.description
    };
    
    const response = await api.post('/area', backendData);
    
    if (response.data.success) {
      const area = response.data.data;
      // Convertir respuesta a formato frontend
      return {
        id: area.id,
        name: area.nombre,
        description: area.descripcion,
        levels: 0, // Valores por defecto para nuevas áreas
        participants: 0,
        active: area.activo === 1 || area.activo === true
      };
    } else {
      throw new Error(response.data.message || 'Error al crear el área');
    }
  } catch (error) {
    console.error('Error al crear el área:', error);
    throw error;
  }
};

// Actualizar un área existente
export const updateArea = async (id, areaData) => {
  try {
    // Convertir nombres de campos del frontend al formato del backend
    const backendData = {
      nombre: areaData.name,
      descripcion: areaData.description
    };
    
    const response = await api.put(`/area/${id}`, backendData);
    
    if (response.data.success) {
      const area = response.data.data;
      // Convertir respuesta a formato frontend
      return {
        id: area.id,
        name: area.nombre,
        description: area.descripcion,
        levels: areaData.levels || 0, // Mantener valores existentes
        participants: areaData.participants || 0,
        active: area.activo === 1 || area.activo === true
      };
    } else {
      throw new Error(response.data.message || `Error al actualizar el área ${id}`);
    }
  } catch (error) {
    console.error(`Error al actualizar el área con ID ${id}:`, error);
    throw error;
  }
};

// Cambiar estado de un área (activar/desactivar)
export const changeAreaStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`/area/${id}/status`, {
      activo: isActive
    });
    
    if (response.data.success) {
      const area = response.data.data;
      // Convertir respuesta a formato frontend
      return {
        id: area.id,
        name: area.nombre,
        description: area.descripcion,
        active: area.activo === 1 || area.activo === true
      };
    } else {
      throw new Error(response.data.message || `Error al cambiar el estado del área ${id}`);
    }
  } catch (error) {
    console.error(`Error al cambiar el estado del área con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un área
export const deleteArea = async (id) => {
  try {
    const response = await api.delete(`/area/${id}`);
    
    if (response.data.success) {
      return { 
        success: true, 
        id,
        message: response.data.message 
      };
    } else {
      throw new Error(response.data.message || `Error al eliminar el área ${id}`);
    }
  } catch (error) {
    console.error(`Error al eliminar el área con ID ${id}:`, error);
    throw error;
  }
};