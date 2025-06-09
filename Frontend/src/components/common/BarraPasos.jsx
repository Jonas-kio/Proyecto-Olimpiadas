import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const BarraPasos = ({ pasoActual }) => {
  const pasos = [
    "Datos Estudiante",
    "Datos Tutor",
    "Áreas de Competencia",
    "Confirmación",
  ];

  return (
    <div className="barra-pasos">
      {pasos.map((titulo, i) => (
        <div key={i} className={`paso ${pasoActual === i + 1 ? "activo" : ""}`}>
          <div className="numero">{i + 1}</div>
          <span>{titulo}</span>
        </div>
      ))}
    </div>
  );
};

export default BarraPasos;
