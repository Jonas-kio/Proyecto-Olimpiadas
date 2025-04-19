
import React, { useEffect, useState } from "react";
import "../../styles/components/Inscripcion.css";
import { useNavigate } from "react-router-dom";

const MisInscripciones = () => {
  const navigate = useNavigate();

  const [inscripciones, setInscripciones] = useState([
    { id: "#IN20250317-001", areas: "Matemáticas, Física", fecha: "17/03/2025", monto: "Bs. 150.00", estado: "PENDIENTE" },
    { id: "#IN20250316-002", areas: "Química", fecha: "16/03/2025", monto: "Bs. 80.00", estado: "INSCRITO" },
    { id: "#IN20250315-003", areas: "Biología", fecha: "15/03/2025", monto: "Bs. 75.00", estado: "RECHAZADO" },
    { id: "#IN20250314-004", areas: "Informática", fecha: "14/03/2025", monto: "Bs. 100.00", estado: "PENDIENTE" },
    { id: "#IN20250313-005", areas: "Astronomía", fecha: "13/03/2025", monto: "Bs. 120.00", estado: "INSCRITO" },
  ]);

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

  return (
    <div className="contenedor-inscripciones">
      <h1 className="titulo-inscripciones">Mis Inscripciones</h1>
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
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.areas}</td>
                <td>
                  {item.estado === "PENDIENTE" ? (
                    <span
                      className="link-fecha"
                      onClick={() =>
                        navigate(`detalle-inscripcion/${item.id.replace("#", "")}`)
                      }
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
                        navigate(`/user/detalle-inscripcion/${item.id.replace("#", "")}`);
                      }
                    }}
                    className={getBotonClass(item.estado)}
                  >
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabla-paginacion">
          <span>1 de 2</span>
          <button>{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default MisInscripciones;
