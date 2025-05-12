import React from 'react'
import { EditIcon } from 'lucide-react'
import StudentList from './StudentList';
import "../../../styles/ocr/OcrResults.css";

const OcrResults = ({
  detectedName,
  setDetectedName,
  students,
  onConfirm,
}) => {
  return (
    <div className="ocr-container">
      <h2 className="ocr-title">Resultados del Procesamiento</h2>
      <div className="ocr-card">
        <div className="ocr-section">
          <label htmlFor="detected-name" className="ocr-label">
            Nombre del pagador/tutor detectado
          </label>
          <div className="ocr-input-wrapper">
            <input
              type="text"
              id="detected-name"
              value={detectedName}
              onChange={(e) => setDetectedName(e.target.value)}
              className="ocr-input"
              placeholder="Nombre del pagador"
            />
            <div className="ocr-icon-container">
              <EditIcon className="ocr-icon" />
            </div>
          </div>
          <p className="ocr-help-text">
            El nombre ha sido extraído automáticamente. Puede editarlo si es necesario.
          </p>
        </div>
        <div className="ocr-section">
          <div className="ocr-list-header">
            <h3 className="ocr-subtitle">Estudiantes asociados al tutor</h3>
            <span className="ocr-count">Total: {students.length} estudiante(s)</span>
          </div>
          <StudentList students={students} />
        </div>
        <div className="ocr-footer">
          <button onClick={onConfirm} className="ocr-confirm-button">
            Confirmar Asociación
          </button>
        </div>
      </div>
    </div>
  )
}


export default OcrResults;