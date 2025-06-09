import PropTypes from "prop-types";
import "../../styles/components/InscripcionIndividual.css";

const BotonesPaso = ({ paso, anterior, siguiente, puedeAvanzar }) => {
  return (
    <div className="botones">
      {paso > 1 && (
        <button type="button" onClick={anterior}>
          Anterior
        </button>
      )}      {paso < 4 ? (
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

BotonesPaso.propTypes = {
  paso: PropTypes.number.isRequired,
  anterior: PropTypes.func.isRequired,
  siguiente: PropTypes.func.isRequired,
  puedeAvanzar: PropTypes.func.isRequired,
};

export default BotonesPaso;
