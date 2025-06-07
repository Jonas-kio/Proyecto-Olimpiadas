import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/components/ListaOlimpiadas.css";
import "../../styles/components/Table.css";
import { getOlimpiadas } from "../../services/olimpiadaService";
import { FaFilePdf } from 'react-icons/fa';

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

        let dataFromAPI = [];

        // Extraer correctamente la estructura anidada del backend
        if (response && response.data) {
          // Extraer los datos de olimpiadas que están dentro de "olimpiadas.data"
          if (
            response.data.olimpiadas &&
            Array.isArray(response.data.olimpiadas.data)
          ) {
            dataFromAPI = response.data.olimpiadas.data;
          }
          // Si hay otra estructura anidada diferente
          else if (
            response.data.data &&
            response.data.data.olimpiadas &&
            Array.isArray(response.data.data.olimpiadas.data)
          ) {
            dataFromAPI = response.data.data.olimpiadas.data;
          }
          // Si hay un array directamente en data
          else if (Array.isArray(response.data.data)) {
            dataFromAPI = response.data.data;
          }
          // Si response.data es un array directamente
          else if (Array.isArray(response.data)) {
            dataFromAPI = response.data;
          }
          // Si no encontramos ninguna estructura conocida, usamos el objeto completo
          else if (typeof response.data === "object") {
            dataFromAPI = [response.data];
          }
        }

        console.log("Datos extraídos:", dataFromAPI);

        if (Array.isArray(dataFromAPI) && dataFromAPI.length > 0) {
          // Mapear los datos al formato que usa tu componente
          const mappedOlimpiadas = dataFromAPI.map((olimpiada) => ({
            id: olimpiada.id || Math.random().toString(36).substr(2, 9),
            nombre: olimpiada.nombre || "Olimpiada",
            // Determinar el estado en base a las fechas y si está activa
            estado: determinarEstado(olimpiada),
            // Extraer las áreas si están disponibles
            areas: olimpiada.areas
              ? Array.isArray(olimpiada.areas)
                ? olimpiada.areas.map((area) =>
                    typeof area === "object" && area.nombre ? area.nombre : area
                  )
                : [olimpiada.areas]
              : ["Matemáticas", "Física"],
            inscritos:
              olimpiada.participantes_count || olimpiada.inscritos || 0,
            modalidad: olimpiada.modalidad || "Virtual",
            fechaInicio: olimpiada.fecha_inicio || olimpiada.fechaInicio,
            edicion: olimpiada.edicion || "13",
            imagen: olimpiada.ruta_imagen_portada,
            ruta_pdf_detalles: olimpiada.ruta_pdf_detalles,
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
        setError(
          "No se pudieron cargar las olimpiadas. Por favor, contacte al administrador."
        );
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
    const fechaInicio = olimpiada.fecha_inicio
      ? new Date(olimpiada.fecha_inicio)
      : olimpiada.fechaInicio
      ? new Date(olimpiada.fechaInicio)
      : null;
    const fechaFin = olimpiada.fecha_fin
      ? new Date(olimpiada.fecha_fin)
      : olimpiada.fechaFin
      ? new Date(olimpiada.fechaFin)
      : null;

    // Si el backend ya envía un estado, lo usamos
    if (olimpiada.estado) {
      return olimpiada.estado;
    }

    // Si tiene campo activo pero no está activa, está terminada
    /* if (olimpiada.hasOwnProperty("activo") && !olimpiada.activo) {
      return "Terminado";
    }
 */
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

  // Función para convertir el estado a una clase CSS válida
  const getEstadoClass = (estado) => {
    // Mapear los estados del backend a las clases CSS
    switch (estado) {
      case "En Proceso":
      case "En Curso":
        return "en-curso";
      case "Pendiente":
        return "pendiente";
      case "Terminado":
        return "terminado";
      default:
        // Para cualquier otro estado, convertir a minúsculas y reemplazar espacios
        return estado.toLowerCase().replace(/ /g, "-");
    }
  };

  // Función para el botón de registro
  const handleRegistrarse = (id) => {
    localStorage.setItem("idOlimpiada", id); // guarda el ID
    localStorage.setItem("tipoInscripcion", "individual"); // guarda el tipo
    navigate("/user/inscripcion/opciones");
  };

  if (loading) {
    return <div className="loading">Cargando olimpiadas...</div>;
  }

  return (
    <div className="lista-olimpiadas-page">
      <div className="lista-olimpiadas-container">
        {error && <div className="error-message">{error}</div>}

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
                  <span
                    className={`estado-badge ${getEstadoClass(olimpiada.estado)}`}
                  >
                    {olimpiada.estado}
                  </span>
                </div>

                <div className="olimpiada-content">
                  <div className="olimpiada-logo">
                    {olimpiada.imagen ? (
                      <img
                        src={`http://localhost:8000/storage/${olimpiada.imagen}`}
                        alt="Portada de la olimpiada"
                        className="olimpiada-portada-img"
                        style={{ width: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "10px" }}
                      />
                    ) : (
                      <div className="sin-imagen">Sin imagen</div>
                    )}
                  </div>
                </div>

              <div className="olimpiada-info">
                <p>
                  <strong>Áreas:</strong>{" "}
                  {olimpiada.areas.length > 0
                    ? olimpiada.areas.join(", ")
                    : "No especificadas"}
                </p>
                {/* <p>
                  <strong>Inscritos:</strong> {olimpiada.inscritos}{" "}
                  participantes
                </p> */}
                <p>
                  <strong>Modalidad:</strong> {olimpiada.modalidad}
                </p>
              </div>
                <div className="olimpiada-info">
                  <p>
                    <strong>Áreas:</strong>{" "}
                    {olimpiada.areas.length > 0
                      ? olimpiada.areas.join(", ")
                      : "No especificadas"}
                  </p>
                  <p>
                    <strong>Inscritos:</strong> {olimpiada.inscritos}{" "}
                    participantes
                  </p>
                  <p>
                    <strong>Modalidad:</strong> {olimpiada.modalidad}
                  </p>
                  {olimpiada.ruta_pdf_detalles && (
                    <p>
                      <strong>Detalles Olimpiada:</strong>{" "}
                      <a
                        href={`http://localhost:8000/storage/${olimpiada.ruta_pdf_detalles}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver PDF de detalles"
                        className="pdf-icon-link"
                        style={{ color: '#d32f2f', fontSize: '1.2rem', verticalAlign: 'middle' }}
                      >
                        <FaFilePdf />
                      </a>
                    </p>
                  )}
                </div>

                <div className="olimpiada-acciones">
                  {olimpiada.estado === "En Curso" ||
                  olimpiada.estado === "En Proceso" ? (
                    <button
                      className="btn-registrarse"
                      onClick={() => handleRegistrarse(olimpiada.id)}
                    >
                      Registrarse
                    </button>
                  ) : olimpiada.estado === "Pendiente" ? (
                    <button className="btn-proximamente" disabled>
                      Próximamente
                    </button>
                  ) : (
                    <button className="btn-terminado" disabled>
                      Finalizado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaOlimpiadas;
