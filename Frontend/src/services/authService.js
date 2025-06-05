// src/services/authService.js
import api from './apiConfig';

export const loginUser = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      
      console.log('Respuesta del backend:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const userRole = response.data.user.role;
        console.log('Rol del usuario:', userRole);
        localStorage.setItem('userRole', userRole);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          expiresIn: response.data.expires_in
        };
      } else {
        throw new Error(response.data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en loginUser (completo):', error);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Error al iniciar sesión');
      }
      
      throw error;
    }
  };

export const registerUser = async (userData) => {
    try {
      const backendData = {
        full_name: userData.nombre,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation
      };
      
      console.log('Datos enviados al backend:', backendData);
      
      const response = await api.post('/register', backendData);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: 'Usuario registrado correctamente'
        };
      } else {
        throw new Error(response.data.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en registerUser:', error);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Error al registrar usuario');
      }
      
      throw error;
    }
  };

export const logoutUser = async () => {
  try {
    const response = await api.post('/logout');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    return {
      success: true,
      message: response.data.message || 'Sesión cerrada correctamente'
    };
  } catch (error) {
    console.error('Error en logoutUser:', error);
    
    // Aún así, limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    throw error;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    
    // Actualizar datos en localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    
    if (error.response && error.response.status === 401) {
      // Si no está autenticado, limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
    
    throw error;
  }
};

export const getCurrentUser = () => {
  const userJSON = localStorage.getItem('user');
  if (userJSON) {
    try {
      return JSON.parse(userJSON);
    } catch (error) {
      console.error('Error al parsear usuario del localStorage:', error);
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

export const hasRole = (role) => {
  const userRole = localStorage.getItem('userRole');
  return userRole === role;
};

export const isAdmin = () => {
  return hasRole('admin');
};