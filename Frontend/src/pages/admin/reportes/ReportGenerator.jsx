import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";
import ExportDropdown from "./ExportDropdown";
import { getAllAreas } from "../../../services/areasService";
import { getLevels } from "../../../services/nivelesService"; 
import "../../../styles/reportes/ReportGenerator.css";

const ReportGenerator = ({ data, onFilter }) => {
  const [areas, setAreas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [nivelesFiltrados, setNivelesFiltrados] = useState([]);

  const [selectedArea, setSelectedArea] = useState("Todos");
  const [selectedNivel, setSelectedNivel] = useState("Todos los niveles");
  const [selectedEstado, setSelectedEstado] = useState("Todos los estados");

  const [filteredData, setFilteredData] = useState([]);

  // Cargar áreas y niveles desde la base de datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [areasFromDB, nivelesFromDB] = await Promise.all([
          getAllAreas(),
          getLevels()
        ]);
        setAreas(areasFromDB);
        setNiveles(nivelesFromDB);
      } catch (error) {
        console.error("Error al cargar áreas o niveles:", error);
      }
    };

    cargarDatos();
  }, []);

  // Filtrar niveles según área seleccionada
  useEffect(() => {
    if (selectedArea === "Todos") {
      setNivelesFiltrados([]);
    } else {
      const filtrados = niveles.filter(
        (nivel) => nivel.area?.name === selectedArea
      );
      setNivelesFiltrados(filtrados);
    }
  }, [selectedArea, niveles]);

  // Aplicar filtros a los datos
  useEffect(() => {
    let resultados = [...data];

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
      onFilter(resultados);
    }
  }, [selectedArea, selectedNivel, selectedEstado, data]);

  return (
    <div>
      <h2 className="report-title">Generar Reporte</h2>

      <div className="report-grid">
        {/* Select Área */}
        <div>
          <label className="report-label">Área</label>
          <div className="select-wrapper">
            <select
              className="report-select"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedNivel("Todos los niveles"); // reiniciar nivel al cambiar área
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

        {/* Select Nivel */}
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
                  {nivel.name} {/*({nivel.gradeMin}° a {nivel.gradeMax}°) */}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="select-icon" />
          </div>
        </div>

        {/* Select Estado */}
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
