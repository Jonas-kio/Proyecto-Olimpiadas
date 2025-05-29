/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";


const ProcesandoModal = ({
  isOpen = true,
  title = "Procesando Comprobante",
  message = "El sistema está verificando su comprobante de pago.\nPor favor espere un momento...",
  
  progreso: progresoExterno = null
}) => {
  const [progresoInterno, setProgresoInterno] = useState(0);
  
  // Usar progreso externo si está disponible, de lo contrario usar el interno
  const progreso = progresoExterno !== null ? progresoExterno : progresoInterno;

  // Solo activar la animación automática si no se proporciona progreso externo
  useEffect(() => {
    if (progresoExterno === null) {
      const intervalo = setInterval(() => {
        setProgresoInterno((prev) => (prev >= 100 ? 100 : prev + 2));
      }, 100);
      return () => clearInterval(intervalo);
    }
  }, [progresoExterno]);

  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px 40px",
          borderRadius: "10px",
          width: "360px",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="spinner"
          style={{
            margin: "0 auto 20px",
            width: "40px",
            height: "40px",
            border: "4px solid #cbd5e1",
            borderTop: "4px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>

        <h3
          style={{ color: "#1e3a8a", fontWeight: "600", marginBottom: "10px" }}
        >
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "#333", whiteSpace: "pre-line" }}>{message}</p>

        <div
          style={{
            marginTop: "20px",
            height: "6px",
            width: "100%",
            backgroundColor: "#e5e7eb",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(progreso, 100)}%`,
              backgroundColor: "#2563eb",
              transition: "width 0.2s ease-in-out",
            }}
          />
        </div>
        
        {/* Mostrar porcentaje de progreso */}
        {progreso > 0 && (
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
            {Math.round(progreso)}%
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProcesandoModal;