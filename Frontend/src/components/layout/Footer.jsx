import React from "react";
import "../../styles/components/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-contenido">
        <div className="footer-col">
          <h3>Oh! SanSi</h3>
          <p>
            Sistema de inscripción para la Olimpiada en Ciencias y Tecnología de
            la Universidad Mayor de San Simón.
          </p>
        </div>

        <div className="footer-col">
          <h3>Enlaces</h3>
          <ul>
            <li>
              <a href="#">Inicio</a>
            </li>
            <li>
              <a href="#">Áreas de competencia</a>
            </li>
            <li>
              <a href="#">Proceso de inscripción</a>
            </li>
            <li>
              <a href="#">Contacto</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contacto</h3>
          <ul>
            <li>Universidad Mayor de San Simón</li>
            <li>Cochabamba, Bolivia</li>
            <li>
              Email:{" "}
              <a href="mailto:olimpiadas@umss.edu.bo">olimpiadas@umss.edu.bo</a>
            </li>
            <li>Teléfono: +591 4 4525252</li>
          </ul>
        </div>
      </div>

      <div className="footer-copy">
        © 2025 Oh! SanSi - Universidad Mayor de San Simón. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
