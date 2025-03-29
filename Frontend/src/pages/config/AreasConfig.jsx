// src/pages/config/AreasConfig.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Table from '../../components/common/Table';
import Form from '../../components/common/Form';
import Button from '../../components/common/Button';
import { 
  getAllAreas, 
  createArea, 
  updateArea, 
  deleteArea, 
  changeAreaStatus 
} from '../../services/areasService';

const AreasConfig = () => {
  // Estados
  const [activeTab, setActiveTab] = useState('areas');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const tabs = [
    { id: 'areas', label: 'Áreas' },
    { id: 'levels', label: 'Niveles' },
    { id: 'categories', label: 'Categorías' },
    { id: 'costs', label: 'Costos' },
    { id: 'forms', label: 'Formularios' },
  ];

  const columns = [
    { key: 'name', title: 'Nombre' },
    { key: 'description', title: 'Descripción' },
    { key: 'levels', title: 'Niveles' },
    { key: 'participants', title: 'Participantes' },
    { key: 'active', title: 'Estado', render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value ? 'Activo' : 'Inactivo'}
      </span>
    )}
  ];

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

  // Renderizar acciones adicionales para cada fila
  const renderActions = (row) => (
    <div className="action-buttons">
      <Button
        variant="link"
        onClick={() => handleEdit(row)}
        className="text-blue-600 mr-2"
      >
        Editar
      </Button>
      <Button
        variant="link"
        onClick={() => handleToggleStatus(row.id, row.active)}
        className={`${row.active ? 'text-yellow-600' : 'text-green-600'} mr-2`}
      >
        {row.active ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="link"
        onClick={() => handleDelete(row.id)}
        className="text-red-600"
      >
        Eliminar
      </Button>
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
    <div className="app-container">
      <Sidebar />
      
      <MainContent 
        title="Panel de Administración" 
        subtitle="Gestión de olimpiadas"
      >
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Mostrar mensajes de error si los hay */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
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
            renderRowActions={renderActions}
          />
        </Card>
      </MainContent>
    </div>
  );
};

export default AreasConfig;
