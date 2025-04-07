import PropTypes from 'prop-types';
import '../../styles/components/DeleteModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType = "registro" }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal__overlay">
      <div className="delete-modal__content">
        <div className="delete-modal__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        
        <h2 className="delete-modal__title">Confirmar Eliminación</h2>
        
        <p className="delete-modal__message">
          ¿Está seguro que desea eliminar el {itemType} <strong>{itemName}</strong>?<br/>
          Esta acción no se puede deshacer.
        </p>
        
        <div className="delete-modal__actions">
          <button
            onClick={onClose}
            className="delete-modal__button-cancel"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="delete-modal__button-delete"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired,
  itemType: PropTypes.string
};

export default DeleteConfirmationModal;