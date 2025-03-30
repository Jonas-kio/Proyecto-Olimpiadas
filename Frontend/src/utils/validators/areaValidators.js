// src/utils/validators/areaValidators.js

/**
 * Valida los campos del formulario de áreas
 * @param {Object} formData - Datos del formulario (formato frontend)
 * @returns {Object} - Objeto con errores y resultado de validación
 */
export const validateAreaForm = (formData) => {
    const errors = {};
    
    // Validación del nombre (requerido y longitud máxima)
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'El nombre del área es obligatorio';
    } else if (formData.name.length > 100) {
      errors.name = 'El nombre no puede exceder los 100 caracteres';
    }
    
    // Validación de la descripción (longitud máxima)
    if (formData.description && formData.description.length > 500) {
      errors.description = 'La descripción no puede exceder los 500 caracteres';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Valida si un área puede ser eliminada
   * @param {Object} area - Área a validar (formato frontend)
   * @returns {Object} - Objeto con errores y resultado de validación
   */
  export const validateAreaDeletion = (area) => {
    const errors = {};
    
    // Verificar si el área tiene niveles asociados
    if (area.levels && area.levels > 0) {
      errors.levels = `No se puede eliminar el área porque tiene ${area.levels} nivel(es) asociado(s)`;
    }
    
    // Verificar si el área tiene participantes asociados
    if (area.participants && area.participants > 0) {
      errors.participants = `No se puede eliminar el área porque tiene ${area.participants} participante(s) asociado(s)`;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Mapea errores del backend al formato del frontend
   * @param {Object} backendErrors - Errores del backend
   * @returns {Object} - Errores en formato frontend
   */
  export const mapBackendErrors = (backendErrors) => {
    const frontendErrors = {};
    
    // Mapear nombres de campo del backend al frontend
    if (backendErrors.nombre) {
      frontendErrors.name = Array.isArray(backendErrors.nombre) 
        ? backendErrors.nombre[0] 
        : backendErrors.nombre;
    }
    
    if (backendErrors.descripcion) {
      frontendErrors.description = Array.isArray(backendErrors.descripcion) 
        ? backendErrors.descripcion[0] 
        : backendErrors.descripcion;
    }
    
    return frontendErrors;
  };