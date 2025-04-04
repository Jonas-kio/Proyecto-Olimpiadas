// Login.jsx
import React from "react";
// import "./styles/Login.css";
import "../../styles/components/Login.css";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-circle">O!</div>
        <h2>Iniciar Sesión</h2>
        <p className="subtitulo">
          Accede a la plataforma de Olimpiadas Oh! SanSi
        </p>
        <form className="login-form">
          <label>Correo Electrónico</label>
          <input type="email" placeholder="ejemplo@correo.com" required />

          <label>Contraseña</label>
          <input type="password" placeholder="********" required />

          <div className="login-opciones">
            <div className="recordarme">
              <input type="checkbox" id="recordarme" />
              <label htmlFor="recordarme">Recordarme</label>
            </div>
            <a href="#">&#191;Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn-login">
            <FaSignInAlt /> Iniciar Sesión
          </button>

          <div className="separador">
            <span>&#191;No tienes una cuenta?</span>
          </div>

          <a href="#" className="crear-cuenta">
            Crear cuenta nueva
          </a>
        </form>
      </div>
    </div>
  );
};

export default Login;
