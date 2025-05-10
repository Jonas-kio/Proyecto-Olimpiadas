import "../../../styles/ocr/ErrorModal.css";

import React, { useState } from 'react'
import { AlertTriangleIcon, XIcon } from 'lucide-react'

const ErrorModal = ({ onClose, onManualAssociation }) => {
  const [manualName, setManualName] = useState('')
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (manualName.trim()) {
      onManualAssociation(manualName)
    }
  }

  return (
    <div className="error-modal-backdrop">
      <div className="error-modal-container">
        <div className="error-modal-header">
          <div className="error-modal-header-left">
            <div className="error-icon-wrapper">
              <AlertTriangleIcon className="error-icon" />
            </div>
            <h3 className="error-title">Error en el procesamiento</h3>
          </div>
          <button onClick={onClose} className="error-close-button">
            <XIcon className="error-close-icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="error-form">
          <div className="error-form-group">
            <p className="error-description">
              No se pudo reconocer el nombre del pagador en el comprobante. Por favor, ingresa el nombre manualmente para continuar con la asociación.
            </p>
            <label htmlFor="manual-name" className="error-label">
              Nombre del pagador
            </label>
            <input
              type="text"
              id="manual-name"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="error-input"
              placeholder="Ingrese el nombre completo"
              required
            />
          </div>
          <div className="error-checkbox-group">
            <label className="error-checkbox-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={() => setDontShowAgain(!dontShowAgain)}
                className="error-checkbox"
              />
              <span>No mostrar este mensaje nuevamente</span>
            </label>
          </div>
          <div className="error-footer">
            <button
              type="button"
              onClick={onClose}
              className="error-cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="error-confirm-button"
            >
              Asociar Manualmente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


export default ErrorModal;