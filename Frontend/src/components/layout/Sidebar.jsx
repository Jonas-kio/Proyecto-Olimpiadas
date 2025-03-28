

import React from 'react';
import { LayoutGrid, Settings, FileText, Users, LogOut } from 'lucide-react';
import '../../styles/components/Sidebar.css';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

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
        <a href="#" className="nav-item">
          <LayoutGrid size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item active">
          <Settings size={20} />
          <span>Configuración</span>
        </a>
        
        <Link to="/reportes" className="nav-item">
        <FileText size={20} />
        <span>Reportes</span>
         </Link>

        <a href="#" className="nav-item">
          <Users size={20} />
          <span>Participantes</span>
        </a>
      </nav>
      
      <div className="logout-container">
        <a href="#" className="logout-button">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
