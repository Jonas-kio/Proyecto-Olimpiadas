import React, { useState } from "react";
import { UploadIcon, XIcon } from "lucide-react";
import "../../../styles/components/FormularioOlimpiada.css";

const ImageUploader = ({ imagePreview, onImageChange, onRemove }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    validateAndSetImage(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetImage(file);
  };

  const validateAndSetImage = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, JPEG o PNG.");
      return;
    }

    setError("");
    onImageChange(file);
  };

  return (
    <div className="input-group">
      <label className="label">
        Imagen de Portada <span className="asterisco">*</span>
      </label>

      <div
        className={`image-upload ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        >
        {imagePreview ? (
            <div className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" onClick={onRemove} className="remove-btn">
                <XIcon size={16} />
            </button>
            </div>
        ) : (
            <div className="upload-placeholder">
            <UploadIcon className="upload-icon" />
            <label className="upload-label">
                <span className="upload-text">Haz clic o arrastra una imagen</span>
                <input
                type="file"
                accept=".jpeg,.jpg,.png"
                className="file-hidden"
                onChange={handleFileChange}
                />
            </label>
            </div>
        )}
        {error && <p className="error-message-inside">{error}</p>}
    </div>
    </div>
  );
};

export default ImageUploader;
