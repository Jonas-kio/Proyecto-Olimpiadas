// src/AppUsuario.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Inicio from "./pages/user/Inicio";
import Login from "./pages/user/Login";
import Inscripcion from "./pages/user/Inscripcion";
import InscripcionIndividual from "./pages/user/InscripcionIndividual";
import MisInscripciones from './pages/user/MisInscripciones';
import DetalleInscripcion from './pages/user/DetalleInscripcion';

const AppUsuario = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Inscripcion" element={<Inscripcion />} />
        <Route
          path="/InscripcionIndividual"
          element={<InscripcionIndividual />}
        />
        <Route path="/mis-inscripciones" element={<MisInscripciones />} />
        <Route path="/detalle-inscripcion/:id" element={<DetalleInscripcion />} />
      </Routes>
      <Footer />
    </>
  );
};

export default AppUsuario;
