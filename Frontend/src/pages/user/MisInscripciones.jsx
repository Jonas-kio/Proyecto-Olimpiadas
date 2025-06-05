
//import React, { useEffect, useState } from "react";
import "../../styles/components/Inscripcion.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { optenerInscrion } from "../../services/inscripcionService"; // Asegúrate de que la ruta sea correcta

const MisInscripciones = () => {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

/*
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: - 20000, behavior: 'smooth' });
    }, 0);
  }, []);



  useEffect(() => {
    const data = localStorage.getItem("actualizarEstado");
    if (data) {
      const { id, nuevoEstado } = JSON.parse(data);
      setInscripciones((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item
        )
      );
      localStorage.removeItem("actualizarEstado");
    }
  }, []);
*/
  useEffect(() => {
    setTimeout(() => {
      headerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, []);

  const transformarDatos = (procesos) => {
    return procesos.map((proceso) => ({
      id: `#${proceso.boleta?.numero || `IN${proceso.id}`}`,
      areas: proceso.areas,
      fecha: proceso.fecha,
      monto: `Bs. ${proceso.monto}`,
      estado: mapearEstado(proceso.estado),
      // Datos adicionales que se podría necesitar
      procesoId: proceso.id,
      boletaId: proceso.boleta?.id,
      cantidadEstudiantes: proceso.cantidad_estudiantes,
      estadoOriginal: proceso.estado,
      estadoLabel: proceso.estado_label
    }));
  };

  const mapearEstado = (estadoApi) => {
    const estadoMap = {
      'pending': 'PENDIENTE',
      'approved': 'INSCRITO',
      'rejected': 'RECHAZADO'
    };
    return estadoMap[estadoApi] || estadoApi.toUpperCase();
  };

  useEffect(() => {
    const cargarInscripciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await optenerInscrion();
        
        if (response.data.success) {
          const datosTransformados = transformarDatos(response.data.procesos);
          setInscripciones(datosTransformados);
        } else {
          setError('Error al cargar las inscripciones');
        }
      } catch (err) {
        console.error('Error al obtener inscripciones:', err);
        setError('Error de conexión. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarInscripciones();
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("actualizarEstado");
    if (data) {
      const { id, nuevoEstado } = JSON.parse(data);
      setInscripciones((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item
        )
      );
      localStorage.removeItem("actualizarEstado");
    }
  }, []);

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "INSCRITO":
        return "estado inscrito";
      case "RECHAZADO":
        return "estado rechazado";
      case "PENDIENTE":
        return "estado pendiente";
      default:
        return "estado";
    }
  };

  const getBotonClass = (estado) => {
    return estado === "INSCRITO" ? "btn validar" : "btn rechazar";
  };

  const handleDetalleClick = (inscripcion) => {
    console.log("Inscripción seleccionada:", inscripcion);
    const idSinHash = inscripcion.procesoId;
    console.log("ID sin hash:", idSinHash);
    navigate(`/user/detalle-inscripcion/${idSinHash}`, {
      state: { 
        procesoId: inscripcion.procesoId,
      }
    });
  };

  if (loading) {
    return (
      <div className="contenedor-inscripciones">
        <h1 ref={headerRef} className="titulo-inscripciones">Mis Inscripciones</h1>
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="contenedor-inscripciones">
        <h1 ref={headerRef} className="titulo-inscripciones">Mis Inscripciones</h1>
        <div className="error-container" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-inscripciones">
      <h1 ref={headerRef} className="titulo-inscripciones">Mis Inscripciones</h1>
      <div className="tabla-contenedor">
        <table className="tabla-inscripciones">
          <thead>
            <tr>
              <th>ID Inscripción</th>
              <th>Áreas</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Validar</th>
              <th>Estudiante(s)</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No tienes inscripciones registradas
                </td>
              </tr>
            ) : (
              inscripciones.map((item, index) => (
                <tr key={item.procesoId || index}>
                  <td>{item.id}</td>
                  <td>{item.areas}</td>
                  <td>
                    {item.estado === "PENDIENTE" ? (
                      <span
                        className="link-fecha"
                        onClick={() => handleDetalleClick(item)}
                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                      >
                        {item.fecha}
                      </span>
                    ) : (
                      item.fecha
                    )}
                  </td>
                  <td>{item.monto}</td>
                  <td>
                    <span className={getEstadoClass(item.estado)}>
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (item.estado === "PENDIENTE") {
                          handleDetalleClick(item);
                        }
                      }}
                      className={getBotonClass(item.estado)}
                      disabled={item.estado !== "PENDIENTE"}
                    >
                      →
                    </button>
                  </td>
                  <td>
                    <button 
                      className={item.estado === "INSCRITO" ? "btn-ver" : "btn-ver disabled"}
                      onClick={() => {
                        if (item.estado === "INSCRITO") {
                          navigate(`/user/ocr/${item.procesoId}`, {
                            state: { 
                              procesoId: item.procesoId,
                              cantidadEstudiantes: item.cantidadEstudiantes 
                            }
                          });
                        }
                      }}
                      disabled={item.estado !== "INSCRITO"}
                    >
                      VER ({item.cantidadEstudiantes || 0})
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="tabla-paginacion">
          <span className="num_pag">1 de 2</span>
          <button className ="btn-ver" >{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default MisInscripciones;
