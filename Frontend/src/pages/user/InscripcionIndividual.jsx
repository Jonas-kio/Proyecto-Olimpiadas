import React, { useState } from "react";
// import "./styles/InscripcionIndividual.css";
import "../../styles/components/InscripcionIndividual.css";
import { useNavigate } from "react-router-dom";
import {
  inscripcionCompetidor,
  inscripcionTutor,
} from "../../services/apiInscripcion";

const InscripcionIndividual = () => {
  const navigate = useNavigate();
  //
  //
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Arma los datos del formulario (esto depende de tus states)
    const formulario = {
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      documento_identidad: estudiante.documento_identidad,
      provincia: estudiante.provincia,
      fecha_nacimiento: estudiante.fecha_nacimiento,
      curso: estudiante.curso,
      correo_electronico: estudiante.correo_electronico,
      colegio: estudiante.colegio,
    };

    try {
      const respuesta = await inscripcionCompetidor(formulario);
      console.log("Inscripción exitosa", respuesta.data);
      // Aquí puedes mostrar un mensaje de éxito o avanzar al siguiente paso
    } catch (error) {
      console.error(
        "Error al inscribir:",
        error.response?.data || error.message
      );
      // Aquí puedes mostrar mensajes de error del backend
    }
  };
  //
  //
  const confirmarInscripcion = (e) => {
    // e.preventDefault();
    // onSubmit = { handleSubmit };
    alert("Inscripción exitosa");
    navigate("/Inscripcion");
  };

  const [paso, setPaso] = useState(1);
  const [estudiante, setEstudiante] = useState({
    nombres: "",
    apellidos: "",
    documento_identidad: "",
    provincia: "",
    fecha_nacimiento: "",
    curso: "",
    correo_electronico: "",
    colegio: "",
  });
  const [tutores, setTutores] = useState([
    { nombres: "", apellidos: "", correo: "", telefono: "" },
    { nombres: "", apellidos: "", correo: "", telefono: "" },
    { nombres: "", apellidos: "", correo: "", telefono: "" },
  ]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [errores, setErrores] = useState({});

  const siguiente = () => {
    if (paso === 1 && !validarEstudiante()) return;
    if (paso === 2 && !validarTutorPrincipal()) return;
    setPaso((prev) => Math.min(prev + 1, 4));
  };

  const anterior = () => setPaso((prev) => Math.max(prev - 1, 1));

  const validarEstudiante = () => {
    const nuevosErrores = {};
    for (const campo in estudiante) {
      if (!estudiante[campo].trim()) {
        nuevosErrores[campo] = true;
      }
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      alert("Debe llenar todos los campos obligatorios.");
      return false;
    }
    return true;
  };

  const validarTutorPrincipal = () => {
    const nuevosErrores = {};
    const tutor = tutores[0];
    Object.entries(tutor).forEach(([key, value]) => {
      if (!value.trim()) {
        nuevosErrores[`t0-${key}`] = true;
      }
    });
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      alert("Debe llenar al menos los campos del Tutor Principal.");
      return false;
    }
    return true;
  };

  const handleEstudianteChange = (e) => {
    setEstudiante({ ...estudiante, [e.target.name]: e.target.value });
  };

  const handleTutorChange = (e, idx) => {
    const nuevos = [...tutores];
    nuevos[idx][e.target.name] = e.target.value;
    setTutores(nuevos);
  };

  const handleAreaChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setAreasSeleccionadas(options);
  };

  return (
    <div className="inscripcion-container">
      <h1>Inscripción Individual</h1>
      <p>Complete el formulario para inscribirse en las Olimpiadas Oh! SanSi</p>

      <div className="barra-pasos">
        {[
          "Datos Estudiante",
          "Datos Tutor",
          "Áreas de Competencia",
          "Confirmación",
        ].map((titulo, i) => (
          <div key={i} className={`paso ${paso === i + 1 ? "activo" : ""}`}>
            <div className="numero">{i + 1}</div>
            <span>{titulo}</span>
          </div>
        ))}
      </div>

      <form
        className="formulario"
        // onSubmit={(e) => e.preventDefault()}
        onSubmit={handleSubmit}
      >
        {paso === 1 && (
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
                    errores.nombres
                      ? "Ingrese sus nombres"
                      : "Ingrese sus nombres"
                  }
                  value={estudiante.nombres}
                  onChange={handleEstudianteChange}
                  className={errores.nombres ? "error" : ""}
                />
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
                    errores.ci ? "Ingrese su numero de carnet" : "Ej. 12345678"
                  }
                  value={estudiante.ci}
                  onChange={handleEstudianteChange}
                  className={errores.ci ? "error" : ""}
                />
              </div>
              <div className="campo">
                <label>
                  Provincia <span className="asterisco rojo">*</span>
                </label>
                <input
                  type="text"
                  name="provincia"
                  placeholder={
                    errores.provincia ? "Ej. Cercado" : "Ej. Cercado"
                  }
                  value={estudiante.provincia}
                  onChange={handleEstudianteChange}
                  className={errores.provincia ? "error" : ""}
                />
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
                  value={estudiante.nacimiento}
                  onChange={handleEstudianteChange}
                  className={errores.nacimiento ? "error" : ""}
                />
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
                  <option value="1ro A">1ro A</option>
                  <option value="1ro B">1ro B</option>
                  <option value="1ro C">1ro C</option>
                  <option value="2do A">2do A</option>
                  <option value="2do B">2do B</option>
                  <option value="2do C">2do C</option>
                  <option value="3ro A">3ro A</option>
                  <option value="3ro B">3ro B</option>
                  <option value="3ro C">3ro C</option>
                  <option value="4to A">4to A</option>
                  <option value="4to B">4to B</option>
                  <option value="4to C">4to C</option>
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
                  errores.correo
                    ? "Ingrese su correo electronico"
                    : "ejemplo@correo.com"
                }
                value={estudiante.correo}
                onChange={handleEstudianteChange}
                className={errores.correo ? "error" : ""}
              />
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
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            {/* TUTOR PRINCIPAL */}
            <div className="bloque-tutor">
              <h3>Tutor Principal</h3>
              <div className="fila">
                <div className="campo">
                  <label>
                    Nombres <span className="asterisco rojo">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    placeholder="Nombres"
                    value={tutores[0].nombres}
                    onChange={(e) => handleTutorChange(e, 0)}
                    className={errores[`t0-nombres`] ? "error" : ""}
                  />
                </div>
                <div className="campo">
                  <label>
                    Apellidos <span className="asterisco rojo">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos"
                    value={tutores[0].apellidos}
                    onChange={(e) => handleTutorChange(e, 0)}
                    className={errores[`t0-apellidos`] ? "error" : ""}
                  />
                </div>
              </div>
              <div className="fila">
                <div className="campo">
                  <label>
                    Correo Electrónico <span className="asterisco rojo">*</span>
                  </label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo Electrónico"
                    value={tutores[0].correo}
                    onChange={(e) => handleTutorChange(e, 0)}
                    className={errores[`t0-correo`] ? "error" : ""}
                  />
                </div>
                <div className="campo">
                  <label>
                    Teléfono/Celular <span className="asterisco rojo">*</span>
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono/Celular"
                    value={tutores[0].telefono}
                    onChange={(e) => handleTutorChange(e, 0)}
                    className={errores[`t0-telefono`] ? "error" : ""}
                  />
                </div>
              </div>
            </div>

            {/* TUTOR PRINCIPAL 1 */}
            <div className="bloque-tutor">
              <h3>Tutor Principal 1</h3>
              <div className="fila">
                <div className="campo">
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    placeholder="Nombres"
                    value={tutores[1].nombres}
                    onChange={(e) => handleTutorChange(e, 1)}
                  />
                </div>
                <div className="campo">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos"
                    value={tutores[1].apellidos}
                    onChange={(e) => handleTutorChange(e, 1)}
                  />
                </div>
              </div>
              <div className="fila">
                <div className="campo">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo Electrónico"
                    value={tutores[1].correo}
                    onChange={(e) => handleTutorChange(e, 1)}
                  />
                </div>
                <div className="campo">
                  <label>Teléfono/Celular</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono/Celular"
                    value={tutores[1].telefono}
                    onChange={(e) => handleTutorChange(e, 1)}
                  />
                </div>
              </div>
            </div>

            {/* TUTOR PRINCIPAL 2 */}
            <div className="bloque-tutor">
              <h3>Tutor Principal 2</h3>
              <div className="fila">
                <div className="campo">
                  <label>Nombres</label>
                  <input
                    type="text"
                    name="nombres"
                    placeholder="Nombres"
                    value={tutores[2].nombres}
                    onChange={(e) => handleTutorChange(e, 2)}
                  />
                </div>
                <div className="campo">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos"
                    value={tutores[2].apellidos}
                    onChange={(e) => handleTutorChange(e, 2)}
                  />
                </div>
              </div>
              <div className="fila">
                <div className="campo">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo Electrónico"
                    value={tutores[2].correo}
                    onChange={(e) => handleTutorChange(e, 2)}
                  />
                </div>
                <div className="campo">
                  <label>Teléfono/Celular</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono/Celular"
                    value={tutores[2].telefono}
                    onChange={(e) => handleTutorChange(e, 2)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {paso === 3 && (
          <>
            <h2>Selección de Áreas</h2>
            <div className="alerta">
              Puedes inscribirte en múltiples áreas. El costo se calculará en
              base a tu selección.
            </div>
            <div className="campo">
              <label>
                Áreas de Competencia <span className="asterisco rojo">*</span>
              </label>
              <select
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor && !areasSeleccionadas.includes(valor)) {
                    setAreasSeleccionadas([...areasSeleccionadas, valor]);
                  }
                  e.target.value = ""; // reset dropdown
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona un área
                </option>
                {["Matemáticas", "Física", "Química", "Biología"]
                  .filter((area) => !areasSeleccionadas.includes(area))
                  .map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
              </select>
            </div>

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
          </>
        )}

        {paso === 4 && (
          <>
            <h2>Confirmación de Inscripción</h2>
            <p>Revise sus datos antes de confirmar la inscripción.</p>
            <div className="campo checkbox">
              <label>
                <input type="checkbox" required /> Acepto los términos y
                condiciones de la Olimpiada Oh! SanSi
              </label>
            </div>
          </>
        )}

        <div className="botones">
          {paso > 1 && (
            <button type="button" onClick={anterior}>
              Anterior
            </button>
          )}
          {paso < 4 ? (
            <button type="button" onClick={siguiente}>
              Siguiente
            </button>
          ) : (
            <button type="submit" onClick={siguiente}>
              Confirmar y Generar Boleta
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InscripcionIndividual;
