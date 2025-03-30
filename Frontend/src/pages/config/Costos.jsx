import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import MainContent from "../../components/layout/MainContent";
import Tabs from "../../components/ui/Tabs";
import "../../index.css";

const Costos = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("costs");

  const [generalCost, setGeneralCost] = useState(50);
  const [specificCosts, setSpecificCosts] = useState([
    { id: 1, name: "Inscripción General", value: 50, area: "Todas", category: "Todas" },
    { id: 2, name: "Inscripción Temprana", value: 40, area: "Todas", category: "Todas" },
    { id: 3, name: "Inscripción Matemáticas Avanzado", value: 60, area: "Matemáticas", category: "Universitaria" },
  ]);

  const [newCost, setNewCost] = useState({ id: null, name: "", value: "", area: "Todas", category: "Todas" });
  const [showNewCostForm, setShowNewCostForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const tabs = [
    { id: "areas", label: "Áreas" },
    { id: "levels_categories", label: "Niveles y Categorías" },
    { id: "costs", label: "Costos" },
    { id: "forms", label: "Formularios" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "areas") navigate("/config/areas");
    if (tabId === "levels_categories") navigate("/config/niveles-categorias");
    if (tabId === "costs") navigate("/config/costos");
    if (tabId === "forms") navigate("/config/formularios");
  };

  const handleGeneralCostChange = (e) => setGeneralCost(e.target.value);
  const handleNewCostChange = (e) => setNewCost({ ...newCost, [e.target.name]: e.target.value });

  const addOrUpdateCost = () => {
    if (!newCost.name.trim() || !newCost.value.trim()) {
      setErrorMessage("Por favor, complete todos los campos obligatorios.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (isEditing) {
      setSpecificCosts(specificCosts.map(cost => cost.id === newCost.id ? newCost : cost));
    } else {
      setSpecificCosts([...specificCosts, { ...newCost, id: specificCosts.length + 1 }]);
    }

    setNewCost({ id: null, name: "", value: "", area: "Todas", category: "Todas" });
    setShowNewCostForm(false);
    setIsEditing(false);
    setErrorMessage("");
  };

  const editCost = (cost) => {
    setNewCost(cost);
    setShowNewCostForm(true);
    setIsEditing(true);
  };

  const deleteCost = (id) => setSpecificCosts(specificCosts.filter((cost) => cost.id !== id));

  return (
    <div className="app-container">
      <Sidebar />
      <MainContent
        title="Panel de Administración"
        subtitle="Gestiona las olimpiadas, configura áreas y revisa inscripciones"
      >
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="cost-section">
          <h3 className="section-title">Costo General de Inscripción</h3>
          <div className="cost-box">
            <input type="number" value={generalCost} onChange={handleGeneralCostChange} />
            <button className="save">Guardar</button>
          </div>
          <p className="info-text">Este costo se aplicará a todas las inscripciones que no tengan un costo específico asignado.</p>
        </div>

        <div className="cost-section">
          <div className="cost-header">
            <h3 className="section-title">Costos Específicos</h3>
            <button className="new-cost-button" onClick={() => setShowNewCostForm(true)}>+ Nuevo Costo</button>
          </div>

          {showNewCostForm && (
            <div className="new-cost-form">
              <h4>{isEditing ? "Editar Costo" : "Nuevo Costo"}</h4>

              <div className="cost-grid">
                <div className="form-group">
                  <label>Nombre del Costo</label>
                  <input type="text" name="name" value={newCost.name} onChange={handleNewCostChange} />
                </div>
                <div className="form-group">
                  <label>Valor (Bs)</label>
                  <input type="number" name="value" value={newCost.value} onChange={handleNewCostChange} />
                </div>
                <div className="form-group">
                  <label>Área</label>
                  <select name="area" value={newCost.area} onChange={handleNewCostChange}>
                    <option>Todas</option>
                    <option>Matemáticas</option>
                    <option>Ciencias</option>
                    <option>Tecnología</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select name="category" value={newCost.category} onChange={handleNewCostChange}>
                    <option>Todas</option>
                    <option>Escolar</option>
                    <option>Universitaria</option>
                  </select>
                </div>
              </div>

              {errorMessage && <p className="text-red-600">{errorMessage}</p>}

              <div className="form-actions">
                <button className="btn-outline" onClick={() => { setShowNewCostForm(false); setErrorMessage(""); }}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={addOrUpdateCost}>
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          )}

          <table className="cost-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Valor</th>
                <th>Área</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {specificCosts.map((cost) => (
                <tr key={cost.id}>
                  <td>{cost.name}</td>
                  <td>Bs. {cost.value}</td>
                  <td>{cost.area}</td>
                  <td>{cost.category}</td>
                  <td>
                    <button className="edit" onClick={() => editCost(cost)}>✏️</button>
                    <button className="delete" onClick={() => deleteCost(cost.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MainContent>
    </div>
  );
};

export default Costos;
