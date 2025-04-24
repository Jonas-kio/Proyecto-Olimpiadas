
import { Routes, Route } from "react-router-dom";


import Inicio from "../pages/user/Inicio";
import Inscripcion from "../pages/user/Inscripcion";
import InscripcionIndividual from "../pages/user/InscripcionIndividual";
import MisInscripciones from "../pages/user/MisInscripciones";
import DetalleInscripcion from "../pages/user/DetalleInscripcion";


const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas para el área de usuario autenticado */}
      <Route path="" element={<Inicio />} />
      <Route path="inicio" element={<Inicio />} />
      <Route path="inscripcion" element={<Inscripcion />} />
      <Route path="inscripcion/inscripcion-individual" element={<InscripcionIndividual />} />
      <Route path="mis-inscripciones" element={<MisInscripciones />} />
      <Route path="detalle-inscripcion/:id" element={<DetalleInscripcion />} />
      
      {/* Puedes agregar más rutas específicas para usuarios aquí */}
    </Routes>
  );
};

export default AppRouter;
