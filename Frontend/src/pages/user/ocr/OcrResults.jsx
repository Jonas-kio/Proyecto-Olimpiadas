import React from 'react'
import { FaUserCircle } from "react-icons/fa";
import StudentList from './StudentList';
import "../../../styles/ocr/OcrResults.css";

const OcrResults = ({
  detectedName,
  students,
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
              readOnly
              className="ocr-input"
            />
            <div className="ocr-icon-container">
              <FaUserCircle className="ocr-icon" />
            </div>
          </div>
          <p className="ocr-help-text">
            El nombre ha sido extraído automáticamente.
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
          <button onClick={() => window.history.back()} className="ocr-confirm-button">
            Volver a la anterior pagina
          </button>
        </div>
      </div>
    </div>
  )
}


export default OcrResults;