import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import "./index.css";


// Importar componentes de autenticación
import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Importar componentes de protección de rutas
import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";

// Componente contenedor principal con todas las rutas
const MainRouter = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Register />} />
      
      {/* Rutas regulares de la aplicación - protegidas con AdminRoute */}
      <Route path="/app/*" element={
        <AdminRoute>
          <App />
        </AdminRoute>
      } />
      
      {/* Ruta principal - redirige al login si no hay sesión, o a la app si hay sesión */}
      <Route path="/" element={
        localStorage.getItem('token') 
          ? <Navigate to="/app" replace /> 
          : <Navigate to="/login" replace />
      } />
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MainRouter />
    </BrowserRouter>
  </React.StrictMode>
);