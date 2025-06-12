import PropTypes from "prop-types";
import "../../styles/components/InscripcionIndividual.css";

const BarraPasos = ({ pasoActual, pasos }) => {
  const pasosDefault = [
    "Datos Estudiante",
    "Datos Tutor",
    "Áreas de Competencia",
    "Confirmación",
  ];
  
  const pasosActuales = pasos || pasosDefault;
  return (
    <div className="barra-pasos">
      {pasosActuales.map((titulo, i) => (
        <div key={i} className={`paso ${pasoActual === i + 1 ? "activo" : ""}`}>
          <div className="numero">{i + 1}</div>
          <span>{titulo}</span>
        </div>
      ))}
    </div>
  );
};

BarraPasos.propTypes = {
  pasoActual: PropTypes.number.isRequired,
  pasos: PropTypes.arrayOf(PropTypes.string),
};

export default BarraPasos;
