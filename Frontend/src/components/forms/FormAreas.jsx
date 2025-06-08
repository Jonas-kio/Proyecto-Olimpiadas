import { useState } from 'react';
import PropTypes from 'prop-types';
import { validateAreaForm } from '../../utils/validators/areaValidators';
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
  hideFieldErrors = false,
  existingAreas = [], // Para validación de duplicados
  currentAreaId = null // Para edición
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
    
    // Usar validateAreaForm directamente
    const validationResult = validateAreaForm(values, existingAreas, currentAreaId);
    
    if (!validationResult.isValid) {
      // Convertir errores al formato del modal
      const fieldErrors = [];
      
      // Mapear errores basándose en los fields
      fields.forEach(field => {
        if (validationResult.errors[field.name]) {
          fieldErrors.push({
            field: field.label,
            message: validationResult.errors[field.name]
          });
        }
      });
      
      // Llamar onSubmit con los errores para mostrar el modal
      onSubmit(fieldErrors);
      return;
    }
    
    // Si no hay errores, proceder
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
      <form className="area-form" onSubmit={handleSubmit} noValidate>
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
                  disabled={loading}
                  rows={field.rows || 4}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`form-input ${shouldShowError(field.name) ? 'input-error' : ''}`}
                  disabled={loading || field.disabled}
                >
                  <option value="">
                    {field.placeholder || `Seleccione ${field.label.toLowerCase()}`}
                  </option>
                  {field.options && field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
                  className={`form-input ${shouldShowError(field.name) ? 'input-error' : ''}`}
                  disabled={loading || field.disabled}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  maxLength={field.maxLength}
                />
              )}
              
              {/* Mostrar mensajes de error si existen y el campo ha sido tocado */}
              {shouldShowError(field.name) && (
                <div className="error-message">{errors[field.name]}</div>
              )}
              
              {/* Mostrar información adicional del campo si existe */}
              {field.helpText && (
                <div className="field-help text-gray-500 text-xs mt-1">
                  {field.helpText}
                </div>
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
            disabled={loading}
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
      type: PropTypes.oneOf(['text', 'textarea', 'select', 'number', 'email', 'password']),
      required: PropTypes.bool,
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      disabled: PropTypes.bool,
      rows: PropTypes.number,
      min: PropTypes.number,
      max: PropTypes.number,
      step: PropTypes.number,
      maxLength: PropTypes.number,
      helpText: PropTypes.string
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
  hideFieldErrors: PropTypes.bool,
  existingAreas: PropTypes.array,
  currentAreaId: PropTypes.number
};

export default FormAreas;