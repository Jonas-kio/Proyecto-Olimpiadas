import { useState, useEffect } from 'react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/common/Table';
import Form from '../../../components/forms/FormAreas';
import Button from '../../../components/common/Button';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import SuccessModal from '../../../components/common/SuccessModal';
import ErrorModal from '../../../components/common/ErrorModal';

import { 
  getAllAreas, 
  createArea, 
  updateArea, 
  deleteArea, 
  changeAreaStatus 
} from '../../../services/areasService';

import {
  validateAreaForm,
  validateAreaDeletion,
  mapBackendErrors,
  normalizeFormData
} from '../../../utils/validators/areaValidators';

const Areas = () => {
  // Estados para datos y UI
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [hideFieldErrors, setHideFieldErrors] = useState(false);

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

  // Definición de columnas para la tabla (sin la columna de Estado)
  const columns = [
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { key: 'levels', title: 'Niveles' },
    { key: 'participants', title: 'Participantes' },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, row) => renderActions(row)
    }
  ];

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

  // Cargar áreas al montar el componente
  useEffect(() => {
    fetchAreas();
  }, []);

  // Obtener todas las áreas
  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await getAllAreas();
      setAreas(data);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar errores de API
  const handleApiError = (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const { data, status } = error.response;
      
      if (status === 404) {
        return 'El recurso solicitado no existe.';
      } else if (status === 422) {
        // Error de validación
        if (data.errors) {
          // Mapear errores del backend al formato frontend
          const frontendErrors = mapBackendErrors(data.errors);
          
          // Guardar los errores en el estado
          setFormErrors(frontendErrors);
          
          // Si vamos a mostrar el modal, ocultamos los errores de campo
          setHideFieldErrors(true);
          
          // Mostrar modal de error con los campos afectados
          setErrorModal({
            show: true,
            message: data.message || 'Hay errores de validación en el formulario.',
            fields: Object.entries(frontendErrors).map(([key, value]) => {
              const fieldLabel = areaFields.find(f => f.name === key)?.label || key;
              return `${fieldLabel}: ${value}`;
            })
          });
          
          // Concatenar todos los errores de validación para el mensaje general
          return Object.values(frontendErrors)
            .join(', ');
        }
        return data.message || 'Error de validación en los datos enviados.';
      } else if (status >= 500) {
        return 'Error en el servidor. Por favor, intente más tarde.';
      } else {
        return data.message || 'Ha ocurrido un error en la petición.';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else {
      // Error en la configuración de la petición
      return error.message || 'Error al procesar la solicitud.';
    }
  };

  // Handler para cerrar el modal de error
  const handleCloseErrorModal = () => {
    setErrorModal({ show: false, message: '', fields: [] });
    // Ahora los errores se mostrarán en los campos
    setHideFieldErrors(false);
  };

  // Manejar cambios en el formulario con validación en tiempo real
  const handleFormChange = (field, value) => {
    // Actualizar el valor del campo
    const updatedFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedFormData);
    
    // Si el formulario ya fue enviado, validar inmediatamente
    if (isFormSubmitted) {
      // Validar todo el formulario para retroalimentación en tiempo real
      const validationResult = validateAreaForm(updatedFormData, areas, editingId);
      setFormErrors(validationResult.errors);
    }
  };

  // Validar todo el formulario antes de enviar
  const validateForm = () => {
    // Normalizar datos antes de validar
    const normalizedData = normalizeFormData(formData);
    setFormData(normalizedData);

    // Validar formulario completo
    const validationResult = validateAreaForm(normalizedData, areas, editingId);
    setFormErrors(validationResult.errors);
    
    return validationResult.isValid;
  };

  // Enviar formulario para crear o actualizar
  const handleSubmit = async () => {
    setIsFormSubmitted(true);
    
    // Limpiar estado de errores y modales
    setHideFieldErrors(false);
    setErrorModal({
      show: false,
      message: '',
      fields: []
    });
    
    if (!validateForm()) {
      // Mostrar modal de error si hay errores de validación
      const errorFields = Object.entries(formErrors).map(([key, value]) => {
        const fieldLabel = areaFields.find(f => f.name === key)?.label || key;
        return `${fieldLabel}: ${value}`;
      });
      
      // Ocultar errores de campo mientras se muestra el modal
      setHideFieldErrors(true);
      
      setErrorModal({
        show: true,
        message: 'Por favor, corrija los errores antes de continuar.',
        fields: errorFields
      });
      
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
      await fetchAreas();
      
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
    setHideFieldErrors(false);
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
    setHideFieldErrors(false);
  };

  // Cambiar estado (activar/desactivar)
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      await changeAreaStatus(id, !currentStatus);
      
      // Encontrar el área para mostrar mensaje específico
      const area = areas.find(a => a.id === id);
      const newStatus = !currentStatus ? 'activada' : 'desactivada';
      
      showSuccess(
        'Estado actualizado',
        `El área "${area?.name}" ha sido ${newStatus} correctamente.`
      );
      
      await fetchAreas();
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar confirmación de eliminación
  const showDeleteConfirmation = (area) => {
    // Verificar si el área puede ser eliminada
    const validationResult = validateAreaDeletion(area);
    
    if (!validationResult.isValid) {
      // Si no se puede eliminar, mostrar modal de error
      setErrorModal({
        show: true,
        message: 'No se puede eliminar el área',
        fields: Object.values(validationResult.errors)
      });
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
      
      await fetchAreas();
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar acciones para cada fila (sin botón de toggle)
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
    </div>
  );
};

export default Areas;