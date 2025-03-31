import { useState, useEffect } from 'react';

import Card from "../../../components/ui/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";

import FormularioNivelCategoria from "../../../components/forms/FormularioNivelCategoria";
import { getLevels, createLevel, deleteLevel } from "../../../services/nivelesService";
import {getActiveAreas} from "../../../services/areasService"
import ErrorModal from '../../../components/common/ErrorModal';
import SuccessModal from '../../../components/common/SuccessModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import "../../../index.css";

const NivelesYCategorias = () => {
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasMap, setAreasMap] = useState({});

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

  const extractGradeNumber = (grade) => {
    const match = grade.match(/^([1-6])/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const validateFormFields = () => {
    const errorFieldsList = [];
    
    if (!formValues.name.trim()) {
      errorFieldsList.push("Nombre del Nivel/Categoría: Campo obligatorio");
    }
    
    if (!formValues.area.trim()) {
      errorFieldsList.push("Área: Debe seleccionar un área");
    }
    
    if (!formValues.level.trim()) {
      errorFieldsList.push("Nivel de Grado: Debe seleccionar un nivel");
    }
    
    if (!formValues.minGrade.trim()) {
      errorFieldsList.push("Grado Mínimo: Campo obligatorio");
    }

    if (errorFieldsList.length > 0) {
      setValidationError("Por favor complete todos los campos obligatorios");
      setErrorFields(errorFieldsList);
      setShowErrorModal(true);
      return false;
    }
    

    const minGradePattern = /^[1-6](ro|do|to)$/;
    if (formValues.minGrade.trim() && !minGradePattern.test(formValues.minGrade.trim())) {
      errorFieldsList.push("Grado Mínimo: Formato incorrecto. Debe ser como '1ro', '2do', etc.");
    }

    if (formValues.minGrade.trim() && formValues.minGrade.trim().length > 3) {
      errorFieldsList.push("Grado Mínimo: No debe exceder los 3 caracteres");
    }

    if (formValues.maxGrade.trim()) {
      const maxGradePattern = /^[1-6](ro|do|to)$/;
      if (!maxGradePattern.test(formValues.maxGrade.trim())) {
        errorFieldsList.push("Grado Máximo: Formato incorrecto. Debe ser como '1ro', '2do', etc.");
      }
      

      if (formValues.maxGrade.trim().length > 3) {
        errorFieldsList.push("Grado Máximo: No debe exceder los 3 caracteres");
      }

      const minGradeNum = extractGradeNumber(formValues.minGrade.trim());
      const maxGradeNum = extractGradeNumber(formValues.maxGrade.trim());
      
      if (maxGradeNum <= minGradeNum) {
        errorFieldsList.push("Grado Máximo: Debe ser mayor al grado mínimo");
      }
    }

    const description = formValues.description.trim();
    if (description) {
      if (description.length < 10) {
        errorFieldsList.push(`Descripción: Debe tener al menos 10 caracteres (actual: ${description.length})`);
      }
      
      if (description.length > 150) {
        errorFieldsList.push(`Descripción: No debe exceder los 150 caracteres (actual: ${description.length})`);
      }
      
      if (/^[0-9]/.test(description)) {
        errorFieldsList.push("Descripción: No debe iniciar con caracteres numéricos");
      }
      
      if (/[0-9]{3,}/.test(description)) {
        errorFieldsList.push("Descripción: No debe contener más de 2 números consecutivos");
      }
    }

    if (errorFieldsList.length > 0) {
      setValidationError("Hay errores en el formulario que deben corregirse");
      setErrorFields(errorFieldsList);
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
      
      const areaId = parseInt(formValues.area, 10);
      
      const levelData = {
        areaId: areaId,
        name: formValues.name,
        description: formValues.description,
        gradeName: formValues.level,
        gradeMin: formValues.minGrade,
        ...(formValues.maxGrade.trim() ? { gradeMax: formValues.maxGrade } : { gradeMax: null })
      };
      
      const newLevel = await createLevel(levelData);
      
      if (!newLevel) {
        throw new Error("No se recibió respuesta al crear el nivel");
      }
      
      
      const selectedArea = areasMap[areaId] || areas.find(a => a.id === areaId);
      const areaName = selectedArea ? selectedArea.name : 'Área no disponible';
      
      setLevels([...levels, newLevel]);
      
      setSuccessTittle("Registro Exitoso!");
      setSuccessMessage("El registro se realizó con éxito");
      setSuccessDetails(`Se ha creado el nivel/categoría "${newLevel.name}" para el área "${areaName}" correctamente.`);
      setShowSuccessModal(true);
    } catch (error) {
      if (error.response?.status === 409) {
        setValidationError("Error de duplicidad");
        setErrorFields([`El nivel/categoría "${formValues.name}" ya existe para el área seleccionada.`]);
      } else if (error.response?.status === 400) {
        setValidationError("Error de validación");
        setErrorFields([error.response?.data?.message || "Datos inválidos"]);
      } else {
        setValidationError("Error en el servidor");
        setErrorFields(["Error al crear el nivel. Intenta nuevamente."]);
      }
      
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setErrorMessage("");
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
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
    <div className="app-container relative">
      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        tittleMessage={successTittle}
        successMessage={successMessage}
        detailMessage={successDetails}
      />
      
      {/* Modal de error */}
      <ErrorModal 
        isOpen={showErrorModal}
        onClose={handleErrorModalClose}
        errorMessage={validationError}
        errorFields={errorFields}
      />

      {/* Modal de confirmación de eliminación */}
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
          <Button onClick={() => setShowForm(!showForm) } disabled={isLoading}>
            {showForm ? "Cancelar" : "+ Nuevo Nivel/Categoría"}
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
          />
        )}

        <Table
          columns={columns}
          data={levels}
          onEdit={() => { }}
          onDelete={handleDeleteClick}
          emptyMessage="No hay niveles o categorías registrados"
        />
      </Card>
    </div>
  );
};

export default NivelesYCategorias;