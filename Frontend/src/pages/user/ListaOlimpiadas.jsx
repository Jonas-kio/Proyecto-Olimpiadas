import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/components/ListaOlimpiadas.css";
import "../../styles/components/Table.css";
import olimpiada14 from "../../assets/images/olimpiada14.png"; // Imagen por defecto
import { getOlimpiadas } from "../../services/olimpiadaService"; // Importación corregida

const ListaOlimpiadas = () => {
  const navigate = useNavigate();
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOlimpiadas = async () => {
      try {
        setLoading(true);
        // Llamada al API para obtener las olimpiadas
        const response = await getOlimpiadas();
        console.log("Respuesta completa del API de olimpiadas:", response);
        
        if (response && response.data) {
          console.log("Datos sin procesar:", response.data);
        }
        
        let dataFromAPI = [];
        
        // Verificar la estructura de la respuesta para extraer los datos correctamente
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            dataFromAPI = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            dataFromAPI = response.data.data;
          } else if (typeof response.data === 'object') {
            // Si la respuesta es un objeto pero no un array, verificamos si tiene propiedades que podrían ser los datos
            console.log("La respuesta es un objeto, intentando extraer datos...");
            const possibleDataKeys = Object.keys(response.data).filter(key => 
              Array.isArray(response.data[key]) || 
              (typeof response.data[key] === 'object' && response.data[key] !== null)
            );
            
            if (possibleDataKeys.length > 0) {
              const firstKey = possibleDataKeys[0];
              if (Array.isArray(response.data[firstKey])) {
                dataFromAPI = response.data[firstKey];
              } else {
                // Convertir el objeto a un array si no es un array
                dataFromAPI = [response.data];
              }
            } else {
              // Si no encontramos un array, convertimos el objeto en un array de un elemento
              dataFromAPI = [response.data];
            }
          }
        }
        
        console.log("Datos extraídos:", dataFromAPI);
        
        if (Array.isArray(dataFromAPI) && dataFromAPI.length > 0) {
          // Mapear los datos al formato que usa tu componente
          const mappedOlimpiadas = dataFromAPI.map(olimpiada => ({
            id: olimpiada.id || Math.random().toString(36).substr(2, 9),
            nombre: olimpiada.nombre || "Olimpiada",
            // Determinar el estado en base a las fechas y si está activa
            estado: determinarEstado(olimpiada),
            // Extraer las áreas si están disponibles
            areas: olimpiada.areas ? (Array.isArray(olimpiada.areas) ? olimpiada.areas.map(area => 
              typeof area === 'object' && area.nombre ? area.nombre : area
            ) : [olimpiada.areas]) : ["Matemáticas", "Física"],
            inscritos: olimpiada.participantes_count || olimpiada.inscritos || 0,
            modalidad: olimpiada.modalidad || "Virtual",
            fechaInicio: olimpiada.fecha_inicio || olimpiada.fechaInicio,
            edicion: olimpiada.edicion || "13",
            imagen: olimpiada.imagen || olimpiada14
          }));
          
          console.log("Olimpiadas procesadas:", mappedOlimpiadas);
          setOlimpiadas(mappedOlimpiadas);
        } else {
          console.log("No se encontraron datos válidos del backend");
          setOlimpiadas([]);
        }
        
        setError(null);
      } catch (error) {
        console.error("Error al cargar olimpiadas:", error);
        setError("No se pudieron cargar las olimpiadas. Intente nuevamente.");
        setOlimpiadas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOlimpiadas();
  }, []);

  // Función para determinar el estado de la olimpiada basado en fechas y estado activo
  const determinarEstado = (olimpiada) => {
    const hoy = new Date();
    const fechaInicio = olimpiada.fecha_inicio ? new Date(olimpiada.fecha_inicio) : 
                       (olimpiada.fechaInicio ? new Date(olimpiada.fechaInicio) : null);
    const fechaFin = olimpiada.fecha_fin ? new Date(olimpiada.fecha_fin) : 
                    (olimpiada.fechaFin ? new Date(olimpiada.fechaFin) : null);
    
    // Si no está activa o si no tiene campo activo pero tiene campo estado, usamos el campo estado
    if (olimpiada.estado) {
      return olimpiada.estado;
    }
    
    // Si tiene campo activo pero no está activa, está terminada
    if (olimpiada.hasOwnProperty('activo') && !olimpiada.activo) {
      return "Terminado";
    }
    
    // Si la fecha de inicio existe y es en el futuro, está pendiente
    if (fechaInicio && fechaInicio > hoy) {
      return "Pendiente";
    }
    
    // Si la fecha de fin existe y ya pasó, está terminada
    if (fechaFin && fechaFin < hoy) {
      return "Terminado";
    }
    
    // En cualquier otro caso, está en curso
    return "En Curso";
  };

  // FUNCIÓN ACTUALIZADA: Dejamos la redirección original
  const handleRegistrarse = (id) => {
    // Usamos la ruta original que funcionaba
    navigate("/user/inscripcion/opciones");
  };

  if (loading) {
    return <div className="loading">Cargando olimpiadas...</div>;
  }

  return (
    <div className="lista-olimpiadas-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="olimpiadas-grid">
        {olimpiadas.length === 0 ? (
          <div className="no-olimpiadas">
            <p>No hay olimpiadas disponibles en este momento.</p>
          </div>
        ) : (
          olimpiadas.map((olimpiada) => (
            <div key={olimpiada.id} className="olimpiada-card">
              <div className="olimpiada-header">
                <h2>{olimpiada.nombre}</h2>
                <span className={`estado-badge ${olimpiada.estado.toLowerCase().replace(" ", "-")}`}>
                  {olimpiada.estado}
                </span>
              </div>
              
              <div className="olimpiada-content">
                <div className="edicion-container">
                  <span className="edicion-numero">{olimpiada.edicion}</span>
                  <span className="edicion-texto">a</span>
                </div>
                
                <div className="flecha-decorativa">
                  <div className="flecha-linea"></div>
                  <div className="flecha-punta"></div>
                </div>
                
                <div className="olimpiada-logo">
                  <div className="atom-icon">
                    <div className="nucleus"></div>
                    <div className="electron-orbit orbit-1"></div>
                    <div className="electron-orbit orbit-2"></div>
                    <div className="electron electron-1"></div>
                    <div className="electron electron-2"></div>
                    <div className="electron electron-3"></div>
                  </div>
                  <div className="texto-principal">
                    <span className="olimpiada-text">OLIMPIADA</span>
                    <span className="cientifica-text">CIENTÍFICA</span>
                    <span className="estudiante-text">ESTUDIANTIL</span>
                    <span className="plurinacional-text">PLURINACIONAL BOLIVIANA</span>
                  </div>
                </div>
              </div>
              
              <div className="olimpiada-info">
                <p><strong>Áreas:</strong> {olimpiada.areas.length > 0 ? olimpiada.areas.join(", ") : "No especificadas"}</p>
                <p><strong>Inscritos:</strong> {olimpiada.inscritos} participantes</p>
                <p><strong>Modalidad:</strong> {olimpiada.modalidad}</p>
              </div>
              
              <div className="olimpiada-acciones">
                {olimpiada.estado === "En Curso" && (
                  <button 
                    className="btn-registrarse"
                    onClick={() => handleRegistrarse(olimpiada.id)}
                  >
                    Registrarse
                  </button>
                )}
                {olimpiada.estado === "Pendiente" && (
                  <button 
                    className="btn-proximamente"
                    disabled
                  >
                    Próximamente
                  </button>
                )}
                {olimpiada.estado === "Terminado" && (
                  <button 
                    className="btn-terminado"
                    disabled
                  >
                    Finalizado
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaOlimpiadas;