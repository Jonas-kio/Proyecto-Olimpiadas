import { useState, useEffect } from "react";
import "../../styles/components/InscripcionIndividual.css";
import "../../styles/components/InscripcionConfirmacion.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
//importando servicios
import {
  obtenerAreasPorOlimpiada,
  obtenerCategoriasPorArea,
  inscripcionDirecta,
  calcularCostosPreliminar,
} from "../../services/inscripcionService";
import { getOlimpiadaDetail } from "../../services/olimpiadaService";
import useNavigationWarning from "../../services/useNavigationWarning";
// Componentes comunes
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import ProcesandoModal from "../../components/common/ProcesandoModal";

// Boletas
import BoletaPago from "../user/BoletaPago";
import {
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
  const procesoId = localStorage.getItem("procesoId");
  const OlimpiadaId = localStorage.getItem("idOlimpiada");

  const [tutores, setTutores] = useState([
    { nombres: "", apellidos: "", correo_electronico: "", telefono: "" },
  ]);
  const [tutorActivo, setTutorActivo] = useState(null);

  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const [errores] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModalAbierto, setErrorModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [camposConError, setCamposConError] = useState([]);
  const [, setUsarBackend] = useState(true);
  const [maximoAreas, setMaximoAreas] = useState(0);
  const [boletaId, setBoletaId] = useState(null);
  const [costosPreliminar, setCostosPreliminar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!idOlimpiada) {
          alert("ID de olimpiada no encontrado");
          navigate("/inscripcion");
          return;
        }

        const response = await obtenerAreasPorOlimpiada(idOlimpiada);
        const responseAreas =
          response?.data?.areas || response?.data?.data?.areas || [];

        if (!Array.isArray(responseAreas)) {
          console.error(
            "La respuesta del backend no es un array:",
            responseAreas
          );
          throw new Error(
            "Formato inesperado de respuesta del backend al obtener áreas."
          );
        }

        const areasLimpias = responseAreas.map((area) => ({
          ...area,
        }));

        console.log("Áreas mapeadas limpias:", areasLimpias);
        setAreasDisponibles(areasLimpias);
      } catch (error) {
        console.error("Error al obtener las áreas de la olimpiada:", error);
        setUsarBackend(false);

        if (error.response?.status === 403) {
          alert(
            "No tienes permisos para acceder a las áreas de esta olimpiada. Por favor, verifica tus credenciales."
          );
        } else {
          alert("Ocurrió un error inesperado al obtener las áreas.");
        }
      }
    };

    fetchData();
  }, [idOlimpiada, navigate]);


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

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Para que algunos navegadores muestren el mensaje
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const hasUnsavedChanges = true; // O pon lógica para saber si hay datos ingresados
  useNavigationWarning(hasUnsavedChanges);

  const textoValido = (texto) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(texto);
  const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const telefonoValido = (tel) => /^\d+$/.test(tel);
  const documentoValido = (doc) => /^\d+$/.test(doc);
  const fechaNacimientoValida = (fecha) => {
    const fechaIngresada = new Date(fecha);
    const anioIngresado = fechaIngresada.getFullYear();

    return anioIngresado >= 2005 && anioIngresado <= 2015;
  };

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

/*   const siguiente = async () => {
    if (!puedeAvanzar()) return;

    const procesoId = localStorage.getItem("procesoId");
    if (!procesoId) {
      alert("No se encontró proceso iniciado");
      return;
    }

    if (paso === 1) {
      try {
        console.log("Payload estudiante:", estudiante);
        const respuesta = await inscripcionCompetidor(procesoId, estudiante);
        const idCompetidor = respuesta.data?.competidor_id;
        setCompetidorId(idCompetidor);
        console.log("✅ Competidor registrado:", idCompetidor);
        setPaso(2);
      } catch (error) {
        console.error("❌ Error registrando estudiante:", error);
        alert("Error al registrar al estudiante.");
      }
    } else if (paso === 2) {
      try {
        if (!competidorId) {
          alert("No se encontró el ID del competidor.");
          return;
        }

        const registrosTutores = tutores.map((tutor, idx) => {
          const payload = {
            ...tutor,
            competidores_ids: [competidorId],
            es_principal: idx === 0,
            relacion: "Madre",
          };
          console.log(`📤 Payload tutor ${idx + 1}:`, payload); // 📤 Log detallado
          return inscripcionTutor(procesoId, payload);
        });

        await Promise.all(registrosTutores);
        console.log("✅ Tutores registrados exitosamente");
        setPaso(3);
      } catch (error) {
        console.error("❌ Error registrando tutores:", error);
        alert("Error al registrar tutores.");
      }
    } else if (paso === 3) {
      try {
        const areaIds = areasSeleccionadas.map((a) => a.id);
        const payloadAreas = { area_id: areaIds };
        console.log("📤 Payload áreas:", payloadAreas); //  Log detallado
        await guardarSeleccionArea(procesoId, payloadAreas);
        console.log("✅ Áreas guardadas:", areaIds);

        const nivelIds = categoriasSeleccionadas.map((c) => c.id);
        const payloadNiveles = { nivel_id: nivelIds };
        console.log("📤 Payload categorías/niveles:", payloadNiveles); // Log detallado
        await guardarSeleccionNivel(procesoId, payloadNiveles);
        console.log("✅ Categorías/niveles guardadas:", nivelIds);

        setPaso(4);
      } catch (error) {
        console.error("❌ Error guardando áreas/categorías:", error);
        alert("Error al guardar áreas/categorías.");
      }
    } else {
      setPaso((prev) => Math.min(prev + 1, 4));
    }
  };

  const anterior = () => setPaso((prev) => Math.max(prev - 1, 1)); */

  const siguiente = async () => {
    if (!puedeAvanzar()) {
      if (paso === 1 && !camposEstudianteCompletos()) {
        alert("Por favor, complete todos los datos del estudiante correctamente");
      } else if (paso === 2 && !camposTutoresCompletos()) {
        alert("Por favor, complete todos los datos de los tutores correctamente");
      } else if (paso === 3 && (!camposAreasCompletos() || !categoriasSeleccionadasValida())) {
        alert("Debe seleccionar al menos un área y una categoría");
      }
      return;
    }

    // Si vamos a avanzar al paso 4 (resumen), calculamos los costos preliminares
    if (paso === 3) {
      try {
        const areasIds = areasSeleccionadas.map(a => a.id);
        const nivelesIds = categoriasSeleccionadas.map(n => n.id);

        setProcesando(true);

        const costos = await calcularCostosPreliminar(areasIds, nivelesIds, 1,procesoId);
        setCostosPreliminar(costos);

        localStorage.setItem("costosResumen", JSON.stringify(costos));

        setPaso(4);
      } catch (error) {
        console.error("Error al calcular costos preliminares:", error);
        alert("No se pudieron calcular los costos. Por favor intente nuevamente.");
      } finally {
        setProcesando(false);
      }
    } else {
      setPaso(paso + 1);
    }
  };

  const anterior = () => {
    setPaso((prev) => Math.max(prev - 1, 1));
  };
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


  const volverDesdeBoletaPago = () => {
    setMostrarBoleta(false);
    setPaso(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);

    try {

      if (!procesoId || !OlimpiadaId) {
        throw new Error("No se encontró información completa del proceso de inscripción.");
      }

      console.log("Preparando datos para inscripción directa...");
      
      const payload = {
        olimpiada_id: OlimpiadaId,
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        documento_identidad: estudiante.documento_identidad,
        correo_electronico: estudiante.correo_electronico,
        fecha_nacimiento: estudiante.fecha_nacimiento,
        provincia: estudiante.provincia,
        curso: estudiante.curso,
        colegio: estudiante.colegio,
        // Áreas seleccionadas
        areas: areasSeleccionadas.map(area => area.id),
        // Niveles seleccionados
        niveles: categoriasSeleccionadas.map(nivel => nivel.id),
        // Tutores
        tutores: tutores.map((tutor, idx) => ({
          nombres: tutor.nombres,
          apellidos: tutor.apellidos,
          correo_electronico: tutor.correo_electronico,
          telefono: tutor.telefono,
          es_principal: idx === 0, 
          relacion: "Tutor" 
        }))
      };
      const respuestaInscripcion = await inscripcionDirecta(procesoId,payload);

      const datosBoleta = respuestaInscripcion.data.data;
      const numeroBoletaGenerado = datosBoleta.numero_boleta;
      console.log(`Boleta generada exitosamente: ${numeroBoletaGenerado}`);
      setBoletaId(datosBoleta.boleta_id);
      setNumeroBoleta(numeroBoletaGenerado);
      setInscripcionId(procesoId);

      try {
        const boletaPDF = await generarBoletaPDF(
          estudiante,
          tutores,
          areasSeleccionadas,
          numeroBoletaGenerado
        );

        // Descargar automáticamente el PDF
        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_${numeroBoletaGenerado}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (estudiante.correo_electronico) {
          try {
            await enviarBoletaPorEmail(
              estudiante,
              tutores,
              areasSeleccionadas,
              numeroBoletaGenerado,
              estudiante.correo_electronico
            );
            console.log("Boleta enviada automáticamente con éxito");
          } catch (errorEnvio) {
            console.error(
              "Error al enviar boleta automáticamente:",
              errorEnvio
            );
            // No detenemos el flujo
          }
        }
      } catch (errorPDF) {
        console.error("Error al generar o descargar el PDF:", errorPDF);
      }

      setInscripcionCompletada(true);
      setMostrarBoleta(true);
      setModalAbierto(true);

      setTimeout(() => {
        localStorage.removeItem("idOlimpiada");
        localStorage.removeItem("tipoInscripcion");
        localStorage.removeItem("cursoSeleccionado");
        localStorage.removeItem("procesoId");
        console.log("Datos de inscripción eliminados del localStorage");
      }, 10000); // 10000 ms = 10 segundos
    } catch (error) {
      const mensajeErrorBase =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar la inscripción. Por favor, verifique los campos.";

      const camposErrores = error.response?.data?.errors;
      if (camposErrores) {
        const campos = Object.keys(camposErrores);
        setCamposConError(campos);
        setMensajeDeError(mensajeErrorBase);
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
          boleta_id={boletaId}
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
                maximoAreas={maximoAreas} // 🔥 Aquí lo pasas
              />
            )}
            {paso === 4 && (
              <FormResumen
                estudiante={estudiante}
                tutores={tutores}
                areasSeleccionadas={areasSeleccionadas}
                categoriasElegidas={categoriasSeleccionadas}
                costos={costosPreliminar}
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
