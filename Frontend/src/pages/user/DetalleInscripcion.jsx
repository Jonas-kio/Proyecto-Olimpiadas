import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/components/Inscripcion.css";
import ProcesandoModal from "../../components/common/ProcesandoModal";
import ValidacionExitosaModal from "../../components/common/ValidacionExitosaModal";
import { FaDownload, FaPrint } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { optenerInscripcionId } from "../../services/inscripcionService"; 


const DetalleInscripcion = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { procesoId } = location.state || {};

  const [archivo, setArchivo] = useState(null);
  const [mensajeOcr, setMensajeOcr] = useState("Esperando archivo...");
  const [errorArchivo, setErrorArchivo] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);
  const [validado, setValidado] = useState(false);

  const [procesoDetalle, setProcesoDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    const cargarDetalleInscripcion = async () => {
      try {
        setLoading(true);
        setError(null);

        if (procesoId) {
          const response = await optenerInscripcionId(procesoId);
          if (response.success) {
            setProcesoDetalle(response.proceso);
          } else {
            setError("No se encontró el detalle de la inscripción.");
          }
        } else {
          setError("ID de inscripción no proporcionado.");
        }
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        setError("Error al cargar los datos de la inscripción.");
      } finally {
        setLoading(false);
      }
    };

    cargarDetalleInscripcion();
  }, [procesoId]);

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
      setExito(true);
    }, 4000);
  };

  const cerrarModalExito = () => {
    setExito(false);
    setValidado(true);
    // Guardar estado validado en localStorage para MisInscripciones.jsx
    localStorage.setItem("actualizarEstado", JSON.stringify({
      id: `#${id}`,
      nuevoEstado: "INSCRITO"
    }));
    navigate(`/user/detalle-inscripcion/${id}`); //redireccionamiento a Detalle de Inscripción
  };

   const getEstadoTexto = (estado) => {
    const estadoMap = {
      'pending': 'PENDIENTE',
      'approved': 'INSCRITO', 
      'rejected': 'RECHAZADO'
    };
    return estadoMap[estado] || estado.toUpperCase();
  };

  const getEstadoClass = (estado) => {
    const estadoMap = {
      'pending': 'pendiente',
      'approved': 'inscrito',
      'rejected': 'rechazado'
    };
    return `estado ${estadoMap[estado] || 'pendiente'}`;
  };

  if (loading) {
    return <p>Cargando detalle de inscripción...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="contenedor-inscripciones">
      {procesando && <ProcesandoModal />}
      {exito && (
        <ValidacionExitosaModal
          inscripcionId={`#${procesoId}`}
          onClose={cerrarModalExito}
        />
      )}

      <div className="detalle-contenedor">

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>

        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "#1d4ed8",
            border: "none",
            width: "50px",
            height: "50px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            marginRight: "12px"
          }}
        >
          <FaArrowLeft color="white" size={24} />
        </button>





        <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#1e3a8a", margin: 0 }}>
          Detalle de Inscripción
        </h1>
      </div>


      <div className="detalle-info" style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "12px" }}>
          Información de Inscripción
        </h3>
        <div className="detalle-datos" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <strong>ID Inscripción:</strong> {procesoDetalle.boleta?.numero || `#IN${procesoDetalle.id}`}<br />
            <strong>Áreas:</strong> {procesoDetalle.areas}<br />
            <strong>Olimpiada:</strong> {procesoDetalle.olimpiada?.nombre || "N/A"}<br />
            <strong>Tipo:</strong> {procesoDetalle.tipo ? procesoDetalle.tipo.charAt(0).toUpperCase() + procesoDetalle.tipo.slice(1) : "N/A"}<br />
            <strong>Estudiantes:</strong> {procesoDetalle.cantidad_estudiantes || 0}
          </div>
          <div>
            <strong>Total a pagar:</strong> Bs. {procesoDetalle.monto || "0"}<br />
            <strong>Fecha:</strong> {procesoDetalle.fecha || "N/A"}<br />
            <span className={getEstadoClass(procesoDetalle.estado)}>
              {getEstadoTexto(procesoDetalle.estado)}
            </span>
          </div>
        </div>
      </div>

        {!validado && (
          <>
            <h3 className="detalle-subtitulo">Cargar Comprobante de Pago</h3>

            <div className="carga-contenedor" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div
                className={`upload-box ${arrastrando ? "arrastrando" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ flex: 1, minWidth: "300px", textAlign: "center" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                  viewBox="0 0 24 24" strokeWidth="1.5" stroke="#6b7280" style={{ marginBottom: "8px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 16V4m0 0L6 10m6-6l6 6M4 20h16" />
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
                      <img src={URL.createObjectURL(archivo)} alt="Vista previa"
                        style={{ maxWidth: "100%", maxHeight: "200px" }} />
                    </>
                  ) : (
                    <>
                      <p>{archivo.name}</p>
                      <iframe src={`${URL.createObjectURL(archivo)}#toolbar=0&navpanes=0&scrollbar=0`}
                        width="100%" height="300px" title="Vista previa del PDF" style={{ border: "none" }}></iframe>
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
          </>
        )}

        {validado && (
          <>
            <h3 className="detalle-subtitulo">Detalles del Pago</h3>
            <div style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              gap: "20px"
            }}>
              <div>
                <p><strong>Número de Comprobante:</strong> 2172394108</p>
                <p><strong>Fecha de Pago:</strong> 17/03/2025</p>
                <p><strong>Monto Pagado:</strong> Bs. 150.00</p>
                <p><strong>Método de Pago:</strong> Transferencia Bancaria</p>
                <p><strong>Validado por:</strong> Sistema OCR</p>
              </div>
              <div style={{
                width: "300px",
                height: "180px",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "4px"
              }}>
              </div>
            </div>

            <div className="botones-comprobante">

            <a
    href={URL.createObjectURL(archivo)}
    download={`Comprobante_${id}.pdf`} // funcion descargar en archivo pdf
    className="btn-descargar" 
    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
  >
    <FaDownload className="icono" /> DESCARGAR COMPROBANTE
  </a>

              <button className="btn-imprimir" onClick={() => window.print()}>
                <FaPrint className="icono" /> IMPRIMIR
              </button>

              <button className="btn-descargar" onClick={() => navigate('/user/ocr')}>
                VER ESTUDIANTES ASOCIADOS
              </button>
            </div>

            <div style={{
              marginTop: "20px",
              backgroundColor: "#e0fce3",
              color: "#16a34a",
              padding: "10px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span>✅</span> Validación exitosa
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetalleInscripcion;
