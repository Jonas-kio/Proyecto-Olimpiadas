import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormResumen = ({
  estudiante,
  tutores,
  areasSeleccionadas,
  categoriaElegida,
}) => {
  const precioPorArea = 50;
  const total = areasSeleccionadas.length * precioPorArea;

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
              <p>{idx === 0 ? "Tutor Principal" : `Tutor ${idx + 1}`}</p>
              <p>
                <span className="etiqueta">Nombre completo:</span>{" "}
                <span className="valor">
                  {" "}
                  {tutor.nombres} {tutor.apellidos}
                </span>
              </p>
              <p>
                <span className="etiqueta">Contacto:</span>{" "}
                <span>
                  {tutor.correo_electronico} / {tutor.telefono}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección: Áreas de Competencia */}
      <div className="seccion">
        <h3>Áreas de Competencia</h3>
        <ul className="areas-lista">
          {areasSeleccionadas.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      {/* Sección: Categoría */}
      <div className="seccion">
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
          <span className="valor">No seleccionada</span>
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
        {areasSeleccionadas.map((area, i) => (
          <div className="fila-resumen" key={i}>
            <span className="etiqueta">{area}:</span>
            <span className="valor">Bs. {precioPorArea}</span>
          </div>
        ))}
        <div className="fila-resumen total">
          <span className="etiqueta">Total:</span>
          <span className="valor">Bs. {total}</span>
        </div>
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
