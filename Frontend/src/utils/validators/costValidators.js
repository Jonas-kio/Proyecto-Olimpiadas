
export const validateCostName = (name) => {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      errorMessage: "El nombre es obligatorio"
    };
  }
  
  if (name.length > 25) {
    return {
      isValid: false,
      errorMessage: "Solo se permiten 25 caracteres"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateCostValue = (value) => {
  if (!value) {
    return {
      isValid: false,
      errorMessage: "El valor es obligatorio"
    };
  }
  
  if (typeof value === 'string' && value.includes("-")) {
    return {
      isValid: false,
      errorMessage: "No se permiten valores negativos"
    };
  }
  
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      errorMessage: "Debe ingresar un valor numérico válido"
    };
  }
  
  if (numericValue <= 0) {
    return {
      isValid: false,
      errorMessage: "El valor debe ser mayor a 0"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateAreaSelection = (areaId) => {
  if (!areaId || areaId === "0" || areaId === 0 || areaId === "Seleccionar Area") {
    return {
      isValid: false,
      errorMessage: "Debe seleccionar un área"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateCategorySelection = (categoryId) => {
  if (!categoryId || categoryId === "0" || categoryId === 0 || categoryId === "Seleccionar Nivel") {
    return {
      isValid: false,
      errorMessage: "Debe seleccionar un nivel"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateCategoryBelongsToArea = (areaId, categoryId, categories) => {
  if (categoryId === "0" || categoryId === 0) {
    return { isValid: true, errorMessage: "" };
  }
  
  const selectedCategory = categories.find(c => c.id.toString() === categoryId.toString());
  
  if (!selectedCategory) {
    return {
      isValid: false,
      errorMessage: "La categoría seleccionada no existe"
    };
  }
  
  const categoryAreaId = selectedCategory.areaId ? 
    selectedCategory.areaId.toString() : 
    (selectedCategory.area_id ? selectedCategory.area_id.toString() : null);
  
  if (!categoryAreaId || categoryAreaId !== areaId.toString()) {
    return {
      isValid: false,
      errorMessage: "La categoría seleccionada no pertenece al área elegida"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};

export const validateUniqueCost = (costData, existingCosts, isEditing = false) => {
  const { id, name, area, category } = costData;
  
  const costsToCompare = isEditing 
    ? existingCosts.filter(cost => cost.id !== id)
    : existingCosts;
  
  const duplicate = costsToCompare.find(cost => 
    cost.name.toLowerCase() === name.toLowerCase() &&
    cost.area_id.toString() === area.toString() &&
    cost.category_id.toString() === category.toString()
  );
  
  if (duplicate) {
    return {
      isValid: false,
      errorMessage: "Ya existe un costo con el mismo nombre, área y categoría"
    };
  }
  
  return { isValid: true, errorMessage: "" };
};


export const validateCostForm = (formData, categories = [], existingCosts = [], isEditing = false) => {
  const nameValidation = validateCostName(formData.name);
  const valueValidation = validateCostValue(formData.value);
  const areaValidation = validateAreaSelection(formData.area);
  const categoryValidation = validateCategorySelection(formData.category);
  
  const categoryAreaValidation = validateCategoryBelongsToArea(
    formData.area, 
    formData.category,
    categories
  );
  
  const uniqueValidation = validateUniqueCost(
    formData,
    existingCosts,
    isEditing
  );
  
  const errorFields = [];
  
  if (!nameValidation.isValid) errorFields.push("Nombre del costo");
  if (!valueValidation.isValid) errorFields.push("Valor (Bs.)");
  if (!areaValidation.isValid) errorFields.push("Área");
  if (!categoryValidation.isValid) errorFields.push("Categoría");
  if (!categoryAreaValidation.isValid) errorFields.push("Categoría/Área");
  if (!uniqueValidation.isValid) errorFields.push("Costo duplicado");
  
  const isValid = 
    nameValidation.isValid && 
    valueValidation.isValid && 
    areaValidation.isValid && 
    categoryValidation.isValid &&
    categoryAreaValidation.isValid &&
    uniqueValidation.isValid;
  
  return {
    isValid,
    errorFields,
    errors: {
      name: nameValidation.errorMessage,
      value: valueValidation.errorMessage,
      area: areaValidation.errorMessage,
      category: categoryValidation.errorMessage,
      categoryArea: categoryAreaValidation.errorMessage,
      unique: uniqueValidation.errorMessage
    }
  };
};

export const buildCostApiData = (formData, areas = [], categories = []) => {
  const apiData = {
    name: formData.name,
    price: parseFloat(formData.value)
  };
  
  if (formData.area && formData.area !== "0") {
    const foundArea = areas.find(a => a.id.toString() === formData.area.toString());
    if (foundArea) {
      apiData.area_id = foundArea.id;
    } else {
      apiData.area_id = parseInt(formData.area);
    }
  }
  
  if (formData.category && formData.category !== "0") {
    const foundCategory = categories.find(c => c.id.toString() === formData.category.toString());
    if (foundCategory) {
      apiData.category_id = foundCategory.id;
    } else {
      apiData.category_id = parseInt(formData.category);
    }
  }
  
  return apiData;
};


export const prepareCostForEdit = (cost) => {
  return {
    id: cost.id,
    name: cost.name,
    value: typeof cost.value === 'string' ? 
      cost.value.replace("Bs. ", "") : 
      cost.value.toString(),
    area: cost.area_id ? cost.area_id.toString() : "0",
    category: cost.category_id ? cost.category_id.toString() : "0"
  };
};


export const formatCostForDisplay = (cost, areaMap = {}, categoryMap = {}) => {
  let areaName = "";
  let categoryName = "";
  
  if (cost.area && cost.area.name) {
    areaName = cost.area.name;
  } else if (cost.area_id && areaMap[cost.area_id]) {
    areaName = areaMap[cost.area_id];
  }
  
  if (cost.category && cost.category.name) {
    categoryName = cost.category.name;
  } else if (cost.category_id && categoryMap[cost.category_id]) {
    categoryName = categoryMap[cost.category_id];
  }
  
  return {
    id: cost.id,
    name: cost.name,
    value: typeof cost.value === 'number' || typeof cost.price === 'number' ? 
      `Bs. ${cost.value || cost.price}` : 
      cost.value || cost.price,
    area: areaName,
    category: categoryName,
    area_id: cost.area_id,
    category_id: cost.category_id
  };
};