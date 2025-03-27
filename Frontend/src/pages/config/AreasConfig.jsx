import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import MainContent from "../../components/layout/MainContent";
import Tabs from "../../components/ui/Tabs";
import Card from "../../components/ui/Card";
import Table from "../../components/common/Table";
import Form from "../../components/common/Form";
import Button from "../../components/common/Button";
import { getAllAreas, createArea, updateArea, deleteArea } from "../../services/areasService";

const AreasConfig = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("areas");
  const [areas, setAreas] = useState([]);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "areas", label: "Áreas" },
    { id: "levels_categories", label: "Niveles y Categorías" },
    { id: "costs", label: "Costos" },
    { id: "forms", label: "Formularios" },
  ];

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "description", title: "Descripción" },
    { key: "levels", title: "Niveles" },
    { key: "participants", title: "Participantes" },
  ];

  const areaFields = [
    {
      name: "name",
      label: "Nombre del Área",
      required: true,
      placeholder: "Ingrese el nombre del área",
    },
    {
      name: "description",
      label: "Descripción",
      required: false,
      placeholder: "Descripción de la competencia",
    },
  ];

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAllAreas();
      setAreas(data);
    } catch (error) {
      console.error("Error al cargar las áreas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formValues.name.trim()) {
        alert("El nombre del área es obligatorio");
        return;
      }

      if (editingAreaId !== null) {
        await updateArea(editingAreaId, formValues);
      } else {
        await createArea(formValues);
      }

      await fetchAreas();
      resetForm();
    } catch (error) {
      console.error("Error al guardar el área:", error);
      alert("Ocurrió un error al guardar. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("¿Está seguro que desea eliminar esta área?")) {
        return;
      }

      setLoading(true);
      await deleteArea(id);
      await fetchAreas();
    } catch (error) {
      console.error("Error al eliminar el área:", error);
      alert("Ocurrió un error al eliminar. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (area) => {
    setEditingAreaId(area.id);
    setFormValues({
      name: area.name,
      description: area.description,
    });
    setShowAreaForm(true);
  };

  const resetForm = () => {
    setShowAreaForm(false);
    setEditingAreaId(null);
    setFormValues({
      name: "",
      description: "",
    });
  };

  const handleFormChange = (field, value) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const handleTabChange = (tabId) => {
    if (tabId === "levels_categories") {
      navigate("/config/niveles-categorias");
    } else {
      setActiveTab(tabId);
    }
  };

  const cardAction = (
    <Button
      onClick={() => setShowAreaForm(!showAreaForm)}
      icon={<span className="plus-icon">{showAreaForm ? "-" : "+"}</span>}
    >
      {showAreaForm ? "Cancelar" : "Nueva Área"}
    </Button>
  );

  return (
    <div className="app-container">
      <Sidebar />

      <MainContent title="Panel de Administración" subtitle="Gestión de olimpiadas">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <Card title="Áreas de Competencia" action={cardAction}>
          {showAreaForm && (
            <Form
              title={editingAreaId ? "Editar Área" : "Nueva Área"}
              fields={areaFields}
              values={formValues}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              submitLabel={editingAreaId ? "Actualizar" : "Guardar"}
            />
          )}

          <Table columns={columns} data={areas} onEdit={startEditing} onDelete={handleDelete} />
        </Card>
      </MainContent>
    </div>
  );
};

export default AreasConfig;
