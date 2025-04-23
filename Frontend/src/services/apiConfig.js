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

// Interceptor para manejar tokens de autenticación
api.interceptors.request.use(
  (config) => {
    // Añadir el token de autenticación si existe
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo global de errores
    console.error("Error en la petición API:", error.message);

    // Si el error es 401 (no autorizado), probablemente el token expiró
    if (error.response && error.response.status === 401) {
      // Verificar si estamos en una ruta de autenticación
      const authPaths = [
        "/auth/login",
        "/auth/register",
        "/auth/recover-password",
        "/auth/reset-password",
      ];
      const isAuthRoute = authPaths.some((path) =>
        error.config.url.includes(path)
      );

      if (!isAuthRoute) {
        console.log("Sesión expirada. Redirigiendo al login...");
        // Limpiar datos de autenticación
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");

        // Redirigir al login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
//FUNCIONES DE INSCRIPCIÓN INDIVIDUAL

export const inscripcionCompetidor = async (formulario) => {
  return await api.post("/inscripcion/competidor", formulario);
};

export const inscripcionTutor = async (formularioTutor) => {
  return await api.post("/inscripcion/tutor", formularioTutor);
};

export const inscripcionArea = async () => {
  return await api.get("/inscripcion/area");
};

export const inscripcionCategoryLevel = async () => {
  return await api.get("/categoryLevelUser");
};

// export const obtenerCategoriasPorArea = async (areaId) => {
//   return await api.get(`/categoryLevelUser?area_id=${areaId}`);
// };
export default api;
