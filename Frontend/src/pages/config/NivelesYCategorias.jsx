import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import MainContent from "../../components/layout/MainContent";
import Card from "../../components/ui/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import TextArea from "../../components/common/TextArea";

const NivelesYCategorias = () => {
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    area: "",
    level: "",
    minGrade: "",
    maxGrade: "",
    description: ""
  });

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

  const handleChange = (field, value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleSubmit = () => {
    setShowForm(false);
    setFormValues({ name: "", area: "", level: "", minGrade: "", maxGrade: "", description: "" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormValues({ name: "", area: "", level: "", minGrade: "", maxGrade: "", description: "" });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <MainContent title="Panel de Administración" subtitle="Gestión de olimpiadas">
        <Card title="Niveles o Categorías">
          {/* Botón debajo del título */}
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "Nuevo Nivel/Categoría"}
            </Button>
          </div>

          {/* Descripción azul */}
          <div className="bg-blue-50 text-blue-800 p-2 rounded text-sm mb-6">
            Configure los niveles o categorías para las diferentes áreas de competencia. Los niveles pueden ser por grado de dificultad (Básico, Intermedio, Avanzado) y por categoría educativa (Primaria, Secundaria, Universitaria).
          </div>

          {/* Formulario dinámico */}
          {showForm && (
            <div className="bg-gray-100 p-4 rounded shadow mb-6">
              <h3 className="text-md font-semibold mb-4">Nuevo Nivel/Categoría</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Nivel/Categoría"
                  placeholder="Ej: Básico, Primaria, etc."
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Select
                  label="Área"
                  options={["Seleccionar Área", "Matemáticas", "Física", "Química"]}
                  value={formValues.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                />
                <Select
                  label="Nivel de Grado"
                  options={["Seleccionar Grado", "Básico", "Intermedio", "Avanzado"]}
                  value={formValues.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                />
                <div className="flex gap-4">
                  <Input
                    label="Grado Mínimo"
                    value={formValues.minGrade}
                    onChange={(e) => handleChange("minGrade", e.target.value)}
                  />
                  <Input
                    label="Grado Máximo (opcional)"
                    value={formValues.maxGrade}
                    onChange={(e) => handleChange("maxGrade", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextArea
                    label="Descripción"
                    placeholder="Ej: Para estudiantes de 6-12 años, Nivel para principiantes, etc."
                    value={formValues.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button onClick={handleSubmit}>Guardar</Button>
              </div>
            </div>
          )}

          <Table columns={columns} data={data} onEdit={() => {}} onDelete={() => {}} />
        </Card>
      </MainContent>
    </div>
  );
};

export default NivelesYCategorias;
