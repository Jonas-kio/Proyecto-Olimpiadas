import React, { useState } from 'react';
import ReportGenerator from './ReportGenerator';
import ParticipantsTable from './ParticipantsTable';
import SummarySection from './SummarySection';
import "../../../styles/reportes/ReportPanel.css";

const ReportPanel = () => {
  const [participants] = useState([
    {
      OlimpiadaId: 1,
      Olimpiada: "Olimpiada Nacional de Matemáticas 2024",
      Participante: "Roxana",
      Área: "Biologia",
      Nivel: "Básico",
      Estado: "Verificado",
      Fecha: "2024-01-20",
    },
    {
      OlimpiadaId: 1,
      Olimpiada: "Olimpiada Nacional de Matemáticas 2024",
      Participante: "Juan Pérez",
      Área: "Matemáticas",
      Nivel: "3S",
      Estado: "Pendiente",
      Fecha: "2024-01-15"
    },
    {
      OlimpiadaId: 2,
      Olimpiada: "Olimpiada Nacional de Robótica 2025",
      Participante: "Ana García",
      Área: "Robótica",
      Nivel: "Builders P",
      Estado: "Inscrito",
      Fecha: "2025-02-10"
    },
    {
      OlimpiadaId: 2,
      Olimpiada: "Olimpiada Nacional de Robótica 2025",
      Participante: "Carlos Mendoza",
      Área: "Robótica",
      Nivel: "Builders S",
      Estado: "Pendiente",
      Fecha: "2025-02-15"
    },
    {
      OlimpiadaId: 3,
      Olimpiada: "holaaaaa",
      Participante: "Isma",
      Área: "Informática",
      Nivel: "Londra",
      Estado: "Inscrito",
      Fecha: "2025-02-15"
    }
  ]);

  const [filteredData, setFilteredData] = useState(participants);

  return (
    <div className="admin-container">
      <div className="admin-inner">
        <div className="admin-box">
          <ReportGenerator data={participants} onFilter={setFilteredData} />
        </div>

        <div className="admin-box">
          <ParticipantsTable data={filteredData} />
        </div>

        <div className="admin-grid">
          <div className="admin-box">
            <h2 className="admin-section-title">Resumen por Área</h2>
            <SummarySection
              items={[
                { name: 'Matemáticas', count: 85, label: 'participantes' },
                { name: 'Física', count: 62, label: 'participantes' },
                { name: 'Química', count: 45, label: 'participantes' },
              ]}
            />
          </div>
          <div className="admin-box">
            <h2 className="admin-section-title">Estado de Pagos</h2>
            <div className="payment-row">
              <span>Total Recaudado</span>
              <span className="payment-value">Bs. 9.600</span>
            </div>
            <div className="payment-row">
              <span>Pagos Pendientes</span>
              <span className="payment-value">Bs. 2.250</span>
            </div>
            <div className="payment-row">
              <span>Pagos Verificados</span>
              <span className="payment-value success">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPanel;
