import "../../styles/components/Navbar.css";
import React from "react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-circle">O!</div>
        <span className="logo-text">Oh! SanSi</span>
      </div>

      <div className="navbar-center">
        <a href="#" onClick={() => navigate("/Inicio")}>
          Inicio
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleScrollToAreas();
          }}
        >
          Áreas
        </a>
        <a href="#" onClick={() => navigate("/Inscripcion")}>
          Inscripción
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleScrollToFooter();
          }}
        >
          Contacto
        </a>
      </div>

      <div className="navbar-right">
        <button className="btn login-btn" onClick={() => navigate("/Login")}>
          <FaSignInAlt className="icon" /> Ingresar
        </button>
        <button className="btn register-btn">
          <FaUserPlus className="icon" /> Registrarse
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
