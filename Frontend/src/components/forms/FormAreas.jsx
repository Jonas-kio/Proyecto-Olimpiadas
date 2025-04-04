import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/FormAreas.css';

const FormAreas = ({ 
  title, 
  fields, 
  values, 
  onChange, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Guardar', 
  cancelLabel = 'Cancelar',
  errors = {},
  loading = false,
  submitDisabled = false,
  hideFieldErrors = false
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
    // Si hideFieldErrors es true, no mostrar errores bajo los campos
    if (hideFieldErrors) return false;
    return touchedFields[fieldName] && errors[fieldName];
  };

  return (
    <div className="form-container form-full-width">
      <form className="area-form" onSubmit={handleSubmit}>
        {title && (
          <div className="form-header">
            <h3>{title}</h3>
          </div>
        )}
        
        <div className="form-row">
          {fields.map((field) => (
            <div className="form-column" key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required-mark">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
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
                  id={field.name}
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
        {errors.general && !hideFieldErrors && (
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
            disabled={loading || submitDisabled}
          >
            {loading ? 'Procesando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

FormAreas.propTypes = {
  title: PropTypes.string,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      required: PropTypes.bool,
      placeholder: PropTypes.string
    })
  ).isRequired,
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  submitDisabled: PropTypes.bool,
  hideFieldErrors: PropTypes.bool
};

export default FormAreas;