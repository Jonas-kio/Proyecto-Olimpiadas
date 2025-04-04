
// src/components/forms/FormularioNivelCategoria.jsx
import React from "react";

const FormularioNivelCategoria = ({ values, onChange, onSubmit, onCancel }) => {
  return (
    
    <div className="formulario-nivel max-w-0xl mx-auto p-1 bg-gray-50 border rounded-lg shadow-sm">

      <h3 className="formulario-titulo">Nuevo Nivel/Categoría</h3>
      <div className="form-grid">

        {/* Fila 1: Nombre y Área */}
        <div className="form-row double">
          <div className="form-group">
            <label>Nombre del Nivel/Categoría</label>
            <input
              type="text"
              placeholder="Ej: Básico, Primaria, etc."
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Área</label>
            <select
              value={values.area}
              onChange={(e) => onChange("area", e.target.value)}
            >
              <option>Seleccionar Área</option>
              <option>Matemáticas</option>
              <option>Física</option>
              <option>Química</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Nivel, Grado Mínimo y Máximo */}
        <div className="form-row triple">
          <div className="form-group">
            <label>Nivel de Grado</label>
            <select
              value={values.level}
              onChange={(e) => onChange("level", e.target.value)}
            >
              <option>Seleccionar Grado</option>
              <option>Primaria</option>
              <option>Secundaria</option>
              
            </select>
          </div>

          <div className="form-group">
            <label>Grado Mínimo</label>
            <input
              type="text"
              value={values.minGrade}
              onChange={(e) => onChange("minGrade", e.target.value)}
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
            <textarea
              placeholder="Ej: Para estudiantes de 6-12 años, Nivel para principiantes, etc."
              value={values.description}
              onChange={(e) => onChange("description", e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={onSubmit}>Guardar</button>
      </div>
    </div>
  );
};

export default FormularioNivelCategoria;