import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Auth.css';

const NotFound = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Página no encontrada</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <text x="20" y="80" fontFamily="Arial" fontSize="80" fontWeight="bold" fill="#1a56db">404</text>
            </svg>
          </div>
          
          <p className="auth-subtitle">Lo sentimos, la página que buscas no existe.</p>
          
          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <Link to="/" className="auth-button">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;