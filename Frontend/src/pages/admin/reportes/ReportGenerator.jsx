import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import ExportDropdown from "./ExportDropdown";
import { getAllAreas } from "../../../services/areasService";
import { getLevels } from "../../../services/nivelesService";
import { getOlimpiadas } from "../../../services/olimpiadaService";
import "../../../styles/reportes/ReportGenerator.css";

const ReportGenerator = ({ filtros, setFiltros, data = [], resumen }) => {
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [nivelesFiltrados, setNivelesFiltrados] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resOlimpiadas, areasFromDB, nivelesFromDB] = await Promise.all([
          getOlimpiadas(),
          getAllAreas(),
          getLevels()
        ]);
        setOlimpiadas(resOlimpiadas.data?.data?.olimpiadas?.data || []);
        setAreas(areasFromDB);
        setNiveles(nivelesFromDB);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (filtros.area_id === "Todos") {
      setNivelesFiltrados([]);
    } else {
      const filtrados = niveles.filter((nivel) => nivel.areaId == filtros.area_id);
      setNivelesFiltrados(filtrados);
    }
  }, [filtros.area_id, niveles]);

  return (
    <div>
      <h2 className="report-title">Generar Reporte</h2>
      <div className="report-grid">
        <div>
          <label className="report-label">Olimpiada</label>
          <div className="select-wrapper">
            <select
              value={filtros.olimpiada_id}
              onChange={(e) => setFiltros({ ...filtros, olimpiada_id: e.target.value })}
              className="report-select"
            >
              <option value="Todos">Todas las olimpiadas</option>
              {olimpiadas.map((ol) => (
                <option key={ol.id} value={ol.id}>{ol.nombre}</option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>
        <div>
          <label className="report-label">Área</label>
          <div className="select-wrapper">
            <select
              value={filtros.area_id}
              onChange={(e) => setFiltros({ ...filtros, area_id: e.target.value, categoria_id: 'Todos' })}
              className="report-select"
            >
              <option value="Todos">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>
        <div>
          <label className="report-label">Nivel</label>
          <div className="select-wrapper">
            <select
              value={filtros.categoria_id}
              onChange={(e) => setFiltros({ ...filtros, categoria_id: e.target.value })}
              className="report-select"
            >
              <option value="Todos">Todos los nivles</option>
              {nivelesFiltrados.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>{nivel.name}</option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>
        <div>
          <label className="report-label">Estado</label>
          <div className="select-wrapper">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="report-select"
            >
              <option value="Todos">Todos los estados</option>
              <option value="approved">Verificado</option>
              <option value="pending">Pendiente</option>
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>
      </div>

      <div className="report-footer">
        <div className="report-summary">Se encontraron {Array.isArray(data) ? data.length : 0} registro(s) con los filtros seleccionados</div>
        <ExportDropdown data={data} resumen={resumen} />

      </div>
    </div>
  );
};

export default ReportGenerator;
