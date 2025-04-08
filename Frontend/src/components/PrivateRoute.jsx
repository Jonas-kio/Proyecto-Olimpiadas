import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para proteger rutas que requieren rol de administrador
const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'admin') {
    // Redirigir a una página de acceso denegado o al dashboard del usuario
    return <Navigate to="/user" replace />;
  }
  
  return children;
};

// Exportar ambos componentes
export { PrivateRoute, AdminRoute };