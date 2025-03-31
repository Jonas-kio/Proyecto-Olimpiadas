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
    <div className="configuracion-container">
      {/* Sección Costos Específicos */}
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

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="buttons">
              <button className="cancel" onClick={() => { setShowNewCostForm(false); setErrorMessage(""); setNewCost({ id: null, name: "", value: "", area: "Todas", category: "Todas" }); 
                setIsEditing(false);}}>Cancelar</button>
              <button className="save" onClick={addOrUpdateCost}>{isEditing ? "Actualizar" : "Guardar"}</button>
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
                  <button className="icon-button edit" onClick={() => editCost(cost)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="#0a3f7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17.5 2.5C17.8978 2.10217 18.4374 1.87868 19 1.87868C19.5626 1.87868 20.1022 2.10217 20.5 2.5C20.8978 2.89782 21.1213 3.43739 21.1213 4C21.1213 4.56261 20.8978 5.10217 20.5 5.5L12 14L8 15L9 11L17.5 2.5Z" stroke="#0a3f7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </button>
                  <button className="icon-button delete" onClick={() => deleteCost(cost.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="#e41e26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#e41e26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CostosConfiguracion;
