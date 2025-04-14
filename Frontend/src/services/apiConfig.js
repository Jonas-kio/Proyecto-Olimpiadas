import axios from "axios";

// Configura la URL base de la API
const API_URL = "http://localhost:8000/api";

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para manejar tokens de autenticación si es necesario
// Comentado ya que no se maneja autenticación todavía
/*
api.interceptors.request.use(
  (config) => {
    // Aquí puedes añadir el token de autenticación si lo tienes
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Versión simplificada que solo registra el error
    console.error("Error en la petición API:", error.message);
    return Promise.reject(error);
  }
);
// ✅ FUNCIONES DE INSCRIPCIÓN

export const inscripcionCompetidor = async (formulario) => {
  return await api.post("/inscripcion/competidor", formulario);
};

export const inscripcionTutor = async (formularioTutor) => {
  return await api.post("/inscripcion/tutor", formularioTutor);
};

export const inscripcionArea = async () => {
  return await api.get("/inscripcion/area");
};

export default api;
