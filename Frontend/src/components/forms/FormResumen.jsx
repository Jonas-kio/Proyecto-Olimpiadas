import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormResumen = ({
  estudiante,
  tutores,
  areasSeleccionadas,
  categoriaElegida,
}) => {
  return (
    <div className="resumen-inscripcion">
      <h2 className="titulo-confirmacion">Confirmación de Inscripción</h2>
      <p className="subtitulo-confirmacion">
        Por favor revise la información ingresada antes de confirmar su
        inscripción.
      </p>

      {/* Datos personales */}
      <div className="bloque-resumen">
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

      {/* Datos del tutor */}
      <div className="bloque-resumen">
        <h3>Datos del Tutor</h3>
        {tutores.map((tutor, idx) => (
          <div key={idx} className="sub-bloque-tutor">
            <div className="fila-resumen">
              <span className="etiqueta">
                {idx === 0 ? "Tutor Principal:" : `Tutor ${idx + 1}:`}
              </span>
              <span className="valor">
                {tutor.nombres} {tutor.apellidos}
              </span>
            </div>
            <div className="fila-resumen">
              <span className="etiqueta">Contacto:</span>
              <span className="valor">
                {tutor.correo_electronico} / {tutor.telefono}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Áreas seleccionadas */}
      <div className="bloque-resumen">
        <h3>Áreas de Competencia</h3>
        {areasSeleccionadas.map((area, i) => (
          <div className="fila-resumen" key={i}>
            <span className="etiqueta">Área {i + 1}:</span>
            <span className="valor">{area}</span>
          </div>
        ))}
      </div>

      {/* Categoría */}
      <div className="bloque-resumen">
        <h3>Categoría Seleccionada</h3>
        {categoriaElegida ? (
          <>
            <div className="fila-resumen">
              <span className="etiqueta">Nombre:</span>
              <span className="valor">{categoriaElegida.name}</span>
            </div>
            <div className="fila-resumen">
              <span className="etiqueta">Grado:</span>
              <span className="valor">
                {categoriaElegida.grade_name} ({categoriaElegida.grade_min}° a{" "}
                {categoriaElegida.grade_max}°)
              </span>
            </div>
          </>
        ) : (
          <div className="fila-resumen">
            <span className="valor">No seleccionada</span>
          </div>
        )}
      </div>

      {/* Institución */}
      <div className="bloque-resumen">
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

      {/* Costo de inscripción */}
      <div className="bloque-resumen">
        <h3>Costo de Inscripción</h3>
        {areasSeleccionadas.map((area, i) => (
          <div className="fila-resumen" key={i}>
            <span className="etiqueta">{area}:</span>
            <span className="valor">Bs. 50</span>
          </div>
        ))}
        <div className="fila-resumen" style={{ fontWeight: "bold" }}>
          <span className="etiqueta">Total:</span>
          <span className="valor">Bs. {areasSeleccionadas.length * 50}</span>
        </div>
      </div>

      <div className="campo checkbox" style={{ marginTop: "20px" }}>
        <label>
          <input type="checkbox" required /> Acepto los términos y condiciones
          de la Olimpiada Oh! SanSi
        </label>
      </div>
    </div>
  );
};

export default FormResumen;
