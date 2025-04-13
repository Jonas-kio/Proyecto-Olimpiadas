/*
import React from "react";

const ValidacionExitosaModal = ({ onClose }) => {
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
        
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            stroke="white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            width="32"
            height="32"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 style={{ color: "#16a34a", fontWeight: "600", marginBottom: "10px" }}>
          ¡Validación Exitosa!
        </h3>

        <p style={{ fontSize: "14px", color: "#333", marginBottom: "20px" }}>
          Su comprobante ha sido verificado correctamente.
        </p>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 24px",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
};

export default ValidacionExitosaModal;
*/
import React from "react";

const ValidacionExitosaModal = ({ onClose, onConfirm }) => {
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
        {/* Ícono verde */}
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            stroke="white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            width="32"
            height="32"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 style={{ color: "#16a34a", fontWeight: "600", marginBottom: "10px" }}>
          ¡Validación Exitosa!
        </h3>

        <p style={{ fontSize: "14px", color: "#333", marginBottom: "20px" }}>
          Su comprobante ha sido verificado correctamente.
        </p>

        <button
          onClick={() => {
            if (onConfirm) onConfirm();
            if (onClose) onClose();
          }}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 24px",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
};

export default ValidacionExitosaModal;
