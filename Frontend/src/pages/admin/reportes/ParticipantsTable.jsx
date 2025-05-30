import React from 'react';
import "../../../styles/reportes/ParticipantsTable.css";

const ParticipantsTable = ({ data }) => {
  const getEstadoClass = (estado) => {
    switch (estado.toLowerCase()) {
      case "inscrito": return "badge badge-green";
      case "pendiente": return "badge badge-yellow";
      case "verificado": return "badge badge-blue";
      default: return "badge";
    }
  };

  // 🔎 Agrupar data por OlimpiadaId
  const groupedByOlimpiada = data.reduce((acc, item) => {
    const key = item.OlimpiadaId || 'Sin Olimpiada';
    if (!acc[key]) acc[key] = { olimpiada: item.Olimpiada || "Olimpiada Desconocida", participantes: [] };
    acc[key].participantes.push(item);
    return acc;
  }, {});

  return (
    <div className="participants-container">
      {Object.keys(groupedByOlimpiada).length > 0 ? (
        Object.entries(groupedByOlimpiada).map(([id, group]) => (
          <div key={id} className="olimpiada-group">
            <div className="olimpiada-header222">
              <h3 className="olimpiada-title222">{group.olimpiada}</h3>
              <span className="olimpiada-count222">({group.participantes.length} Participantes)</span>
            </div>

            <div className="table-wrapper">
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
                  {group.participantes.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-cell">{item.Participante}</td>
                      <td className="table-cell">{item.Área}</td>
                      <td className="table-cell">{item.Nivel}</td>
                      <td className="table-cell">
                        <span className={getEstadoClass(item.Estado)}>{item.Estado}</span>
                      </td>
                      <td className="table-cell">{item.Fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="no-data">No hay registros disponibles.</p>
      )}
    </div>
  );
};

export default ParticipantsTable;
