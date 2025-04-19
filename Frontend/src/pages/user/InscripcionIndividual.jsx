import React, { useState, useEffect } from "react";
import "../../styles/components/InscripcionIndividual.css";
import { useNavigate } from "react-router-dom";
import {
  inscripcionCompetidor,
  inscripcionTutor,
  inscripcionArea,
  inscripcionCategoryLevel,
} from "../../services/apiConfig";

// Componentes comunes
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";

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
  ]);
  const [tutorActivo, setTutorActivo] = useState(null);

  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [errores, setErrores] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModalAbierto, setErrorModalAbierto] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [camposConError, setCamposConError] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseAreas = await inscripcionArea();
        const responseCategorias = await inscripcionCategoryLevel();
        setAreasDisponibles(responseAreas.data?.data || []);
        setCategoriasDisponibles(responseCategorias.data?.data || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const relacionadas = categoriasDisponibles.filter((cat) =>
      areasSeleccionadas.includes(cat.area?.nombre)
    );
    setCategoriasFiltradas(relacionadas);
  }, [areasSeleccionadas, categoriasDisponibles]);

  const textoValido = (texto) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(texto);
  const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const telefonoValido = (tel) => /^\d+$/.test(tel);
  const documentoValido = (doc) => /^\d+$/.test(doc);
  const fechaNacimientoValida = (fecha) => new Date(fecha) <= new Date();
  const categoriaSeleccionadaValida = () => categoriaSeleccionada.trim() !== "";

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
      return camposAreasCompletos() && categoriaSeleccionadaValida();
    return true;
  };

  const siguiente = () => {
    if (!puedeAvanzar()) return;
    setPaso((prev) => Math.min(prev + 1, 4));
  };

  const anterior = () => setPaso((prev) => Math.max(prev - 1, 1));

  const handleEstudianteChange = (e) => {
    const { name, value } = e.target;
    if (name === "documento_identidad" && value.length > 10) return;
    if ((name === "nombres" || name === "apellidos") && value.length > 50)
      return;
    if (name === "colegio" && value.length > 100) return;
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
    const nuevos = [...tutores];
    nuevos[idx][name] = value;
    setTutores(nuevos);
    setTutorActivo(idx);
  };

  const categoriaElegida = categoriasDisponibles.find(
    (cat) => cat.id === parseInt(categoriaSeleccionada)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formulario = { ...estudiante };
    const tutoresFormulario = tutores.filter(
      (t) => t.nombres || t.apellidos || t.correo_electronico || t.telefono
    );

    try {
      // const respuestaEstudiante = await inscripcionCompetidor(formulario);
      // for (const tutor of tutoresFormulario) {
      //   await inscripcionTutor(tutor);
      // }
      const respuestaEstudiante = await inscripcionCompetidor(formulario);
      console.log(
        "Estudiante registrado exitosamente:",
        respuestaEstudiante.data
      ); // <- este log

      for (const tutor of tutoresFormulario) {
        const respuesta = await inscripcionTutor(tutor);
        console.log("Tutor registrado exitosamente:", respuesta.data); // <- este log
      }
      setModalAbierto(true);
    } catch (error) {
      const mensajeErrorBase =
        error.response?.data?.message ||
        "Error al guardar los datos. Por favor, verifique los campos.";

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
    }
  };

  return (
    <div className="inscripcion-container">
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
              categoriaSeleccionada={categoriaSeleccionada}
              setCategoriaSeleccionada={setCategoriaSeleccionada}
              categoriasDisponibles={categoriasDisponibles}
            />
          )}

          {paso === 4 && (
            <FormResumen
              estudiante={estudiante}
              tutores={tutores}
              areasSeleccionadas={areasSeleccionadas}
              categoriaElegida={categoriaElegida}
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
