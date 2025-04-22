// ListaOlimpiadas.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import "../../styles/components/ListaOlimpiadas.css";
import "../../styles/components/Table.css";
import olimpiada14 from "../../assets/images/olimpiada14.png";

const ListaOlimpiadas = () => {
  const navigate = useNavigate();
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOlimpiadas = async () => {
      try {
        setOlimpiadas([
          {
            id: 1,
            nombre: "Olimpiada Científica 2025",
            estado: "Pendiente",
            areas: ["Matemáticas", "Física"],
            inscritos: 90,
            modalidad: "Virtual",
            fechaInicio: "2025-06-15",
            edicion: "13",
            imagen: olimpiada14
          },
          {
            id: 2,
            nombre: "Olimpiada Científica 2022",
            estado: "En Curso",
            areas: ["Matemáticas", "Física"],
            inscritos: 90,
            modalidad: "Virtual",
            fechaInicio: "2022-03-10",
            edicion: "12",
            imagen: olimpiada14
          },
          {
            id: 3,
            nombre: "Olimpiada Científica 2019",
            estado: "Terminado",
            areas: ["Química", "Robótica"],
            inscritos: 50,
            modalidad: "Presencial",
            fechaInicio: "2019-09-20",
            edicion: "11",
            imagen: olimpiada14
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar olimpiadas:", error);
        setLoading(false);
      }
    };

    fetchOlimpiadas();
  }, []);

  const handleRegistrarse = (id) => {
    navigate("/user/inscripcion/opciones");
  };

  if (loading) {
    return <div className="loading">Cargando olimpiadas...</div>;
  }

  return (
    <div className="lista-olimpiadas-container">
      <div className="olimpiadas-grid">
        {olimpiadas.map((olimpiada) => (
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
              <p><strong>Áreas:</strong> {olimpiada.areas.join(", ")}</p>
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
        ))}
      </div>
    </div>
  );
};

export default ListaOlimpiadas;