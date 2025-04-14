// src/AppUsuario.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Inicio from "./pages/user/Inicio";

import Inscripcion from "./pages/user/Inscripcion";
import InscripcionIndividual from "./pages/user/InscripcionIndividual";

const AppUsuario = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />

        <Route path="/Inscripcion" element={<Inscripcion />} />
        <Route
          path="/InscripcionIndividual"
          element={<InscripcionIndividual />}
        />
      </Routes>
      <Footer />
    </>
  );
};

export default AppUsuario;
