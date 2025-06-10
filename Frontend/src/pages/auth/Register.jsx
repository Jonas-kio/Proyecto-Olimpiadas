import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import '../../styles/components/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Validar nombre
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre completo es obligatorio';
    }
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
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
    
    // Validar términos y condiciones
    if (!formData.terms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await registerUser(formData);
      
      // Redireccionar al login después del registro exitoso
      navigate('/login', { 
        state: { 
          message: 'Cuenta creada correctamente. Por favor inicia sesión.',
          email: formData.email
        } 
      });
    } catch (error) {
      setErrors({ general: error.message || 'Error al registrar usuario' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
       <div 
        className="auth-image" 
        style={{ 
          backgroundImage: "url('https://i.imgur.com/C9LO4Yz.png')" 
        }}
      />
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!</span>
            </div>
          </div>
          <h1 className="auth-title">Crear Cuenta Nueva</h1>
          <p className="auth-subtitle">Únete a la plataforma de Olimpiadas Oh! SanSí</p>
          
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.nombre && <div className="error-message">{errors.nombre}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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
                autoComplete="new-password"
              />
              {errors.password_confirmation && <div className="error-message">{errors.password_confirmation}</div>}
            </div>
            
            <div className="auth-checkbox">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                Acepto los <Link to="/terminos-y-condiciones" className="auth-link">términos y condiciones</Link>
              </label>
            </div>
            {errors.terms && <div className="error-message">{errors.terms}</div>}
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Iniciar Sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;