import React from "react";

const ValidacionExitosaModal = ({ onClose, inscripcionId }) => {
  const handleAceptar = () => {
    localStorage.setItem("actualizarEstado", JSON.stringify({
      id: inscripcionId,
      nuevoEstado: "INSCRITO"
    }));
    onClose();
  };

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
          <svg xmlns="http://www.w3.org/2000/svg" stroke="white" fill="none" viewBox="0 0 24 24" width="36" height="36">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>¡Validación Exitosa!</h2>
        <p style={{ marginBottom: "20px" }}>El comprobante fue verificado correctamente.</p>
        <button onClick={handleAceptar} style={{
          backgroundColor: "#2563eb",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer"
        }}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ValidacionExitosaModal;

