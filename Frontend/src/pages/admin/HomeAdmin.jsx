import React from "react";
import { FaUserAlt, FaBook, FaFileInvoice, FaCog } from "react-icons/fa";
import "../../styles/components/HomeAdmin.css"

const HomeAdmin = () => {
    return (
        <div className="admin-dashboard">
        {/* Estadísticas principales */}
        <div className="dashboard-stats">
            <div className="stat-card">
            <div className="stat-content">
                <h3>Total Inscritos</h3>
                <p>234</p>
            </div>
            <FaUserAlt className="stat-icon" />
            </div>
            <div className="stat-card">
            <div className="stat-content">
                <h3>Áreas Activas</h3>
                <p>6</p>
            </div>
            <FaBook className="stat-icon" />
            </div>
            <div className="stat-card">
            <div className="stat-content">
                <h3>Pagos Pendientes</h3>
                <p>45</p>
            </div>
            <FaFileInvoice className="stat-icon" />
            </div>
            <div className="stat-card">
            <div className="stat-content">
                <h3>Instituciones</h3>
                <p>12</p>
            </div>
            <FaCog className="stat-icon" />
            </div>
        </div>

        {/* Contenido adicional */}
        <div className="dashboard-content">
            {/* Inscripciones recientes */}
            <div className="recent-registrations">
            <h3>Inscripciones Recientes</h3>
            <ul>
                <li>
                <div>
                    <strong>Kevin Cossio</strong>
                    <p>Matemáticas - Nivel Avanzado</p>
                </div>
                <span>Hace 2 horas</span>
                </li>
                <li>
                <div>
                    <strong>Jhonatan Encinas</strong>
                    <p>Física - Nivel Intermedio</p>
                </div>
                <span>Hace 3 horas</span>
                </li>
                <li>
                <div>
                    <strong>Huascar Flores</strong>
                    <p>Química - Nivel Básico</p>
                </div>
                <span>Hace 5 horas</span>
                </li>
            </ul>
            </div>

            {/* Resumen de Pagos */}
            <div className="payment-summary">
            <h3>Resumen de Pagos</h3>
            <div className="payment-details">
                <p>Total Recaudado</p> <span>Bs. 9,600</span>
            </div>
            <div className="payment-details">
                <p>Pagos Pendientes</p> <span>Bs. 2,250</span>
            </div>
            <div className="payment-details">
                <p>Pagos Verificados</p> <span className="verified">85%</span>
            </div>
            <p className="info-message">45 pagos necesitan verificación. Revise la sección de participantes.</p>
            </div>
        </div>
        </div>
    );
    };

export default HomeAdmin;


