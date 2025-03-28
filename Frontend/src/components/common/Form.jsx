import React, { useState, useEffect } from 'react';
import '../../styles/components/Form.css';

const Form = ({ 
  title, 
  fields, 
  values, 
  onChange, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Guardar', 
  cancelLabel = 'Cancelar',
  errors = {},  // Nuevo prop para recibir errores
  loading = false  // Nuevo prop para estado de carga
}) => {
  // Estado para rastrear campos tocados por el usuario
  const [touchedFields, setTouchedFields] = useState({});

  // Manejar el envío del formulario con validaciones
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados al enviar
    const allTouched = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouchedFields(allTouched);
    
    onSubmit();
  };

  // Manejar cambios en los campos y rastrear cuando son tocados
  const handleChange = (fieldName, value) => {
    // Marcar el campo como tocado
    setTouchedFields({
      ...touchedFields,
      [fieldName]: true
    });
    
    // Llamar al onChange original
    onChange(fieldName, value);
  };

  // Determinar si se debe mostrar un mensaje de error
  const shouldShowError = (fieldName) => {
    return touchedFields[fieldName] && errors[fieldName];
  };

  return (
    <div className="form-container form-full-width">
      <form className="area-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>{title}</h3>
        </div>
        
        <div className="form-row">
          {fields.map((field) => (
            <div className="form-column" key={field.name}>
              <label>
                {field.label}
                {field.required && <span className="required-mark">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
                  className={`form-input ${shouldShowError(field.name) ? 'input-error' : ''}`}
                  required={field.required}
                  disabled={loading}
                  rows={4}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
                  className={`form-input ${shouldShowError(field.name) ? 'input-error' : ''}`}
                  required={field.required}
                  disabled={loading}
                />
              )}
              
              {/* Mostrar mensajes de error si existen y el campo ha sido tocado */}
              {shouldShowError(field.name) && (
                <div className="error-message">{errors[field.name]}</div>
              )}
            </div>
          ))}
        </div>
        
        {/* Error general del formulario */}
        {errors.general && (
          <div className="error-general">{errors.general}</div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Procesando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;