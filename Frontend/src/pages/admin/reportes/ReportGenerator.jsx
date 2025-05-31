import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import ExportDropdown from "./ExportDropdown";
import { getAllAreas } from "../../../services/areasService";
import { getLevels } from "../../../services/nivelesService"; 
import { getOlimpiadas } from "../../../services/olimpiadaService";
import "../../../styles/reportes/ReportGenerator.css";

const ReportGenerator = ({ data, onFilter }) => {
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [niveles, setNiveles] = useState([]);

  const [selectedOlimpiada, setSelectedOlimpiada] = useState("Todas");
  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedNivel, setSelectedNivel] = useState("Todos los niveles");
  const [selectedEstado, setSelectedEstado] = useState("Todos los estados");
  const [nivelesFiltrados, setNivelesFiltrados] = useState([]);

  const [filteredData, setFilteredData] = useState([]);

  // Cargar Olimpiadas, Áreas y Niveles desde backend
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

  // Filtrar niveles según área seleccionada
  useEffect(() => {
    if (selectedArea === "Todos") {
      setNivelesFiltrados([]);
    } else {
      const filtrados = niveles.filter((nivel) => nivel.area?.name === selectedArea);
      setNivelesFiltrados(filtrados);
    }
  }, [selectedArea, niveles]);

  // Aplicar todos los filtros a los datos recibidos del padre
  useEffect(() => {
    let resultados = [...data];

    if (selectedOlimpiada !== "Todas") {
      resultados = resultados.filter(p => p.Olimpiada === selectedOlimpiada);
    }

    if (selectedArea !== "Todos") {
      resultados = resultados.filter(p => p.Área === selectedArea);
    }

    if (selectedNivel !== "Todos los niveles") {
      resultados = resultados.filter(p => p.Nivel === selectedNivel);
    }

    if (selectedEstado !== "Todos los estados") {
      resultados = resultados.filter(p => p.Estado === selectedEstado);
    }

    setFilteredData(resultados);
    if (onFilter) {
      onFilter(resultados);  // enviar al padre
    }
  }, [selectedOlimpiada, selectedArea, selectedNivel, selectedEstado, data]);

  return (
    <div>
      <h2 className="report-title">Generar Reporte</h2>

      <div className="report-grid">
        {/* Olimpiada */}
        <div>
          <label className="report-label">Olimpiada</label>
          <div className="select-wrapper">
            <select
              className="report-select"
              value={selectedOlimpiada}
              onChange={(e) => setSelectedOlimpiada(e.target.value)}
            >
              <option value="Todas">Todas las olimpiadas</option>
              {olimpiadas.map((ol) => (
                <option key={ol.id} value={ol.nombre}>
                  {ol.nombre}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>

        {/* Área */}
        <div>
          <label className="report-label">Área</label>
          <div className="select-wrapper">
            <select
              className="report-select"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedNivel("Todos los niveles");
              }}
            >
              <option value="Todos">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>

        {/* Nivel */}
        <div>
          <label className="report-label">Nivel</label>
          <div className="select-wrapper">
            <select
              className="report-select"
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value)}
            >
              <option>Todos los niveles</option>
              {nivelesFiltrados.map((nivel) => (
                <option key={nivel.id} value={nivel.name}>
                  {nivel.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="report-label">Estado de Pago</label>
          <div className="select-wrapper">
            <select
              className="report-select"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option>Todos los estados</option>
              <option>Pendiente</option>
              <option>Inscrito</option>
              <option>Verificado</option>
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>
      </div>

      <div className="report-footer">
        <div className="report-summary">
          Se encontraron {filteredData.length} registros con los filtros seleccionados
        </div>
        <ExportDropdown data={filteredData} />
      </div>
    </div>
  );
};

export default ReportGenerator;
