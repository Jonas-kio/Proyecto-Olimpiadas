/*
import React from 'react';
//import '@/styles/components/Inscripcion.css';
import "../../styles/components/Inscripcion.css";


const inscripciones = [
  { id: '#IN20250317-001', areas: 'Matemáticas, Física', fecha: '17/03/2025', monto: 'Bs. 150.00', estado: 'PENDIENTE' },
  { id: '#IN20250316-002', areas: 'Química', fecha: '16/03/2025', monto: 'Bs. 80.00', estado: 'INSCRITO' },
  { id: '#IN20250315-003', areas: 'Biología', fecha: '15/03/2025', monto: 'Bs. 75.00', estado: 'RECHAZADO' },
  { id: '#IN20250314-004', areas: 'Informática', fecha: '14/03/2025', monto: 'Bs. 100.00', estado: 'PENDIENTE' },
  { id: '#IN20250313-005', areas: 'Astronomía', fecha: '13/03/2025', monto: 'Bs. 120.00', estado: 'INSCRITO' },
];

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'INSCRITO': return 'bg-green-500';
    case 'PENDIENTE': return 'bg-orange-400';
    case 'RECHAZADO': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

const MisInscripciones = () => {
  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 0' }}>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6 text-blue-900">Mis Inscripciones</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-6 py-3">ID Inscripción</th>
                <th className="px-6 py-3">Áreas</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Validar</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-3">{item.id}</td>
                  <td className="px-6 py-3">{item.areas}</td>
                  <td className="px-6 py-3">{item.fecha}</td>
                  <td className="px-6 py-3">{item.monto}</td>
                  <td className="px-6 py-3">
                    <span className={`text-white px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button className={`text-white px-2 py-1 rounded-full ${item.estado === 'INSCRITO' ? 'bg-blue-600' : 'bg-red-600'}`}>
                      →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 text-center text-sm text-gray-700 bg-gray-100">
            <span className="px-2 py-1 border rounded">1 de 2</span>
            <button className="ml-2 px-3 py-1 border rounded bg-white text-blue-600">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisInscripciones;
*/

/*
martes 07 a las 23:46 pm
import React from "react";
import "../../styles/components/Inscripcion.css";


const inscripciones = [
  { id: "#IN20250317-001", areas: "Matemáticas, Física", fecha: "17/03/2025", monto: "Bs. 150.00", estado: "PENDIENTE" },
  { id: "#IN20250316-002", areas: "Química", fecha: "16/03/2025", monto: "Bs. 80.00", estado: "INSCRITO" },
  { id: "#IN20250315-003", areas: "Biología", fecha: "15/03/2025", monto: "Bs. 75.00", estado: "RECHAZADO" },
  { id: "#IN20250314-004", areas: "Informática", fecha: "14/03/2025", monto: "Bs. 100.00", estado: "PENDIENTE" },
  { id: "#IN20250313-005", areas: "Astronomía", fecha: "13/03/2025", monto: "Bs. 120.00", estado: "INSCRITO" },
];

const MisInscripciones = () => {
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
    <a href={`/detalle-inscripcion/${item.id}`} className="link-fecha">
      {item.fecha}
    </a>
  ) : (
    item.fecha
  )}
</td>

                <td>{item.monto}</td>
                <td><span className={getEstadoClass(item.estado)}>{item.estado}</span></td>
                <td>
                  <button className={getBotonClass(item.estado)}>→</button>
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
*/

import React from "react";
import "../../styles/components/Inscripcion.css";
import { useNavigate } from "react-router-dom";

const inscripciones = [
  { id: "#IN20250317-001", areas: "Matemáticas, Física", fecha: "17/03/2025", monto: "Bs. 150.00", estado: "PENDIENTE" },
  { id: "#IN20250316-002", areas: "Química", fecha: "16/03/2025", monto: "Bs. 80.00", estado: "INSCRITO" },
  { id: "#IN20250315-003", areas: "Biología", fecha: "15/03/2025", monto: "Bs. 75.00", estado: "RECHAZADO" },
  { id: "#IN20250314-004", areas: "Informática", fecha: "14/03/2025", monto: "Bs. 100.00", estado: "PENDIENTE" },
  { id: "#IN20250313-005", areas: "Astronomía", fecha: "13/03/2025", monto: "Bs. 120.00", estado: "INSCRITO" },
];

const MisInscripciones = () => {
  const navigate = useNavigate();

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
                   onClick={() => navigate(`/detalle-inscripcion/${item.id}`)}
                 >
                   {item.fecha}
                 </span>
                 
                  ) : (
                    item.fecha
                  )}
                </td>
                <td>{item.monto}</td>
                <td>
                  <span className={getEstadoClass(item.estado)}>{item.estado}</span>
                </td>
                <td>
                  <button
                    onClick={() => {
                      if (item.estado === "PENDIENTE") {
                        /*navigate(`/detalle-inscripcion/${item.id}`);*/
                        navigate(`/detalle-inscripcion/${item.id.replace("#", "")}`);

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


