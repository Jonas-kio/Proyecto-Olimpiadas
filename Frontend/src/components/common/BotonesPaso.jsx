import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const BotonesPaso = ({ paso, anterior, siguiente, puedeAvanzar }) => {
  return (
    <div className="botones">
      {paso > 1 && (
        <button type="button" onClick={anterior}>
          Anterior
        </button>
      )}

      {paso < 4 ? (
        <button
          type="button"
          onClick={siguiente}
          disabled={!puedeAvanzar()}
          style={!puedeAvanzar() ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          Siguiente
        </button>
      ) : (
        <button type="submit">Confirmar y Generar Boleta</button>
      )}
    </div>
  );
};

export default BotonesPaso;
