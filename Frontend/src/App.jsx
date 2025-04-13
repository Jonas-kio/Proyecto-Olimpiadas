// src/App.jsx
import React, { useState } from "react";
import AppUsuario from "./AppUsuario";
import AppAdmin from "./AppAdmin";
import "./App.css";


const App = () => {
  const [modoSeleccionado, setModoSeleccionado] = useState(null);

  if (modoSeleccionado === "usuario") return <AppUsuario />;
  if (modoSeleccionado === "admin") return <AppAdmin />;

  // Pantalla de selección
  return (
    <div className="selector-container">
      <h1 className="titulo">Bienvenido(Login chafa)</h1>
      <button
        className="selector-btn"
        onClick={() => setModoSeleccionado("usuario")}
      >
        Usuarios
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
