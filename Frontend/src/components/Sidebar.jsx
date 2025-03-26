import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
    return (
      <aside className="sidebar">
        <h2>Oh! SanSi</h2>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/configuracion">Configuración</Link></li>
            <li><Link to="/reportes">Reportes</Link></li>
            <li><Link to="/participantes">Participantes</Link></li>
          </ul>
        </nav>
      </aside>
    );
  };
  
  export default Sidebar;