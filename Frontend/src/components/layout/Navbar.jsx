import "../../styles/components/Navbar.css";
import React, { useState } from "react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => {
    setMenuAbierto((prev) => !prev);
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const handleScrollToAreas = () => {
    if (location.pathname === "/Inicio") {
      const seccion = document.querySelector(".areas-section");
      if (seccion) {
        seccion.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/Inicio");
      setTimeout(() => {
        const seccion = document.querySelector(".areas-section");
        if (seccion) {
          seccion.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    cerrarMenu();
  };

  const handleScrollToFooter = () => {
    if (location.pathname === "/Inicio") {
      const footer = document.querySelector("footer");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/Inicio");
      setTimeout(() => {
        const footer = document.querySelector("footer");
        if (footer) {
          footer.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    cerrarMenu();
  };

  return (
    <nav className={`navbar ${menuAbierto ? "show" : ""}`}>
      <div className="navbar-left">
        <div className="logo-circle">O!</div>
        <span className="logo-text">Oh! SanSi</span>
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <div className="navbar-center">
        <a href="#" onClick={() => { navigate("/Inicio"); cerrarMenu(); }}>Inicio</a>
        <a href="#" onClick={handleScrollToAreas}>Áreas</a>
        <a href="#" onClick={() => { navigate("/Inscripcion"); cerrarMenu(); }}>Inscripción</a>
        <a href="#" onClick={handleScrollToFooter}>Contacto</a>
      </div>

      <div className="navbar-right">
        <button className="btn login-btn" onClick={cerrarMenu}>
          <FaSignInAlt className="icon" /> Ingresar
        </button>
        <button className="btn register-btn" onClick={cerrarMenu}>
          <FaUserPlus className="icon" /> Registrarse
        </button>
      </div>

      {/* Menú desplegable móvil */}
      <div className="navbar-responsive">
        <a href="#" onClick={() => { navigate("/Inicio"); cerrarMenu(); }}>Inicio</a>
        <a href="#" onClick={handleScrollToAreas}>Áreas</a>
        <a href="#" onClick={() => { navigate("/Inscripcion"); cerrarMenu(); }}>Inscripción</a>
        <a href="#" onClick={handleScrollToFooter}>Contacto</a>
        <div className="responsive-btn-group">
          <button className="btn login-btn" onClick={cerrarMenu}>
            <FaSignInAlt className="icon" /> Ingresar
          </button>
          <button className="btn register-btn" onClick={cerrarMenu}>
            <FaUserPlus className="icon" /> Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
