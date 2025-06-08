import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet  } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import "./index.css";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

import Navbar from "./components/layout/Navbar.jsx";
import Inicio from "./pages/user/Inicio.jsx";

import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";
import AppUsuario from "./AppUsuario.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/common/ScrollToTop";



// eslint-disable-next-line react-refresh/only-export-components
const MainRouter = () => {

  return (
    <Routes>
      {/* Wrap routes in Layout component */}
      <Route element={<Layout />}>
        {/* Página de inicio pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
      </Route>

        {/* Ruta para el panel de administrador - requiere rol admin */}
        <Route path="/app/*" element={
          <AdminRoute>
            <App />
          </AdminRoute>
        } />
        
        {/* Ruta para usuarios regulares */}
        <Route path="/user/*" element={
          <PrivateRoute>
            <AppUsuario />
          </PrivateRoute>
        } />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      
    </Routes>
    

  );
};

// eslint-disable-next-line react-refresh/only-export-components
const LandingPage = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userRole = localStorage.getItem('userRole');

  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <Navigate to="/app" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return (
    <>
      <Inicio />
      <Footer />
    </>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
const Layout = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return (
    <>
      {!isAuthenticated && <Navbar />}
      <Outlet />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <ScrollToTop />
      <MainRouter />
    </BrowserRouter>
  </React.StrictMode>
);