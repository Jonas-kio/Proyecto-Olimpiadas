import React, { useState, useEffect } from "react";
import "../../styles/components/InscripcionIndividual.css";
import "../../styles/components/InscripcionConfirmacion.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
//importando servicios
import {
  iniciarProceso,
  inscripcionCompetidor,
  inscripcionTutor,
  obtenerAreasPorOlimpiada,
  // inscripcionArea,
  guardarSeleccionArea,
  guardarSeleccionNivel,
  obtenerResumenInscripcion,
  obtenerCategoriasPorArea,
  verificarEstadoProceso,
  diagnosticarProceso,
} from "../../services/inscripcionService";
import { getOlimpiadaDetail } from "../../services/olimpiadaService";
// Componentes comunes
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import ProcesandoModal from "../../components/common/ProcesandoModal";

// Boletas
import BoletaPago from "../user/BoletaPago";
import {
  generarNumeroBoleta,
  generarBoletaPDF,
  enviarBoletaPorEmail,
} from "../../services/boletaService";

// Formularios divididos
import FormEstudiantes from "../../components/forms/FormEstudiantes";
import FormTutores from "../../components/forms/FormTutores";
import FormAreasCategorias from "../../components/forms/FormAreasCategorias";
import FormResumen from "../../components/forms/FormResumen";

// Navegación de pasos
import BarraPasos from "../../components/common/BarraPasos";
import BotonesPaso from "../../components/common/BotonesPaso";

const InscripcionIndividual = () => {
  const navigate = useNavigate();
  const { idOlimpiada } = useParams();
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

  // Estados para boletas
  const [mostrarBoleta, setMostrarBoleta] = useState(false);
  const [numeroBoleta, setNumeroBoleta] = useState("");
  const [inscripcionCompletada, setInscripcionCompletada] = useState(false);
  const [inscripcionId, setInscripcionId] = useState(null);

  const [tutores, setTutores] = useState([
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  ]);
  const [tutorActivo, setTutorActivo] = useState(null);

  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  // const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const [errores, setErrores] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModalAbierto, setErrorModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [camposConError, setCamposConError] = useState([]);
  const [usarBackend, setUsarBackend] = useState(true); // Bandera para cambiar entre modos
  const [maximoAreas, setMaximoAreas] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!idOlimpiada) {
          alert("ID de olimpiada no encontrado");
          navigate("/inscripcion");
          return;
        }
        const responseAreas = await obtenerAreasPorOlimpiada(idOlimpiada); //Llamada al backend areas
        console.log("Id de la olimpiada:", idOlimpiada);
        console.log("Respuesta completa de áreas:", responseAreas);
        // const responseCategorias = await inscripcionCategoryLevel(); // llamada al backend categorias

        const areasLimpias = responseAreas.map((area) => ({
          id: area.id,
          nombre: area.nombre,
          descripcion: area.descripcion,
        }));
        console.log("Áreas mapeadas limpias:", areasLimpias);

        // const areasData = Array.isArray(responseAreas.data)
        //   ? responseAreas.data
        //   : responseAreas.data.data || [];

        setAreasDisponibles(areasLimpias);
        console.log("Áreas disponibles recibidas en el estado:", areasLimpias);
        // setCategoriasDisponibles(responseCategorias.data?.data || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        // Si falla la conexión al backend, se puede cambiar al modo simulación
        setUsarBackend(false);
      }
    };
    fetchData();
  }, []);
  //Datos
  useEffect(() => {
    const id = localStorage.getItem("idOlimpiada");
    const tipo = localStorage.getItem("tipoInscripcion");

    if (!id || !tipo) {
      alert("Datos de inscripción no encontrados. Serás redirigido.");
      navigate("/inscripcion");
    }
  }, []);

  useEffect(() => {
    const fetchMaximoAreas = async () => {
      try {
        const idOlimpiada = localStorage.getItem("idOlimpiada");
        if (idOlimpiada) {
          const res = await getOlimpiadaDetail(idOlimpiada);
          const data = res.data?.data?.olimpiada;
          console.log("Datos de olimpiada:", data);
          if (data?.maximo_areas) {
            console.log("Maximo de areas permitidas:", data.maximo_areas);
            setMaximoAreas(data.maximo_areas);
          }
        }
      } catch (err) {
        console.error("Error al obtener detalle de olimpiada con await:", err);
      }
    };

    fetchMaximoAreas();
  }, []);

  useEffect(() => {
    console.log("Áreas seleccionadas:", areasSeleccionadas);
  }, [areasSeleccionadas]);

  // useEffect(() => {
  //   const relacionadas = categoriasDisponibles.filter((cat) =>
  //     areasSeleccionadas.some((area) => area.id === cat.area_id)
  //   );
  //   console.log(
  //     "Categorías filtradas según áreas seleccionadas:",
  //     relacionadas
  //   );
  //   setCategoriasFiltradas(relacionadas);
  // }, [areasSeleccionadas, categoriasDisponibles]);
  // useEffect(() => {
  //   const cursoSeleccionado = parseInt(
  //     localStorage.getItem("cursoSeleccionado")
  //   );

  //   const relacionadas = categoriasDisponibles.filter((cat) => {
  //     const perteneceArea = areasSeleccionadas.some(
  //       (area) => area.id === cat.area_id
  //     );
  //     const min = parseInt(cat.grade_min);
  //     const max = cat.grade_max ? parseInt(cat.grade_max) : 12; // Si no hay max, asumimos hasta 6to secundaria
  //     const dentroDelRango =
  //       cursoSeleccionado >= min && cursoSeleccionado <= max;

  //     return perteneceArea && dentroDelRango;
  //   });

  //   console.log("Categorías filtradas por área y curso:", relacionadas);
  //   setCategoriasFiltradas(relacionadas);
  // }, [areasSeleccionadas, categoriasDisponibles]);

  const textoValido = (texto) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(texto);
  const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const telefonoValido = (tel) => /^\d+$/.test(tel);
  const documentoValido = (doc) => /^\d+$/.test(doc);
  const fechaNacimientoValida = (fecha) => new Date(fecha) <= new Date();
  const categoriasSeleccionadasValida = () =>
    categoriasSeleccionadas.length > 0;

  const camposEstudianteCompletos = () => {
    const llenos = Object.values(estudiante).every((v) => v.trim());
    return (
      llenos &&
      correoValido(estudiante.correo_electronico) &&
      documentoValido(estudiante.documento_identidad) &&
      textoValido(estudiante.nombres) &&
      textoValido(estudiante.apellidos) &&
      fechaNacimientoValida(estudiante.fecha_nacimiento)
    );
  };

  const camposTutoresCompletos = () => {
    return tutores.every((tutor) => {
      const llenos = Object.values(tutor).every((v) => v.trim());
      return (
        llenos &&
        correoValido(tutor.correo_electronico) &&
        telefonoValido(tutor.telefono)
      );
    });
  };

  const camposAreasCompletos = () => areasSeleccionadas.length > 0;

  const puedeAvanzar = () => {
    if (paso === 1) return camposEstudianteCompletos();
    if (paso === 2) return camposTutoresCompletos();
    if (paso === 3)
      return camposAreasCompletos() && categoriasSeleccionadasValida();
    return true;
  };

  const siguiente = () => {
    if (!puedeAvanzar()) return;
    setPaso((prev) => Math.min(prev + 1, 4));
  };

  const anterior = () => setPaso((prev) => Math.max(prev - 1, 1));

  const handleEstudianteChange = (e) => {
    const { name, value } = e.target;
    // Guardar curso seleccionado en localStorage si es "curso"
    if (name === "curso") {
      localStorage.setItem("cursoSeleccionado", value);
      console.log("curso : ", value);
    }
    if (name === "documento_identidad" && value.length > 10) return;
    if ((name === "nombres" || name === "apellidos") && value.length > 50)
      return;
    if (name === "colegio" && value.length > 100) return;
    if (name === "provincia" && value.length > 100) return;
    if (name === "correo_electronico") {
      // Limitar a 50 caracteres en total
      if (value.length > 40) return;

      // Bloquear más caracteres después de .com
      const index = value.indexOf(".com");
      if (index !== -1 && value.length > index + 4) return;
    }

    setEstudiante((prev) => ({ ...prev, [name]: value }));
  };

  const handleTutorChange = (e, idx) => {
    const { name, value } = e.target;
    if ((name === "nombres" || name === "apellidos") && value.length > 50)
      return;
    if (name === "correo_electronico" && value.length > 50) return;
    if (name === "telefono" && value.length > 8) return;
    const nuevos = [...tutores];
    nuevos[idx][name] = value;
    setTutores(nuevos);
    setTutorActivo(idx);
  };

  const categoriasElegidas = categoriasDisponibles.filter((cat) =>
    categoriasSeleccionadas.some((sel) => sel.id === cat.id)
  );

  const volverDesdeBoletaPago = () => {
    setMostrarBoleta(false);
    setPaso(1);
  };

  // Modo Simulación (cuando no hay conexión al backend)
  const manejarModoSimulacion = async () => {
    console.log("Simulando registro exitoso del estudiante:", estudiante);
    console.log("Simulando registro exitoso de tutores:", tutores);
    console.log("Simulando registro de áreas:", areasSeleccionadas);

    // Generar número de boleta
    const nuevoBoleta = generarNumeroBoleta();
    console.log("NÚMERO DE BOLETA GENERADO:", nuevoBoleta);

    // Simular una pequeña demora para dar impresión de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      nuevoBoleta,
      estudianteId: `sim-${Date.now()}`, // ID simulado
    };
  };

  // Modo Backend (cuando hay conexión al backend)
  const manejarModoBackend = async (
    procesoId,
    formularioEstudiante,
    tutoresFormulario
  ) => {
    try {
      // Paso 1: Registrar el estudiante (competidor)
      const respuestaEstudiante = await inscripcionCompetidor(
        procesoId,
        formularioEstudiante
      );
      console.log(
        "Estudiante registrado exitosamente:",
        respuestaEstudiante.data
      );
      const competidorId = respuestaEstudiante.data.competidor_id;

      // Paso 2: Registrar los tutores asociados al estudiante
      const registrosTutores = tutoresFormulario.map((tutor, idx) => {
        const payloadTutor = {
          ...tutor,
          competidores_ids: [competidorId],
          es_principal: idx === tutorActivo,
          relacion: "Tutor",
        };
        console.log("Payload tutor:", payloadTutor);
        return inscripcionTutor(procesoId, payloadTutor);
      });

      await Promise.all(registrosTutores);
      console.log("Tutores registrados exitosamente"); // Paso 3: Guardar áreas seleccionadas
      const areaIds = areasSeleccionadas.map((area) => area.id);
      await guardarSeleccionArea(procesoId, { area_id: areaIds });
      console.log("Áreas seleccionadas guardadas:", areasSeleccionadas); // Paso 4: Guardar nivel seleccionado
      // Convertimos a array para manejar múltiples niveles
      // const nivelesIds = Array.isArray(categoriaSeleccionada)
      //   ? categoriaSeleccionada
      //   : [categoriaSeleccionada];

      // await guardarSeleccionNivel(procesoId, {
      //   nivel_id: nivelesIds,
      // });
      const nivelesIds = categoriasSeleccionadas.map((cat) => cat.id);
      await guardarSeleccionNivel(procesoId, {
        nivel_id: nivelesIds,
      });
      console.log("Niveles seleccionados guardados:", nivelesIds);

      // Paso 5: Obtener resumen de inscripcion
      const resumen = await obtenerResumenInscripcion(procesoId);
      console.log("Resumen de inscripción:", resumen.data);

      // Paso 6: Generar número de boleta
      const nuevoBoleta = generarNumeroBoleta();
      console.log("NÚMERO DE BOLETA GENERADO:", nuevoBoleta);

      return {
        success: true,
        nuevoBoleta,
        estudianteId: competidorId,
      };
    } catch (error) {
      console.error("Error en el proceso de inscripción backend:", error);
      return {
        success: false,
        error,
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);

    const formularioEstudiante = { ...estudiante };
    const tutoresFormulario = tutores.filter(
      (t) => t.nombres || t.apellidos || t.correo_electronico || t.telefono
    );

    try {
      let resultado;

      if (usarBackend) {
        // 1. INICIAR PROCESO
        const olimpiadaId = localStorage.getItem("idOlimpiada");
        const tipoInscripcion =
          localStorage.getItem("tipoInscripcion") || "individual";
        const respuestaProceso = await iniciarProceso(
          olimpiadaId,
          tipoInscripcion
        );
        const procesoId = respuestaProceso.data.proceso_id;
        console.log("Proceso iniciado con ID:", procesoId);

        // 2. Usar la función de manejo de backend
        resultado = await manejarModoBackend(
          procesoId,
          formularioEstudiante,
          tutoresFormulario
        );
      } else {
        // Usar modo simulación
        resultado = await manejarModoSimulacion();
      }

      if (!resultado.success) {
        throw (
          resultado.error || new Error("Error en el proceso de inscripción")
        );
      }

      // Guardar el número de boleta generado
      setNumeroBoleta(resultado.nuevoBoleta);
      setInscripcionId(resultado.estudianteId || null);

      // 👇 Aquí llamas a verificar el estado del proceso 👇
      const estadoProceso = await verificarEstadoProceso(
        localStorage.getItem("procesoId")
      );
      console.log(
        "Estado del proceso después de la inscripción:",
        estadoProceso
      );
      //Diagnostico Proceso
      const consultarDiagnosticoProceso = async () => {
        try {
          const procesoId = localStorage.getItem("procesoId"); // o tu fuente de ID
          const diagnostico = await diagnosticarProceso(procesoId);
          console.log("Diagnóstico del proceso:", diagnostico);
          // Aquí puedes mostrar un mensaje, actualizar estado, etc.
        } catch (error) {
          console.error("No se pudo obtener el diagnóstico:", error);
        }
      };

      // Generar el PDF de la boleta
      try {
        const boletaPDF = await generarBoletaPDF(
          estudiante,
          tutores,
          areasSeleccionadas,
          resultado.nuevoBoleta
        );

        // Descargar automáticamente el PDF
        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_${resultado.nuevoBoleta}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Envío automático de la boleta al correo del usuario (opcional)
        if (estudiante.correo_electronico) {
          try {
            console.log(
              "Enviando boleta automáticamente al correo:",
              estudiante.correo_electronico
            );
            await enviarBoletaPorEmail(
              estudiante,
              tutores,
              areasSeleccionadas,
              resultado.nuevoBoleta,
              estudiante.correo_electronico
            );
            console.log("Boleta enviada automáticamente con éxito");
          } catch (errorEnvio) {
            console.error(
              "Error al enviar boleta automáticamente:",
              errorEnvio
            );
            // No impedir la continuación del flujo si falla el envío automático
          }
        }
      } catch (errorPDF) {
        console.error("Error al generar o descargar el PDF:", errorPDF);
        // Aún así, continuamos con el flujo
      }

      // Marcar como completado y mostrar boleta
      setInscripcionCompletada(true);
      setMostrarBoleta(true);
      setModalAbierto(true);

      // Limpiar datos de inscripción del localStorage
      localStorage.removeItem("idOlimpiada");
      localStorage.removeItem("tipoInscripcion");
      localStorage.removeItem("cursoSeleccionado");
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
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="inscripcion-container">
      {mostrarBoleta ? (
        <BoletaPago
          estudiante={estudiante}
          tutores={tutores}
          areasSeleccionadas={areasSeleccionadas}
          numeroBoleta={numeroBoleta}
          registration_process_id={inscripcionId}
          onVolver={volverDesdeBoletaPago}
        />
      ) : (
        <div className="formulario-wrapper">
          <h1>Inscripción Individual</h1>
          <p>
            Complete el formulario para inscribirse en las Olimpiadas Oh! SanSi
          </p>

          <BarraPasos pasoActual={paso} />

          <form className="formulario" onSubmit={handleSubmit}>
            {paso === 1 && (
              <FormEstudiantes
                estudiante={estudiante}
                handleEstudianteChange={handleEstudianteChange}
                errores={errores}
                textoValido={textoValido}
                documentoValido={documentoValido}
                fechaNacimientoValida={fechaNacimientoValida}
                correoValido={correoValido}
              />
            )}

            {paso === 2 && (
              <FormTutores
                tutores={tutores}
                setTutores={setTutores}
                errores={errores}
                handleTutorChange={handleTutorChange}
                textoValido={textoValido}
                correoValido={correoValido}
                telefonoValido={telefonoValido}
                tutorActivo={tutorActivo}
                setTutorActivo={setTutorActivo}
              />
            )}

            {paso === 3 && (
              <FormAreasCategorias
                areasDisponibles={areasDisponibles}
                areasSeleccionadas={areasSeleccionadas}
                setAreasSeleccionadas={setAreasSeleccionadas}
                categoriasFiltradas={categoriasFiltradas}
                setCategoriasFiltradas={setCategoriasFiltradas} // 👈 NUEVO
                categoriasSeleccionadas={categoriasSeleccionadas}
                setCategoriasSeleccionadas={setCategoriasSeleccionadas}
                obtenerCategoriasPorArea={obtenerCategoriasPorArea} // 👈 NUEVO
                categoriasDisponibles={categoriasDisponibles}
                maximoAreas={maximoAreas} // 🔥 Aquí lo pasas
              />
            )}

            {paso === 4 && (
              <FormResumen
                estudiante={estudiante}
                tutores={tutores}
                areasSeleccionadas={areasSeleccionadas}
                categoriasElegidas={categoriasSeleccionadas}
              />
            )}

            <BotonesPaso
              paso={paso}
              siguiente={siguiente}
              anterior={anterior}
              puedeAvanzar={puedeAvanzar}
            />
          </form>
        </div>
      )}

      <SuccessModal
        isOpen={modalAbierto && !inscripcionCompletada}
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

      {procesando && (
        <ProcesandoModal
          isOpen={procesando}
          title="Inscribiendote.. "
          message="Por favor espere un momento..."
        />
      )}
    </div>
  );
};

export default InscripcionIndividual;
