import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormEstudiantes = ({
  estudiante,
  handleEstudianteChange,
  errores,
  textoValido,
  documentoValido,
  fechaNacimientoValida,
  correoValido,
}) => {
  return (
    <>
      <h2>Datos Personales</h2>
      <div className="fila">
        <div className="campo">
          <label>
            Nombres <span className="asterisco rojo">*</span>
          </label>
          <input
            type="text"
            name="nombres"
            placeholder={
              errores.nombres ? "Ingrese sus nombres" : "Ingrese sus nombres"
            }
            value={estudiante.nombres}
            onChange={handleEstudianteChange}
            className={errores.nombres ? "error" : ""}
          />
          <div className="char-counter">
            {!textoValido(estudiante.nombres) && (
              <span className="mensaje-error">Solo se permiten letras</span>
            )}
            {estudiante.nombres.length === 50 && (
              <span className="mensaje-error">
                Límite de caracteres alcanzado
              </span>
            )}
          </div>
        </div>
        <div className="campo">
          <label>
            Apellidos <span className="asterisco rojo">*</span>
          </label>
          <input
            type="text"
            name="apellidos"
            placeholder={
              errores.apellidos
                ? "Ingrese sus apellidos"
                : "Ingrese sus apellidos"
            }
            value={estudiante.apellidos}
            onChange={handleEstudianteChange}
            className={errores.apellidos ? "error" : ""}
          />
          <div className="char-counter">
            {!textoValido(estudiante.apellidos) && (
              <span className="mensaje-error">Solo se permiten letras</span>
            )}
            {estudiante.apellidos.length === 50 && (
              <span className="mensaje-error">
                Límite de caracteres alcanzado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>
            Número de Documento de Identidad
            <span className="asterisco rojo">*</span>
          </label>
          <input
            type="text"
            name="documento_identidad"
            placeholder={
              errores.documento_identidad
                ? "Ingrese su numero de carnet"
                : "Ej. 12345678"
            }
            value={estudiante.documento_identidad}
            onChange={handleEstudianteChange}
            className={errores.documento_identidad ? "error" : ""}
          />
          <div className="char-counter">
            {!documentoValido(estudiante.documento_identidad) &&
              estudiante.documento_identidad && (
                <span className="mensaje-error">Solo se permiten números</span>
              )}
            {estudiante.documento_identidad.length === 10 && (
              <span className="mensaje-error">
                Límite de 10 caracteres alcanzado
              </span>
            )}
          </div>
        </div>
        <div className="campo">
          <label>
            Provincia <span className="asterisco rojo">*</span>
          </label>
          <input
            type="text"
            name="provincia"
            placeholder={errores.provincia ? "Ej. Cercado" : "Ej. Cercado"}
            value={estudiante.provincia}
            onChange={handleEstudianteChange}
            className={errores.provincia ? "error" : ""}
          />
          {estudiante.provincia.length === 100 && (
            <span className="mensaje-error">
              Límite de caracteres alcanzado
            </span>
          )}
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label>
            Fecha de Nacimiento <span className="asterisco rojo">*</span>
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={estudiante.fecha_nacimiento}
            onChange={handleEstudianteChange}
            className={errores.fecha_nacimiento ? "error" : ""}
          />
          {!fechaNacimientoValida(estudiante.fecha_nacimiento) &&
            estudiante.fecha_nacimiento && (
              <span className="mensaje-error">
                La fecha no puede ser futura
              </span>
            )}
        </div>
        <div className="campo">
          <label>
            Curso <span className="asterisco rojo">*</span>
          </label>
          <select
            name="curso"
            value={estudiante.curso}
            onChange={handleEstudianteChange}
            className={errores.curso ? "error" : ""}
          >
            <option value="">Seleccione un curso</option>
            {[
              "1ro Primaria",
              "2do Primaria",
              "3ro Primaria",
              "4to Primaria",
              "5to Primaria",
              "6to Primaria",
              "1ro Secundaria",
              "2do Secundaria",
              "3ro Secundaria",
              "4to Secundaria",
              "5to Secundaria",
              "6to Secundaria",
            ].map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="campo">
        <label>
          Correo Electrónico <span className="asterisco rojo">*</span>
        </label>
        <input
          type="email"
          name="correo_electronico"
          placeholder={
            errores.correo_electronico
              ? "Ingrese su correo electronico"
              : "ejemplo@correo.com"
          }
          value={estudiante.correo_electronico}
          onChange={handleEstudianteChange}
          className={errores.correo_electronico ? "error" : ""}
        />
        {!correoValido(estudiante.correo_electronico) &&
          estudiante.correo_electronico && (
            <span className="mensaje-error" style={{ color: "red" }}>
              El correo electrónico no es válido
            </span>
          )}
        {estudiante.correo_electronico.length === 40 && (
          <span className="mensaje-error">Límite de caracteres alcanzado</span>
        )}
      </div>

      <div className="campo">
        <label>
          Colegio <span className="asterisco rojo">*</span>
        </label>
        <input
          type="text"
          name="colegio"
          placeholder={
            errores.colegio ? "Ingrese su colegio" : "Ingrese su colegio"
          }
          value={estudiante.colegio}
          onChange={handleEstudianteChange}
          className={errores.colegio ? "error" : ""}
        />
        {estudiante.colegio.length === 100 && (
          <span className="mensaje-error">Límite de caracteres alcanzado</span>
        )}
      </div>
    </>
  );
};

export default FormEstudiantes;
