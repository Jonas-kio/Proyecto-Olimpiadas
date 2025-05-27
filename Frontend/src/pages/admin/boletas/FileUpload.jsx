import React, { useRef } from 'react';
import { UploadIcon, CheckCircleIcon } from 'lucide-react';
import "../../../styles/boletas/FileUpload.css";

const FileUpload = ({ onFileUpload, uploadedFile }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="file-upload-container">
      <h2 className="file-upload-title">Subir Archivo CSV</h2>
      <div
        className="file-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploadedFile ? (
          <div className="flex flex-col items-center space-y-3">
            <CheckCircleIcon className="file-upload-success-icon" />
            <div>
              <p className="file-upload-file-name">Archivo subido exitosamente</p>
              <p className="file-upload-file-detail">{uploadedFile.name}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="file-upload-change-button"
            >
              Cambiar archivo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <UploadIcon className="file-upload-icon" />
            <div>
              <p className="file-upload-file-name">
                Arrastra tu archivo CSV aquí o haz clic para seleccionar
              </p>
              <p className="file-upload-file-detail">
                Solo archivos CSV (máx. 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
