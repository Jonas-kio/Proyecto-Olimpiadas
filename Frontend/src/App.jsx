import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AreasConfig from './pages/config/AreasConfig';
import './styles/global.css';
import NivelesYCategorias from './pages//config/NivelesYCategorias';
import Costos from './pages//config/Costos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/config/areas" element={<AreasConfig />} />
        {/* Otras rutas de configuración podrían agregarse aquí */}
        <Route path="/" element={<Navigate to="/config/areas" replace />} />
        <Route path="/config/niveles-categorias" element={<NivelesYCategorias />} />
        <Route path="/config/Costos" element={<Costos />} />
      </Routes>
    </Router>
  );
}

export default App;