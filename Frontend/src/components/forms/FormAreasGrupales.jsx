import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { inscripcionArea, categoriasNiveles, obtenerAreasPorOlimpiadaEspecifica } from '../../services/inscripcionGrupalService';
import '../../styles/FormAreas.css';

const FormAreasGrupales = ({ 
  competidores = [], 
  onActualizarAsignacion = () => {}, 
  asignacionesActuales = [],
  olimpiadaId = null,
  procesoId = null
}) => {  const [areas, setAreas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarAreasYCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [areasData, categoriasData] = await Promise.all([
        olimpiadaId ? obtenerAreasPorOlimpiadaEspecifica(olimpiadaId) : inscripcionArea(),
        categoriasNiveles()
      ]);

      console.log('Areas cargadas:', areasData);
      console.log('Categorias cargadas:', categoriasData);

      // 🔍 Debug detallado de la estructura de áreas
      console.log('🔍 Tipo de areasData:', typeof areasData);
      console.log('🔍 areasData completo:', JSON.stringify(areasData, null, 2));
      console.log('🔍 Propiedades de areasData:', Object.keys(areasData || {}));

      // Extraer arrays de las respuestas API
      let areasArray = [];
      let categoriasArray = [];      // Para áreas: manejar múltiples estructuras de respuesta
      if (areasData) {
        if (Array.isArray(areasData)) {
          // Caso 1: Respuesta directa como array
          areasArray = areasData;
        } else if (areasData.data && areasData.data.areas && Array.isArray(areasData.data.areas)) {
          // Caso 2: {status: "success", data: {areas: [...]}} - ESTRUCTURA ACTUAL
          areasArray = areasData.data.areas;
          console.log('✅ Áreas extraídas de data.areas:', areasArray);
        } else if (areasData.data && Array.isArray(areasData.data)) {
          // Caso 3: {data: [...]}
          areasArray = areasData.data;
        } else if (areasData.areas && Array.isArray(areasData.areas)) {
          // Caso 4: {areas: [...]}
          areasArray = areasData.areas;
        } else {
          console.warn('⚠️ Estructura de areas no reconocida:', areasData);
          // Si hay un objeto con propiedades, intentamos convertirlo
          if (typeof areasData === 'object' && areasData !== null) {
            const keys = Object.keys(areasData);
            console.log('🔍 Intentando extraer áreas de las propiedades:', keys);
            // Buscar alguna propiedad que contenga un array
            for (const key of keys) {
              if (Array.isArray(areasData[key])) {
                console.log(`🔍 Encontrado array en propiedad '${key}':`, areasData[key]);
                areasArray = areasData[key];
                break;
              }
            }
          }
        }
      }

      // Para categorías: viene con {success: true, data: array}
      if (categoriasData) {
        if (Array.isArray(categoriasData)) {
          categoriasArray = categoriasData;
        } else if (categoriasData.data && Array.isArray(categoriasData.data)) {
          categoriasArray = categoriasData.data;
        } else {
          console.warn('Estructura de categorias no reconocida:', categoriasData);
        }
      }

      setAreas(areasArray);
      setCategorias(categoriasArray);

      console.log('Areas procesadas:', areasArray);
      console.log('Categorias procesadas:', categoriasArray);
      
      // Debug: mostrar estructura de los primeros elementos
      if (areasArray.length > 0) {
        console.log('Primera área estructura:', areasArray[0]);
      }
      if (categoriasArray.length > 0) {
        console.log('Primera categoría estructura:', categoriasArray[0]);
      }
    } catch (error) {
      console.error('Error al cargar areas y categorias:', error);
      setError('Error al cargar las áreas y categorías');
      setAreas([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [olimpiadaId]);

  useEffect(() => {
    cargarAreasYCategorias();
  }, [cargarAreasYCategorias]);

  useEffect(() => {
    if (competidores && competidores.length > 0) {
      // Inicializar asignaciones si hay competidores pero no hay asignaciones previas
      if (asignacionesActuales.length === 0) {
        const nuevasAsignaciones = competidores.map((competidor, index) => ({
          competidorIndex: index,
          competidor: competidor,
          areaId: '',
          categoriaId: '',
          areaSeleccionada: null,
          categoriaSeleccionada: null
        }));
        setAsignaciones(nuevasAsignaciones);
      } else {
        setAsignaciones(asignacionesActuales);
      }
    }
  }, [competidores, asignacionesActuales]);

  const manejarCambioArea = (competidorIndex, areaId) => {
    const areaSeleccionada = areas.find(area => area.id === parseInt(areaId));
    
    const nuevasAsignaciones = asignaciones.map((asignacion, index) => {
      if (index === competidorIndex) {
        return {
          ...asignacion,
          areaId: areaId,
          areaSeleccionada: areaSeleccionada,
          categoriaId: '', // Resetear categoría al cambiar área
          categoriaSeleccionada: null
        };
      }
      return asignacion;
    });

    setAsignaciones(nuevasAsignaciones);
    onActualizarAsignacion && onActualizarAsignacion(nuevasAsignaciones);
  };

  const manejarCambioCategoria = (competidorIndex, categoriaId) => {
    const categoriaSeleccionada = categorias.find(categoria => categoria.id === parseInt(categoriaId));
    
    const nuevasAsignaciones = asignaciones.map((asignacion, index) => {
      if (index === competidorIndex) {
        return {
          ...asignacion,
          categoriaId: categoriaId,
          categoriaSeleccionada: categoriaSeleccionada
        };
      }
      return asignacion;
    });

    setAsignaciones(nuevasAsignaciones);
    onActualizarAsignacion && onActualizarAsignacion(nuevasAsignaciones);
  };

  const obtenerCategoriasPorArea = (areaId) => {
    if (!areaId || !Array.isArray(categorias)) return [];
    return categorias.filter(categoria => categoria.area_id === parseInt(areaId));
  };

  const esAsignacionValida = (asignacion) => {
    return asignacion.areaId && asignacion.categoriaId;
  };
  const todasLasAsignacionesValidas = () => {
    return asignaciones.length > 0 && asignaciones.every(esAsignacionValida);  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando áreas y categorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="retry-button"
            onClick={cargarAreasYCategorias}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!competidores || competidores.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="fas fa-info-circle me-2"></i>
        No hay competidores registrados. Por favor, complete el paso anterior.
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="text-primary mb-3">
            <i className="fas fa-users-cog me-2"></i>
            Asignación de Áreas y Categorías
          </h4>
          <p className="text-muted">
            Seleccione el área y categoría para cada competidor. Las categorías se filtrarán según el área seleccionada.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="fas fa-list-ul me-2"></i>
                Competidores ({asignaciones.length})
              </h5>
            </div>            <div className="card-body">
              {asignaciones.map((asignacion, index) => (
                <div key={index} className="competitor-assignment-card mb-4">
                  <div className="competitor-header">
                    <div className="competitor-info">
                      <div className="competitor-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="competitor-details">
                        <h5 className="competitor-name">
                          {asignacion.competidor.nombres} {asignacion.competidor.apellidos}
                        </h5>
                        <div className="competitor-meta">
                          <span className="meta-item">
                            <i className="fas fa-id-card me-1"></i>
                            CI: {asignacion.competidor.documento_identidad}
                          </span>
                          <span className="meta-item">
                            <i className="fas fa-school me-1"></i>
                            {asignacion.competidor.colegio}
                          </span>
                          <span className="meta-item">
                            <i className="fas fa-graduation-cap me-1"></i>
                            {asignacion.competidor.curso}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="assignment-status">
                      {esAsignacionValida(asignacion) ? (
                        <span className="status-badge status-complete">
                          <i className="fas fa-check-circle"></i>
                          Completado
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          <i className="fas fa-exclamation-triangle"></i>
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="assignment-controls">
                    <div className="control-group">
                      <label className="control-label">
                        <i className="fas fa-layer-group me-2"></i>
                        Área de Competencia
                      </label>
                      <select
                        className={`form-select ${asignacion.areaId ? 'selected' : ''}`}
                        value={asignacion.areaId}
                        onChange={(e) => manejarCambioArea(index, e.target.value)}
                      >
                        <option value="">Seleccionar área...</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.nombre || area.name || area.area || 'Área sin nombre'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="control-group">
                      <label className="control-label">
                        <i className="fas fa-trophy me-2"></i>
                        Nivel/Categoría
                      </label>
                      <select
                        className={`form-select ${asignacion.categoriaId ? 'selected' : ''} ${!asignacion.areaId ? 'disabled' : ''}`}
                        value={asignacion.categoriaId}
                        onChange={(e) => manejarCambioCategoria(index, e.target.value)}
                        disabled={!asignacion.areaId}
                      >
                        <option value="">
                          {asignacion.areaId ? "Seleccionar categoría..." : "Primero seleccione un área"}
                        </option>
                        {obtenerCategoriasPorArea(asignacion.areaId).map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.name || categoria.nombre || categoria.category || categoria.level_name || 'Categoría sin nombre'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {esAsignacionValida(asignacion) && (
                    <div className="assignment-summary">
                      <div className="summary-item">
                        <strong>Área seleccionada:</strong> {asignacion.areaSeleccionada?.nombre || asignacion.areaSeleccionada?.name || 'Área sin nombre'}
                      </div>
                      <div className="summary-item">
                        <strong>Categoría seleccionada:</strong> {asignacion.categoriaSeleccionada?.name || asignacion.categoriaSeleccionada?.nombre || 'Categoría sin nombre'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>      {/* Resumen de estado */}
      <div className="row mt-4">
        <div className="col-12">
          <div className={`summary-alert ${todasLasAsignacionesValidas() ? 'alert-success' : 'alert-warning'}`}>
            <div className="d-flex align-items-center">
              <i className={`fas ${todasLasAsignacionesValidas() ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
              <div>
                <strong>Estado de asignaciones:</strong> {' '}
                {asignaciones.filter(esAsignacionValida).length} de {asignaciones.length} completadas
                {!todasLasAsignacionesValidas() && (
                  <div className="mt-1">
                    <small>
                      Complete todas las asignaciones para continuar al siguiente paso.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>        </div>
      </div>

      {/* Información adicional */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="info-card card">
            <div className="card-body">
              <h6 className="card-title">
                <i className="fas fa-info-circle me-2"></i>
                Información importante
              </h6>
              <ul className="mb-0 small">
                <li>Cada competidor debe tener asignada un área y una categoría</li>
                <li>Las categorías disponibles dependen del área seleccionada</li>
                <li>Puede cambiar las asignaciones en cualquier momento antes de finalizar</li>
                <li>Verifique que la edad del competidor corresponda con la categoría seleccionada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FormAreasGrupales.propTypes = {
  competidores: PropTypes.array,
  onActualizarAsignacion: PropTypes.func,
  asignacionesActuales: PropTypes.array,
  olimpiadaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  procesoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FormAreasGrupales;