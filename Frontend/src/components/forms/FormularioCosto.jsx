/* eslint-disable react/prop-types */
import React from "react";

const FormularioCosto = ({ values, onChange, onSubmit, onCancel, errorMessage }) => {
  const [nameError, setNameError] = React.useState("");
  const [valueError, setValueError] = React.useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      if (value.length > 25) {
        setNameError("Solo se permiten 25 caracteres");
        return;
      } else {
        setNameError("");
      }
    }

    if (name === "value") {
      if (value.includes("-")) {
        setValueError("Error");
        return;
      }

      const numericValue = parseFloat(value);
      if (numericValue <= 0 || isNaN(numericValue)) {
        setValueError("El valor debe ser mayor a 0");
      } else {
        setValueError("");
      }
    }

    onChange({ target: { name, value } });
  };

  return (
    <div className="formulario-nivel max-w-2xl mx-auto p-4 bg-gray-50 border rounded-lg shadow-sm">
      <h3 className="formulario-titulo">Nuevo Costo</h3>

      {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}

      <div className="form-grid">
        {/* Fila 1: Nombre y Valor */}
        <div className="form-row double">
          <div className="form-group">
            <label>Nombre del costo</label>
            <input
              type="text"
              name="name"
              placeholder="Ej: Inscripción General"
              value={values.name}
              onChange={handleChange}
            />
            {nameError && <p className="text-red-600 text-sm mt-1 font-medium">{nameError}</p>}
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
            />
            {valueError && <p className="text-red-600 text-sm mt-1 font-medium">{valueError}</p>}
          </div>
        </div>

        {/* Fila 2: Área y Categoría */}
        <div className="form-row double">
          <div className="form-group">
            <label>Área</label>
            <select
              name="area"
              value={values.area}
              onChange={onChange}
            >
              <option value="Todas">Todas</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
            </select>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={values.category}
              onChange={onChange}
            >
              <option value="Todas">Todas</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Universitaria">Universitaria</option>
            </select>
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

export default FormularioCosto;
