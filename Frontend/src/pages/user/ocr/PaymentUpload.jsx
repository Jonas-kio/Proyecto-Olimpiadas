import "../../../styles/ocr/PaymentUpload.css";

import React, { useState, useRef } from 'react'
import { Upload, AlertCircleIcon } from 'lucide-react'

const PaymentUpload = ({ onImageUpload, uploadedImage, onProcess }) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0])
    }
  }

  const handleFiles = (file) => {
    setError('')
    // Validar tipo de archivo
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      setError('El archivo debe ser una imagen JPG o PNG.')
      return
    }
    // Validar tamaño máximo
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe exceder 5MB.')
      return
    }
    // Leer y cargar la imagen
    const reader = new FileReader()
    reader.onload = (e) => {
      onImageUpload(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const openFileDialog = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="upload-container">
      <h2 className="upload-title">Subir Comprobante de Pago</h2>
      <div className="upload-card">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${uploadedImage ? 'has-image' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
          />
          {!uploadedImage ? (
            <div>
              <div className="upload-icon-container">
                <Upload className="upload-icon" />
              </div>
              <div>
                <p className="upload-text">Arrastra y suelta tu comprobante aquí</p>
                <p className="upload-or">o</p>
                <button onClick={openFileDialog} className="select-button">
                  Seleccionar archivo
                </button>
                <p className="file-info">JPG o PNG, máximo 5MB</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="preview-container">
                <img
                  src={uploadedImage}
                  alt="Vista previa del comprobante"
                  className="preview-image"
                />
                <button
                  onClick={() => onImageUpload(null)}
                  className="remove-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <p className="file-info">Haz clic en el botón para cambiar de archivo</p>
              <button onClick={openFileDialog} className="select-button">
                Seleccionar otro archivo
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <AlertCircleIcon className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onProcess}
            disabled={!uploadedImage}
            className="process-button"
          >
            Procesar Comprobante
          </button>
        </div>
      </div>
    </div>
  )
}


export default PaymentUpload;
