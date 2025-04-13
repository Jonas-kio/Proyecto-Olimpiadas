import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/components/Inscripcion.css";

import ProcesandoModal from "../../components/common/ProcesandoModal";
import ValidacionExitosaModal from "../../components/common/ValidacionExitosaModal";

const DetalleInscripcion = () => {
  const { id } = useParams();
  const [archivo, setArchivo] = useState(null);
  const [mensajeOcr, setMensajeOcr] = useState("Esperando archivo...");
  const [errorArchivo, setErrorArchivo] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validarArchivo = (file) => {
    if (!file) return false;

    if (!tiposPermitidos.includes(file.type)) {
      setErrorArchivo("Solo se permiten archivos PDF, JPG o PNG.");
      setArchivo(null);
      setMensajeOcr("Esperando archivo...");
      return false;
    }

    if (file.size > maxSizeBytes) {
      setErrorArchivo(`El archivo excede el tamaño permitido (máx. ${maxSizeMB} MB).`);
      setArchivo(null);
      setMensajeOcr("Esperando archivo...");
      return false;
    }

    setArchivo(file);
    setErrorArchivo("");
    setMensajeOcr("Archivo listo para validación OCR");
    return true;
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    validarArchivo(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files[0];
    validarArchivo(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = () => {
    setArrastrando(false);
  };

  const cargarComprobante = () => {
    if (!archivo) {
      setErrorArchivo("Debe seleccionar un archivo válido antes de cargar.");
      return;
    }

    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      setExito(true); // Mostrar modal de éxito
    }, 4000);
  };

  return (
    <div className="contenedor-inscripciones">
      {procesando && <ProcesandoModal />}
      {exito && <ValidacionExitosaModal onClose={() => setExito(false)} />}

      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "24px",
        paddingLeft: "calc((100% - 1000px) / 2)",
        height: "48px"
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "#2563eb",
            border: "none",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            marginRight: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            padding: 0
          }}
          aria-label="Volver"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            style={{ width: "20px", height: "20px" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#1e3a8a", margin: 0 }}>
          Detalle de Inscripción
        </h1>
      </div>

      <div className="detalle-contenedor">
        <div className="detalle-info" style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "12px" }}>
            Información de Inscripción
          </h3>
          <div className="detalle-datos" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>ID Inscripción:</strong> {id}<br />
              <strong>Áreas:</strong> Matemáticas, Física
            </div>
            <div>
              <strong>Total a pagar:</strong> Bs. 150.00<br />
              <strong>Fecha:</strong> 17/03/2025<br />
              <span className="estado pendiente">PENDIENTE</span>
            </div>
          </div>
        </div>

        <h3 className="detalle-subtitulo">Cargar Comprobante de Pago</h3>

        <div className="carga-contenedor" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div
            className={`upload-box ${arrastrando ? "arrastrando" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{ flex: 1, minWidth: "300px", textAlign: "center" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#6b7280"
              style={{ marginBottom: "8px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0L6 10m6-6l6 6M4 20h16"
              />
            </svg>

            <p className="upload-instruccion" style={{ margin: "8px 0 4px", color: "#666" }}>
              Arrastre la imagen del comprobante aquí
            </p>

            <div style={{ fontSize: "14px", margin: "4px 0", color: "#999" }}>o</div>

            <input
              type="file"
              id="archivo"
              accept="application/pdf,image/*"
              style={{ display: "none" }}
              onChange={handleArchivoChange}
            />
            <label htmlFor="archivo" className="btn seleccionar" style={{ marginTop: "4px" }}>
              {archivo ? "Cambiar archivo" : "Seleccionar archivo"}
            </label>
            {archivo && <p style={{ marginTop: "8px", fontSize: "13px" }}>{archivo.name}</p>}
          </div>

          <div className="preview-box" style={{ flex: 1, minWidth: "300px" }}>
            {archivo ? (
              archivo.type.startsWith("image/") ? (
                <>
                  <p>{archivo.name}</p>
                  <img
                    src={URL.createObjectURL(archivo)}
                    alt="Vista previa"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                </>
              ) : (
                <>
                  <p>{archivo.name}</p>
                  <iframe
                    src={`${URL.createObjectURL(archivo)}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="300px"
                    title="Vista previa del PDF"
                    style={{ border: "none" }}
                  ></iframe>
                </>
              )
            ) : (
              "Vista previa del comprobante"
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "10px" }}>
          <div style={{ flex: 1 }}>
            <button className="btn validar" onClick={cargarComprobante}>Cargar Comprobante</button>
          </div>
          <div style={{ flex: 1 }}>
            <div className="ocr-estado">
              Estado de validación OCR: <span>{mensajeOcr}</span>
            </div>
          </div>
        </div>

        {errorArchivo && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorArchivo}</p>
        )}
      </div>
    </div>
  );
};

export default DetalleInscripcion;
