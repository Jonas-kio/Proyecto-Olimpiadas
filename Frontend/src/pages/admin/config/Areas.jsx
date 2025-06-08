import { useState, useEffect } from 'react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/common/Table';
import Form from '../../../components/forms/FormAreas';
import Button from '../../../components/common/Button';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import SuccessModal from '../../../components/common/SuccessModal';
import ErrorModal from '../../../components/common/ErrorModal';
import LoadingModal from '../../../components/modals/LoadingModal';


import { 
  getAllAreas, 
  createArea, 
  updateArea, 
  deleteArea
} from '../../../services/areasService';

import { getLevels } from '../../../services/nivelesService';

import {
  validateAreaForm,
  validateAreaDeletion,
  mapBackendErrors,
  normalizeFormData
} from '../../../utils/validators/areaValidators';

const Areas = () => {
  // Estados para datos y UI
  const [areas, setAreas] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [hideFieldErrors, setHideFieldErrors] = useState(true); // Iniciar con true para ocultar errores en campos
  
  // Estados para modales
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    itemId: null,
    itemName: ''
  });
  const [successModal, setSuccessModal] = useState({
    show: false,
    title: '',
    message: '',
    detail: ''
  });
  const [errorModal, setErrorModal] = useState({
    show: false,
    message: '',
    fields: []
  });

  // Definición de columnas para la tabla
  const columns = [
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { 
      key: 'niveles', 
      title: 'Niveles',
      render: (_, row) => renderNiveles(row)
    },
    //{ key: 'participants', title: 'Participantes' },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => renderActions(row)
    }
  ];

  // Renderizar los niveles asociados a un área como un número
  const renderNiveles = (row) => {
    // Filtrar los niveles que pertenecen a esta área específica
    // Importante comprobar tanto el areaId como área.id debido a las diferentes estructuras de datos
    const nivelesDelArea = niveles.filter(nivel => {
      // Normalizar el areaId del nivel considerando ambas estructuras posibles
      const nivelAreaId = nivel.areaId || (nivel.area && nivel.area.id);
      
      // Comparar con el id del área actual
      return nivelAreaId === row.id;
    });
    
    // Mostrar el número de niveles asociados a esta área
    return (
      <div className="niveles-count">
        {nivelesDelArea.length}
      </div>
    );
  };

  // Definición de campos para el formulario
  const areaFields = [
    {
      name: 'name',
      label: 'Nombre del Área',
      required: true,
      placeholder: 'Ingrese el nombre del área'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Descripción del área'
    }
  ];

  // Cargar áreas y niveles al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Obtener todos los datos necesarios
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar áreas y niveles en paralelo para optimizar
      const [areasData, nivelesData] = await Promise.all([
        getAllAreas(),
        getLevels()
      ]);
      
      // Verificar que los datos sean arrays válidos
      const validAreas = Array.isArray(areasData) ? areasData : [];
      const validNiveles = Array.isArray(nivelesData) ? nivelesData : [];
      
      // Normalizamos los datos de niveles para asegurar que areaId sea consistente
      const normalizedNiveles = validNiveles.map(nivel => {
        // Utilizar areaId si existe, o extraer del objeto area si está disponible
        const areaId = nivel.areaId || (nivel.area && nivel.area.id);
        
        return {
          ...nivel,
          // Aseguramos que areaId sea un número para comparaciones consistentes
          areaId: typeof areaId === 'string' ? parseInt(areaId, 10) : areaId
        };
      });
      
      setAreas(validAreas);
      setNiveles(normalizedNiveles);
      setError(null);
      
      // Para depuración
      console.log('Áreas cargadas:', validAreas);
      console.log('Niveles cargados:', normalizedNiveles);
      
      // Calcular cuántos niveles hay por cada área
      const nivelesCountByArea = {};
      normalizedNiveles.forEach(nivel => {
        const areaId = nivel.areaId || (nivel.area && nivel.area.id);
        if (areaId) {
          nivelesCountByArea[areaId] = (nivelesCountByArea[areaId] || 0) + 1;
        }
      });
      console.log('Conteo de niveles por área:', nivelesCountByArea);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar errores de API y mostrarlos en el formato deseado
  const handleApiError = (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const { data, status } = error.response;
      
      if (status === 404) {
        showErrorModal('El recurso solicitado no existe.', []);
        return 'El recurso solicitado no existe.';
      } else if (status === 422) {
        // Error de validación
        if (data.errors) {
          // Mapear errores del backend al formato frontend
          const frontendErrors = mapBackendErrors(data.errors);
          
          // No guardamos errores en formErrors para que no se muestren en los campos
          
          // Formateamos los errores para el modal
          const errorFieldsList = Object.entries(frontendErrors).map(([key, value]) => {
            const fieldLabel = areaFields.find(f => f.name === key)?.label || key;
            return `${fieldLabel}: ${value}`;
          });
          
          // Mostrar modal de error con los campos afectados
          showErrorModal('Por favor corrija los errores en el formulario', errorFieldsList);
          
          // Concatenar todos los errores de validación para el mensaje general
          return Object.values(frontendErrors).join(', ');
        }
        
        showErrorModal(data.message || 'Error de validación en los datos enviados.', []);
        return data.message || 'Error de validación en los datos enviados.';
      } else if (status >= 500) {
        showErrorModal('Error en el servidor. Por favor, intente más tarde.', []);
        return 'Error en el servidor. Por favor, intente más tarde.';
      } else {
        showErrorModal(data.message || 'Ha ocurrido un error en la petición.', []);
        return data.message || 'Ha ocurrido un error en la petición.';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      showErrorModal('No se pudo conectar con el servidor. Verifique su conexión a internet.', []);
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else {
      // Error en la configuración de la petición
      showErrorModal(error.message || 'Error al procesar la solicitud.', []);
      return error.message || 'Error al procesar la solicitud.';
    }
  };
  
  // Función auxiliar para mostrar el modal de error
  const showErrorModal = (message, fields) => {
    // Siempre ocultar los errores de campo cuando mostramos el modal
    setHideFieldErrors(true);
    
    setErrorModal({
      show: true,
      message,
      fields
    });
  };

  // Handler para cerrar el modal de error
  const handleCloseErrorModal = () => {
    setErrorModal({ show: false, message: '', fields: [] });
    // Mantenemos hideFieldErrors en true para que los errores no aparezcan en los campos
    // después de cerrar el modal
    setHideFieldErrors(true);
  };

  // Manejar cambios en el formulario con validación en tiempo real mínima
  const handleFormChange = (field, value) => {
    // Actualizar el valor del campo
    const updatedFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedFormData);
    
    // No realizamos validación en tiempo real para evitar mensajes mientras el usuario escribe
    // Solo limpiamos errores para el campo que se está editando
    if (isFormSubmitted) {
      // Mantener otros errores, pero quitar el error del campo actual
      const updatedErrors = { ...formErrors };
      delete updatedErrors[field];
      setFormErrors(updatedErrors);
    }
  };

  // Validar todo el formulario antes de enviar y mostrar errores en el modal
  const validateForm = () => {
    // Normalizar datos antes de validar
    const normalizedData = normalizeFormData(formData);
    setFormData(normalizedData);

    // Validar formulario completo
    const validationResult = validateAreaForm(normalizedData, areas, editingId);
    
    // Si hay errores, mostrarlos en el modal y no en los campos
    if (!validationResult.isValid) {
      // Crear lista de errores para el modal
      const errorFieldsList = Object.entries(validationResult.errors).map(([key, value]) => {
        const fieldLabel = areaFields.find(f => f.name === key)?.label || key;
        return `${fieldLabel}: ${value}`;
      });
      
      // Limpiar los errores de los campos
      setFormErrors({});
      
      // Mostrar modal con todos los errores
      setHideFieldErrors(true);
      showErrorModal('Por favor corrija los siguientes errores', errorFieldsList);
      
      return false;
    }
    
    // Si no hay errores, continuar
    setFormErrors({});
    return true;
  };

  // Enviar formulario para crear o actualizar
  const handleSubmit = async () => {
    setIsFormSubmitted(true);
    
    // Limpiar estado de errores y modales
    setHideFieldErrors(true); // Siempre ocultar errores de campo al enviar
    setErrorModal({
      show: false,
      message: '',
      fields: []
    });
    
    if (!validateForm()) {
      // Si validateForm devuelve false, ya mostró los errores en el modal
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Datos ya normalizados y validados
      const normalizedData = normalizeFormData(formData);
      
      if (editingId) {
        // Actualizar área existente
        await updateArea(editingId, normalizedData);
        showSuccess('Área actualizada', `El área "${normalizedData.name}" ha sido actualizada correctamente.`);
      } else {
        // Crear nueva área
        await createArea(normalizedData);
        showSuccess('Área creada', `El área "${normalizedData.name}" ha sido creada correctamente.`);
      }
      
      // Resetear formulario y recargar datos
      resetForm();
      await fetchData(); // Volvemos a cargar áreas y niveles
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje de éxito
  const showSuccess = (title, message, detail = '') => {
    setSuccessModal({
      show: true,
      title,
      message,
      detail
    });
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowAreaForm(false);
    setFormErrors({});
    setIsFormSubmitted(false);
    setHideFieldErrors(true); // Mantener true para seguir ocultando errores en campos
  };

  // Iniciar edición de un área
  const handleEdit = (area) => {
    setFormData({
      name: area.name,
      description: area.description,
    });
    setEditingId(area.id);
    setShowAreaForm(true);
    setIsFormSubmitted(false);
    setHideFieldErrors(true); // Mantener true para seguir ocultando errores en campos
  };

  // Mostrar confirmación de eliminación
  const showDeleteConfirmation = (area) => {
    // Verificar si el área puede ser eliminada
    const validationResult = validateAreaDeletion(area);
    
    if (!validationResult.isValid) {
      // Si no se puede eliminar, mostrar modal de error con el nuevo formato
      const errorFieldsList = Object.values(validationResult.errors);
      showErrorModal('No se puede eliminar el área', errorFieldsList);
      return;
    }
    
    // Si se puede eliminar, mostrar confirmación
    setDeleteModal({
      show: true,
      itemId: area.id,
      itemName: area.name
    });
  };

  // Eliminar un área
  const handleDelete = async (id) => {
    setDeleteModal({ show: false, itemId: null, itemName: '' });
    
    try {
      setLoading(true);
      await deleteArea(id);
      
      showSuccess(
        'Área eliminada',
        'El área ha sido eliminada correctamente.',
      );
      
      await fetchData(); // Volvemos a cargar áreas y niveles
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar acciones para cada fila
  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="icon-button edit" onClick={() => handleEdit(row)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="#0a3f7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 2.5C17.8978 2.10217 18.4374 1.87868 19 1.87868C19.5626 1.87868 20.1022 2.10217 20.5 2.5C20.8978 2.89782 21.1213 3.43739 21.1213 4C21.1213 4.56261 20.8978 5.10217 20.5 5.5L12 14L8 15L9 11L17.5 2.5Z" stroke="#0a3f7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className="icon-button delete" onClick={() => showDeleteConfirmation(row)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="#e41e26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#e41e26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );

  // Componente de acción para la tarjeta
  const cardAction = (
    <Button 
      onClick={() => {
        // Al abrir o cerrar el formulario, reiniciar estados
        if (showAreaForm) {
          resetForm();
        } else {
          setShowAreaForm(true);
          setHideFieldErrors(true); // Asegurar que no se muestren errores al abrir el formulario
        }
      }}
      icon={<span className="plus-icon">{showAreaForm ? "-" : "+"}</span>}
      variant="primary"
    >
      {showAreaForm ? "Cancelar" : "Nueva Área"}
    </Button>
  );

  // Verificar si el botón de guardar debe estar deshabilitado
  const isSubmitDisabled = () => {
    // Verificar campos requeridos
    const requiredFieldsMissing = !formData.name.trim() || !formData.description.trim();
    
    // Si ya se ha intentado enviar, verificar también los errores de validación
    if (isFormSubmitted) {
      return requiredFieldsMissing || Object.keys(formErrors).length > 0;
    }
    
    return requiredFieldsMissing;
  };

  return (
    
    <>
    {loading && <LoadingModal isOpen={loading} />} 
    {/* Mostrar Modal Cargando Datos */}
    <div className="area-container">
      {/* Mostrar mensajes de error si los hay */}
      {error && (
        <div className="error-alert" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Card 
        title="Áreas de Competencia" 
        action={cardAction}
      >
        {showAreaForm && (
          <Form
            title={editingId ? "Editar Área" : "Nueva Área"}
            fields={areaFields}
            values={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            submitLabel={editingId ? "Actualizar" : "Guardar"}
            errors={formErrors}
            loading={loading}
            submitDisabled={isSubmitDisabled()}
            hideFieldErrors={hideFieldErrors}
          />
        )}
        
        <Table 
          columns={columns} 
          data={areas}
          loading={loading}
          emptyMessage="No hay áreas disponibles"
        />
      </Card>
      
      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal 
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, itemId: null, itemName: '' })}
        onConfirm={() => handleDelete(deleteModal.itemId)}
        itemName={deleteModal.itemName}
        itemType="área"
      />
      
      {/* Modal de éxito */}
      <SuccessModal 
        isOpen={successModal.show}
        onClose={() => setSuccessModal({ show: false, title: '', message: '', detail: '' })}
        tittleMessage={successModal.title}
        successMessage={successModal.message}
        detailMessage={successModal.detail}
      />
      
      {/* Modal de error */}
      <ErrorModal 
        isOpen={errorModal.show}
        onClose={handleCloseErrorModal}
        errorMessage={errorModal.message}
        errorFields={errorModal.fields}
      />
{/* 👇 Aquí insertamos el modal de carga 
<LoadingModal
      isOpen={loading}
      message="Cargando áreas y niveles, por favor espere..."
    />
    */}
      
    </div>
    </>

  );
};

export default Areas;