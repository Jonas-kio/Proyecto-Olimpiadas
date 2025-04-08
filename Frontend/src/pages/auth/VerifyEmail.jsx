import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/apiConfig';
import '../../styles/components/Auth.css';

const VerifyEmail = () => {
  const [verificationState, setVerificationState] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();

  // Verificar el token si viene como parámetro de ruta
  useEffect(() => {
    const verifyEmailToken = async () => {
      // Si tenemos un token en la URL, intentamos verificarlo
      if (token) {
        try {
          await api.post('/auth/verify-email', { token });
          setVerificationState('success');
        } catch (error) {
          setVerificationState('error');
          if (error.response && error.response.data) {
            setErrorMessage(error.response.data.message || 'Error al verificar el correo.');
          } else {
            setErrorMessage('Error de conexión con el servidor.');
          }
        }
      } else {
        // Si no hay token, simplemente mostramos la pantalla de verificación pendiente
        const email = location.state?.email;
        if (!email) {
          navigate('/login');
        }
      }
    };

    verifyEmailToken();
  }, [token, navigate, location.state]);

  const renderContent = () => {
    switch (verificationState) {
      case 'success':
        return <VerificationSuccess />;
      case 'error':
        return <VerificationFailed message={errorMessage} />;
      default:
        return <VerifyingEmail email={location.state?.email} />;
    }
  };

  return renderContent();
};

// Componente para mostrar el estado de verificación en curso
const VerifyingEmail = ({ email }) => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Confirmación de Correo</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <div className="loading-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px', borderColor: 'rgba(66, 133, 244, 0.3)', borderTopColor: '#4285f4' }}></div>
          </div>
          
          <p className="auth-subtitle">Verificando tu correo electrónico</p>
          <p className="auth-subtitle">Por favor espera mientras confirmamos tu cuenta...</p>
          
          {email && (
            <div className="auth-footer">
              <p>Hemos enviado un correo electrónico a <strong>{email}</strong> con un enlace de verificación.</p>
              <p>Por favor revisa tu bandeja de entrada y haz clic en el enlace para confirmar tu cuenta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar verificación exitosa
const VerificationSuccess = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Confirmación de Correo</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#E6F7ED" stroke="#34C759" strokeWidth="4" />
              <path d="M25 40 L35 50 L55 30" stroke="#34C759" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <p className="auth-subtitle">¡Correo verificado exitosamente!</p>
          <p className="auth-subtitle">Tu cuenta ha sido verificada. Ya puedes acceder a la plataforma.</p>
          
          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <Link to="/login" className="auth-button">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar verificación fallida
const VerificationFailed = ({ message }) => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Confirmación de Correo</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#FFEBEE" stroke="#FF3B30" strokeWidth="4" />
              <path d="M30 30 L50 50" stroke="#FF3B30" strokeWidth="4" strokeLinecap="round" />
              <path d="M50 30 L30 50" stroke="#FF3B30" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          
          <p className="auth-subtitle">Ha ocurrido un error</p>
          <p className="error-message" style={{ textAlign: 'center' }}>{message || 'No se ha podido verificar tu correo electrónico.'}</p>
          
          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <Link to="/login" className="auth-button">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;