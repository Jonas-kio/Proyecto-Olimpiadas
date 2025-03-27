import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css"; // Importa el CSS

const Sidebar = () => {
    return (
        <aside className="sidebar">
          <h2 className="sidebar-title">Oh! SanSi</h2>
          <div className="sidebar-user">
            <p className="sidebar-username">Admin User</p>
            <p className="sidebar-role">Administrador</p>
          </div>
          <nav>
            <ul>
              
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/configuracion">Configuración</Link></li>
              <li><Link to="/reportes">Reportes</Link></li>
              <li><Link to="/participantes">Participantes</Link></li>
              
              
            </ul>
          </nav>
          <button className="logout-button">Cerrar Sesión</button>
        </aside>
      );
   
   
   /*
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
    */
};

export default Sidebar;
