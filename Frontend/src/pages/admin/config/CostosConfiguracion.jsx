import { useState, useEffect } from "react";

import Card from "../../../components/ui/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import FormularioCosto from "../../../components/forms/FormularioCosto";
import "../../../styles/components/CostosConfiguracion.css";
import costService from "../../../services/costosService";
import { getActiveAreas } from "../../../services/areasService";
import { getLevels } from "../../../services/nivelesService";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import DeleteConfirmationModal from "../../../components/common/DeleteConfirmationModal";

import { 
  validateCostForm, 
  buildCostApiData, 
  prepareCostForEdit, 
  formatCostForDisplay 
} from "../../../utils/validators/costValidators";

const CostConfiguracion = () => {

  const [showNewCostForm, setShowNewCostForm] = useState(false);
  const [specificCosts, setSpecificCosts] = useState([]);
  const [newCost, setNewCost] = useState({ id: null, name: "", value: "", area: "0", category: "0" });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);

  const [areaMap, setAreaMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [errorFields, setErrorFields] = useState([]);
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetailMessage, setSuccessDetailMessage] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        const areasData = await getActiveAreas();
        console.log("Áreas cargadas:", areasData);
        setAreas(areasData);

        const areaMapData = {};
        areasData.forEach(area => {
          areaMapData[area.id] = area.name;
        });
        setAreaMap(areaMapData);

        const categoriesData = await getLevels();
        console.log("Categorías/Niveles cargados:", categoriesData);
        setCategories(categoriesData);

        const categoryMapData = {};
        categoriesData.forEach(category => {
          categoryMapData[category.id] = category.name;
        });
        setCategoryMap(categoryMapData);

        await refreshCostsList();
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setModalErrorMessage("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
        setErrorModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleNewCostChange = (e) => {
    const { name, value } = e.target;
    setNewCost((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateCost = async (errorFieldsFromForm) => {
    if (errorFieldsFromForm) {
      setErrorFields(errorFieldsFromForm);
      setModalErrorMessage("Por favor complete todos los campos requeridos");
      setErrorModalOpen(true);
      return;
    }

    try {
      const validationResult = validateCostForm(
        newCost, 
        categories, 
        specificCosts, 
        isEditing
      );
      
      if (!validationResult.isValid) {
        setErrorFields(validationResult.errorFields);
        setModalErrorMessage(
          validationResult.errors.unique || 
          validationResult.errors.categoryArea || 
          "Por favor complete todos los campos requeridos"
        );
        setErrorModalOpen(true);
        return;
      }
      
      const apiData = buildCostApiData(newCost, areas, categories);
      
      console.log("Datos a enviar a la API:", apiData);

      if (newCost.id) {
        await costService.updateCost(newCost.id, apiData);
        console.log(`Costo ID ${newCost.id} actualizado correctamente`);
        setSuccessMessage("Costo actualizado exitosamente");
        setSuccessDetailMessage(`El costo "${newCost.name}" ha sido actualizado correctamente.`);
      } else {
        await costService.createCost(apiData);
        console.log("Nuevo costo creado correctamente");
        setSuccessMessage("Costo creado exitosamente");
        setSuccessDetailMessage(`El costo "${newCost.name}" ha sido creado correctamente.`);
      }

      await refreshCostsList();
      
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Error al guardar el costo:", error);
      const errorMsg = error.message || "Error al guardar el costo. Por favor, intente de nuevo.";
      setModalErrorMessage(errorMsg);
      setErrorModalOpen(true);
    }
  };

  const handleDeleteCost = (id) => {
    const costToDelete = specificCosts.find(cost => cost.id === id);
    setCostToDelete(costToDelete);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCost = async () => {
    if (costToDelete) {
      try {
        await costService.deleteCost(costToDelete.id);
        console.log(`Costo ID ${costToDelete.id} eliminado correctamente`);
        
        setSpecificCosts(specificCosts.filter(cost => cost.id !== costToDelete.id));
        
        setSuccessMessage("Costo eliminado exitosamente");
        setSuccessDetailMessage("El costo ha sido eliminado correctamente.");
        setSuccessModalOpen(true);
        
        setDeleteModalOpen(false);
        setCostToDelete(null);
      } catch (error) {
        console.error("Error al eliminar el costo:", error);
        const errorMsg = error.message || "Error al eliminar el costo. Por favor, intente de nuevo.";
        setModalErrorMessage(errorMsg);
        setErrorModalOpen(true);
        

        setDeleteModalOpen(false);
        setCostToDelete(null);
      }
    }
  };

  const editarCosto = (cost) => {

    const costForEdit = prepareCostForEdit(cost);
    
    console.log("Editando costo:", costForEdit);
    setNewCost(costForEdit);
    setShowNewCostForm(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setShowNewCostForm(false);
    setIsEditing(false);
    setNewCost({ id: null, name: "", value: "", area: "0", category: "0" });
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCostToDelete(null);
  };

  const refreshCostsList = async () => {
    try {
      const updatedCosts = await costService.getAllCosts();
      const formattedCosts = updatedCosts.map(cost => 
        formatCostForDisplay(cost, areaMap, categoryMap)
      );
      
      setSpecificCosts(formattedCosts);
    } catch (error) {
      console.error("Error al actualizar la lista de costos:", error);
      throw error;
    }
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
  };

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
    setShowNewCostForm(false); 
    setNewCost({ id: null, name: "", value: "", area: "0", category: "0" });
  };

  return (
    <div className="p-4 space-y-4">
      <Card
        title="Costos Específicos"
        action={
          <Button 
            onClick={() => {
              if (showNewCostForm && isEditing) {
                setIsEditing(false);
                setNewCost({ id: null, name: "", value: "", area: "0", category: "0" });
              } else {
                setShowNewCostForm(!showNewCostForm);
                
                if (showNewCostForm) {
                  setIsEditing(false);
                  setNewCost({ id: null, name: "", value: "", area: "0", category: "0" });
                }
              }
            }} 
            disabled={loading}
            className="bg-blue-700 text-white"
          >
            {showNewCostForm 
              ? (isEditing ? "Cancelar Edición" : "Cancelar") 
              : "+ Nuevo Costo"}
          </Button>
        }
      >
        {showNewCostForm && (
          <FormularioCosto
            values={newCost}
            onChange={handleNewCostChange}
            onSubmit={addOrUpdateCost}
            onCancel={handleCancel}
            areas={[...areas]}
            categories={[...categories]}
            isEditing={!!newCost.id}
            existingCosts={specificCosts} 
          />
        )}

        {loading ? (
          <p className="text-center py-4">Cargando costos...</p>
        ) : specificCosts.length > 0 ? (
          <Table
            columns={[
              { key: "name", title: "Nombre" },
              { key: "value", title: "Valor" },
              { key: "area", title: "Área" },
              { key: "category", title: "Categoría" },
            ]}
            data={specificCosts}
            onEdit={editarCosto}
            onDelete={handleDeleteCost}
          />
        ) : (
          <p className="text-center py-4">No hay costos registrados</p>
        )}
      </Card>

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={closeErrorModal}
        errorMessage={modalErrorMessage}
        errorFields={errorFields}
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={closeSuccessModal}
        tittleMessage="Operación Exitosa"
        successMessage={successMessage}
        detailMessage={successDetailMessage}
      />
      
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteCost}
        itemName={costToDelete?.name || ''}
        itemType="costo"
      />
    </div>
  );
};

export default CostConfiguracion;