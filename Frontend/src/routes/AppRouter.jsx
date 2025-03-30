
import { Routes, Route } from "react-router-dom";
//import Configuracion from "../pages/Configuracion";
//import AreasConfig from "../pages/config/AreasConfig";
import Dashboard from "../pages/participants/Dashboard";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/user" element={<Dashboard/>} />
    </Routes>
  );
};

export default AppRouter;
