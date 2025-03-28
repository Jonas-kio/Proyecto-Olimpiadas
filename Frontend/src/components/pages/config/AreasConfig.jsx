// src/pages/config/AreasConfig.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Form from '../../components/common/Form.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import MainContent from "../../components/layout/MainContent";
import Tabs from "../../components/ui/Tabs";
import { 
  getAllAreas, 
  createArea, 
  updateArea, 
  deleteArea, 
  changeAreaStatus 
} from '../../services/areasService';

const AreasConfig = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  
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
          // Concatenar todos los errores de validación
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar formulario para crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (editingId) {
        // Actualizar área existente
        await updateArea(editingId, formData);
      } else {
        // Crear nueva área
        await createArea(formData);
      }
      
      // Resetear formulario y recargar datos
      setFormData({ name: '', description: '' });
      setEditingId(null);
      await fetchAreas();
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Iniciar edición de un área
  const handleEdit = (area) => {
    setFormData({
      name: area.name,
      description: area.description,
    });
    setEditingId(area.id);
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
  
  // Cancelar edición
  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Áreas</h1>
      
      {/* Mostrar mensajes de error si los hay */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Formulario para crear/editar áreas */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Área' : 'Crear Nueva Área'}
        </h2>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="name">Nombre</Form.Label>
            <Form.Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          
          <Form.Group>
            <Form.Label htmlFor="description">Descripción</Form.Label>
            <Form.Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          
          <div className="flex items-center">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
            
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="ml-2"
              >
                Cancelar
              </Button>
            )}
          </div>
        </Form>
      </Card>
      
      {/* Tabla de áreas */}
      <Card>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Nombre</Table.HeaderCell>
              <Table.HeaderCell>Descripción</Table.HeaderCell>
              <Table.HeaderCell>Niveles</Table.HeaderCell>
              <Table.HeaderCell>Participantes</Table.HeaderCell>
              <Table.HeaderCell>Estado</Table.HeaderCell>
              <Table.HeaderCell>Acciones</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && !areas.length ? (
              <Table.Row>
                <Table.Cell colSpan="7" className="text-center">
                  Cargando...
                </Table.Cell>
              </Table.Row>
            ) : areas.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan="7" className="text-center">
                  No hay áreas disponibles
                </Table.Cell>
              </Table.Row>
            ) : (
              areas.map(area => (
                <Table.Row key={area.id}>
                  <Table.Cell>{area.id}</Table.Cell>
                  <Table.Cell>{area.name}</Table.Cell>
                  <Table.Cell>{area.description}</Table.Cell>
                  <Table.Cell>{area.levels}</Table.Cell>
                  <Table.Cell>{area.participants}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded text-xs ${area.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {area.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="link"
                      onClick={() => handleEdit(area)}
                      title="Editar"
                      className="text-blue-600 mr-2"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleToggleStatus(area.id, area.active)}
                      className={`${area.active ? 'text-yellow-600' : 'text-green-600'} mr-2`}
                      title={area.active ? 'Desactivar' : 'Activar'}
                    >
                      {area.active ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleDelete(area.id)}
                      className="text-red-600"
                      title="Eliminar"
                    >
                      Eliminar
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default AreasConfig;