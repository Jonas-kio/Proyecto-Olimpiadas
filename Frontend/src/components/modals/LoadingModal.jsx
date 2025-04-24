/*-
import React from 'react';
import '../../styles/components/LoadingModal.css';

const LoadingModal = ({ isOpen, message = "Por favor espere mientras se cargan los datos..." }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal__overlay">
      <div className="delete-modal__content">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <h2 className="delete-modal__title">Cargando Datos</h2>
        <p className="delete-modal__message">{message}</p>
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
*/
import React from "react";

const LoadingModal = ({ isOpen, message = "Cargando datos, por favor espere..." }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px 40px",
        borderRadius: "10px",
        width: "360px",
        textAlign: "center",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
      }}>
        {/* Spinner estilo círculo azul */}
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "6px solid #cce3ff",
          borderTop: "6px solid #0a3f7d",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />

        {/* Mensajes */}
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>Cargando datos</h2>
        <p style={{ marginBottom: "20px" }}>{message}</p>

        {/* Barra de carga */}
        <div style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#eee",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <div style={{
            width: "60%",
            height: "100%",
            backgroundColor: "#0a3f7d",
            animation: "loadingBar 1.5s infinite"
          }} />
        </div>
      </div>

      {/* Animaciones embebidas */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingModal;
