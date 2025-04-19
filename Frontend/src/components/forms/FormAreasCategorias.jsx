import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormAreasCategorias = ({
  areasDisponibles,
  areasSeleccionadas,
  setAreasSeleccionadas,
  categoriasFiltradas,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categoriasDisponibles,
}) => {
  const handleAreaChange = (e) => {
    const valor = e.target.value;
    if (valor) {
      setAreasSeleccionadas([valor]); // solo se permite una por ahora
      setCategoriaSeleccionada(""); // resetear categoría
    }
    e.target.value = "";
  };

  return (
    <>
      <h2>Selección de Áreas</h2>
      <div className="alerta">
        Puedes inscribirte en múltiples áreas. El costo se calculará en base a
        tu selección.
      </div>
      <div className="fila-categorias">
        <div className="campo">
          <label>
            Áreas de Competencia <span className="asterisco rojo">*</span>
          </label>
          <select name="area" onChange={handleAreaChange} defaultValue="">
            <option value="" disabled>
              Selecciona un área
            </option>
            {areasDisponibles
              .filter((area) => !areasSeleccionadas.includes(area.nombre))
              .map((area) => (
                <option key={area.id} value={area.nombre}>
                  {area.nombre}
                </option>
              ))}
          </select>

          {areasSeleccionadas.length > 0 && (
            <div className="etiquetas-contenedor">
              {areasSeleccionadas.map((area) => (
                <span className="etiqueta-area" key={area}>
                  {area}
                  <button
                    type="button"
                    onClick={() =>
                      setAreasSeleccionadas(
                        areasSeleccionadas.filter((a) => a !== area)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="campo">
          <label>
            Nivel/Categoría <span className="asterisco rojo">*</span>
          </label>
          <select
            name="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categoriasFiltradas.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} - {cat.grade_name} ({cat.grade_min}° a{" "}
                {cat.grade_max}°)
              </option>
            ))}
          </select>

          {categoriaSeleccionada && (
            <div className="etiquetas-contenedor">
              <span className="etiqueta-area">
                {categoriasDisponibles.find(
                  (cat) => cat.id === parseInt(categoriaSeleccionada)
                )?.name || "Categoría"}
                <button
                  type="button"
                  onClick={() => setCategoriaSeleccionada("")}
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormAreasCategorias;
