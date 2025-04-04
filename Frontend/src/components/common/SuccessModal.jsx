import PropTypes from 'prop-types';
import '../../styles/components/SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, tittleMessage, successMessage, detailMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal__overlay">
      <div className="success-modal__content">
        <div className="success-modal__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        
        {tittleMessage && (
          <h2 className="success-modal__title">{tittleMessage}</h2>
        )}

        {successMessage && (
          <p className="success-modal__message">{successMessage}</p>
        )}
        
        {detailMessage && (
          <div className="success-modal__details">
            <p>{detailMessage}</p>
          </div>
        )}
        
        <div className="success-modal__actions">
          <button
            onClick={onClose}
            className="success-modal__button"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

SuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tittleMessage: PropTypes.string,
  successMessage: PropTypes.string,
  detailMessage: PropTypes.string
};

export default SuccessModal;