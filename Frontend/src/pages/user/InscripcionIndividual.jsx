import React, { useState, useEffect } from "react";
// import "./styles/InscripcionIndividual.css";
import "../../styles/components/InscripcionIndividual.css";
import { useNavigate } from "react-router-dom";
import {
  inscripcionCompetidor,
  inscripcionTutor,
  inscripcionArea,
  inscripcionCategoryLevel,
} from "../../services/apiConfig";
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
  // const [tutores, setTutores] = useState([
  //   { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  //   { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  //   { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  // ]);
  const [tutores, setTutores] = useState([
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  ]);
  const [tutorActivo, setTutorActivo] = useState(null);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [errores, setErrores] = useState({});
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

  //MODALS
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModalAbierto, setErrorModalAbierto] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [camposConError, setCamposConError] = useState([]);

  //<MODAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseAreas = await inscripcionArea();
        const responseCategorias = await inscripcionCategoryLevel();

        const dataAreas = responseAreas.data?.data || [];
        const dataCategorias = responseCategorias.data?.data || [];

        setAreasDisponibles(dataAreas);
        setCategoriasDisponibles(dataCategorias);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const categoriasRelacionadas = categoriasDisponibles.filter((cat) =>
      areasSeleccionadas.includes(cat.area?.nombre)
    );
    setCategoriasFiltradas(categoriasRelacionadas);
  }, [areasSeleccionadas, categoriasDisponibles]);

  const categoriaSeleccionadaValida = () => categoriaSeleccionada.trim() !== "";

  const siguiente = () => {
    if (paso === 1 && !validarEstudiante()) return;
    if (paso === 2 && !validarTutores()) return;
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

  const validarTutores = () => {
    const nuevosErrores = {};
    let esValido = true;

    tutores.forEach((tutor, idx) => {
      const camposLlenos = Object.values(tutor).some((valor) => valor.trim());
      const camposTodosLlenos = Object.values(tutor).every((valor) =>
        valor.trim()
      );

      if (camposLlenos && !camposTodosLlenos) {
        esValido = false;
        Object.entries(tutor).forEach(([key, value]) => {
          if (!value.trim()) {
            nuevosErrores[`t${idx}-${key}`] = true;
          }
        });
      }

      if (camposTodosLlenos) {
        if (!correoValido(tutor.correo_electronico)) {
          nuevosErrores[`t${idx}-correo_electronico`] = true;
          esValido = false;
        }
        if (!telefonoValido(tutor.telefono)) {
          nuevosErrores[`t${idx}-telefono`] = true;
          esValido = false;
        }
      }
    });

    if (!esValido) {
      setErrores(nuevosErrores);
      alert(
        "Todos los tutores añadidos deben tener todos sus campos completos y válidos."
      );
      return false;
    }

    return true;
  };

  const handleEstudianteChange = (e) => {
    // setEstudiante({ ...estudiante, [e.target.name]: e.target.value });
    const { name, value } = e.target;

    if (name === "documento_identidad") {
      if (value.length <= 10) {
        setEstudiante({ ...estudiante, [name]: value });
      }
    } else if (name === "fecha_nacimiento") {
      setEstudiante({ ...estudiante, [name]: value });
    } else {
      if (value.length <= 50) {
        setEstudiante({ ...estudiante, [name]: value });
      }
    }
  };

  const handleTutorChange = (e, idx) => {
    const nuevos = [...tutores];
    const { name, value } = e.target;

    // Limitar a 100 caracteres solo para nombres/apellidos
    if ((name === "nombres" || name === "apellidos") && value.length > 50) {
      return; // No actualiza si supera los 100
    }
    nuevos[idx][e.target.name] = e.target.value;
    setTutores(nuevos);
    setTutorActivo(idx); // <- identificamos la tarjeta que se está escribiendo
  };

  // const handleAreaChange = (e) => {
  //   const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
  //   setAreasSeleccionadas(options);
  // };
  const textoValido = (texto) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(texto);
  const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const telefonoValido = (telefono) => /^\d+$/.test(telefono);
  const documentoValido = (doc) => /^\d+$/.test(doc);
  const fechaNacimientoValida = (fecha) => {
    const hoy = new Date();
    const fechaIngresada = new Date(fecha);
    return fechaIngresada <= hoy;
  };
  const camposEstudianteCompletos = () => {
    const todosLlenos = Object.values(estudiante).every((valor) =>
      valor.trim()
    );
    const correoOK = correoValido(estudiante.correo_electronico);
    const documentoOK = documentoValido(estudiante.documento_identidad);
    const nombresOK = textoValido(estudiante.nombres);
    const apellidosOK = textoValido(estudiante.apellidos);
    const fechaNacimientoOk = fechaNacimientoValida(
      estudiante.fecha_nacimiento
    );
    return (
      todosLlenos &&
      correoOK &&
      documentoOK &&
      nombresOK &&
      apellidosOK &&
      fechaNacimientoOk
    );
  };

  const camposTutoresCompletos = () => {
    return tutores.every((tutor) => {
      const camposLlenos = Object.values(tutor).every((valor) => valor.trim());
      const correoOK = correoValido(tutor.correo_electronico);
      const telefonoOK = telefonoValido(tutor.telefono);
      return camposLlenos && correoOK && telefonoOK;
    });
  };

  const camposAreasCompletos = () => areasSeleccionadas.length > 0;
  const puedeAvanzar = () => {
    if (paso === 1) return camposEstudianteCompletos();
    if (paso === 2) return camposTutoresCompletos();
    if (paso === 3)
      return camposAreasCompletos() && categoriaSeleccionadaValida();
    return true;
  };
  const categoriaElegida = categoriasDisponibles.find(
    (cat) => cat.id === parseInt(categoriaSeleccionada)
  );
  console.log("Categorías disponibles:", categoriasDisponibles);
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
                  <div className="char-counter">
                    {/* {estudiante.nombres.length}/100 */}
                    {!textoValido(estudiante.nombres) && (
                      <span className="mensaje-error">
                        Solo se permiten letras
                      </span>
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
                    {/* {estudiante.apellidos.length}/100 */}
                    {!textoValido(estudiante.apellidos) && (
                      <span className="mensaje-error">
                        Solo se permiten letras
                      </span>
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
                    {/* {estudiante.documento_identidad.length}/10 */}
                    {!documentoValido(estudiante.documento_identidad) &&
                      estudiante.documento_identidad && (
                        <span className="mensaje-error">
                          Solo se permiten números
                        </span>
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
              {tutores.map((tutor, idx) => (
                <div className="bloque-tutor" key={idx}>
                  <h3>
                    {idx === 0 ? "Tutor Principal" : `Tutor Adicional ${idx}`}
                  </h3>
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
                      />
                      {!textoValido(tutor.nombres) &&
                        tutor.nombres &&
                        tutorActivo === idx && (
                          <span className="mensaje-error">
                            Solo se permiten letras
                          </span>
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
                      />
                      {!textoValido(tutor.apellidos) &&
                        tutor.apellidos &&
                        tutorActivo === idx && (
                          <span className="mensaje-error">
                            Solo se permiten letras
                          </span>
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
                        Correo Electrónico
                        <span className="asterisco rojo">*</span>
                      </label>
                      <input
                        type="email"
                        name="correo_electronico"
                        placeholder="Correo Electrónico"
                        value={tutor.correo_electronico}
                        onChange={(e) => handleTutorChange(e, idx)}
                        className={
                          errores[`t${idx}-correo_electronico`] ? "error" : ""
                        }
                      />
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
                        Teléfono/Celular
                        <span className="asterisco rojo">*</span>
                      </label>
                      <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono/Celular"
                        value={tutor.telefono}
                        onChange={(e) => handleTutorChange(e, idx)}
                        className={errores[`t${idx}-telefono`] ? "error" : ""}
                      />
                      {!telefonoValido(tutor.telefono) &&
                        tutor.telefono &&
                        tutorActivo === idx && (
                          <span className="mensaje-error">
                            El teléfono debe contener solo números
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="botones-tutores">
                <button
                  type="button"
                  onClick={() =>
                    setTutores([
                      ...tutores,
                      {
                        nombres: "",
                        apellidos: "",
                        correo_electronico: "",
                        telefono: "",
                      },
                    ])
                  }
                  className="boton-agregar-tutor"
                >
                  + Añadir Tutor
                </button>
                {tutores.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTutores((prev) => prev.slice(0, -1))}
                    className="boton-eliminar-tutor"
                  >
                    - Eliminar Tutor
                  </button>
                )}
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
              <div className="fila-categorias">
                <div className="campo">
                  <label>
                    Áreas de Competencia{" "}
                    <span className="asterisco rojo">*</span>
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
                        setCategoriaSeleccionada(""); // Limpia la categoría seleccionada
                      }
                      e.target.value = "";
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecciona un área
                    </option>
                    {areasDisponibles
                      .filter(
                        (area) => !areasSeleccionadas.includes(area.nombre)
                      )
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
              {/* AREA CATEGORIA */}
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
                        {categoriaElegida.grade_name} (
                        {categoriaElegida.grade_min}° a{" "}
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
      {/* Nuevo actualizacion */}
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
