import React from 'react';
import '../../styles/components/Form.css';

const Form = ({ title, fields, values, onChange, onSubmit, onCancel, submitLabel = 'Guardar', cancelLabel = 'Cancelar' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
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
              <label>{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
                className="form-input"
                required={field.required}
              />
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="submit" className="btn-save">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;