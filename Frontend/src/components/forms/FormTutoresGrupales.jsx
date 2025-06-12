import PropTypes from "prop-types";
import "../../styles/components/InscripcionIndividual.css";

const FormTutoresGrupales = ({ tutores, setTutores }) => {
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

  const manejarCambio = (e, index) => {
    const { name, value } = e.target;
    const nuevosTutores = [...tutores];
    nuevosTutores[index][name] = value;
    setTutores(nuevosTutores);
  };

  // Funciones de validación
  const textoValido = (texto) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(texto);
  };

  const correoValido = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const telefonoValido = (telefono) => {
    return /^\d*$/.test(telefono);
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
                onChange={(e) => manejarCambio(e, idx)}
                maxLength="50"
              />
              {!textoValido(tutor.nombres) && tutor.nombres && (
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
                onChange={(e) => manejarCambio(e, idx)}
                maxLength="50"
              />
              {!textoValido(tutor.apellidos) && tutor.apellidos && (
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
                onChange={(e) => manejarCambio(e, idx)}
                maxLength="50"
              />
              {tutor.correo_electronico.length >= 50 && (
                <span className="mensaje-error">
                  Límite de caracteres alcanzado
                </span>
              )}
              {!correoValido(tutor.correo_electronico) &&
                tutor.correo_electronico && (
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
                onChange={(e) => manejarCambio(e, idx)}
                maxLength="8"
              />
              {tutor.telefono.length > 8 && (
                <span className="mensaje-error">
                  Límite de 8 dígitos alcanzado
                </span>
              )}
              {!telefonoValido(tutor.telefono) && tutor.telefono && (
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
    </>  );
};

FormTutoresGrupales.propTypes = {
  tutores: PropTypes.arrayOf(PropTypes.shape({
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    correo_electronico: PropTypes.string.isRequired,
    telefono: PropTypes.string.isRequired,
  })).isRequired,
  setTutores: PropTypes.func.isRequired,
};

export default FormTutoresGrupales;
