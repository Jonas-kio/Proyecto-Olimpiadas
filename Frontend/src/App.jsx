// src/App.jsx
import "./App.css";
import DashboardAdmin from "./pages/admin/DasboardAdmin";
import { Routes, Route } from "react-router-dom";


const App = () => {
  return (
    <div className="app-container">
      <div className="content">
        <Routes>
          <Route path="/*" element={<DashboardAdmin />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;