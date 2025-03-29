import React from "react";
import { Routes, Route } from "react-router-dom";
import Configuracion from "../pages/Configuracion";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/configuracion" element={<Configuracion />} />
      {/* Aqui pondremos el resto de accesos o rutas al dashboard ,etc */}
    </Routes>
  );
};

export default AppRouter;
