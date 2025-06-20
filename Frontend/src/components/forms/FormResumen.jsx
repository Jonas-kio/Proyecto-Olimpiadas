/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

import "../../styles/components/InscripcionIndividual.css";

const FormResumen = ({
  estudiante,
  tutores,
  areasSeleccionadas,
  categoriasElegidas,
  costos,
}) => {

  const [costosResumen, setCostosResumen] = useState(null);


  useEffect(() => {
    if (costos) {
      setCostosResumen(costos);
    } else {
      console.warn("No se proporcionaron costos para el resumen.");
      const costosGuardados = localStorage.getItem("costosResumen");
      if (costosGuardados) {
        setCostosResumen(JSON.parse(costosGuardados));
      }
    }
  }, [costos]);

  const obtenerDesgloseCostos = () => {
    if (!costosResumen) return [];

    if (costosResumen.desglose_costos && costosResumen.desglose_costos.length > 0) {
      return costosResumen.desglose_costos;
    }

    if (costosResumen.desglose_combinaciones && costosResumen.desglose_combinaciones.length > 0) {
      return costosResumen.desglose_combinaciones;
    }

    return [];
  };

  return (
    <div className="formulario confirmacion">
      <h2 className="titulo-confirmacion">Confirmación de Inscripción</h2>
      <p className="subtitulo-confirmacion">
        Por favor revise la información ingresada antes de confirmar su
        inscripción.
      </p>

      {/* Sección: Datos Personales */}
      <div className="seccion">
        <h3>Datos Personales</h3>
        <div className="fila-resumen">
          <span className="etiqueta">Nombre completo:</span>
          <span className="valor">
            {estudiante.nombres} {estudiante.apellidos}
          </span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Documento:</span>
          <span className="valor">CI: {estudiante.documento_identidad}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Fecha de nacimiento:</span>
          <span className="valor">{estudiante.fecha_nacimiento}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Contacto:</span>
          <span className="valor">{estudiante.correo_electronico}</span>
        </div>
      </div>

      {/* Sección: Tutores */}

      <div className="seccion">
        <h3>Datos del Tutor</h3>
        {tutores.map((tutor, idx) => (
          <div className="fila-resumen" key={idx}>
            <div className="subseccion-tutor">
              <h4 className="subtitulo-tutor">
                {idx === 0 ? "Tutor Principal" : `Tutor ${idx + 1}`}
              </h4>
              <div>
                <span className="etiqueta">Nombre completo:</span>{" "}
                <span className="valor">
                  {tutor.nombres} {tutor.apellidos}
                </span>
              </div>
              <div>
                <span className="etiqueta">Contacto:</span>{" "}
                <span>
                  {tutor.correo_electronico} / {tutor.telefono}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección: Áreas de Competencia */}
      <div className="seccion">
        <h3>Áreas de Competencia</h3>
        <ul className="areas-lista">
          {areasSeleccionadas.map((area, index) => (
            <li key={index}>{typeof area === "object" ? area.nombre : area}</li>
          ))}
        </ul>
      </div>

      {/* Sección: Categoría */}
      <div className="seccion">
        <h3>Categorías Seleccionadas</h3>
        {categoriasElegidas.length > 0 ? (
          <ul className="areas-lista">
            {categoriasElegidas.map((cat, index) => (
              <li key={index}>
                {cat.name} - {cat.grade_name} ({cat.grade_min}
                {cat.grade_max ? ` a ${cat.grade_max}` : ""})
              </li>
            ))}
          </ul>
        ) : (
          <span className="valor">No se seleccionaron categorías</span>
        )}
      </div>

      {/* Sección: Institución */}
      <div className="seccion">
        <h3>Información Institucional</h3>
        <div className="fila-resumen">
          <span className="etiqueta">Institución:</span>
          <span className="valor">{estudiante.colegio}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Ciudad:</span>
          <span className="valor">{estudiante.provincia}</span>
        </div>
      </div>

      {/* Sección: Costos */}
      <div className="seccion">
        <h3>Costo de Inscripción</h3>
        {costosResumen ? (
          <>
            <div className="fila-resumen">
              <span className="etiqueta">Cantidad de Competidores:</span>
              <span className="valor">
                {costosResumen.cantidad_competidores || 1}
              </span>
            </div>

            {obtenerDesgloseCostos().length > 0 && (
              <div className="desglose-costos">
                <div className="fila-resumen">
                  <span className="etiqueta">Desglose por área:</span>
                </div>

                {obtenerDesgloseCostos().map((item, index) => (
                  <div className="fila-resumen" key={index}>
                    <span className="etiqueta indentado">
                      {item.area.nombre} - {item.nivel.nombre}:
                    </span>
                    <span className="valor">
                      Bs. {item.costo_unitario_formateado}
                    </span>
                    <span className="valor">
                      Subtotal: Bs. {item.subtotal_formateado}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="fila-resumen total">
              <span className="etiqueta">Total:</span>
              <span className="valor">
                Bs. {costosResumen.monto_total_formateado || "0.00"}
              </span>
            </div>
          </>
        ) : (
          <p>Cargando resumen de costos...</p>
        )}
      </div>

      {/* Aceptar términos */}
      <div className="terminos" style={{ marginTop: "20px" }}>
        <label>
          <input type="checkbox" required />
          Acepto los términos y condiciones de la Olimpiada Oh! SanSi
        </label>
      </div>
    </div>
  );
};

export default FormResumen;