import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormTutores = ({
  tutores,
  setTutores,
  errores,
  handleTutorChange,
  textoValido,
  correoValido,
  telefonoValido,
  tutorActivo,
  setTutorActivo,
}) => {
  const agregarTutor = () => {
    setTutores([
      ...tutores,
      {
        nombres: "",
        apellidos: "",
        correo_electronico: "",
        telefono: "",
      },
    ]);
  };

  const eliminarTutor = () => {
    if (tutores.length > 1) {
      setTutores((prev) => prev.slice(0, -1));
    }
  };

  return (
    <>
      {tutores.map((tutor, idx) => (
        <div className="bloque-tutor" key={idx}>
          <h3>{idx === 0 ? "Tutor Principal" : `Tutor Adicional ${idx}`}</h3>
          <div className="fila">
            <div className="campo">
              <label>
                Nombres <span className="asterisco rojo">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                placeholder="Nombres"
                value={tutor.nombres}
                onChange={(e) => handleTutorChange(e, idx)}
                className={errores[`t${idx}-nombres`] ? "error" : ""}
                onFocus={() => setTutorActivo(idx)}
              />
              {!textoValido(tutor.nombres) &&
                tutor.nombres &&
                tutorActivo === idx && (
                  <span className="mensaje-error">Solo se permiten letras</span>
                )}
              {tutor.nombres.length === 50 && (
                <span className="mensaje-error">
                  Límite de 50 caracteres alcanzado
                </span>
              )}
            </div>

            <div className="campo">
              <label>
                Apellidos <span className="asterisco rojo">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                value={tutor.apellidos}
                onChange={(e) => handleTutorChange(e, idx)}
                className={errores[`t${idx}-apellidos`] ? "error" : ""}
                onFocus={() => setTutorActivo(idx)}
              />
              {!textoValido(tutor.apellidos) &&
                tutor.apellidos &&
                tutorActivo === idx && (
                  <span className="mensaje-error">Solo se permiten letras</span>
                )}
              {tutor.apellidos.length === 50 && (
                <span className="mensaje-error">
                  Límite de 50 caracteres alcanzado
                </span>
              )}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>
                Correo Electrónico <span className="asterisco rojo">*</span>
              </label>
              <input
                type="email"
                name="correo_electronico"
                placeholder="Correo Electrónico"
                value={tutor.correo_electronico}
                onChange={(e) => handleTutorChange(e, idx)}
                className={errores[`t${idx}-correo_electronico`] ? "error" : ""}
                onFocus={() => setTutorActivo(idx)}
              />
              {tutor.correo_electronico.length > 50 && tutorActivo === idx && (
                <span className="mensaje-error">
                  Límite de 50 caracteres alcanzado
                </span>
              )}

              {!correoValido(tutor.correo_electronico) &&
                tutor.correo_electronico &&
                tutorActivo === idx && (
                  <span className="mensaje-error">
                    El correo electrónico no es válido
                  </span>
                )}
            </div>

            <div className="campo">
              <label>
                Teléfono/Celular <span className="asterisco rojo">*</span>
              </label>
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono/Celular"
                value={tutor.telefono}
                onChange={(e) => handleTutorChange(e, idx)}
                className={errores[`t${idx}-telefono`] ? "error" : ""}
                onFocus={() => setTutorActivo(idx)}
              />
              {tutor.telefono.length > 8 && tutorActivo === idx && (
                <span className="mensaje-error">
                  Límite de 8 dígitos alcanzado
                </span>
              )}

              {!telefonoValido(tutor.telefono) &&
                tutor.telefono &&
                tutorActivo === idx && (
                  <span className="mensaje-error">
                    Solo se permiten números
                  </span>
                )}
            </div>
          </div>
        </div>
      ))}

      <div className="botones-tutores">
        <button
          type="button"
          onClick={agregarTutor}
          className="boton-agregar-tutor"
        >
          + Añadir Tutor
        </button>
        {tutores.length > 1 && (
          <button
            type="button"
            onClick={eliminarTutor}
            className="boton-eliminar-tutor"
          >
            - Eliminar Tutor
          </button>
        )}
      </div>
    </>
  );
};

export default FormTutores;
