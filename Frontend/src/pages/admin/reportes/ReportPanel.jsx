import React, { useState, useEffect } from 'react';
import ReportGenerator from './ReportGenerator';
import ParticipantsTable from './ParticipantsTable';
import SummarySection from './SummarySection';
import { getReporteInscripciones, getResumenInscripciones } from '../../../services/reportesService';
import LoadingModal from "../../../components/modals/LoadingModal";  
import '../../../styles/reportes/ReportPanel.css';

const ReportPanel = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [resumen, setResumen] = useState({
    resumen_por_area: [],
    estado_pagos: {
      total_recaudado: 0,
      total_pendiente: 0,
      porcentaje_verificado: 0
    }
  });
  const [filtros, setFiltros] = useState({
    olimpiada_id: 'Todos',
    area_id: 'Todos',
    categoria_id: 'Todos',
    estado: 'Todos'
  });

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const data = await getReporteInscripciones(filtros);
        setParticipants(data);
        setFilteredData(data);
        const resumenData = await getResumenInscripciones(filtros);
        setResumen(resumenData);
      } catch (error) {
        console.error('Error al cargar reportes', error);
      }
      setIsInitialLoading(false);
    };
    cargarDatosIniciales();
  }, []); 

  useEffect(() => {
    if (!isInitialLoading) {
      const cargarDatosConFiltros = async () => {
        setLoading(true);
        try {
          const data = await getReporteInscripciones(filtros);
          setParticipants(data);
          setFilteredData(data);
          const resumenData = await getResumenInscripciones(filtros);
          setResumen(resumenData);
        } catch (error) {
          console.error('Error al cargar reportes', error);
        }
        setLoading(false);
      };
      cargarDatosConFiltros();
    }
  }, [filtros]);

  return (
    <div className="admin-container">
      <div className="admin-inner">
        <div className="admin-box">
          <ReportGenerator filtros={filtros} setFiltros={setFiltros} data={filteredData} resumen={resumen} />
        </div>

        <div className="admin-box">
          <ParticipantsTable data={participants} loading={loading} />
        </div>

        <div className="admin-grid">
          <div className="admin-box">
            <h2 className="admin-section-title">Resumen por Área</h2>
            {loading ? (
              <p className="loading-message">Cargando datos del resumen...</p>
            ) : resumen.resumen_por_area.length > 0 ? (
              <SummarySection
                items={resumen.resumen_por_area.map(item => ({
                  key: item.area_id || item.area || Math.random(),
                  name: item.area,
                  count: item.total_participantes,
                  label: 'Participante(s)'
                }))}
              />
            ) : (
              <p className="no-data">No hay areas encontradas.</p> 
            )}
          </div>

          <div className="admin-box">
            <h2 className="admin-section-title">Estado de Pagos</h2>
            {loading ? (
              <p className="loading-message">Cargando estado de pagos...</p>
            ) : resumen.estado_pagos.total_recaudado > 0 || resumen.estado_pagos.total_pendiente > 0 || resumen.estado_pagos.porcentaje_verificado > 0 ? (
              <>
                <div className="payment-row">
                  <span>Total Recaudado</span>
                  <span className="payment-value">Bs. {resumen.estado_pagos.total_recaudado}</span>
                </div>
                <div className="payment-row">
                  <span>Pagos Pendientes</span>
                  <span className="payment-value">Bs. {resumen.estado_pagos.total_pendiente}</span>
                </div>
                <div className="payment-row">
                  <span>Pagos Verificados</span>
                  <span className="payment-value success">{resumen.estado_pagos.porcentaje_verificado}%</span>
                </div>
              </>
            ) : (
              <p className="no-data">No hay pagos realizados.</p>  
            )}
          </div>
        </div>
      </div>
      <LoadingModal isOpen={isInitialLoading} />
    </div>
  );
};

export default ReportPanel;