
import PropTypes from 'prop-types';
import '../../styles/components/ErrorModal.css'; 

const ErrorModal = ({ isOpen, onClose, errorMessage, errorFields = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Error de validación</h2>
        
        {errorMessage && (
          <p className="modal-message">{errorMessage}</p>
        )}
        
        {errorFields && errorFields.length > 0 && (
          <div className="error-fields">
            <p className="error-fields-title">Campos con error:</p>
            <ul className="error-fields-list">
              {errorFields.map((field, index) => (
                <li key={index} className="error-field-item">
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="modal-button"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

ErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  errorFields: PropTypes.arrayOf(PropTypes.string)
};

export default ErrorModal;