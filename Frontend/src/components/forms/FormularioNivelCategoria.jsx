/* eslint-disable react/prop-types */

// src/components/forms/FormularioNivelCategoria.jsx
import { useState, useEffect } from 'react';
import { getActiveAreas } from '../../services/areasService';
import { 
  validateLevelName, 
  validateAreaSelection, 
  validateGradeLevel, 
  validateMinGrade, 
  validateMaxGrade,
  validateDescription,
  validateLevelForm
} from '../../utils/validators/nivelesValidators'; 

const FormularioNivelCategoria = ({ values, onChange, onSubmit, onCancel, isEditing = false }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  
  // Estados para errores de validación
  const [nameError, setNameError] = useState("");
  const [areaError, setAreaError] = useState("");
  const [levelError, setLevelError] = useState("");
  const [minGradeError, setMinGradeError] = useState("");
  const [maxGradeError, setMaxGradeError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  
  // Pistas visuales para la descripción
  const [descriptionHints, setDescriptionHints] = useState({
    minLength: false,
    maxLength: false,
    startsWithNumber: false,
    consecutiveNumbers: false
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasData = await getActiveAreas();
        setAreas(areasData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar las áreas:', err);
        setError('No se pudieron cargar las áreas. Por favor, inténtalo de nuevo.');
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);
  
  useEffect(() => {
    const descValidation = validateDescription(values.description);
    setDescriptionCharCount(values.description.trim().length);
    setDescriptionHints(descValidation.hints || {
      minLength: false,
      maxLength: false,
      startsWithNumber: false,
      consecutiveNumbers: false
    });
    
    if (!descValidation.isValid && values.description.trim().length > 0) {
      setDescriptionError(descValidation.errorMessage);
    } else {
      setDescriptionError("");
    }
  }, [values.description]);

  const handleNameChange = (value) => {
    const validation = validateLevelName(value);
    if (!validation.isValid) {
      setNameError(validation.errorMessage);
    } else {
      setNameError("");
    }
    onChange("name", value);
  };

  const handleAreaChange = (value) => {
    const validation = validateAreaSelection(value);
    if (!validation.isValid) {
      setAreaError(validation.errorMessage);
    } else {
      setAreaError("");
    }
    onChange("area", value);
  };

  const handleLevelChange = (value) => {
    const validation = validateGradeLevel(value);
    if (!validation.isValid) {
      setLevelError(validation.errorMessage);
    } else {
      setLevelError("");
    }
    onChange("level", value);
  };

  const handleMinGradeChange = (value) => {
    const validation = validateMinGrade(value);
    if (!validation.isValid && value.trim().length > 0) {
      setMinGradeError(validation.errorMessage);
    } else {
      setMinGradeError("");
    }
    
    if (values.maxGrade.trim().length > 0) {
      const maxValidation = validateMaxGrade(values.maxGrade, value);
      if (!maxValidation.isValid) {
        setMaxGradeError(maxValidation.errorMessage);
      } else {
        setMaxGradeError("");
      }
    }
    
    onChange("minGrade", value);
  };

  const handleMaxGradeChange = (value) => {
    const validation = validateMaxGrade(value, values.minGrade);
    if (!validation.isValid && value.trim().length > 0) {
      setMaxGradeError(validation.errorMessage);
    } else {
      setMaxGradeError("");
    }
    onChange("maxGrade", value);
  };

  const handleDescriptionChange = (value) => {
    onChange("description", value);
  };

  const validateForm = () => {
    const validationResult = validateLevelForm(values, isEditing);
    
    setNameError(validationResult.errors.name || "");
    setAreaError(validationResult.errors.area || "");
    setLevelError(validationResult.errors.level || "");
    setMinGradeError(validationResult.errors.minGrade || "");
    setMaxGradeError(validationResult.errors.maxGrade || "");
    setDescriptionError(validationResult.errors.description || "");
    
    return validationResult;
  };

  const handleSubmit = () => {
    const validationResult = validateForm();
    if (validationResult.isValid) {
      onSubmit();
    } else {
      onSubmit(validationResult.errorFields);
    }
  };

  const requiredField = (
    <span className="text-red-600 ml-1">*</span>
  );

  const getCharCountColor = () => {
    if (descriptionCharCount === 0) return "text-gray-500";
    if (descriptionCharCount < 10) return "text-red-600";
    if (descriptionCharCount > 150) return "text-red-600";
    return "text-green-600";
  };

  return (
    <div className="formulario-nivel">
      <h3 className="formulario-titulo">{isEditing ? 'Editar Nivel/Categoría' : 'Nuevo Nivel/Categoría'}</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="form-grid">

        {/* Fila 1: Nombre y Área */}
        <div className="form-row double">
          <div className="form-group">
            <label>Nombre del Nivel/Categoría {requiredField}</label>
            <input
              type="text"
              placeholder="Ej: Básico, Primaria, etc."
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={nameError ? "border-red-300" : ""}
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          <div className="form-group">
            <label>Área {requiredField}</label>
            <select
              value={values.area}
              onChange={(e) => handleAreaChange(e.target.value)}
              className={areaError ? "border-red-300" : ""}
              disabled={isEditing}
            >
              <option value="">Seleccionar Área</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {loading && <span className="loading-text">Cargando áreas...</span>}
            {isEditing && (
              <span className="text-blue-500 text-xs mt-1 block">
                El área no puede ser modificada en modo edición
              </span>
            )}
            {areaError && <p className="text-red-500 text-sm">{areaError}</p>}
          </div>
        </div>

        {/* Fila 2: Nivel, Grado Mínimo y Máximo */}
        <div className="form-row triple">
          <div className="form-group">
            <label>Nivel de Grado {requiredField}</label>
            <select
              value={values.level}
              onChange={(e) => handleLevelChange(e.target.value)}
              className={levelError ? "border-red-300" : ""}
              disabled={isEditing}
            >
              <option value="">Seleccionar Grado</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
            {isEditing && (
              <span className="text-blue-500 text-xs mt-1 block">
                El nivel de grado no puede ser modificado en modo edición
              </span>
            )}
            {levelError && <p className="text-red-500 text-sm">{levelError}</p>}
          </div>

          <div className="form-group">
            <label>Grado Mínimo {requiredField}</label>
            <input
              type="text"
              value={values.minGrade}
              onChange={(e) => handleMinGradeChange(e.target.value)}
              className={minGradeError ? "border-red-300" : ""}
              placeholder="Ej: 1ro, 2do"
            />
            {minGradeError && <p className="text-red-500 text-sm">{minGradeError}</p>}
          </div>

          <div className="form-group">
            <label>Grado Máximo (opcional)</label>
            <input
              type="text"
              value={values.maxGrade}
              onChange={(e) => handleMaxGradeChange(e.target.value)}
              className={maxGradeError ? "border-red-300" : ""}
              placeholder="Ej: 3ro, 4to"
            />
            {maxGradeError && <p className="text-red-500 text-sm">{maxGradeError}</p>}
          </div>
        </div>

        {/* Fila 3: Descripción */}
        <div className="form-row full">
          <div className="form-group">
            <label>Descripción</label>
            <span className={`text-sm ${getCharCountColor()}`}>
              {descriptionCharCount}/150 caracteres
            </span>
            <textarea
              placeholder="Ej: Para estudiantes de 6-12 años, Nivel para principiantes, etc."
              value={values.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className={descriptionError ? "border-red-300" : ""}
            >
            </textarea>
            {/* Validation hints */}
            <div className="text-sm mt-1">
              {descriptionHints.minLength && (
                <p className="text-red-600">La descripción debe tener al menos 10 caracteres.</p>
              )}
              {descriptionHints.maxLength && (
                <p className="text-red-600">La descripción no debe exceder 150 caracteres.</p>
              )}
              {descriptionHints.startsWithNumber && (
                <p className="text-red-600">La descripción no debe iniciar con números.</p>
              )}
              {descriptionHints.consecutiveNumbers && (
                <p className="text-red-600">La descripción no debe tener más de 2 números consecutivos.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={!!nameError || !!areaError || !!levelError || !!minGradeError || !!maxGradeError || !!descriptionError}
        >
          {isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default FormularioNivelCategoria;