import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/components/InscripcionIndividual.css";
import "../../styles/components/FormularioGrupal.css";

// Importar servicios
import {
  generarBoletaGrupal,
  registrarTutoresGrupales,
  registrarCompetidoresGrupales,
  asignarAreasNivelesGrupales,
} from "../../services/inscripcionGrupalService";

// Importar componentes de formularios grupales
import FormTutoresGrupales from "../../components/forms/FormTutoresGrupales";
import FormCompetidoresGrupales from "../../components/forms/FormCompetidoresGrupales";
import FormAreasGrupales from "../../components/forms/FormAreasGrupales";
import FormResumenGrupal from "../../components/forms/FormResumenGrupal";

// Importar componente de boleta grupal
import BoletaPagoGrupal from "./BoletaPagoGrupal";

// Componentes comunes
import BarraPasos from "../../components/common/BarraPasos";
import BotonesPaso from "../../components/common/BotonesPaso";

const InscripcionGrupal = () => {
  const navigate = useNavigate();
  const { idOlimpiada } = useParams();
  const [paso, setPaso] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Estados para el proceso
  const [procesoId, setProcesoId] = useState(null);
  const [olimpiadaId, setOlimpiadaId] = useState(null);  // Estados para datos grupales
  const [tutores, setTutores] = useState([
    {
      nombres: "",
      apellidos: "",
      correo_electronico: "",
      telefono: "",
    },
  ]);  const [competidores, setCompetidores] = useState([]);
  const [asignacionesAreasYCategorias, setAsignacionesAreasYCategorias] = useState([]);

  // Estados para boletas
  const [mostrarBoleta, setMostrarBoleta] = useState(false);
  const [datosBoletaGenerada, setDatosBoletaGenerada] = useState(null);
  // Cargar datos iniciales
  useEffect(() => {
    const procesoIdStorage = localStorage.getItem("procesoId");
    const olimpiadaIdStorage = localStorage.getItem("idOlimpiada");

    if (procesoIdStorage && olimpiadaIdStorage) {
      setProcesoId(procesoIdStorage);
      setOlimpiadaId(olimpiadaIdStorage);
    } else {
      console.error("No se encontró información del proceso");
      navigate("/user/inscripcion");
    }
  }, [navigate]);
  // Detectar cuando se cargan competidores desde CSV
  useEffect(() => {
    if (competidores.length > 0) {
      const tienenAreas = competidores.length > 0 && 
                         competidores.every(comp => comp.area && comp.nivel);
      console.log("🔍 Competidores actualizados:", {
        cantidad: competidores.length,
        tienenAreas,
        primerCompetidor: competidores[0],
        camposDisponibles: Object.keys(competidores[0] || {})
      });
    }
  }, [competidores]);

  // Validaciones por paso
  const validarTutores = () => {
    return tutores.every((tutor) => {
      return (
        tutor.nombres.trim() &&
        tutor.apellidos.trim() &&
        tutor.correo_electronico.trim() &&
        tutor.telefono.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutor.correo_electronico) &&
        /^\d{8}$/.test(tutor.telefono)
      );
    });
  };  // Validación silenciosa para habilitar/deshabilitar el botón
  const validarCompetidoresSilencioso = () => {
    // Validar que hay al menos 2 competidores
    if (competidores.length < 2) {
      return false;
    }
    
    // Si los competidores vienen de CSV con áreas asignadas, validación más flexible
    if (competidoresTienenAreasAsignadas()) {
      // Para competidores de CSV, solo verificar campos básicos
      const competidoresCompletos = competidores.filter(competidor => {
        return (
          competidor.nombres?.trim() &&
          competidor.apellidos?.trim() &&
          competidor.documento_identidad?.trim() &&
          competidor.area?.trim() &&
          competidor.nivel?.trim()
        );
      });
      return competidoresCompletos.length >= 2;
    }
    
    // Para competidores manuales, validación completa
    const competidoresCompletos = competidores.filter(competidor => {
      return (
        competidor.nombres?.trim() &&
        competidor.apellidos?.trim() &&
        competidor.documento_identidad?.trim() &&
        competidor.fecha_nacimiento?.trim() &&
        competidor.provincia?.trim() &&
        competidor.curso?.trim() &&
        competidor.correo_electronico?.trim() &&
        competidor.colegio?.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(competidor.correo_electronico) &&
        /^\d{7,10}$/.test(competidor.documento_identidad)
      );
    });
    
    // Requiere al menos 2 competidores completos
    return competidoresCompletos.length >= 2;
  };
  // Validación con alertas para cuando el usuario hace clic en "Siguiente"
  const validarCompetidores = () => {
    // Validar que hay al menos 2 competidores
    if (competidores.length < 2) {
      alert("Se requieren al menos 2 competidores para una inscripción grupal.");
      return false;
    }
    
    // Si los competidores vienen de CSV con áreas asignadas, validación más flexible
    if (competidoresTienenAreasAsignadas()) {
      // Para competidores de CSV, solo verificar campos básicos
      const competidoresCompletos = competidores.filter(competidor => {
        return (
          competidor.nombres?.trim() &&
          competidor.apellidos?.trim() &&
          competidor.documento_identidad?.trim() &&
          competidor.area?.trim() &&
          competidor.nivel?.trim()
        );
      });
      
      if (competidoresCompletos.length < 2) {
        alert(`Se requieren al menos 2 competidores completos. Actualmente hay ${competidoresCompletos.length} competidor(es) completo(s) de ${competidores.length} total(es).`);
        return false;
      }
      
      return true;
    }
    
    // Para competidores manuales, validación completa
    const competidoresCompletos = competidores.filter(competidor => {
      return (
        competidor.nombres?.trim() &&
        competidor.apellidos?.trim() &&
        competidor.documento_identidad?.trim() &&
        competidor.fecha_nacimiento?.trim() &&
        competidor.provincia?.trim() &&
        competidor.curso?.trim() &&
        competidor.correo_electronico?.trim() &&
        competidor.colegio?.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(competidor.correo_electronico) &&
        /^\d{7,10}$/.test(competidor.documento_identidad)
      );
    });
    
    // Requiere al menos 2 competidores completos
    if (competidoresCompletos.length < 2) {
      alert(`Se requieren al menos 2 competidores completos. Actualmente hay ${competidoresCompletos.length} competidor(es) completo(s) de ${competidores.length} total(es).`);
      return false;
    }
    
    return true;
  };
  const validarAreasYCategorias = () => {
    return asignacionesAreasYCategorias.length > 0 && 
           asignacionesAreasYCategorias.every(asignacion => 
             asignacion.areaId && asignacion.categoriaId
           );
  };  const puedeAvanzar = () => {
    switch (paso) {
      case 1:
        return validarTutores();
      case 2:
        return validarCompetidoresSilencioso();
      case 3:
        // Si los competidores vienen de CSV con áreas asignadas, esta es la pantalla de resumen
        if (competidoresTienenAreasAsignadas()) {
          return true; // Siempre puede proceder desde el resumen
        }
        return validarAreasYCategorias();
      case 4:
        return true;
      default:
        return false;
    }
  };// Función para detectar si los competidores vienen de CSV con áreas ya asignadas
  const competidoresTienenAreasAsignadas = () => {
    return competidores.length > 0 && 
           competidores.every(comp => comp.area && comp.nivel);
  };

  const siguiente = async () => {
    // Verificar si puede avanzar según el estado actual
    if (!puedeAvanzar()) {
      return;
    }

    // Validación adicional con alertas para cada paso
    let puedeProceeder = true;
    
    switch (paso) {
      case 1:
        puedeProceeder = validarTutores();
        break;
      case 2:
        puedeProceeder = validarCompetidores();
        // Si los competidores vienen de CSV con áreas asignadas, saltar paso 3
        if (puedeProceeder && competidoresTienenAreasAsignadas()) {
          console.log("🔄 Saltando paso 3 - Competidores desde CSV con áreas asignadas");
          setPaso(4); // Ir directamente al paso 4 (resumen)
          return;
        }
        break;
      case 3:
        puedeProceeder = validarAreasYCategorias();
        break;
      default:
        puedeProceeder = true;
    }

    if (!puedeProceeder) {
      return;
    }

    if (paso < 4) {
      setPaso(paso + 1);
    }
  };
  const anterior = () => {
    if (paso > 1) {
      // Si estamos en el paso 4 y los competidores vienen de CSV (saltamos el 3), volver al 2
      if (paso === 4 && competidoresTienenAreasAsignadas()) {
        setPaso(2);
      } else {
        setPaso(paso - 1);
      }
    }
  };  const handleSubmit = async () => {
    setProcesando(true);

    try {
      console.log("🚀 Iniciando envío de datos grupales completos...");
      
      // Paso 1: Registrar todos los tutores
      console.log("📤 Enviando tutores...", tutores);
      await registrarTutoresGrupales(procesoId, tutores);
      console.log("✅ Tutores registrados exitosamente");

      // Paso 2: Manejar competidores según su origen
      let competidoresConIds = [];
      
      if (competidoresTienenAreasAsignadas()) {
        // Los competidores vienen de CSV y ya fueron registrados
        console.log("🔄 Competidores desde CSV - ya registrados, usando IDs existentes");
        competidoresConIds = competidores.map(comp => ({
          id: comp.id, // Los competidores CSV ya tienen ID
          nombres: comp.nombres,
          apellidos: comp.apellidos
        }));
        console.log("✅ Usando competidores CSV existentes:", competidoresConIds);
      } else {
        // Competidores de registro manual - necesitan ser registrados
        console.log("📤 Enviando competidores manuales...", competidores);
        
        // 🔍 Logging detallado de los datos de competidores
        console.log("🔍 Datos detallados de competidores:", JSON.stringify(competidores, null, 2));
        competidores.forEach((comp, index) => {
          console.log(`🔍 Competidor ${index}:`, {
            nombres: comp.nombres,
            apellidos: comp.apellidos,
            documento_identidad: comp.documento_identidad,
            correo_electronico: comp.correo_electronico,
            provincia: comp.provincia,
            fecha_nacimiento: comp.fecha_nacimiento,
            curso: comp.curso,
            colegio: comp.colegio
          });
        });
        
        const responseCompetidores = await registrarCompetidoresGrupales(procesoId, competidores);
        console.log("✅ Competidores registrados exitosamente:", responseCompetidores.data);
        
        // Guardar los competidores registrados con sus IDs
        competidoresConIds = responseCompetidores.data.competidores || responseCompetidores.data.data || [];
      }      // Paso 3: Manejar asignaciones de áreas y niveles
      if (competidoresTienenAreasAsignadas()) {
        // Los competidores vienen de CSV con áreas ya asignadas por ExcelProcessorService
        console.log("⏭️ Saltando asignaciones - Los competidores CSV ya tienen áreas y niveles asignados");
      } else {
        // Crear asignaciones para competidores de registro manual
        console.log("📤 Creando asignaciones para competidores manuales...");
        
        const asignacionesParaBackend = asignacionesAreasYCategorias.map((asignacion, index) => {
          const competidor = competidoresConIds[index];
          if (!competidor) {
            throw new Error(`No se encontró el competidor registrado para el índice ${index}`);
          }
          
          return {
            competidor_id: competidor.id,
            area_id: parseInt(asignacion.areaId),
            nivel_id: parseInt(asignacion.categoriaId) // El backend usa 'nivel_id' para categorías
          };
        });

        console.log("📤 Enviando asignaciones transformadas...", asignacionesParaBackend);
        await asignarAreasNivelesGrupales(procesoId, asignacionesParaBackend);
        console.log("✅ Áreas y categorías asignadas exitosamente");
      }

      // Paso 4: Generar la boleta
      console.log("📄 Generando boleta grupal...");
      const response = await generarBoletaGrupal(procesoId);
      
      if (response.data.success) {
        setDatosBoletaGenerada(response.data);
        setMostrarBoleta(true);
        
        // Limpiar localStorage
        localStorage.removeItem("procesoId");
        localStorage.removeItem("idOlimpiada");
        localStorage.removeItem("tipoInscripcion");
        
        console.log("✅ Boleta grupal generada exitosamente");
      } else {
        throw new Error(response.data.mensaje || "Error al generar la boleta");
      }
    } catch (error) {
      console.error("❌ Error en el proceso de inscripción grupal:", error);
      
      // Mensaje de error más específico
      const errorMessage = error.response?.data?.mensaje || 
                          error.response?.data?.message || 
                          error.message || 
                          "Error desconocido";
      
      alert(`Error en la inscripción: ${errorMessage}`);
    } finally {
      setProcesando(false);
    }
  };

  const volverDesdeBoletaPago = () => {
    setMostrarBoleta(false);
    navigate("/user/mis-inscripciones");
  };  const pasos = [
    "1 Datos Tutor",
    "2 Datos Estudiantes", 
    competidoresTienenAreasAsignadas() ? "3 Resumen y Boleta" : "3 Áreas y Categorías",
    competidoresTienenAreasAsignadas() ? "" : "4 Resumen y Boleta"
  ].filter(paso => paso !== ""); // Filtrar pasos vacíos

  // Si se está mostrando la boleta, renderizar el componente BoletaPagoGrupal
  if (mostrarBoleta && datosBoletaGenerada) {
    // Extraer áreas únicas de las asignaciones para pasar al componente
    const areasUnicas = asignacionesAreasYCategorias
      .filter((asignacion, index, arr) => 
        arr.findIndex(a => a.areaSeleccionada?.id === asignacion.areaSeleccionada?.id) === index
      )
      .map(asignacion => asignacion.areaSeleccionada)
      .filter(area => area);

    return (
      <BoletaPagoGrupal
        competidores={competidores}
        tutores={tutores}
        areasSeleccionadas={areasUnicas}
        numeroBoleta={datosBoletaGenerada.codigo}
        registration_process_id={procesoId}
        boleta_id={datosBoletaGenerada.boleta_id}
        onVolver={volverDesdeBoletaPago}
      />
    );
  }

  return (
    <div className="inscripcion-container">
      <h1>Inscripción Grupal</h1>
      <p>Complete los siguientes pasos para registrar múltiples competidores</p>      <BarraPasos pasos={pasos} pasoActual={paso} />

      <form className="formulario-inscripcion" onSubmit={(e) => {
        e.preventDefault();
        if (paso === 4 || (paso === 3 && competidoresTienenAreasAsignadas())) {
          handleSubmit();
        }
      }}>{paso === 1 && (
          <FormTutoresGrupales
            tutores={tutores}
            setTutores={setTutores}
          />
        )}        {paso === 2 && (
          <FormCompetidoresGrupales
            competidores={competidores}
            setCompetidores={setCompetidores}
            procesoId={procesoId}
          />
        )}        {paso === 3 && !competidoresTienenAreasAsignadas() && (
          <FormAreasGrupales
            competidores={competidores}
            onActualizarAsignacion={setAsignacionesAreasYCategorias}
            asignacionesActuales={asignacionesAreasYCategorias}
            olimpiadaId={olimpiadaId || idOlimpiada}
            procesoId={procesoId}
          />        )}        {(paso === 4 || (paso === 3 && competidoresTienenAreasAsignadas())) && (
          <FormResumenGrupal
            tutores={tutores}
            competidores={competidores}
            asignacionesAreasYCategorias={asignacionesAreasYCategorias}
            procesoId={procesoId}
            olimpiadaId={olimpiadaId}
            onConfirmarInscripcion={handleSubmit}
          />
        )}<BotonesPaso
          paso={competidoresTienenAreasAsignadas() && paso === 3 ? 4 : paso}
          siguiente={siguiente}
          anterior={anterior}
          puedeAvanzar={puedeAvanzar}
        />
      </form>

      {procesando && (
        <div className="overlay-procesando">
          <div className="spinner">Generando boleta...</div>
        </div>
      )}
    </div>
  );
};

export default InscripcionGrupal;
