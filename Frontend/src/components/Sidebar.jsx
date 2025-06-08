import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Settings, FileText, Users, LogOut, Trophy, ReceiptIcon} from 'lucide-react';
import { FaRegUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const currentPath = location.pathname;

  const [activeItem, setActiveItem] = useState("dashboard");
  
  useEffect(() => {

    if (currentPath === "/" || currentPath === "/app") {

      setActiveItem("dashboard");
    }
  }, []); 
  
  useEffect(() => {
    console.log("Ruta actual:", currentPath);
    
    if (currentPath === "/" || currentPath === "/app" || currentPath === "/app/homeAdmin" || currentPath === "/app/dashboard") {
      setActiveItem("dashboard");
    } else if (currentPath.includes("/app/dasboardOlimpiada")) {
      setActiveItem("dasboardOlimpiada");
    } else if (currentPath.includes("/app/configuracion")) {
      setActiveItem("configuracion");
    } else if (currentPath.includes("/app/reportes")) {
      setActiveItem("reportes");
    } else if (currentPath.includes("/app/boletas")) {
      setActiveItem("boletas");
    } else if (currentPath.includes("/app/participantes")) {
      setActiveItem("participantes");
    }
  }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-circle">O!</div>
        <span className="logo-text">Oh! SanSi</span>
      </div>
      
      <div className="user-container">
        <div className="user-avatar"><FaRegUserCircle size={24} /></div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-role">Administrador</div>
        </div>
      </div>
      
      <nav className="nav-menu">
        <ul>
          <li>
            <Link 
              to="/app/homeAdmin" 
              className={`nav-item ${activeItem === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveItem("dashboard")}
            >
              <LayoutGrid size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/app/dasboardOlimpiada" 
              className={`nav-item ${activeItem === "dasboardOlimpiada" ? "active" : ""}`}
              onClick={() => setActiveItem("dasboardOlimpiada")}
            >
              <Trophy size={20} />
              <span>Crear Olimpiada</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/app/configuracion" 
              className={`nav-item ${activeItem === "configuracion" ? "active" : ""}`}
              onClick={() => setActiveItem("configuracion")}
            >
              <Settings size={20} />
              <span>Configuración</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/app/reportes" 
              className={`nav-item ${activeItem === "reportes" ? "active" : ""}`}
              onClick={() => setActiveItem("reportes")}
            >
              <FileText size={20} />
              <span>Reportes</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/app/boletas" 
              className={`nav-item ${activeItem === "boletas" ? "active" : ""}`}
              onClick={() => setActiveItem("boletas")}
            >
              <ReceiptIcon size={20} />
              <span>Boletas</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="logout-container">
        {/* Mantenemos el Link pero añadimos onClick para manejar el logout */}
        <Link 
          to="/" 
          className="logout-button" 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;