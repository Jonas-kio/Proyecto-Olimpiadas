import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import '../../styles/components/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Comprobar si hay un mensaje o email desde la página de registro
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }));
    }
  }, [location.state]);

  // Comprobar si hay un email guardado al cargar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        remember: true
      }));
    }
  }, []);

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
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };
      
      const response = await loginUser(credentials);
      
      // Si el usuario marcó "recordarme", guardar el email
      if (formData.remember) {
        localStorage.setItem('userEmail', formData.email);
      } else {
        localStorage.removeItem('userEmail');
      }
      
      // Redireccionar según el rol del usuario
      const userRole = response.user.role.toLowerCase();
      
      if (userRole === 'admin') {
        console.log('Redirigiendo a admin dashboard');
        // Este es el cambio clave - redirige a /app
        navigate('/app');
      } else {
        console.log('Redirigiendo a user dashboard');
        navigate('/user');
      }
    } catch (error) {
      setErrors({ general: error.message || 'Error al iniciar sesión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div 
        className="auth-image" 
        style={{ 
          backgroundImage: "url('/public/login2.jpg')" 
        }}
      />
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-text">O!Sansi</span>
            </div>
          </div>
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Accede a la plataforma de Olimpiadas Oh! SanSí</p>
          
          {success && <div className="success-message">{success}</div>}
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <form className="auth-form" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="auth-checkbox">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember">Recordarme</label>
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            
            <div className="auth-links">
              <Link to="/recuperar-contrasena" className="auth-link">¿Olvidaste tu contraseña?</Link>
            </div>
          </form>
          
          <div className="auth-footer">
            <p>¿No tienes una cuenta? <Link to="/registrar" className="auth-link">Crear cuenta nueva</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;