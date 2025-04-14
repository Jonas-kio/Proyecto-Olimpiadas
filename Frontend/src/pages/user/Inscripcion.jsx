import "../../styles/components/Inscripcion.css";

// import "./styles/Inscripcion.css";

import { useNavigate } from "react-router-dom";

const Inscripcion = () => {
  const navigate = useNavigate();
  return (
    <div className="inscripcion-container">
      <h1>Inscripción a Olimpiadas Científicas</h1>
      <p>
        Selecciona el tipo de inscripción que deseas realizar. Puedes
        inscribirte de forma individual o realizar una inscripción grupal si
        eres tutor o representante de una institución.
      </p>

      <div className="opciones">
        {/* Opción Individual */}
        <div className="card-inscripcion">
          <div className="icono">👤</div>
          <h2>Inscripción Individual</h2>
          <p>
            Para estudiantes que desean inscribirse de manera individual en una
            o más áreas de competencia.
          </p>
          <ul>
            <li>✔ Inscripción en múltiples áreas</li>
            <li>✔ Proceso simplificado</li>
            <li>✔ Pago individual</li>
          </ul>
          <button
            className="btn-primario"
            onClick={() => navigate("/user/inscripcion/inscripcion-individual")}
          >
            Inscripción Individual
          </button>
        </div>

        {/* Opción Grupal */}
        <div className="card-inscripcion">
          <div className="icono">👥</div>
          <h2>Inscripción Grupal</h2>
          <p>
            Para tutores o instituciones que desean inscribir a múltiples
            estudiantes de forma simultánea.
          </p>
          <ul>
            <li>✔ Inscripción masiva de estudiantes</li>
            <li>✔ Carga por planilla Excel</li>
            <li>✔ Pago consolidado</li>
          </ul>
          <button className="btn-primario">Inscripción Grupal</button>
        </div>
      </div>

      <div className="soporte">
        <p>¿Necesitas ayuda para decidir qué tipo de inscripción realizar?</p>
        <button className="btn-secundario">Contacta con soporte</button>
      </div>
    </div>
  );
};

export default Inscripcion;
