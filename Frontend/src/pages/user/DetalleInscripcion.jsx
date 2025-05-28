import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../../styles/components/Inscripcion.css";
import ProcesandoModal from "../../components/common/ProcesandoModal";
import ValidacionExitosaModal from "../../components/common/ValidacionExitosaModal";
import { FaDownload, FaPrint } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { optenerInscripcionId, ValidarProcesoOCR } from "../../services/inscripcionService";

import { createWorker } from "tesseract.js"; 


const DetalleInscripcion = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { procesoId: locationProcesoId } = location.state || {};
  const { id: urlId } = useParams() || {};
  const procesoId = urlId || locationProcesoId;
  const procesoIdNumerico = procesoId ? Number(procesoId) : null;

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


  const [progresoOcr, setProgresoOcr] = useState(0);
  const [, setTextoExtraido] = useState("");
  const workerRef = useRef(null);

  const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    const initWorker = async () => {
      try {
        console.log("Inicializando worker de Tesseract v6.0.1...");
        
        // API para Tesseract.js v6.0.1
        const worker = await createWorker('spa', {
          logger: m => {
            if (m && typeof m.progress !== 'undefined') {
              setProgresoOcr(m.progress * 100);
              setMensajeOcr(`Procesando OCR: ${m.status || ''} (${Math.round(m.progress * 100)}%)`);
            }
          }
        });
        
        workerRef.current = worker;
        console.log("Worker de Tesseract inicializado correctamente");
      } catch (error) {
        console.error("Error al inicializar Tesseract worker:", error);
        setErrorArchivo(`Error al inicializar OCR: ${error.message}`);
      }
    };

    initWorker();

    // Limpieza al desmontar
    return () => {
      if (workerRef.current) {
        (async () => {
          try {
            await workerRef.current.terminate();
            console.log("Worker de Tesseract terminado correctamente");
          } catch (error) {
            console.error("Error al terminar el worker:", error);
          }
        })();
        workerRef.current = null;
      }
    };
  }, []);

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


  const extraerTextoConOCR = async (imagenData) => {
    try {
      if (!workerRef.current) {
        console.log("Worker no inicializado, utilizando método alternativo");
        setErrorArchivo("El servicio OCR no está listo. Intentando inicializar...");
        
        // Versión específica para Tesseract.js v6.0.1
        const worker = await createWorker('spa');
        workerRef.current = worker;
      }
        
      console.log("Iniciando reconocimiento OCR...");
      
      // En Tesseract.js v6.0.1, recognize devuelve un objeto diferente
      const resultado = await workerRef.current.recognize(imagenData);
      
      // En v6.0.1, el texto está directamente en resultado.data.text
      const texto = resultado.data.text;
      
      console.log("Texto extraído:", texto);
      setTextoExtraido(texto);
      return texto;
    } catch (err) {
      console.error("Error en el procesamiento OCR:", err);
      setErrorArchivo(`Error en el procesamiento OCR: ${err.message || "Error desconocido"}`);
      return null;
    }
  };

  const enviarTextoAlBackend = async (texto, imagenData) => {
    try {
      console.log("Enviando datos al servicio OCR...");
      
      // Verificar que procesoId exista y sea un número válido
      if (!procesoIdNumerico || isNaN(procesoIdNumerico)) {
        console.error("Error: ID del proceso no disponible o inválido:", procesoId);
        setErrorArchivo("No se pudo obtener un ID de proceso de inscripción válido");
        return false;
      }

      // Crear el payload con el nombre correcto de la propiedad y asegurando que es un número
      let payload = {
        texto: texto,
        registration_process_id: procesoIdNumerico, // Asegurar que sea un número
        comprobante: null
      };

      console.log("Proceso ID que se enviará (numérico):", procesoIdNumerico);

      if (imagenData && imagenData.startsWith('data:')) {
        if (imagenData.length > 1000000) {
          console.log("Imagen muy grande, intentando reducir tamaño...");
        }
        payload.comprobante = imagenData;
      } else if (archivo) {
        const base64 = await convertirArchivoABase64(archivo);
        payload.comprobante = base64;
      }

      const payloadSize = JSON.stringify(payload).length;
      console.log(`Tamaño del payload: ${Math.round(payloadSize / 1024)}KB`);
      
      if (payloadSize > 10485760) {
        throw new Error("El archivo es demasiado grande para ser procesado. Intente con una imagen de menor tamaño.");
      }
      
      // Corregir la validación para que coincida con los nombres de las propiedades del payload
      if (!payload.texto || !payload.comprobante || !payload.registration_process_id) {
        console.error("Faltan datos en el payload:", {
          tieneTexto: !!payload.texto,
          tieneComprobante: !!payload.comprobante,
          tieneProcesoId: !!payload.registration_process_id
        });
        throw new Error("Faltan datos requeridos para la validación");
      }
      
      console.log("Enviando payload OCR con campos:", Object.keys(payload), 
                  "y proceso ID:", payload.registration_process_id);

      const response = await ValidarProcesoOCR(payload);
      
      if (response && response.success) {
        console.log("Validación exitosa:", response);
        return true;
      } else {
        const errorMsg = response?.mensaje || response?.message || "Error desconocido al validar el comprobante";
        console.error("Error de validación:", errorMsg);
        setErrorArchivo(errorMsg);
        return false;
      }
    } catch (err) {
      console.error("Error al enviar datos al backend:", err);
      
      let mensajeError = "Error de conexión al validar el comprobante";
      if (err.response) {
        console.error("Respuesta del servidor:", err.response.data);
        mensajeError = err.response.data.message || err.response.data.mensaje || 
                      `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setErrorArchivo(mensajeError);
      return false;
    }
  };

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

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

  const cargarComprobante = async () => {
    if (!archivo) {
      setErrorArchivo("Debe seleccionar un archivo válido antes de cargar.");
      return;
    }

    setProcesando(true);
    setMensajeOcr("Iniciando procesamiento OCR...");
    setProgresoOcr(0);
    setErrorArchivo("");
    
    try {
      // Si es un PDF, puede requerir tratamiento especial
      if (archivo.type === "application/pdf") {
        setErrorArchivo("El procesamiento de PDF requiere conversión a imagen. Intente con una imagen JPG o PNG.");
        setProcesando(false);
        return;
      }
      
      // Convertir el archivo a base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const imagenBase64 = e.target.result;
          console.log("Imagen cargada, iniciando OCR...");
          
          // Extraer texto con OCR
          const textoOCR = await extraerTextoConOCR(imagenBase64);
          
          if (textoOCR && textoOCR.trim().length > 0) {
            console.log("Texto OCR obtenido, enviando al backend...");
            
            // Enviar el texto y la imagen al backend
            const enviado = await enviarTextoAlBackend(textoOCR, imagenBase64);
            
            setProcesando(false);
            
            if (enviado) {
              setExito(true);
            }
          } else {
            setProcesando(false);
            setErrorArchivo("No se pudo extraer texto del comprobante. Intente con una imagen más clara.");
          }
        } catch (err) {
          console.error("Error en el procesamiento:", err);
          setProcesando(false);
          setErrorArchivo(`Error: ${err.message}`);
        }
      };
      
      reader.onerror = () => {
        setProcesando(false);
        setErrorArchivo("Error al leer el archivo");
      };
      
      reader.readAsDataURL(archivo);
      
    } catch (err) {
      console.error("Error general:", err);
      setProcesando(false);
      setErrorArchivo(`Error general: ${err.message}`);
    }
  };

  const cerrarModalExito = () => {
    setExito(false);
    setValidado(true);
    
    // Usar procesoDetalle.id en lugar de id
    const idInscripcion = procesoDetalle?.boleta?.numero || `IN${procesoDetalle?.id}`;
    
    localStorage.setItem("actualizarEstado", JSON.stringify({
      id: `#${idInscripcion}`,
      nuevoEstado: "INSCRITO"
    }));
    
    navigate(`/user/detalle-inscripcion/${procesoId}`);
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
      {procesando && (
        <ProcesandoModal 
          isOpen={true}
          title="Procesando OCR"
          message={mensajeOcr}
          progreso={progresoOcr}
        />
      )}
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
                {progresoOcr > 0 && progresoOcr < 100 && (
                  <div className="progress-bar" style={{ 
                    height: '6px', 
                    background: '#e2e8f0', 
                    borderRadius: '3px', 
                    marginTop: '8px' 
                  }}>
                    <div style={{ 
                      width: `${progresoOcr}%`, 
                      height: '100%', 
                      backgroundColor: '#3b82f6', 
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                )}
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
                href={archivo ? URL.createObjectURL(archivo) : '#'}
                download={`Comprobante_${procesoDetalle?.id || 'inscripcion'}.pdf`}
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
