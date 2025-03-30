
import { Routes, Route } from "react-router-dom";
//import Configuracion from "../pages/Configuracion";
//import AreasConfig from "../pages/config/AreasConfig";
import DashboardConfig from "../pages/admin/config/DashboardConfig";
import Reportes from "../pages/admin/config/Reportes";

const AppRouterAdmin = () => {
  return (
    <Routes>
      {/* <Route path="/admin" element={<homeAdmin/>} /> */}
      <Route path="/configuracion" element={<DashboardConfig />} />
      <Route path="/reports" element={<Reportes/>} /> */
    </Routes>
  );
};

export default AppRouterAdmin;
