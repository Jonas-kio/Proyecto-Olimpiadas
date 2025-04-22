
import { Routes, Route } from "react-router-dom";


import Inicio from "../pages/user/Inicio";
import ListaOlimpiadas from "../pages/user/ListaOlimpiadas";
import Inscripcion from "../pages/user/Inscripcion";
import InscripcionIndividual from "../pages/user/InscripcionIndividual";


const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas para el área de usuario autenticado */}
      <Route path="/" element={<Inicio />} />
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/inscripcion" element={<ListaOlimpiadas />} />
      <Route path="/ListaOlimpiadas" element={<Inscripcion />} />
      <Route path="/inscripcion/opciones" element={<Inscripcion />} />
      <Route path="/inscripcion/inscripcion-individual" element={<InscripcionIndividual />} />
      
      {/* Puedes agregar más rutas específicas para usuarios aquí */}
    </Routes>
  );
};

export default AppRouter;
