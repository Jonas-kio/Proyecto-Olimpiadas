import PropTypes from 'prop-types';
import '../../styles/components/ErrorModal.css'; 

const ErrorModal = ({ isOpen, onClose, errorMessage, errorFields = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal__overlay">
      <div className="error-modal__content">
        <h2 className="error-modal__title">Error de validación</h2>
        
        {errorMessage && (
          <p className="error-modal__message">{errorMessage}</p>
        )}
        
        {errorFields && errorFields.length > 0 && (
          <div className="error-modal__fields">
            <p className="error-modal__fields-title">Campos con error:</p>
            <ul className="error-modal__fields-list">
              {errorFields.map((field, index) => (
                <li key={index} className="error-modal__field-item">
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="error-modal__actions">
          <button
            onClick={onClose}
            className="error-modal__button"
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