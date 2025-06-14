import { Routes, Route } from "react-router-dom";

import Inicio from "../pages/user/Inicio";
import ListaOlimpiadas from "../pages/user/ListaOlimpiadas";
import Inscripcion from "../pages/user/Inscripcion";
import InscripcionIndividual from "../pages/user/InscripcionIndividual";
import InscripcionGrupal from "../pages/user/InscripcionGrupal";
import MisInscripciones from "../pages/user/MisInscripciones";
import DetalleInscripcion from "../pages/user/DetalleInscripcion";
import OcrPaymentFlow from "../pages/user/ocr/OcrPaymentFlow";

const AppRouter = () => {
  return (
    <Routes>
    
      {/* Rutas para el área de usuario autenticado */}
      
      <Route path="" element={<Inicio />} />
      <Route path="inicio" element={<Inicio />} />
      <Route path="ListaOlimpiadas" element={<Inicio />} />      <Route
        path="/inscripcion/inscripcion-individual/:idOlimpiada"
        element={<InscripcionIndividual />}
      />
      <Route
        path="/inscripcion/inscripcion-grupal/:idOlimpiada"
        element={<InscripcionGrupal />}
      />
      <Route path="mis-inscripciones" element={<MisInscripciones />} />
      <Route path="detalle-inscripcion/:id" element={<DetalleInscripcion />} />
      <Route path="/" element={<Inicio />} />
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/inscripcion" element={<ListaOlimpiadas />} />
      <Route path="/ListaOlimpiadas" element={<Inscripcion />} />
      <Route path="/inscripcion/opciones" element={<Inscripcion />} />
      <Route path="/ocr/:procesoId" element={<OcrPaymentFlow />} />
      <Route path="/ocr/" element={<OcrPaymentFlow />} />

      <Route
        path="/inscripcion/inscripcion-individual/:idOlimpiada"
        element={<InscripcionIndividual />}
      />

      {/* Puedes agregar más rutas específicas para usuarios aquí */}
      
    </Routes>
  );
};

export default AppRouter;
