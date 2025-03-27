import React, { useState } from "react";
import "../styles/Configuracion.css";

const Configuracion = () => {
  const [generalCost, setGeneralCost] = useState(50);
  const [specificCosts, setSpecificCosts] = useState([
    { id: 1, name: "Inscripción General", value: 50, area: "Todas", category: "Todas" },
    { id: 2, name: "Inscripción Temprana", value: 40, area: "Todas", category: "Todas" },
    { id: 3, name: "Inscripción Matemáticas Avanzado", value: 60, area: "Matemáticas", category: "Universitaria" },
  ]);
  const [newCost, setNewCost] = useState({ name: "", value: "", area: "Todas", category: "Todas" });
  const [showNewCostForm, setShowNewCostForm] = useState(false); // Estado para mostrar u ocultar el formulario

  // Manejo de cambios en los inputs
  const handleGeneralCostChange = (e) => setGeneralCost(e.target.value);
  const handleNewCostChange = (e) => setNewCost({ ...newCost, [e.target.name]: e.target.value });

  // Agregar nuevo costo
  const addNewCost = () => {
    if (newCost.name && newCost.value) {
      setSpecificCosts([...specificCosts, { ...newCost, id: specificCosts.length + 1 }]);
      setNewCost({ name: "", value: "", area: "Todas", category: "Todas" });
      setShowNewCostForm(false); // Ocultar el formulario después de agregar
    }
  };

  // Eliminar un costo
  const deleteCost = (id) => setSpecificCosts(specificCosts.filter((cost) => cost.id !== id));

  return (
    <div className="configuracion-container">
      {/* Título principal */}
      <h2 className="title">Panel de Administración</h2>
      <p className="subtitle">Gestiona las olimpiadas, configura áreas y revisa inscripciones</p>

      {/* Tabs de navegación */}
      <div className="config-tabs">
        <button>Áreas</button>
        <button>Niveles</button>
        <button>Categorías</button>
        <button className="active">Costos</button>
        <button>Formularios</button>
      </div>

      {/* Costo General */}
      <div className="cost-section">
        <h3 className="section-title">Costo General de Inscripción</h3>
        <div className="cost-box">
          <input type="number" value={generalCost} onChange={handleGeneralCostChange} />
          <button className="save">Guardar</button>
        </div>
        <p className="info-text">Este costo se aplicará a todas las inscripciones que no tengan un costo específico asignado.</p>
      </div>

      {/* Costos Específicos */}
      <div className="cost-section">
        <h3 className="section-title">Costos Específicos</h3>

        {/* Botón de nuevo costo */}
        <button className="new-cost-button" onClick={() => setShowNewCostForm(!showNewCostForm)}>
          {showNewCostForm ? "Cancelar" : "Nuevo Costo"}
        </button>

        {/* Formulario de nuevo costo (visible solo si showNewCostForm es true) */}
        {showNewCostForm && (
          <div className="new-cost-form">
            <h4 className="form-title">Nuevo Costo</h4>
            <div className="cost-grid">
              <input type="text" name="name" placeholder="Nombre del Costo" value={newCost.name} onChange={handleNewCostChange} />
              <input type="number" name="value" placeholder="Valor (Bs.)" value={newCost.value} onChange={handleNewCostChange} />
              <select name="area" value={newCost.area} onChange={handleNewCostChange}>
                <option value="Todas">Todas</option>
                <option value="Matemáticas">Matemáticas</option>
              </select>
              <select name="category" value={newCost.category} onChange={handleNewCostChange}>
                <option value="Todas">Todas</option>
                <option value="Universitaria">Universitaria</option>
              </select>
            </div>
            <div className="buttons">
              <button className="cancel" onClick={() => setShowNewCostForm(false)}>Cancelar</button>
              <button className="save" onClick={addNewCost}>Guardar</button>
            </div>
          </div>
        )}

        {/* Tabla de costos específicos */}
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
                  <button className="edit">✏️</button>
                  <button className="delete" onClick={() => deleteCost(cost.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Configuracion;
