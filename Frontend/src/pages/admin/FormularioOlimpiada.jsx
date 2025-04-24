import React, { useState } from 'react';
import { CheckIcon, UploadIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import axios from 'axios';
import "../../styles/components/FormularioOlimpiada.css";

const FormularioOlimpiada = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedAreas: [],
    minParticipants: '',
    modality: '',
    pdfFile: null,
    coverImage: null,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isAreasOpen, setIsAreasOpen] = useState(false);

  const areas = ['Matemáticas', 'Física', 'Química', 'Biología', 'Informática'];
  const modalities = ['Presencial', 'Virtual', 'Híbrida'];

  const handleAreaToggle = (area) => {
    setFormData((prev) => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(area)
        ? prev.selectedAreas.filter((a) => a !== area)
        : [...prev.selectedAreas, area],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }));
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid =
      formData.name &&
      formData.description &&
      formData.startDate &&
      formData.endDate &&
      formData.selectedAreas.length > 0 &&
      formData.minParticipants &&
      formData.modality &&
      formData.pdfFile &&
      formData.coverImage;

    if (isValid) {
      console.log('Form submitted:', formData);
      alert('Olimpiada creada exitosamente!');
    } else {
      alert('Por favor complete todos los campos requeridos');
    }
  };

  return (
    <div className="create-olympiad-container">
      <div className="create-olympiad-box">
        <h1 className="title">Crear Nueva Olimpiada</h1>

        <form onSubmit={handleSubmit} className="form-content">
          {/* Imagen de portada */}
          <div className="input-group">
            <label className="label">Imagen de Portada</label>
            <div className="image-upload">
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData((prev) => ({
                        ...prev,
                        coverImage: null,
                      }));
                    }}
                    className="remove-btn"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <UploadIcon className="upload-icon" />
                  <label className="upload-label">
                    <span className="upload-text">Subir imagen</span>
                    <input
                      type="file"
                      className="file-hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                  <p className="upload-note">PNG, JPG hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Nombre y descripción */}
          <div className="input-group">
            <label className="label">Nombre de la Olimpiada</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea"
              rows={4}
              required
            />
          </div>

          {/* Fechas */}
          <div className="date-grid">
            <div>
              <label className="label">Fecha de inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Fecha de fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          {/* Áreas */}
          <div className="dropdown-container">
            <label className="dropdown-label">Áreas</label>
            <div className="dropdown-wrapper">
              <button
                type="button"
                onClick={() => setIsAreasOpen(!isAreasOpen)}
                className={`dropdown-button ${isAreasOpen ? 'open' : ''}`}
              >
                <span className="dropdown-selected">
                  {formData.selectedAreas.length
                    ? `${formData.selectedAreas.length} áreas seleccionadas`
                    : 'Seleccionar áreas'}
                </span>
                <ChevronDownIcon className={`chevron-icon ${isAreasOpen ? 'rotate' : ''}`} />
              </button>

              {isAreasOpen && (
                <div className="dropdown-options">
                  {areas.map((area) => (
                    <div key={area} className="dropdown-option" onClick={() => handleAreaToggle(area)}>
                      <input
                        type="checkbox"
                        checked={formData.selectedAreas.includes(area)}
                        onChange={() => {}}
                        className="checkbox"
                      />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formData.selectedAreas.length > 0 && (
              <div className="selected-tags">
                {formData.selectedAreas.map((area) => (
                  <span key={area} className="tag">
                    {area}
                    <XIcon size={14} className="remove-tag" onClick={() => handleAreaToggle(area)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cupo mínimo */}
          <div className="input-group">
            <label className="label">Cupo mínimo de participantes</label>
            <input
              type="number"
              value={formData.minParticipants}
              onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
              className="input"
              min="1"
              required
            />
          </div>

          {/* Modalidad */}
          <div className="input-group">
            <label className="label">Modalidad</label>
            <select
              value={formData.modality}
              onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
              className="input"
              required
            >
              <option value="">Seleccione una modalidad</option>
              {modalities.map((modality) => (
                <option key={modality} value={modality}>
                  {modality}
                </option>
              ))}
            </select>
          </div>

          {/* PDF de la olimpiada */}
          <div className="pdf-upload-container">
            <label className="pdf-upload-label">Detalles de la olimpiada (PDF)</label>
            <div className="pdf-upload-wrapper">
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFormData((prev) => ({
                    ...prev,
                    pdfFile: selectedFile,
                  }));
                }}
                className="pdf-upload-input"
              />
              <UploadIcon className="pdf-upload-icon" />
            </div>

            {formData.pdfFile && (
              <p className="pdf-upload-filename">
                Archivo seleccionado: <span>{formData.pdfFile.name}</span>
              </p>
            )}
          </div>

          {/* Botón de envío */}
          <button type="submit" className="submit-btn">
            <CheckIcon size={20} />
            Guardar Olimpiada
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioOlimpiada;
