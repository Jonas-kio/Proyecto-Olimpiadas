import { useState } from "react";
import "../../../styles/CostosConfiguracion.css";
import "../../../components/common/Table.jsx";

const CostosConfiguracion = () => {
  const [specificCosts, setSpecificCosts] = useState([
    { id: 1, name: "Inscripción General", value: 50, area: "Todas", category: "Todas" },
    { id: 2, name: "Inscripción Temprana", value: 40, area: "Todas", category: "Todas" },
    { id: 3, name: "Inscripción Matemáticas Avanzado", value: 60, area: "Matemáticas", category: "Universitaria" },
  ]);

  const [newCost, setNewCost] = useState({ id: null, name: "", value: "", area: "Todas", category: "Todas" });
  const [showNewCostForm, setShowNewCostForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewCostChange = (e) => {
    const { name, value } = e.target;

    if (name === "value") {
      if (!/^\d*$/.test(value)) {  // Solo números enteros positivos
        setErrorMessage("Solo números enteros positivos.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
    }

    setNewCost({ ...newCost, [name]: value });
  };

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
    <div className="configuracion-container">
      <div className="cost-section">
        <div className="cost-header">
          <h3 className="section-title">Costos de Inscripción</h3>
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
                <input type="text" name="value" value={newCost.value} onChange={handleNewCostChange} />
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

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="buttons">
              <button className="cancel" onClick={() => { setShowNewCostForm(false); setErrorMessage(""); setNewCost({ id: null, name: "", value: "", area: "Todas", category: "Todas" }); 
                setIsEditing(false);}}>Cancelar</button>
              <button className="save" onClick={addOrUpdateCost}>{isEditing ? "Actualizar" : "Guardar"}</button>
            </div>
          </div>
        )}

        <div className="table-container">
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
                    <button className="icon-button edit" onClick={() => editCost(cost)}>✏️</button>
                    <button className="icon-button delete" onClick={() => deleteCost(cost.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostosConfiguracion;
