import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/apiConfig';
import '../../styles/components/Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Verificar validez del token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        await api.get(`/auth/verify-reset-token/${token}`);
      } catch (error) {
        setTokenValid(false);
        setErrors({
          general: 'El enlace de restablecimiento de contraseña no es válido o ha expirado.'
        });
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar el error del campo que se está editando
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'La confirmación de contraseña es obligatoria';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', {
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Redireccionar después de unos segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (error.response && error.response.data) {
        // Manejar errores específicos del servidor
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: error.response.data.message || 'Error al restablecer la contraseña' });
        }
      } else {
        setErrors({ general: 'Error al conectar con el servidor' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-circle">
                <span className="logo-text">O!</span>
              </div>
            </div>
            <h1 className="auth-title">Enlace Inválido</h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" fill="#FFEBEE" stroke="#FF3B30" strokeWidth="4" />
                <path d="M30 30 L50 50" stroke="#FF3B30" strokeWidth="4" strokeLinecap="round" />
                <path d="M50 30 L30 50" stroke="#FF3B30" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            
            <p className="error-message" style={{ textAlign: 'center' }}>
              {errors.general || 'El enlace de restablecimiento de contraseña no es válido o ha expirado.'}
            </p>
            
            <div className="auth-footer" style={{ marginTop: '2rem' }}>
              <Link to="/recuperar-contrasena" className="auth-button">
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Restablecer Contraseña</h1>
          <p className="auth-subtitle">Ingresa tu nueva contraseña</p>
          
          {success ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="38" fill="#E6F7ED" stroke="#34C759" strokeWidth="4" />
                  <path d="M25 40 L35 50 L55 30" stroke="#34C759" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              <p className="success-message" style={{ textAlign: 'center' }}>
                ¡Tu contraseña ha sido actualizada con éxito!
              </p>
              <p className="auth-subtitle">
                Serás redirigido a la página de inicio de sesión...
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {errors.general && <div className="error-message">{errors.general}</div>}
              
              <div className="form-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
                {errors.password_confirmation && <div className="error-message">{errors.password_confirmation}</div>}
              </div>
              
              <button 
                type="submit" 
                className="auth-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;