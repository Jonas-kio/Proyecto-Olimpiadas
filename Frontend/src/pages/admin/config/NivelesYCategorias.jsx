
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import MainContent from "../../components/layout/MainContent";
import Card from "../../components/ui/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Tabs from "../../components/ui/Tabs";
import FormularioNivelCategoria from "../../components/forms/FormularioNivelCategoria";
import "../../index.css";

const NivelesYCategorias = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("levels_categories");
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    area: "",
    level: "",
    minGrade: "",
    maxGrade: "",
    description: "",
  });

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

  const handleChange = (field, value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleSubmit = () => {
    if (
      !formValues.name.trim() ||
      !formValues.area.trim() ||
      !formValues.level.trim() ||
      !formValues.minGrade.trim() ||
      !formValues.maxGrade.trim()
    ) {
      setErrorMessage("* Completa los campos obligatorios");
      return;
    }

    setErrorMessage("");
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setErrorMessage("");
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowForm(false);
    setFormValues({
      name: "",
      area: "",
      level: "",
      minGrade: "",
      maxGrade: "",
      description: "",
    });
  };

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "area", title: "Área" },
    { key: "description", title: "Descripción" },
    { key: "participants", title: "Participantes" },
  ];

  const data = [
    { name: "Básico", area: "Matemáticas", description: "Nivel para principiantes", participants: 30 },
    { name: "Intermedio", area: "Matemáticas", description: "Nivel para estudiantes con conocimientos medios", participants: 25 },
    { name: "Avanzado", area: "Matemáticas", description: "Nivel para estudiantes avanzados", participants: 20 },
    { name: "Primaria", area: "Todas", description: "Para estudiantes de 6-12 años", participants: 45 },
    { name: "Secundaria", area: "Todas", description: "Para estudiantes de 13-17 años", participants: 78 },
    { name: "Universitaria", area: "Todas", description: "Para estudiantes de 18-25 años", participants: 111 },
  ];

  return (
    <div className="app-container relative">

{showModal && (
  <div className="modal-overlay">
    <div className="modal-content"> 
            <h2 className="text-xl font-semibold text-blue-800 mb-2">✔ Registro exitoso</h2>
            <p className="text-gray-700 mb-6">El registro se realizó con éxito.</p>
            <div className="flex justify-end">
              <button
                onClick={handleModalClose}
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

<Card
          title="Niveles o Categorías"
          action={
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "+ Nuevo Nivel/Categoría"}
            </Button>
          }
        >
          <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-6">
            Configure los niveles o categorías para las diferentes áreas de competencia. Los niveles pueden ser por grado de dificultad (Básico, Intermedio, Avanzado) y por categoría educativa (Primaria, Secundaria, Universitaria).
          </div>

          {errorMessage && (
            <div className="text-red-600 font-medium mb-4">
              {errorMessage}
            </div>
          )}

          {showForm && (
            <FormularioNivelCategoria
              values={formValues}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}

          <Table columns={columns} data={data} onEdit={() => {}} onDelete={() => {}} />
        </Card>
    </div>
  );
};

export default NivelesYCategorias;
