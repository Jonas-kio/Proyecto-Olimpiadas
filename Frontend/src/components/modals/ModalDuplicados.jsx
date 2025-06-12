import React, { useState } from 'react';
import './ModalDuplicados.css';

const ModalDuplicados = ({ 
  isOpen, 
  onClose, 
  resultadoVerificacion, 
  onConfirmarAccion 
}) => {
  const [accionSeleccionada, setAccionSeleccionada] = useState('');
  const [competidoresSeleccionados, setCompetidoresSeleccionados] = useState(new Set());

  if (!isOpen || !resultadoVerificacion) return null;

  const { 
    competidores_existentes = [], 
    competidores_nuevos = [], 
    total_existentes = 0, 
    total_nuevos = 0 
  } = resultadoVerificacion;

  const handleSeleccionarCompetidor = (indice) => {
    const nuevaSeleccion = new Set(competidoresSeleccionados);
    if (nuevaSeleccion.has(indice)) {
      nuevaSeleccion.delete(indice);
    } else {
      nuevaSeleccion.add(indice);
    }
    setCompetidoresSeleccionados(nuevaSeleccion);
  };

  const handleConfirmar = () => {
    if (!accionSeleccionada) {
      alert('Por favor selecciona una acción');
      return;
    }

    let datos = {};

    switch (accionSeleccionada) {
      case 'omitir_duplicados':
        datos = {
          accion: 'omitir_duplicados',
          indices_omitir: competidores_existentes.map(c => c.indice),
          competidores_nuevos: competidores_nuevos
        };
        break;
      
      case 'asociar_existentes':
        datos = {
          accion: 'asociar_existentes',
          competidores_ids: Array.from(competidoresSeleccionados)
            .map(indice => {
              const competidor = competidores_existentes.find(c => c.indice === indice);
              return competidor?.competidor_existente?.id;
            })
            .filter(id => id),
          competidores_nuevos: competidores_nuevos
        };
        break;
      
      case 'cancelar':
        datos = { accion: 'cancelar' };
        break;
      
      default:
        alert('Acción no reconocida');
        return;
    }

    onConfirmarAccion(datos);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-duplicados">
        <div className="modal-header">
          <h2>🔍 Competidores Duplicados Detectados</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="resumen-verificacion">
            <div className="stat-card existentes">
              <h3>Competidores Existentes</h3>
              <span className="number">{total_existentes}</span>
              <p>Ya están registrados en el sistema</p>
            </div>
            <div className="stat-card nuevos">
              <h3>Competidores Nuevos</h3>
              <span className="number">{total_nuevos}</span>
              <p>Se pueden registrar sin problemas</p>
            </div>
          </div>

          {total_existentes > 0 && (
            <div className="competidores-existentes">
              <h3>📋 Competidores que ya existen:</h3>
              <div className="competidores-list">
                {competidores_existentes.map((competidor) => (
                  <div key={competidor.indice} className="competidor-item">
                    <div className="competidor-info">
                      <strong>{competidor.nombres} {competidor.apellidos}</strong>
                      <div className="detalles">
                        <span>CI: {competidor.documento_identidad}</span>
                        <span>Email: {competidor.correo_electronico}</span>
                      </div>
                      <div className="motivos">
                        Duplicado por: {competidor.motivo_duplicado.join(', ')}
                      </div>
                    </div>
                    <div className="datos-existente">
                      <h4>Datos en el sistema:</h4>
                      <p><strong>{competidor.competidor_existente.nombres} {competidor.competidor_existente.apellidos}</strong></p>
                      <p>Colegio: {competidor.competidor_existente.colegio}</p>
                      <p>Curso: {competidor.competidor_existente.curso}</p>
                      <p>Provincia: {competidor.competidor_existente.provincia}</p>
                    </div>
                    {accionSeleccionada === 'asociar_existentes' && (
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={competidoresSeleccionados.has(competidor.indice)}
                          onChange={() => handleSeleccionarCompetidor(competidor.indice)}
                        />
                        Asociar al proceso
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="acciones-disponibles">
            <h3>🛠️ ¿Qué deseas hacer?</h3>
            <div className="opciones-radio">
              <label className="opcion-radio">
                <input
                  type="radio"
                  name="accion"
                  value="omitir_duplicados"
                  checked={accionSeleccionada === 'omitir_duplicados'}
                  onChange={(e) => setAccionSeleccionada(e.target.value)}
                />
                <div className="opcion-content">
                  <strong>Omitir duplicados</strong>
                  <p>Registrar solo los competidores nuevos ({total_nuevos})</p>
                </div>
              </label>

              {total_existentes > 0 && (
                <label className="opcion-radio">
                  <input
                    type="radio"
                    name="accion"
                    value="asociar_existentes"
                    checked={accionSeleccionada === 'asociar_existentes'}
                    onChange={(e) => setAccionSeleccionada(e.target.value)}
                  />
                  <div className="opcion-content">
                    <strong>Asociar competidores existentes</strong>
                    <p>Vincular los competidores ya registrados a este proceso</p>
                  </div>
                </label>
              )}

              <label className="opcion-radio">
                <input
                  type="radio"
                  name="accion"
                  value="cancelar"
                  checked={accionSeleccionada === 'cancelar'}
                  onChange={(e) => setAccionSeleccionada(e.target.value)}
                />
                <div className="opcion-content">
                  <strong>Cancelar</strong>
                  <p>Revisar los datos y corregir duplicados manualmente</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleConfirmar}
            disabled={!accionSeleccionada}
          >
            Confirmar Acción
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDuplicados;
