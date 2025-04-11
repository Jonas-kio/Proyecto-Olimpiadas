import React, { useState, useEffect } from "react";
// import "./styles/InscripcionIndividual.css";
import "../../styles/components/InscripcionIndividual.css";
import { useNavigate } from "react-router-dom";
import {
  inscripcionCompetidor,
  inscripcionTutor,
  inscripcionArea,
} from "../../services/apiInscripcion";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

const InscripcionIndividual = () => {
  const navigate = useNavigate();
  //
  //
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Datos del estudiante
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

    // ✅ FILTRAR tutores que tengan al menos un campo lleno
    const tutoresFormulario = tutores.filter(
      (tutor) =>
        tutor.nombres ||
        tutor.apellidos ||
        tutor.correo_electronico ||
        tutor.telefono
    );

    try {
      // Enviar estudiante
      const respuestaEstudiante = await inscripcionCompetidor(formulario);
      console.log(
        "Inscripción del estudiante exitosa",
        respuestaEstudiante.data
      );
      console.log("Tutores que se van a registrar:", tutoresFormulario);

      // Enviar tutores uno por uno
      for (const tutor of tutoresFormulario) {
        const respuesta = await inscripcionTutor(tutor);
        console.log("Tutor registrado:", respuesta.data);
      }

      setModalAbierto(true);
    } catch (error) {
      const mensajeErrorBase =
        error.response?.data?.message ||
        "Error al guardar los datos. Por favor, verifique los campos.";

      console.error(
        "Error al inscribir:",
        error.response?.data || error.message
      );

      const camposErrores = error.response?.data?.errors;
      if (camposErrores) {
        const campos = Object.keys(camposErrores);
        setCamposConError(campos);

        // Detectar campos duplicados
        if (
          campos.includes("documento_identidad") ||
          campos.includes("correo_electronico")
        ) {
          setMensajeDeError(
            "Ya existe un competidor registrado con ese documento o correo."
          );
        } else {
          setMensajeDeError(mensajeErrorBase);
        }
      } else {
        setCamposConError([]);
        setMensajeDeError(mensajeErrorBase);
      }

      setErrorModalAbierto(true);
    }
  };
  //
  //
  // const confirmarInscripcion = (e) => {
  //   // e.preventDefault();
  //   // onSubmit = { handleSubmit };
  //   // alert("Inscripción exitosa");
  //   navigate("/Inscripcion");
  // };

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
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  ]);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [errores, setErrores] = useState({});
  //MODALS
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModalAbierto, setErrorModalAbierto] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [camposConError, setCamposConError] = useState([]);
  //<MODAL
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await inscripcionArea(); // llamamos al backend
        const data = response.data?.data || []; // ajustamos según formato de respuesta
        setAreasDisponibles(data);
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };

    fetchAreas();
  }, []);
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
  const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const telefonoValido = (telefono) => /^\d+$/.test(telefono);
  const documentoValido = (doc) => /^\d+$/.test(doc);

  const camposEstudianteCompletos = () => {
    const todosLlenos = Object.values(estudiante).every((valor) =>
      valor.trim()
    );
    const correoOK = correoValido(estudiante.correo_electronico);
    const documentoOK = documentoValido(estudiante.documento_identidad);
    return todosLlenos && correoOK && documentoOK;
  };

  const camposTutorPrincipalCompletos = () => {
    const tutor = tutores[0];
    return (
      tutor.nombres.trim() &&
      tutor.apellidos.trim() &&
      tutor.telefono.trim() &&
      correoValido(tutor.correo_electronico) &&
      telefonoValido(tutor.telefono)
    );
  };

  const camposAreasCompletos = () => areasSeleccionadas.length > 0;
  const puedeAvanzar = () => {
    if (paso === 1) return camposEstudianteCompletos();
    if (paso === 2) return camposTutorPrincipalCompletos();
    if (paso === 3) return camposAreasCompletos();
    return true;
  };
  return (
    <div className="inscripcion-container">
      <div className="formulario-wrapper">
        <h1>Inscripción Individual</h1>
        <p>
          Complete el formulario para inscribirse en las Olimpiadas Oh! SanSi
        </p>

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
                      errores.documento_identidad
                        ? "Ingrese su numero de carnet"
                        : "Ej. 12345678"
                    }
                    value={estudiante.documento_identidad}
                    onChange={handleEstudianteChange}
                    className={errores.documento_identidad ? "error" : ""}
                  />
                  {!documentoValido(estudiante.documento_identidad) &&
                    estudiante.documento_identidad && (
                      <span className="mensaje-error">
                        El documento debe contener solo números
                      </span>
                    )}
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
                    Fecha de Nacimiento{" "}
                    <span className="asterisco rojo">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={estudiante.fecha_nacimiento}
                    onChange={handleEstudianteChange}
                    className={errores.fecha_nacimiento ? "error" : ""}
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
                    <option value="1ro Primaria">1ro Primaria</option>
                    <option value="2do Primaria">2do Primaria</option>
                    <option value="3ro Primaria">3ro Primaria</option>
                    <option value="4to Primaria">4to Primaria</option>
                    <option value="5to Primaria">5to Primaria</option>
                    <option value="6to Primaria">6to Primaria</option>
                    {/* -   */}
                    <option value="1ro Secundaria">1ro Secundaria</option>
                    <option value="2do Secundaria">2do Secundaria</option>
                    <option value="3ro Secundaria">3ro Secundaria</option>
                    <option value="4to Secundaria">4to Secundaria</option>
                    <option value="5to Secundaria">5to Secundaria</option>
                    <option value="6to Secundaria">6to Secundaria</option>
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
              </div>

              <div className="campo">
                <label>
                  Colegio <span className="asterisco rojo">*</span>
                </label>
                <input
                  type="text"
                  name="colegio"
                  placeholder={
                    errores.colegio
                      ? "Ingrese su colegio"
                      : "Ingrese su colegio"
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
                      Correo Electrónico{" "}
                      <span className="asterisco rojo">*</span>
                    </label>
                    <input
                      type="email"
                      name="correo_electronico"
                      placeholder="Correo Electrónico"
                      value={tutores[0].correo_electronico}
                      onChange={(e) => handleTutorChange(e, 0)}
                      className={
                        errores[`t0-correo_electronico`] ? "error" : ""
                      }
                    />
                    {!correoValido(tutores[0].correo_electronico) &&
                      tutores[0].correo_electronico && (
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
                      value={tutores[0].telefono}
                      onChange={(e) => handleTutorChange(e, 0)}
                      className={errores[`t0-telefono`] ? "error" : ""}
                    />
                    {!telefonoValido(tutores[0].telefono) &&
                      tutores[0].telefono && (
                        <span className="mensaje-error">
                          El telefono debe contener solo numeros
                        </span>
                      )}
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
                      name="correo_electronico"
                      placeholder="Correo Electrónico"
                      value={tutores[1].correo_electronico}
                      onChange={(e) => handleTutorChange(e, 1)}
                    />
                    {!correoValido(tutores[1].correo_electronico) &&
                      tutores[1].correo_electronico && (
                        <span className="mensaje-error">
                          El correo electrónico no es válido
                        </span>
                      )}
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
                    {!telefonoValido(tutores[1].telefono) &&
                      tutores[1].telefono && (
                        <span className="mensaje-error">
                          El telefono debe contener solo numeros
                        </span>
                      )}
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
                      name="correo_electronico"
                      placeholder="Correo Electrónico"
                      value={tutores[2].correo_electronico}
                      onChange={(e) => handleTutorChange(e, 2)}
                    />

                    {!correoValido(tutores[2].correo_electronico) &&
                      tutores[2].correo_electronico && (
                        <span className="mensaje-error">
                          El correo electrónico no es válido
                        </span>
                      )}
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
                    {!telefonoValido(tutores[2].telefono) &&
                      tutores[2].telefono && (
                        <span className="mensaje-error">
                          El telefono debe contener solo numeros
                        </span>
                      )}
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
                  name="area"
                  // onChange={(e) => {
                  //   const valor = e.target.value;
                  //   if (valor && !areasSeleccionadas.includes(valor)) {
                  //     setAreasSeleccionadas([...areasSeleccionadas, valor]);
                  //   }
                  //   e.target.value = "";
                  // }}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor) {
                      setAreasSeleccionadas([valor]);
                    }
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
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
            <div className="resumen-inscripcion">
              <h2 className="titulo-confirmacion">
                Confirmación de Inscripción
              </h2>
              <p className="subtitulo-confirmacion">
                Por favor revise la información ingresada antes de confirmar su
                inscripción.
              </p>

              {/* DATOS PERSONALES SIMULADO PARA LA BOLETA*/}
              <p>DATOS SIMULADOS </p>
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
                  <span className="valor">
                    CI: {estudiante.documento_identidad}
                  </span>
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

              {/* DATOS DEL TUTOR */}
              <div className="bloque-resumen">
                <h3>Datos del Tutor</h3>
                <div className="fila-resumen">
                  <span className="etiqueta">Nombre completo:</span>
                  <span className="valor">
                    {tutores[0].nombres} {tutores[0].apellidos}
                  </span>
                </div>
                <div className="fila-resumen">
                  <span className="etiqueta">Contacto:</span>
                  <span className="valor">
                    {tutores[0].correo_electronico} / {tutores[0].telefono}
                  </span>
                </div>
              </div>

              {/* ÁREAS DE COMPETENCIA */}
              <div className="bloque-resumen">
                <h3>Áreas de Competencia</h3>
                {areasSeleccionadas.map((area, i) => (
                  <div className="fila-resumen" key={i}>
                    <span className="etiqueta">Área {i + 1}:</span>
                    <span className="valor">{area}</span>
                  </div>
                ))}
              </div>

              {/* INFORMACIÓN INSTITUCIONAL */}
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

              {/* COSTO DE INSCRIPCIÓN (simulado: Bs. 50 por área) */}
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
                  <span className="valor">
                    Bs. {areasSeleccionadas.length * 50}
                  </span>
                </div>
              </div>

              <div className="campo checkbox" style={{ marginTop: "20px" }}>
                <label>
                  <input type="checkbox" required /> Acepto los términos y
                  condiciones de la Olimpiada Oh! SanSi
                </label>
              </div>
            </div>
          )}

          <div className="botones">
            {paso > 1 && (
              <button type="button" onClick={anterior}>
                Anterior
              </button>
            )}
            {paso < 4 ? (
              <button
                type="button"
                onClick={siguiente}
                disabled={!puedeAvanzar()}
                style={
                  !puedeAvanzar() ? { opacity: 0.5, cursor: "not-allowed" } : {}
                }
              >
                Siguiente
              </button>
            ) : (
              <button type="submit">Confirmar y Generar Boleta</button>
            )}
          </div>
        </form>
      </div>
      {/* Mensajes de Exito y modal */}
      <SuccessModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          navigate("/Inscripcion");
        }}
        tittleMessage="¡Inscripción Exitosa!"
        successMessage="Tu inscripción se ha completado correctamente."
        detailMessage="Gracias por participar en la Olimpiada Oh! SanSi."
      />
      <ErrorModal
        isOpen={errorModalAbierto}
        onClose={() => setErrorModalAbierto(false)}
        errorMessage={mensajeDeError}
        errorFields={camposConError}
      />
    </div>
  );
};

export default InscripcionIndividual;
