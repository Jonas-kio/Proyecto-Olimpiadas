
import { Link } from "react-router-dom";
import { LayoutGrid, Settings, FileText, Users, LogOut } from 'lucide-react';
import "../styles/Sidebar.css"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-circle">O!</div>
        <span className="logo-text">Oh! SanSi</span>
      </div>
      
      <div className="user-container">
        <div className="user-avatar"></div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-role">Administrador</div>
        </div>
      </div>
      
      <nav className="nav-menu">
        <ul>
          <li>
            <Link to="/dashboardAdmin" className="nav-item">
              <LayoutGrid size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/configuracion" className="nav-item active">
              <Settings size={20} />
              <span>Configuración</span>
            </Link>
          </li>
          <li>
            <Link to="/reportes" className="nav-item">
              <FileText size={20} />
              <span>Reportes</span>
            </Link>
          </li>
          <li>
            <Link to="/participantes" className="nav-item">
              <Users size={20} />
              <span>Participantes</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="logout-container">
        <Link to="/logout" className="logout-button">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
