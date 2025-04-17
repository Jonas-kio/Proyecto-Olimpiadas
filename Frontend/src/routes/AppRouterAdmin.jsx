
import { Routes, Route } from "react-router-dom";
//import Configuracion from "../pages/Configuracion";
//import AreasConfig from "../pages/config/AreasConfig";
import DashboardConfig from "../pages/admin/config/DashboardConfig";
import Reportes from "../pages/admin/config/Reportes";
import HomeAdmin from "../pages/admin/homeAdmin";

const AppRouterAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeAdmin/>} />
      <Route path="/homeAdmin" element={<HomeAdmin/>} />
      <Route path="/configuracion" element={<DashboardConfig />} />
      <Route path="/reports" element={<Reportes/>} />
    </Routes>
  );
};

export default AppRouterAdmin;
