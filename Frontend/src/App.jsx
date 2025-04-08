// src/App.jsx
import React, { useState } from "react";
import AppUsuario from "./AppUsuario";
import AppAdmin from "./AppAdmin";
import "./App.css";

const App = () => {
  const [modoSeleccionado, setModoSeleccionado] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginExitoso, setLoginExitoso] = useState(false);

  const handleLogin = () => {
    // Login improvisado
    if (email === "usuario@gmail.com" && password === "usuario123") {
      setLoginExitoso(true);
      setModoSeleccionado("usuario");
    } else {
      alert("Credenciales incorrectas.");
    }
  };

  if (modoSeleccionado === "usuario" && loginExitoso) return <AppUsuario />;
  if (modoSeleccionado === "admin") return <AppAdmin />;

  return (
    <div className="selector-container">
      <h1 className="titulo">Bienvenido</h1>
      <p>email "usuario@gmail.com" password "usuario123"</p>
      <input
        type="email"
        placeholder="Correo"
        className="login-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="login-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="selector-btn" onClick={handleLogin}>
        Iniciar Sesión
      </button>

      <button
        className="selector-btn"
        onClick={() => setModoSeleccionado("admin")}
      >
        Administrador
      </button>
    </div>
  );
};

export default App;
