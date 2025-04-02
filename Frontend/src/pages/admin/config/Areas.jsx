// src/pages/config/AreasConfig.jsx
import { useState, useEffect } from 'react';

import Card from '../../../components/ui/Card';
import Table from '../../../components/common/Table';
import Form from '../../../components/common/FormAreas';
import Button from '../../../components/common/Button';
import { 
  getAllAreas, 
  createArea, 
  updateArea, 
  deleteArea, 
  changeAreaStatus 
} from '../../../services/areasService';

const Areas = () => {
  // Estados
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Definición de columnas para la tabla
  const columns = [
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { key: 'levels', title: 'Niveles' },
    { key: 'participants', title: 'Participantes' },
    { 
      key: 'active', 
      title: 'Estado', 
      render: (value) => (
        <span className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
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
          // Actualizar formErrors con los errores de validación
          setFormErrors(data.errors);
          // Concatenar todos los errores de validación para el mensaje general
          return Object.values(data.errors)
            .flat()
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

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Limpiar el error de este campo si existe
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };

  // Enviar formulario para crear o actualizar
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setFormErrors({});
      
      if (!formData.name.trim()) {
        setFormErrors({
          ...formErrors,
          name: 'El nombre del área es obligatorio'
        });
        return;
      }
      
      if (editingId) {
        // Actualizar área existente
        await updateArea(editingId, formData);
      } else {
        // Crear nueva área
        await createArea(formData);
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

  // Resetear formulario
  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowAreaForm(false);
    setFormErrors({});
  };

  // Iniciar edición de un área
  const handleEdit = (area) => {
    setFormData({
      name: area.name,
      description: area.description,
    });
    setEditingId(area.id);
    setShowAreaForm(true);
  };

  // Cambiar estado (activar/desactivar)
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      await changeAreaStatus(id, !currentStatus);
      await fetchAreas();
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un área
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta área?')) {
      try {
        setLoading(true);
        await deleteArea(id);
        await fetchAreas();
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
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
      <button className="icon-button delete" onClick={() => handleDelete(row.id)}>
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
      onClick={() => setShowAreaForm(!showAreaForm)}
      icon={<span className="plus-icon">{showAreaForm ? "-" : "+"}</span>}
      variant="primary"
    >
      {showAreaForm ? "Cancelar" : "Nueva Área"}
    </Button>
  );

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
          />
        )}
        
        <Table 
          columns={columns} 
          data={areas}
          loading={loading}
          emptyMessage="No hay áreas disponibles"
        />
      </Card>
    </div>
  );
};

export default Areas;