import PropTypes from "prop-types";
import { useState } from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormResumenGrupal = ({ tutores, competidores, asignacionesAreasYCategorias }) => {
  const [confirmado, setConfirmado] = useState(false);

  const costoUnitario = 50; // Bs 50 por competidor
  const costoTotal = competidores.length * costoUnitario;

  return (
    <div className="formulario confirmacion">
      <h2 className="titulo-confirmacion">Confirmación de Inscripción Grupal</h2>
      <p className="subtitulo-confirmacion">
        Por favor revise la información ingresada antes de confirmar la inscripción grupal.
      </p>

      {/* Sección: Información General */}
      <div className="seccion">
        <h3>Información General</h3>
        <div className="fila-resumen">
          <span className="etiqueta">Tipo de Inscripción:</span>
          <span className="valor">Grupal</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Total de Competidores:</span>
          <span className="valor highlight">{competidores.length}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Total de Tutores:</span>
          <span className="valor">{tutores.length}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Fecha de Registro:</span>
          <span className="valor">{new Date().toLocaleDateString('es-BO')}</span>
        </div>
      </div>

      {/* Sección: Tutores */}
      {tutores && tutores.length > 0 && (
        <div className="seccion">
          <h3>Datos de los Tutores ({tutores.length})</h3>
          {tutores.map((tutor, index) => (
            <div className="fila-resumen" key={index}>
              <div className="subseccion-tutor">
                <h4 className="subtitulo-tutor">
                  {index === 0 ? "Tutor Principal" : `Tutor Adicional ${index}`}
                </h4>
                <div>
                  <span className="etiqueta">Nombre completo:</span>{" "}
                  <span className="valor">
                    {tutor.nombres} {tutor.apellidos}
                  </span>
                </div>
                <div>
                  <span className="etiqueta">Contacto:</span>{" "}
                  <span className="valor">
                    {tutor.correo_electronico} / {tutor.telefono}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección: Competidores */}
      {competidores && competidores.length > 0 && (
        <div className="seccion">
          <h3>Competidores Registrados ({competidores.length})</h3>
          <div className="tabla-competidores">
            {competidores.map((competidor, index) => (
              <div key={index} className="competidor-item">
                <div className="competidor-numero">#{index + 1}</div>
                <div className="competidor-info">
                  <div className="fila-resumen">
                    <span className="etiqueta">Nombre completo:</span>
                    <span className="valor">{competidor.nombres} {competidor.apellidos}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Documento:</span>
                    <span className="valor">CI: {competidor.documento_identidad}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Colegio:</span>
                    <span className="valor">{competidor.colegio}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Curso:</span>
                    <span className="valor">{competidor.curso}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Provincia:</span>
                    <span className="valor">{competidor.provincia}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Contacto:</span>
                    <span className="valor">{competidor.correo_electronico}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección: Áreas de Competencia */}
      {asignacionesAreasYCategorias && asignacionesAreasYCategorias.length > 0 && (
        <div className="seccion">
          <h3>Distribución por Áreas de Competencia</h3>
          <div className="areas-asignadas">
            {asignacionesAreasYCategorias.map((asignacion, index) => {
              const competidor = competidores[index];
              if (!competidor) return null;
              
              return (
                <div key={index} className="fila-resumen">
                  <span className="etiqueta">
                    {competidor.nombres} {competidor.apellidos}:
                  </span>
                  <span className="valor">
                    {asignacion.areaSeleccionada?.nombre || `Área ${asignacion.areaId}`} - 
                    {asignacion.categoriaSeleccionada?.name || `Categoría ${asignacion.categoriaId}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección: Costos */}
      <div className="seccion">
        <h3>Costo de Inscripción</h3>
        <div className="fila-resumen">
          <span className="etiqueta">Cantidad de Competidores:</span>
          <span className="valor">{competidores.length}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Costo por Competidor:</span>
          <span className="valor">Bs. {costoUnitario.toFixed(2)}</span>
        </div>
        <div className="fila-resumen total">
          <span className="etiqueta">Total a Pagar:</span>
          <span className="valor">Bs. {costoTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Información Importante */}
      <div className="seccion">
        <h3>Información Importante</h3>
        <ul className="areas-lista">
          <li>Una vez generada la boleta, no se podrán realizar cambios en la inscripción</li>
          <li>Deberá realizar el pago correspondiente para completar la inscripción</li>
          <li>Mantenga el código de boleta para futuras consultas</li>
          <li>Recibirá un correo electrónico con los detalles de la boleta</li>
        </ul>
      </div>      {/* Aceptar términos */}
      <div className="terminos" style={{ marginTop: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            required
          />
          Confirmo que toda la información es correcta y acepto los términos y condiciones de la Olimpiada Oh! SanSi
        </label>
      </div>
    </div>
  );
};

FormResumenGrupal.propTypes = {
  tutores: PropTypes.arrayOf(PropTypes.shape({
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    correo_electronico: PropTypes.string.isRequired,
    telefono: PropTypes.string.isRequired
  })).isRequired,
  competidores: PropTypes.arrayOf(PropTypes.shape({
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    documento_identidad: PropTypes.string.isRequired,
    colegio: PropTypes.string.isRequired,
    curso: PropTypes.string.isRequired,
    provincia: PropTypes.string
  })).isRequired,
  asignacionesAreasYCategorias: PropTypes.arrayOf(PropTypes.shape({
    areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        categoriaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    areaSeleccionada: PropTypes.object,
    categoriaSeleccionada: PropTypes.object
  })).isRequired
};

export default FormResumenGrupal;
