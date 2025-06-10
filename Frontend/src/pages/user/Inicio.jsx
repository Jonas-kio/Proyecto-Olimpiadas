import "../../styles/components/Inicio.css";
import { useRef, useEffect, useState } from "react";
import { getAllAreasLibre } from "../../services/areasService";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/VideoPlayer";

const Inicio = () => {
  const navigate = useNavigate();
  // Dentro del componente Inicio
  const detalleRef = useRef(null);
  const [areas, setAreas] = useState([]);
  const [mostrarTodasAreas, setMostrarTodasAreas] = useState(false);
  const areasRef = useRef(null);


  const asignarIcono = (nombreArea) => {
    const nombreNormalizado = nombreArea.toLowerCase();

    const iconosPorArea = {
      'matemática': '➗',
      'matemáticas': '➗',
      'física': '⚛️',
      'química': '🧪',
      'biología': '🧫',
      'informática': '💻',
      'computación': '💻',
      'sistemas': '🖥️',
      'astronomía': '🔭',
      'robótica': '🤖',
      'ciencias sociales': '🌍',
      'historia': '📜',
      'geografía': '🗺️',
      'literatura': '📚',
      'idiomas': '🗣️',
      'inglés': '🇬🇧',
      'arte': '🎨',
      'música': '🎵',
      'educación física': '🏃',
      'deportes': '⚽',
      'filosofía': '🧠',
      'psicología': '🧩',
      'economía': '💰',
      'contabilidad': '📊',
      'medicina': '⚕️',
      'enfermería': '🩺',
      'arquitectura': '🏛️',
      'ingeniería': '⚙️',
      'comunicación': '📱',
      'periodismo': '📰',
      'diseño': '✏️',
      'cocina': '👨‍🍳',
      'agronomía': '🌱',
      'veterinaria': '🐾',
      'mecánica': '🔧',
      'electrónica': '🔌',
      'estadística': '📈',
      'lógica': '🔢',
      'programación': '👨‍💻',
      'redes': '🌐',
      'inteligencia artificial': '🤖',
    };

    for (const [key, icon] of Object.entries(iconosPorArea)) {
      if (nombreNormalizado.includes(key)) {
        return icon;
      }
    }
    return '🔬';
  };


  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const areasDesdeAPI = await getAllAreasLibre(true);
        const areasConIconos = areasDesdeAPI.map(area => ({
          nombre: area.name,
          icono: asignarIcono(area.name)
        }));
        setAreas(areasConIconos);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
        setAreas([
          { nombre: "Matemáticas", icono: "➗" },
          { nombre: "Física", icono: "⚛️" },
          { nombre: "Química", icono: "🧪" },
          { nombre: "Biología", icono: "🧫" }
        ]);
      }
    };
    
    cargarAreas();
  }, []);

  useEffect(() => {
    const container = detalleRef.current;
    if (!container) return;

    let currentIndex = 0;
    const itemCount = container.children.length;

    const scrollToIndex = (index) => {
      const itemWidth = container.offsetWidth;
      container.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      });
    };

    const autoScroll = setInterval(() => {
      currentIndex = (currentIndex + 1) % itemCount;
      scrollToIndex(currentIndex);
    }, 3000); // cada 3 segundos

    return () => clearInterval(autoScroll);
  }, []);
  // Datos dinámicos de la olimpiada
  const olimpiadaActual = {
    nombre: "Olimpiada en Ciencias y Tecnología",
    subtitulo: "Oh! SanSi",
    descripcion:
      "Plataforma oficial de inscripción para las Olimpiadas Científicas de la Universidad Mayor de San Simón.",
    imagenPortada: "/src/assets/images/Estudents.png",
    fechaLimiteInscripcion: "30 de junio de 2025",
    fechaInicio: "15 de abril de 2025",
    fechaFin: "30 de junio de 2025",
    cupoMinimo: 50,
    modalidad: "Presencial",
    detallePDF: "/documentos/detalle_olimpiada.pdf",
    areas: areas,
  };

  return (
    <div className="inicio-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-texto">
          <h1>{olimpiadaActual.nombre}</h1>
          <h2>{olimpiadaActual.subtitulo}</h2>
          <p>{olimpiadaActual.descripcion}</p>
          <div className="hero-botones">
            <button
              className="btn-primario"
              onClick={() => navigate("/user/inscripcion")}
            >
              Inscríbete ahora
            </button>
            <button 
              className="btn-secundario"
              onClick={() => areasRef.current.scrollIntoView({ behavior: 'smooth' })}
            >
              Conoce las áreas
            </button>
          </div>
        </div>
        <div className="hero-imagen">
          <img
            src={"https://i.imgur.com/xGYenCL.png"}
            alt="Estudiantes"
            width={500}
          />
        </div>
      </section>

      {/* BANNER */}
      <div className="banner-inscripcion">
        ¡Inscripciones abiertas hasta el{" "}
        <strong>{olimpiadaActual.fechaLimiteInscripcion}</strong>!{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/user/inscripcion");
          }}
        >
          Inscríbete aquí
        </a>
      </div>

      <section className="detalle-olimpiada">
        <h2 className="titulo-seccion">Procedimiento de Inscripción</h2>
        
        <div className="procedimiento-marco">
          <div className="video-explicacion-container">
            <div className="video-side">
              <div className="video-wrapper">
                <VideoPlayer 
                  width="100%" 
                  height="100%" 
                />
              </div>
            </div>
            
            <div className="explicacion-side">
              <h3 className="pasos-titulo">Sigue los pasos para inscribirte</h3>
              <ol className="pasos-inscripcion">
                <li>Regístrate con tu información personal</li>
                <li>Selecciona una olimpiada para inscribirte</li>
                <li>Selecciona si es una inscripcion individual o grupal</li>
                <li>Llena los datos requeridos del formulario</li>
                <li>Selecciona las areas y niveles de competencia</li>
                <li>Genera tu boleta, realiza el pago y confirma tu inscripción</li>
              </ol>
              <button 
                className="btn-primario"
                onClick={() => navigate("/user/inscripcion")}
              >
                Comenzar Inscripción
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* BENEFICIOS */}
      <section className="beneficios-section">
        <h2 className="titulo2">Un proceso de inscripción simplificado</h2>
        <p className="parrafo2">
          Nuestra plataforma facilita la inscripción de estudiantes a las
          olimpiadas científicas con un proceso intuitivo y eficiente.
        </p>
        <div className="beneficios-grid">
          <div className="beneficio">
            <span>👥</span>
            <h3>Inscripción Sencilla</h3>
            <p className="parrafoBeneficio">
              Inscribe estudiantes de forma individual o masiva con nuestro
              sistema intuitivo.
            </p>
          </div>
          <div className="beneficio">
            <span>💳</span>
            <h3>Pagos Automatizados</h3>
            <p className="parrafoBeneficio">
              Genera boletas de pago y verifica comprobantes de forma rápida y
              segura.
            </p>
          </div>
 {/* 
          <div className="beneficio">
            <span>📊</span>
            <h3>Reportes Detallados</h3>
            <p className="parrafoBeneficio">
              Accede a informes completos sobre inscripciones, pagos y
              participación.
            </p>
          </div>
*/}

          <div
            className="beneficio"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/user/mis-inscripciones")}
          >
            <span>📊</span>
            <h3>Reportes Detallados</h3>
            <p className="parrafoBeneficio">
              Accede a informes completos sobre inscripciones, pagos y participación.
            </p>
          </div>



        </div>
      </section>

      {/* ÁREAS DE COMPETENCIA */}
      <section className="areas-section" ref={areasRef}>
        <h2 className="titulo2">Áreas de competencia</h2>
        <p className="parrafo2">
          Las olimpiadas abarcan diversas disciplinas científicas para
          estudiantes de todos los niveles.
        </p>
        <div className={`areas-grid ${mostrarTodasAreas ? 'areas-grid-expanded' : ''}`}>
          {(mostrarTodasAreas ? olimpiadaActual.areas : olimpiadaActual.areas.slice(0, window.innerWidth <= 576 ? 3 : 6)).map((area) => (
            <div key={area.nombre} className="area-card">
              <span className="area-icon">{area.icono}</span>
              <h3>
                {area.nombre.includes('o') || area.nombre.length > 12 
                  ? area.nombre.replace(/o|y|\//, (match) => match === 'o' ? ' o ' : match === 'y' ? ' y ' : ' / ')
                  : area.nombre}
              </h3>
            </div>
          ))}
        </div>
        {olimpiadaActual.areas.length > (window.innerWidth <= 576 ? 3 : 6) && (
          <button 
            className="btn-primario mt-32" 
            onClick={() => setMostrarTodasAreas(!mostrarTodasAreas)}
          >
            {mostrarTodasAreas ? "Mostrar menos áreas" : "Ver todas las áreas"}
          </button>
        )}
      </section>

      {/* PARTICIPACIÓN */}
      <section className="participacion">
        <h2>¿Listo para participar en las olimpiadas?</h2>
        <p>
          No pierdas la oportunidad de demostrar tus conocimientos y representar
          a tu institución en las Olimpiadas Científicas Oh! SanSi.
        </p>
        <div className="participacion-botones">
          <button
            className="btn-primario"
            onClick={() => navigate("/user/inscripcion")}
          >
            Comenzar Inscripción
          </button>
          <button className="btn-secundario">Contactar soporte</button>
        </div>
      </section>
    </div>
  );
};
export default Inicio;
