// Este servicio sería reemplazado por llamadas reales a la API
// Por ahora usamos datos de ejemplo y operaciones simuladas

// Datos iniciales (mock)
const initialAreas = [
    {
      id: 1,
      name: "Matemáticas",
      description: "Competencias en resolución de problemas matemáticos",
      levels: 3,
      participants: 85,
    },
    {
      id: 2,
      name: "Física",
      description: "Competencias en resolución de problemas físicos",
      levels: 2,
      participants: 62,
    },
    {
      id: 3,
      name: "Química",
      description: "Competencias en resolución de problemas químicos",
      levels: 3,
      participants: 45,
    },
  ];
  
  // Simulación de almacenamiento local
  let areas = [...initialAreas];
  
  // Obtener todas las áreas
  export const getAllAreas = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...areas]);
      }, 300); // Simula un tiempo de respuesta
    });
  };
  
  // Crear un área nueva
  export const createArea = async (areaData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = areas.length > 0 ? Math.max(...areas.map((a) => a.id)) + 1 : 1;
        const newArea = {
          id: newId,
          ...areaData,
          levels: 0,
          participants: 0,
        };
        
        areas.push(newArea);
        resolve(newArea);
      }, 300);
    });
  };
  
  // Actualizar un área existente
  export const updateArea = async (id, areaData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = areas.findIndex((area) => area.id === id);
        
        if (index === -1) {
          reject(new Error('Área no encontrada'));
          return;
        }
        
        // Mantener los campos que no se actualizan
        const updatedArea = {
          ...areas[index],
          ...areaData
        };
        
        areas[index] = updatedArea;
        resolve(updatedArea);
      }, 300);
    });
  };
  
  // Eliminar un área
  export const deleteArea = async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = areas.length;
        areas = areas.filter((area) => area.id !== id);
        
        if (areas.length === initialLength) {
          reject(new Error('Área no encontrada'));
          return;
        }
        
        resolve({ success: true, id });
      }, 300);
    });
  };
  
  // Obtener un área por ID
  export const getAreaById = async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const area = areas.find((area) => area.id === id);
        
        if (!area) {
          reject(new Error('Área no encontrada'));
          return;
        }
        
        resolve(area);
      }, 300);
    });
  };