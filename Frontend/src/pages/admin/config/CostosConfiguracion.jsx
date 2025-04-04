
import { useState } from "react";


import Card from "../../../components/ui/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import FormularioCosto from "../../../components/forms/FormularioCosto";
import "../../../index.css";

const Configuracion = () => {

  const [showNewCostForm, setShowNewCostForm] = useState(false);
  const [specificCosts, setSpecificCosts] = useState([
    { id: 1, name: "Inscripción General", value: 50, area: "Todas", category: "Todas" },
    { id: 2, name: "Inscripción Temprana", value: 40, area: "Todas", category: "Todas" },
    { id: 3, name: "Inscripción Matemáticas Avanzado", value: 60, area: "Matemáticas", category: "Universitaria" },
  ]);
  const [newCost, setNewCost] = useState({ id: null, name: "", value: "", area: "Todas", category: "Todas" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewCostChange = (e) => {
    const { name, value } = e.target;
    setNewCost((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateCost = () => {
    if (!newCost.name || !newCost.value) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    if (newCost.id) {
      setSpecificCosts(specificCosts.map((c) => (c.id === newCost.id ? newCost : c)));
    } else {
      const newEntry = { ...newCost, id: Date.now() };
      setSpecificCosts([...specificCosts, newEntry]);
    }
    setNewCost({ id: null, name: "", value: "", area: "Todas", category: "Todas" });
    setShowNewCostForm(false);
    setErrorMessage("");
  };

  const editarCosto = (cost) => {
    setNewCost(cost);
    setShowNewCostForm(true);
  };

  const eliminarCosto = (id) => {
    setSpecificCosts(specificCosts.filter((cost) => cost.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <Card
        title="Costos Específicos"
        action={
          <Button onClick={() => setShowNewCostForm(true)} className="bg-blue-700 text-white">
            + Nuevo Costo
          </Button>
        }
      >
        {showNewCostForm && (
          <FormularioCosto
            values={newCost}
            onChange={handleNewCostChange}
            onSubmit={addOrUpdateCost}
            onCancel={() => setShowNewCostForm(false)}
            errorMessage={errorMessage}
          />
        )}

        <Table
          columns={[
            { key: "name", title: "Nombre" },
            { key: "value", title: "Valor" },
            { key: "area", title: "Área" },
            { key: "category", title: "Categoría" },
          ]}
          data={specificCosts.map((cost) => ({
            id: cost.id,
            name: cost.name,
            value: `Bs. ${cost.value}`,
            area: cost.area,
            category: cost.category,
          }))}
          onEdit={editarCosto}
          onDelete={eliminarCosto}
        />
      </Card>
    </div>
  );
};

export default Configuracion;
