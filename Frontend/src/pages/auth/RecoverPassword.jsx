import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/apiConfig';
import '../../styles/components/Auth.css';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Limpiar errores al escribir
    if (errors.email || errors.general) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar email
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await api.post('/auth/recover-password', { email });
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Limpiar el formulario
      setEmail('');
      
      // Opcional: Redirigir después de unos segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      if (error.response && error.response.data) {
        // Manejar errores específicos del servidor
        if (error.response.data.errors && error.response.data.errors.email) {
          setErrors({ email: error.response.data.errors.email });
        } else {
          setErrors({ general: error.response.data.message || 'Error al enviar las instrucciones' });
        }
      } else {
        setErrors({ general: 'Error al conectar con el servidor' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Recuperar Contraseña</h1>
          <p className="auth-subtitle">Te enviaremos instrucciones para recuperar tu contraseña</p>
          
          {success ? (
            <div>
              <div className="success-message">
                <p>¡Hemos enviado las instrucciones a tu correo electrónico!</p>
                <p>Por favor, revisa tu bandeja de entrada y sigue los pasos indicados.</p>
              </div>
              <div className="auth-footer">
                <Link to="/login" className="auth-button">
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {errors.general && <div className="error-message">{errors.general}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={handleChange}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              
              <button 
                type="submit" 
                className="auth-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Enviando instrucciones...</span>
                  </>
                ) : (
                  'Enviar Instrucciones'
                )}
              </button>
              
              <div className="auth-footer">
                <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;