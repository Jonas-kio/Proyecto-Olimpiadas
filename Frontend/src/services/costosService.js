
import api from './apiConfig';


// En costService.js, dentro de getAllCosts:
export const getAllCosts = async () => {
  try {
    const response = await api.get('/costs');
    
    if (response.data.success) {
      // Verificar qué está llegando realmente
      console.log("Datos de costos recibidos:", JSON.stringify(response.data.data, null, 2));
      
      const processedData = response.data.data
        .filter(cost => cost && (cost.id !== undefined && cost.id !== null))
        .map(cost => {
          // Extraer la información de área y categoría si existe
          let areaInfo = null;
          let categoryInfo = null;
          
          // Verificar si viene el objeto de área completo o solo el ID
          if (cost.area && typeof cost.area === 'object') {
            areaInfo = {
              id: cost.area.id,
              name: cost.area.nombre || cost.area.name || 'Todas'
            };
          }
          
          // Verificar si viene el objeto de categoría completo o solo el ID
          if (cost.category && typeof cost.category === 'object') {
            categoryInfo = {
              id: cost.category.id,
              name: cost.category.nombre || cost.category.name || 'Todas'
            };
          }
          
          return {
            id: cost.id,
            name: cost.name || "Sin nombre",
            price: cost.price || 0,
            area_id: cost.area_id,
            category_id: cost.category_id,
            area: areaInfo,
            category: categoryInfo
          };
        });
      
      return processedData;
    } else {
      throw new Error(response.data.message || 'Error al obtener costos');
    }
  } catch (error) {
    console.error('Error al obtener los costos:', error);
    throw error;
  }
};


export const getCostById = async (id) => {
  try {
    const response = await api.get(`/costs/${id}`);
    
    if (response.data.success) {
      const cost = response.data.data;
      return {
        id: cost.id,
        name: cost.name,
        price: cost.price,
        area_id: cost.area_id,
        category_id: cost.category_id
      };
    } else {
      throw new Error(response.data.message || `Error al obtener el costo ${id}`);
    }
  } catch (error) {
    console.error(`Error al obtener el costo con ID ${id}:`, error);
    throw error;
  }
};


export const createCost = async (costData) => {
  try {

    const response = await api.post('/costs', costData);
    
    if (response.data.success) {
      const cost = response.data.data;

      return {
        id: cost.id,
        name: cost.name,
        price: cost.price,
        area_id: cost.area_id,
        category_id: cost.category_id
      };
    } else {
      throw new Error(response.data.message || 'Error al crear el costo');
    }
  } catch (error) {
    console.error('Error al crear el costo:', error);
    throw error;
  }
};


export const updateCost = async (id, costData) => {
  try {
    const dataToUpdate = {
      name: costData.name,
      price: costData.price
    };
    
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined || dataToUpdate[key] === null) {
        delete dataToUpdate[key];
      }
    });
    
    const response = await api.patch(`/costs/${id}`, dataToUpdate);
    
    if (response.data.success) {
      const cost = response.data.data;
      return {
        id: cost.id,
        name: cost.name,
        price: cost.price,
        area_id: cost.area_id,
        category_id: cost.category_id
      };
    } else {
      throw new Error(response.data.message || `Error al actualizar el costo ${id}`);
    }
  } catch (error) {
    console.error(`Error al actualizar el costo con ID ${id}:`, error);
    throw error;
  }
};


export const deleteCost = async (id) => {
  try {
    const response = await api.delete(`/costs/${id}`);
    
    if (response.data.success) {
      return { 
        success: true, 
        id,
        message: response.data.message,
        result: response.data.result
      };
    } else {
      throw new Error(response.data.message || `Error al eliminar el costo ${id}`);
    }
  } catch (error) {
    console.error(`Error al eliminar el costo con ID ${id}:`, error);
    throw error;
  }
};


const costService = {
  getAllCosts,
  getCostById,
  createCost,
  updateCost,
  deleteCost
};

export default costService;