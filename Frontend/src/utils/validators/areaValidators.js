// src/utils/validators/areaValidators.js

/**
 * Expresiones regulares para validaciones
 */
const REGEX = {
  // Solo letras, espacios, y algunos caracteres especiales permitidos (ñ, tildes, etc.)
  ONLY_LETTERS_SPACES: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
  // Evitar caracteres peligrosos en descripción
  SAFE_DESCRIPTION: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s,.;:'"()¿?¡!-]+$/
};

/**
 * Constantes para validación
 */
const VALIDATION = {
  AREA_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100 // Manteniendo tu límite de 100 caracteres
  },
  AREA_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500 // Manteniendo tu límite de 500 caracteres
  }
};

/**
 * Normaliza texto: elimina espacios al inicio/final y capitaliza
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text) return '';
  
  // Eliminar espacios al inicio y final
  const trimmed = text.trim();
  
  // Capitalizar primera letra
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Normaliza los datos del formulario
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos normalizados
 */
export const normalizeFormData = (formData) => {
  return {
    ...formData,
    name: normalizeText(formData.name),
    description: formData.description ? formData.description.trim() : ''
  };
};

/**
 * Verifica si el nombre del área es válido
 * @param {string} name - Nombre del área
 * @param {Array} existingAreas - Áreas existentes para verificar duplicados
 * @param {number} currentAreaId - ID del área en edición (para ignorar en duplicados)
 * @returns {string|null} Mensaje de error o null si es válido
 */
const validateName = (name, existingAreas = [], currentAreaId = null) => {
  // Verificar si está vacío
  if (!name || name.trim() === '') {
    return 'El nombre del área es obligatorio';
  }
  
  // Verificar longitud mínima
  if (name.trim().length < VALIDATION.AREA_NAME.MIN_LENGTH) {
    return `El nombre debe tener al menos ${VALIDATION.AREA_NAME.MIN_LENGTH} caracteres`;
  }
  
  // Verificar longitud máxima
  if (name.trim().length > VALIDATION.AREA_NAME.MAX_LENGTH) {
    return `El nombre no puede exceder los ${VALIDATION.AREA_NAME.MAX_LENGTH} caracteres`;
  }
  
  // Verificar que solo contiene letras y espacios
  if (!REGEX.ONLY_LETTERS_SPACES.test(name)) {
    return 'El nombre sólo debe contener letras y espacios';
  }
  
  // Verificar duplicados (solo si se proporcionaron áreas existentes)
  if (existingAreas && existingAreas.length > 0) {
    const duplicate = existingAreas.find(area => 
      area.name && area.name.toLowerCase() === name.trim().toLowerCase() && 
      area.id !== currentAreaId
    );
    
    if (duplicate) {
      return `Ya existe un área con el nombre "${name.trim()}"`;
    }
  }
  
  return null;
};

/**
 * Verifica si la descripción del área es válida
 * @param {string} description - Descripción del área
 * @returns {string|null} Mensaje de error o null si es válido
 */
const validateDescription = (description) => {
  // Verificar si está vacío
  if (!description || description.trim() === '') {
    return 'La descripción del área es obligatoria';
  }
  
  // Verificar longitud mínima
  if (description.trim().length < VALIDATION.AREA_DESCRIPTION.MIN_LENGTH) {
    return `La descripción debe tener al menos ${VALIDATION.AREA_DESCRIPTION.MIN_LENGTH} caracteres`;
  }
  
  // Verificar longitud máxima
  if (description.trim().length > VALIDATION.AREA_DESCRIPTION.MAX_LENGTH) {
    return `La descripción no puede exceder los ${VALIDATION.AREA_DESCRIPTION.MAX_LENGTH} caracteres`;
  }
  
  // Verificar caracteres peligrosos
  if (!REGEX.SAFE_DESCRIPTION.test(description)) {
    return 'La descripción contiene caracteres no permitidos';
  }
  
  return null;
};

/**
 * Valida los campos del formulario de áreas
 * @param {Object} formData - Datos del formulario (formato frontend)
 * @param {Array} existingAreas - Áreas existentes para validar duplicados
 * @param {number} currentAreaId - ID del área en edición
 * @returns {Object} - Objeto con errores y resultado de validación
 */
export const validateAreaForm = (formData, existingAreas = [], currentAreaId = null) => {
  const errors = {};
  
  // Validar nombre
  const nameError = validateName(formData.name, existingAreas, currentAreaId);
  if (nameError) {
    errors.name = nameError;
  }
  
  // Validar descripción
  const descriptionError = validateDescription(formData.description);
  if (descriptionError) {
    errors.description = descriptionError;
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
