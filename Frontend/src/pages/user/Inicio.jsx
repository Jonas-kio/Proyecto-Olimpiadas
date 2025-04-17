import "../../styles/components/Inicio.css";
import { useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();
  // Dentro del componente Inicio
  const detalleRef = useRef(null);

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
    areas: [
      { nombre: "Matemáticas", icono: "➗" },
      { nombre: "Física", icono: "🧬" },
      { nombre: "Química", icono: "🧪" },
      { nombre: "Biología", icono: "🧫" },
      { nombre: "Informática", icono: "💻" },
      { nombre: "Astronomía", icono: "🔭" },
      { nombre: "Robótica", icono: "🤖" },
      { nombre: "Ciencias Sociales", icono: "🌍" },
    ],
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
            <button className="btn-secundario">Conoce las áreas</button>
          </div>
        </div>
        <div className="hero-imagen">
          <img
            src={olimpiadaActual.imagenPortada}
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
        <h2>Detalles de la Olimpiada</h2>
        <div className="detalle-scroll" ref={detalleRef}>
          {[
            {
              label: "Fecha de inicio",
              valor: olimpiadaActual.fechaInicio,
              img: "/src/assets/images/fechaInicio.jpg",
            },
            {
              label: "Fecha de fin",
              valor: olimpiadaActual.fechaFin,
              img: "/src/assets/images/fechaFin.jpg",
            },
            {
              label: "Cupo mínimo",
              valor: `${olimpiadaActual.cupoMinimo} participantes`,
              img: "/src/assets/images/cupoMinimo.png",
            },
            {
              label: "Modalidad",
              valor: olimpiadaActual.modalidad,
              img: "/src/assets/images/modalidad.webp",
            },
          ].map((item, index) => (
            <div className="detalle-item" key={index}>
              <img src={item.img} alt={item.label} />
              <p>
                <strong>{item.label}:</strong> {item.valor}
              </p>
            </div>
          ))}
        </div>

        <a
          href={olimpiadaActual.detallePDF}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secundario link-detalle-pdf"
        >
          📄 Ver detalles de la olimpiada (PDF)
        </a>
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
  onClick={() => navigate("/mis-inscripciones")}
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
      <section className="areas-section">
        <h2 className="titulo2">Áreas de competencia</h2>
        <p className="parrafo2">
          Las olimpiadas abarcan diversas disciplinas científicas para
          estudiantes de todos los niveles.
        </p>
        <div className="areas-grid">
          {olimpiadaActual.areas.map((area) => (
            <div key={area.nombre} className="area-card">
              <span className="area-icon">{area.icono}</span>
              <h3>{area.nombre}</h3>
            </div>
          ))}
        </div>
        <button className="btn-primario mt-32">
          Ver todas las áreas y categorías
        </button>
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
