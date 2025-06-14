import { useState, useEffect } from 'react';

import Card from "../../../components/ui/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";

import FormularioNivelCategoria from "../../../components/forms/FormularioNivelCategoria";
import { getLevels, createLevel, deleteLevel, updateLevel } from "../../../services/nivelesService";
import { getActiveAreas } from "../../../services/areasService";
import ErrorModal from '../../../components/common/ErrorModal';
import SuccessModal from '../../../components/common/SuccessModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import "../../../index.css";


import { validateLevelForm, buildLevelApiData } from '../../../utils/validators/nivelesValidators';
import LoadingModal from '../../../components/modals/LoadingModal'; //Importacion del Modal

const NivelesYCategorias = () => {
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasMap, setAreasMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState(null);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [errorFields, setErrorFields] = useState([]);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetails, setSuccessDetails] = useState("");
  const [successTittle, setSuccessTittle] = useState("");
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);

  const [formValues, setFormValues] = useState({
    name: "",
    area: "",
    level: "",
    minGrade: "",
    maxGrade: "",
    description: "",
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasData = await getActiveAreas();
        setAreas(areasData);
        
        const areaMapping = {};
        areasData.forEach(area => {
          areaMapping[area.id] = area;
        });
        setAreasMap(areaMapping);
        
        console.log('Áreas cargadas:', areasData); 
      } catch (error) {
        console.error("Error fetching areas:", error);
        setErrorMessage("Error al cargar las áreas. Por favor, recargue la página.");
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setIsLoading(true);
        const fetchedLevels = await getLevels();
        
        if (!fetchedLevels || !Array.isArray(fetchedLevels)) {
          setErrorMessage("Formato de respuesta inválido al cargar niveles.");
          return;
        }

        const formattedLevels = fetchedLevels.map(level => {
          if (!level) return null;
          
          if (level.id === undefined || level.id === null) {
            console.error("Nivel sin ID:", level);
            return null; 
          }
          
          const areaName = level.area ? 
                          (typeof level.area === 'object' ? level.area.name : level.area) : 
                          'Área no disponible';
          
          return {
            id: level.id,
            name: level.name || "Sin nombre",
            areaId: level.areaId,
            area: areaName,
            description: level.description || '',
            gradeName: level.gradeName,
            gradeMin: level.gradeMin,
            gradeMax: level.gradeMax,
          };
        }).filter(Boolean);
        
        setLevels(formattedLevels);
      } catch (error) {
        console.error("Error fetching levels:", error);
        setErrorMessage("Error al cargar los niveles. Por favor, recargue la página.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);
  
  const handleChange = (field, value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const validateFormFields = () => {
    const validationResult = validateLevelForm(formValues, isEditing);
    
    if (!validationResult.isValid) {
      setValidationError(validationResult.errorFields.length > 0 
        ? "Por favor complete todos los campos obligatorios" 
        : "Hay errores en el formulario que deben corregirse");
      setErrorFields(validationResult.errorFields);
      setShowErrorModal(true);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFormFields()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      
      let result;
      
      if (isEditing && currentLevelId) {
        const updateData = buildLevelApiData(formValues, isEditing, currentLevelId, levels);
        
        result = await updateLevel(currentLevelId, updateData);
        
        setLevels(levels.map(level => {
          if (level.id === currentLevelId) {
            return {
              ...level,
              name: result.name,
              description: result.description,
              gradeMin: result.gradeMin,
              gradeMax: result.gradeMax
            };
          }
          return level;
        }));
        
        setSuccessTittle("Actualización Exitosa!");
        setSuccessMessage("La actualización se realizó con éxito");
        setSuccessDetails(`Se ha actualizado el nivel/categoría "${result.name}" correctamente.`);
      } else {
        // Usar función de utilidad para construir datos de API
        const levelData = buildLevelApiData(formValues, isEditing);

        result = await createLevel(levelData);
        
        const areaName = areasMap[levelData.areaId]?.name || 'Área no disponible';
        
        setLevels([...levels, {
          ...result,
          area: areaName
        }]);
        
        setSuccessTittle("Registro Exitoso!");
        setSuccessMessage("El registro se realizó con éxito");
        setSuccessDetails(`Se ha creado el nivel/categoría "${result.name}" para el área "${areaName}" correctamente.`);
      }
      
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error en la operación:", error);
      
      if (error.response?.status === 409) {
        setValidationError("Error de duplicidad");
        setErrorFields([`El nivel/categoría "${formValues.name}" ya existe para el área seleccionada.`]);
      } else if (error.response?.status === 400) {
        setValidationError("Error de validación");
        setErrorFields([error.response?.data?.message || "Datos inválidos"]);
      } else if (error.response?.status === 422) {
        setValidationError("Error de validación");
        const errorMessages = error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat() 
          : ["Datos inválidos"];
        setErrorFields(errorMessages);
      } else {
        setValidationError("Error en el servidor");
        setErrorFields([`Error al ${isEditing ? 'actualizar' : 'crear'} el nivel. Intenta nuevamente.`]);
      }
      
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentLevelId(null);
    setErrorMessage("");
    resetForm();
  };

  const resetForm = () => {
    setFormValues({
      name: "",
      area: "",
      level: "",
      minGrade: "",
      maxGrade: "",
      description: "",
    });
  };

  const handleEditClick = (level) => {
    console.log("Editando nivel:", level);
    
    if (!level || !level.id) {
      console.error("Nivel inválido para editar:", level);
      return;
    }
    
    setIsEditing(true);
    setCurrentLevelId(level.id);
    
    setFormValues({
      name: level.name || "",
      area: level.areaId?.toString() || "",
      level: level.gradeName || "",
      minGrade: level.gradeMin || "",
      maxGrade: level.gradeMax || "",
      description: level.description || "",
    });
    
    setShowForm(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setShowForm(false);
    resetForm();
    setIsEditing(false);
    setCurrentLevelId(null);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleDeleteClick = (levelId) => {
    console.log("ID recibido para eliminar:", levelId);

    if (levelId === undefined || levelId === null) {
      console.error("El ID a eliminar no es válido:", levelId);
      setValidationError("Error al intentar eliminar");
      setErrorFields(["No se recibió un ID válido para eliminar."]);
      setShowErrorModal(true);
      return;
    }

    const levelToRemove = levels.find(level => level.id === levelId);
    
    if (!levelToRemove) {
      console.error(`No se encontró nivel con ID ${levelId}`);
      setValidationError("Error al intentar eliminar");
      setErrorFields([`No se encontró el nivel con ID ${levelId} en la lista actual.`]);
      setShowErrorModal(true);
      return;
    }
    
    setLevelToDelete({
      id: levelId,
      name: levelToRemove.name || 'Sin nombre'
    });
    
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLevelToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    console.log("Confirmando eliminación:", levelToDelete);
    
    if (!levelToDelete || !levelToDelete.id) {
      console.error("No hay ID para eliminar");
      setValidationError("Error al eliminar");
      setErrorFields([
        "No se pudo identificar correctamente el nivel/categoría a eliminar.",
        "Por favor, intente nuevamente."
      ]);
      setShowErrorModal(true);
      setShowDeleteModal(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const levelId = levelToDelete.id;
      console.log("Intentando eliminar nivel con ID:", levelId);
      
      await deleteLevel(levelId);
      
      setLevels(levels.filter(level => level.id !== levelId));

      setSuccessTittle("Eliminación exitosa!");
      setSuccessMessage("La eliminacion del nivel fue exitosa. ");
      setSuccessDetails(`Se ha eliminado el nivel/categoría "${levelToDelete.name}" correctamente.`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al eliminar nivel:", error);
      
      setValidationError("Error al eliminar");
      setErrorFields([
        `No se pudo eliminar el nivel/categoría "${levelToDelete.name || ''}".`,
        error.message || "Inténtelo de nuevo más tarde."
      ]);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setLevelToDelete(null);
    }
  };

  const columns = [
    { key: "name", title: "Nombre" },
    { key: "area", title: "Área" },
    { key: "description", title: "Descripción" },
    { key: "gradeName", title: "Nivel de Grado" },
    { key: "gradeMin", title: "Grado Minimo" },
    { key: "gradeMax", title: "Grado Máximo" },
  ];

  return (
    <>
    {isLoading && <LoadingModal isOpen={isLoading} />}
    <div className="app-container relative">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        tittleMessage={successTittle}
        successMessage={successMessage}
        detailMessage={successDetails}
      />
      
      <ErrorModal 
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        errorMessage={validationError}
        errorFields={errorFields}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={levelToDelete?.name || ''}
        itemType="nivel/categoría"
      />

      <Card
        title="Niveles o Categorías"
        action={
          <Button onClick={() => {
            if (showForm && isEditing) {
              setIsEditing(false);
              setCurrentLevelId(null);
              resetForm();
            } else {
              setShowForm(!showForm);
              
              if (showForm) {
                setIsEditing(false);
                setCurrentLevelId(null);
                resetForm();
              }
            }
          }} disabled={isLoading}>
            {showForm 
              ? (isEditing ? "Cancelar Edición" : "Cancelar") 
              : "+ Nuevo Nivel/Categoría"}
          </Button>
        }
      >
        <div
          style={{
            backgroundColor: '#DBEAFE', 
            color: '#1D4ED8',          
            padding: '1rem 1.5rem',     
            borderRadius: '0.75rem',    
            fontSize: '0.875rem',       
            marginBottom: '1.5rem',     
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', 
          }}
        >
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
            isEditing={isEditing}
            areas={areas} 
          />
        )}

        <Table
          columns={columns}
          data={levels}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage="No hay niveles o categorías registrados"
        />
      </Card>
    </div>
    </>
  );
};

export default NivelesYCategorias;