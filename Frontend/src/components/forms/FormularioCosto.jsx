/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { 
  validateCostName, 
  validateCostValue, 
  validateAreaSelection, 
  validateCategorySelection,
  validateCostForm
} from "../../utils/validators/costValidators"; 

const FormularioCosto = ({
  values,
  onChange,
  onSubmit,
  onCancel,
  areas = [], 
  categories = [],
  isEditing = false,
  existingCosts = [] 
}) => {
  const [nameError, setNameError] = useState("");
  const [valueError, setValueError] = useState("");

  const [areaOptions, setAreaOptions] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [areaError, setAreaError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (areas.length > 0) {
      setAreaOptions([
        { id: 0, name: "Seleccionar Area" },
        ...areas
      ]);
    } 
     
    setFilteredCategories([{ id: 0, name: "Seleccionar Nivel" }]);
  }, [areas]);

  useEffect(() => {
    if (values.area && values.area !== "0") {
      const filteredCats = categories.filter(cat => {
        const catAreaId = cat.areaId ? parseInt(cat.areaId) : null;
        const selectedAreaId = parseInt(values.area);
        
        return catAreaId === selectedAreaId;
      });
      
      setFilteredCategories([
        { id: 0, name: "Seleccionar Nivel" },
        ...filteredCats
      ]);

      if (values.category !== "0") {
        const categoryBelongsToArea = filteredCats.some(cat => 
          parseInt(cat.id) === parseInt(values.category)
        );
        
        if (!categoryBelongsToArea) {
          onChange({ target: { name: "category", value: "0" } });
        }
      }
    } else {
      setFilteredCategories([{ id: 0, name: "Seleccionar Nivel" }]);
    }
  }, [values.area, categories, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limpiar el error general al hacer cambios
    setFormError("");

    if (name === "name") {
      const validation = validateCostName(value);
      if (!validation.isValid) {
        setNameError(validation.errorMessage);
        return;
      } else {
        setNameError("");
      }
    }

    if (name === "value") {
      const validation = validateCostValue(value);
      if (!validation.isValid) {
        setValueError(validation.errorMessage);
        return;
      } else {
        setValueError("");
      }
    }

    if (name === "area") {
      const validation = validateAreaSelection(value);
      if (!validation.isValid) {
        setAreaError(validation.errorMessage);
        // Resetear categoría cuando se cambia el área
        onChange({ target: { name: "category", value: "0" } });
      } else {
        setAreaError("");
      }
    }

    if (name === "category") {
      console.log("Valor de categoría:", value);
      const validation = validateCategorySelection(value);
      console.log("Resultado de validación:", validation);
      if (!validation.isValid) {
        setCategoryError(validation.errorMessage);
      } else {
        setCategoryError("");
      }
    }

    onChange({ target: { name, value } });
  };

  const validateForm = () => {
    console.log("Valores antes de validar:", values);
    const validationResult = validateCostForm(
      values, 
      categories, 
      existingCosts, 
      isEditing
    );
    console.log("Resultado de validación completa:", validationResult);
    
 
    if (validationResult.errors.name) {
      setNameError(validationResult.errors.name);
    }
    
    if (validationResult.errors.value) {
      setValueError(validationResult.errors.value);
    }
    
    if (validationResult.errors.area) {
      setAreaError(validationResult.errors.area);
    }
    
    if (validationResult.errors.category) {
      setCategoryError(validationResult.errors.category);
    }
    
    // Para errores más generales como duplicados o categoría que no pertenece al área
    if (validationResult.errors.categoryArea || validationResult.errors.unique) {
      setFormError(validationResult.errors.categoryArea || validationResult.errors.unique);
    }
    
    return validationResult;
  };

  const handleSubmit = () => {
    if (values.category === "0") {
      setCategoryError("Debe seleccionar un nivel");
      onSubmit(["Categoría"]); 
      return;
    }
    
    const validationResult = validateForm();
    if (validationResult.isValid) {
      onSubmit();
    } else {
      onSubmit(validationResult.errorFields);
    }
  };

  return (
    <div className="formulario-nivel max-w-2xl mx-auto p-4 bg-gray-50 border rounded-lg shadow-sm">
      <h3 className="formulario-titulo">{isEditing ? "Editar Costo" : "Nuevo Costo"}</h3>

      {/* Mostrar error general (duplicados, etc.) */}
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{formError}</p>
        </div>
      )}

      <div className="form-grid">
        <div className="form-row double">
          <div className="form-group">
            <label>Nombre del costo</label>
            <input
              type="text"
              name="name"
              placeholder="Ej: Inscripción General"
              value={values.name}
              onChange={handleChange}
              maxLength={25}
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          <div className="form-group">
            <label>Valor (Bs.)</label>
            <input
              type="number"
              name="value"
              placeholder="0.00"
              value={values.value}
              onChange={handleChange}
              min={0.01}
              step="0.01"
              className={valueError ? "border-red-500" : ""}
            />
            {valueError && <p className="text-red-500 text-sm">{valueError}</p>}
          </div>
        </div>

        <div className="form-row double">
          <div className="form-group">
            <label>Área</label>
            <select
              name="area"
              value={values.area}
              onChange={handleChange}
              className={areaError ? "border-red-500" : ""}
              disabled={isEditing} 
            >
              {areaOptions.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {isEditing && (
              <span className="text-blue-500 text-xs mt-1 block">
                El área no puede ser modificada en modo edición
              </span>
            )}
            {areaError && <p className="text-red-500 text-sm">{areaError}</p>}
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={values.category}
              onChange={handleChange}
              disabled={isEditing || values.area === "0"} // Deshabilitar en modo edición o si no hay área
              className={`${categoryError ? "border-red-500" : ""} ${values.area === "0" || isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {isEditing && (
              <span className="text-blue-500 text-xs mt-1 block">
                La categoría no puede ser modificada en modo edición
              </span>
            )}
            {values.area === "0" && (
              <p className="text-sm text-gray-500">
                Primero seleccione un área
              </p>
            )}
            {categoryError && <p className="text-red-500 text-sm">{categoryError}</p>}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={!!nameError || !!valueError || !!areaError || !!categoryError || !!formError}
        >
          {isEditing ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default FormularioCosto;