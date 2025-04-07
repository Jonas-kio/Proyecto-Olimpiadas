import "../../styles/components/Inicio.css";
import React from "react";
// import Estudents from "../assets/images/Estudents.png";
// import "./styles/Inicio.css";

import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();
  return (
    <div className="inicio-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-texto">
          <h1>Olimpiada en Ciencias y Tecnología</h1>
          <h2>Oh! SanSi</h2>
          <p>
            Plataforma oficial de inscripción para las Olimpiadas Científicas de
            la Universidad Mayor de San Simón.
          </p>
          <div className="hero-botones">
            <button
              className="btn-primario"
              onClick={() => navigate("/Inscripcion")}
            >
              Inscríbete ahora
            </button>
            <button className="btn-secundario">Conoce las áreas</button>
          </div>
        </div>
        <div className="hero-imagen">
          <img
            src="src/assets/images/Estudents.png"
            alt="Estudiantes"
            width={500}
          />
        </div>
      </section>

      {/* BANNER */}
      <div className="banner-inscripcion">
        ¡Inscripciones abiertas hasta el <strong>30 de junio de 2025</strong>!{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/inscripcion");
          }}
        >
          Inscríbete aquí
        </a>
      </div>

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
          <div className="beneficio">
            <span>📊</span>
            <h3>Reportes Detallados</h3>
            <p className="parrafoBeneficio">
              Accede a informes completos sobre inscripciones, pagos y
              participación.
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
          {[
            { nombre: "Matemáticas", icono: "➗" },
            { nombre: "Física", icono: "🧬" },
            { nombre: "Química", icono: "🧪" },
            { nombre: "Biología", icono: "🧫" },
            { nombre: "Informática", icono: "💻" },
            { nombre: "Astronomía", icono: "🔭" },
            { nombre: "Robótica", icono: "🤖" },
            { nombre: "Ciencias Sociales", icono: "🌍" },
          ].map((area) => (
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
            onClick={() => navigate("/inscripcion")}
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
