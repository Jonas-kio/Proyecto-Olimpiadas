
export const validateLevelName = (name) => {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      errorMessage: "El nombre es obligatorio"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};


export const validateAreaSelection = (areaId) => {
  if (!areaId || areaId === "" || areaId === "Seleccionar Área") {
    return {
      isValid: false,
      errorMessage: "Debe seleccionar un área"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};


export const validateGradeLevel = (level) => {
  if (!level || level === "" || level === "Seleccionar Grado") {
    return {
      isValid: false,
      errorMessage: "Debe seleccionar un nivel de grado"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};


export const validateMinGrade = (grade) => {
  if (!grade || grade.trim() === "") {
    return {
      isValid: false,
      errorMessage: "El grado mínimo es obligatorio"
    };
  }
  
  const minGradePattern = /^[1-6](ro|do|to)$/;
  if (!minGradePattern.test(grade.trim())) {
    return {
      isValid: false,
      errorMessage: "Formato incorrecto. Debe ser como '1ro', '2do', etc."
    };
  }
  
  if (grade.trim().length > 3) {
    return {
      isValid: false,
      errorMessage: "No debe exceder los 3 caracteres"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateMaxGrade = (maxGrade, minGrade) => {

  if (!maxGrade || maxGrade.trim() === "") {
    return { isValid: true, errorMessage: "" };
  }
  
  const maxGradePattern = /^[1-6](ro|do|to)$/;
  if (!maxGradePattern.test(maxGrade.trim())) {
    return {
      isValid: false,
      errorMessage: "Formato incorrecto. Debe ser como '1ro', '2do', etc."
    };
  }
  
  if (maxGrade.trim().length > 3) {
    return {
      isValid: false,
      errorMessage: "No debe exceder los 3 caracteres"
    };
  }
  
  const extractGradeNumber = (grade) => {
    const match = grade.match(/^([1-6])/);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  const minGradeNum = extractGradeNumber(minGrade.trim());
  const maxGradeNum = extractGradeNumber(maxGrade.trim());
  
  if (maxGradeNum <= minGradeNum) {
    return {
      isValid: false,
      errorMessage: "Debe ser mayor al grado mínimo"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateDescription = (description) => {

  if (!description || description.trim() === "") {
    return { 
      isValid: true, 
      errorMessage: "", 
      hints: {
        minLength: false,
        maxLength: false,
        startsWithNumber: false,
        consecutiveNumbers: false
      }
    };
  }
  
  const desc = description.trim();
  const hints = {
    minLength: desc.length < 10,
    maxLength: desc.length > 150,
    startsWithNumber: /^[0-9]/.test(desc),
    consecutiveNumbers: /[0-9]{3,}/.test(desc)
  };
  
  const hasErrors = Object.values(hints).some(value => value === true);
  
  let errorMessage = "";
  if (hints.minLength) {
    errorMessage = "La descripción debe tener al menos 10 caracteres";
  } else if (hints.maxLength) {
    errorMessage = "La descripción no debe exceder los 150 caracteres";
  } else if (hints.startsWithNumber) {
    errorMessage = "La descripción no debe iniciar con caracteres numéricos";
  } else if (hints.consecutiveNumbers) {
    errorMessage = "La descripción no debe contener más de 2 números consecutivos";
  }
  
  return {
    isValid: !hasErrors,
    errorMessage,
    hints
  };
};

export const validateLevelForm = (formData, isEditing = false) => {
  const nameValidation = validateLevelName(formData.name);
  const descriptionValidation = validateDescription(formData.description);
  const minGradeValidation = validateMinGrade(formData.minGrade);
  const maxGradeValidation = validateMaxGrade(formData.maxGrade, formData.minGrade);
  
  let areaValidation = { isValid: true, errorMessage: "" };
  let gradeLevelValidation = { isValid: true, errorMessage: "" };
  
  if (!isEditing) {
    areaValidation = validateAreaSelection(formData.area);
    gradeLevelValidation = validateGradeLevel(formData.level);
  }
  
  const errorFields = [];
  
  if (!nameValidation.isValid) {
    errorFields.push("Nombre del Nivel/Categoría: Campo obligatorio");
  }
  
  if (!isEditing && !areaValidation.isValid) {
    errorFields.push("Área: Debe seleccionar un área");
  }
  
  if (!isEditing && !gradeLevelValidation.isValid) {
    errorFields.push("Nivel de Grado: Debe seleccionar un nivel");
  }
  
  if (!minGradeValidation.isValid) {
    errorFields.push(`Grado Mínimo: ${minGradeValidation.errorMessage}`);
  }
  
  if (!maxGradeValidation.isValid) {
    errorFields.push(`Grado Máximo: ${maxGradeValidation.errorMessage}`);
  }
  
  if (!descriptionValidation.isValid) {
    errorFields.push(`Descripción: ${descriptionValidation.errorMessage}`);
  }
  
  const isValid = 
    nameValidation.isValid && 
    (isEditing || areaValidation.isValid) && 
    (isEditing || gradeLevelValidation.isValid) && 
    minGradeValidation.isValid && 
    maxGradeValidation.isValid && 
    descriptionValidation.isValid;
  
  return {
    isValid,
    errorFields,
    errors: {
      name: nameValidation.errorMessage,
      area: areaValidation.errorMessage,
      level: gradeLevelValidation.errorMessage,
      minGrade: minGradeValidation.errorMessage,
      maxGrade: maxGradeValidation.errorMessage,
      description: descriptionValidation.errorMessage
    },
    descriptionHints: descriptionValidation.hints
  };
};


export const buildLevelApiData = (formData, isEditing, currentLevelId = null, levels = []) => {
  if (isEditing && currentLevelId) {
    const currentLevel = levels.find(level => level.id === currentLevelId);
    
    if (!currentLevel) {
      throw new Error("No se pudo encontrar el nivel a editar");
    }
    
    return {
      areaId: currentLevel.areaId,
      gradeName: currentLevel.gradeName,
      name: formData.name,
      description: formData.description,
      gradeMin: formData.minGrade,
      gradeMax: formData.maxGrade.trim() ? formData.maxGrade : null
    };
  } else {
    return {
      areaId: parseInt(formData.area, 10),
      name: formData.name,
      description: formData.description,
      gradeName: formData.level,
      gradeMin: formData.minGrade,
      gradeMax: formData.maxGrade.trim() ? formData.maxGrade : null
    };
  }
};


export const extractGradeNumber = (grade) => {
  const match = grade.match(/^([1-6])/);
  return match ? parseInt(match[1], 10) : 0;
};