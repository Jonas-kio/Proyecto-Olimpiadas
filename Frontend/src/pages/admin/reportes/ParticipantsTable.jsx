import React from 'react';
import "../../../styles/reportes/ParticipantsTable.css";

const ParticipantsTable = ({ data }) => {
  const getEstadoClass = (estado) => {
    switch (estado.toLowerCase()) {
      case "inscrito":
        return "badge badge-green";
      case "pendiente":
        return "badge badge-yellow";
      case "verificado":
        return "badge badge-blue";
      default:
        return "badge";
    }
  };

  return (
    <table className="participants-table">
      <thead className="table-header">
        <tr>
          <th className="header-cell">Participante</th>
          <th className="header-cell">Área</th>
          <th className="header-cell">Nivel</th>
          <th className="header-cell">Estado</th>
          <th className="header-cell">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index} className="table-row">
              <td className="table-cell">{item.Participante}</td>
              <td className="table-cell">{item.Área}</td>
              <td className="table-cell">{item.Nivel}</td>
              <td className="table-cell">
                <span className={getEstadoClass(item.Estado)}>{item.Estado}</span>
              </td>
              <td className="table-cell">{item.Fecha}</td>
            </tr>
          ))
        ) : (
          <tr className="table-row">
            <td colSpan="5" className="table-cell text-center no-data">
              No hay registros disponibles.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ParticipantsTable;
