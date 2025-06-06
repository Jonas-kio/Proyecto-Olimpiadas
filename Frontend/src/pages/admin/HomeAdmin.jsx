import React, { useEffect, useState } from "react";
import {getDashboardSummary, getRecentRegistrations, getPaymentSummary} from "../../services/reportesService";
import {FaUserGraduate, FaUserAlt, FaBook, FaFileInvoice,FaSchool} from "react-icons/fa";
import LoadingModal from "../../components/modals/LoadingModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "../../styles/components/HomeAdmin.css";
// Configurar dayjs con plugin y localización
dayjs.extend(relativeTime);
dayjs.locale("es");

const HomeAdmin = () => {
  const [summary, setSummary] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [pagos, setPagos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumenData, recientesData, pagosData] = await Promise.all([
          getDashboardSummary(),
          getRecentRegistrations(),
          getPaymentSummary(),
        ]);
        setSummary(resumenData);
        setRecientes(recientesData);
        setPagos(pagosData);
      } catch (err) {
        console.error("Error al cargar el dashboard:", err);
        setError("Error al cargar el panel de administración, no se pudo conectar al servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <LoadingModal isOpen={loading} />

      {!loading && error && (
        <div className="admin-dashboard">
          <p className="error-message">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-dashboard">

          {/* Tarjetas resumen */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-content">
                <h3>Total Inscritos</h3>
                <p>{summary.total_inscritos}</p>
              </div>
              <FaUserGraduate className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Total Participantes</h3>
                <p>{summary.participantes_unicos}</p>
              </div>
              <FaUserAlt className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Áreas Activas</h3>
                <p>{summary.areas_activas}</p>
              </div>
              <FaBook className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Pagos Pendientes</h3>
                <p>{pagos.registros_pendientes}</p>
              </div>
              <FaFileInvoice className="stat-icon" />
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Instituciones</h3>
                <p>{summary.instituciones}</p>
              </div>
              <FaSchool className="stat-icon2" />
            </div>
          </div>

          {/* Contenido inferior */}
          <div className="dashboard-content">

            {/* Lista de inscripciones recientes */}
            <div className="recent-registrations">
              <h3>Inscripciones Recientes</h3>
              <ul>
                {[...recientes]
                  .sort((a, b) => {
                    if (!a.created_at) return 1; // manda sin fecha al final
                    if (!b.created_at) return -1;
                    return dayjs(b.created_at).diff(dayjs(a.created_at)); // más reciente 
                  })
                  .map((r, index) => (
                    <li key={index}>
                      <div>
                        <strong>{r.nombres} {r.apellidos}</strong>
                        <p>{r.area} - Nivel {r.nivel}</p>
                      </div>
                      <span>
                        {r.created_at
                          ? dayjs().diff(dayjs(r.created_at), "day") > 7
                            ? dayjs(r.created_at).format("DD [de] MMMM [de] YYYY") //[a las] HH:mm
                            : dayjs(r.created_at).fromNow()
                          : "Sin fecha"}
                      </span>
                    </li>
                ))}
                {recientes.length === 0 && (
                  <li className="no-inscriptions">No hay inscripciones recientes.</li>
                )}
              </ul>
            </div>

            {/* Resumen de pagos */}
            <div className="payment-summary">
              <h3>Resumen de Pagos</h3>

              <div className="payment-details">
                <p>Total Recaudado</p>
                <span>Bs. {pagos.total_recaudado}</span>
              </div>

              <div className="payment-details">
                <p>Pagos Pendientes</p>
                <span>Bs. {pagos.total_pendiente}</span>
              </div>

              <div className="payment-details">
                <p>Pagos Verificados</p>
                <span className="verified">{pagos.porcentaje_verificado}%</span>
              </div>

              <p className="info-message">
                {pagos.registros_pendientes} pagos necesitan verificación. Revise la sección de reportes.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeAdmin;