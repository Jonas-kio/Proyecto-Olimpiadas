
import { Routes, Route } from "react-router-dom";
//import Configuracion from "../pages/Configuracion";
//import AreasConfig from "../pages/config/AreasConfig";
import DashboardConfig from "../pages/admin/config/DashboardConfig";
import Reportes from "../pages/admin/reportes/ReportPanel";
import Boletas from "../pages/admin/boletas/Tickets";
import HomeAdmin from "../pages/admin/HomeAdmin";
import DasboardOlimpiada from '../pages/admin/DasboardOlimpiada';
import FormularioOlimpiada from "../pages/admin/formularioOlimpiada";

const AppRouterAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeAdmin/>} />
      <Route path="/homeAdmin" element={<HomeAdmin/>} />
      <Route path="/dasboardOlimpiada" element={<DasboardOlimpiada/>} />
      <Route path="/formulario_Olimpiada" element={<FormularioOlimpiada />} />
      <Route path="/formulario_Olimpiada/:id" element={<FormularioOlimpiada />} />
      <Route path="/configuracion" element={<DashboardConfig />} />
      <Route path="/reportes" element={<Reportes/>} />
      <Route path="/boletas" element={<Boletas/>} />
    </Routes>
  );
};

export default AppRouterAdmin;
