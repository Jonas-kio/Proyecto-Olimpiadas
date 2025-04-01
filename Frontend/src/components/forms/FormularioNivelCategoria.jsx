/* eslint-disable react/prop-types */

// src/components/forms/FormularioNivelCategoria.jsx
import { useState, useEffect } from 'react';
import { getActiveAreas } from '../../services/areasService';

const FormularioNivelCategoria = ({ values, onChange, onSubmit, onCancel, isEditing = false }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
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
    const description = values.description.trim();
    setDescriptionCharCount(description.length);

    setDescriptionHints({
      minLength: description.length > 0 && description.length < 10,
      maxLength: description.length > 150,
      startsWithNumber: /^[0-9]/.test(description),
      consecutiveNumbers: /[0-9]{3,}/.test(description)
    });
  }, [values.description]);

  const handleDescriptionChange = (e) => {
    onChange("description", e.target.value);
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
              onChange={(e) => onChange("name", e.target.value)}
              className={!values.name.trim() ? "border-red-300" : ""}
            />
          </div>

          <div className="form-group">
            <label>Área {requiredField}</label>
            <select
              value={values.area}
              onChange={(e) => onChange("area", e.target.value)}
              className={!values.area ? "border-red-300" : ""}
              disabled={isEditing}
            >
              <option>Seleccionar Área</option>
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
          </div>
        </div>

        {/* Fila 2: Nivel, Grado Mínimo y Máximo */}
        <div className="form-row triple">
          <div className="form-group">
            <label>Nivel de Grado {requiredField}</label>
            <select
              value={values.level}
              onChange={(e) => onChange("level", e.target.value)}
              className={!values.level ? "border-red-300" : ""}
              disabled={isEditing}
            >
              <option>Seleccionar Grado</option>
              <option>Primaria</option>
              <option>Secundaria</option>
            </select>
            {isEditing && (
              <span className="text-blue-500 text-xs mt-1 block">
                El nivel de grado no puede ser modificado en modo edición
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Grado Mínimo {requiredField}</label>
            <input
              type="text"
              value={values.minGrade}
              onChange={(e) => onChange("minGrade", e.target.value)}
              className={!values.minGrade.trim() ? "border-red-300" : ""}
            />
          </div>

          <div className="form-group">
            <label>Grado Máximo (opcional)</label>
            <input
              type="text"
              value={values.maxGrade}
              onChange={(e) => onChange("maxGrade", e.target.value)}
            />
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
              onChange={handleDescriptionChange}
              className={descriptionHints.minLength || descriptionHints.maxLength || 
                         descriptionHints.startsWithNumber || descriptionHints.consecutiveNumbers 
                         ? "border-red-300" : ""}
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
        <button className="btn-primary" onClick={onSubmit}>
          {isEditing ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default FormularioNivelCategoria;