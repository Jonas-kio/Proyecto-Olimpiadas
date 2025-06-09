/* eslint-disable react/prop-types */
// components/boleta/BoletaPagoGrupal.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  generarBoletaPDF,
  generarEnlacesCorreo,
  obtenerDatosBoleta
} from "../../services/boletaService";
import "../../styles/components/BoletaPago.css";
import LoadingModal from '../../components/modals/LoadingModal';
import {
  FaDownload,
  FaEnvelope,
  FaSpinner,
  FaCheck,
  FaArrowLeft,
  FaGoogle,
  FaMicrosoft,
  FaEye,
} from "react-icons/fa";

const BoletaPagoGrupal = ({
  competidores,
  tutores,
  areasSeleccionadas,
  numeroBoleta,
  registration_process_id,
  boleta_id,
  onVolver,
}) => {
  const [correoDestino, setCorreoDestino] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estadoMensaje, setEstadoMensaje] = useState(""); // 'success', 'error', 'info'
  const [mostrarOpcionesCorreo, setMostrarOpcionesCorreo] = useState(false);
  const [enlacesCorreo, setEnlacesCorreo] = useState(null);

  const [datosBoleta, setDatosBoleta] = useState(null);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {    const cargarDatosBoleta = async () => {
      try {
        if (registration_process_id && boleta_id) {
          setCargando(true);
          // Usar esGrupal=true para inscripciones grupales
          const respuesta = await obtenerDatosBoleta(registration_process_id, boleta_id, true);
          setDatosBoleta(respuesta.data);
          
          // Guardar en localStorage para mantener compatibilidad con el código existente
          localStorage.setItem("costosResumen", JSON.stringify(respuesta.data.costo));
          mostrarMensajeTemporal("Información de boleta cargada correctamente", "success");
        }
      } catch (error) {
        console.error("Error al cargar datos de la boleta:", error);
        mostrarMensajeTemporal("No se pudieron cargar los datos completos de la boleta", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarDatosBoleta();
  }, [registration_process_id, boleta_id]);

  const resumenCostos = datosBoleta?.costo;
  const totalPago = resumenCostos?.monto_total_formateado || "0.00"

  // Para inscripciones grupales, usar el primer competidor como referencia para el correo
  const competidorPrincipal = useMemo(() => {
    return competidores?.[0] || {};
  }, [competidores]);

  useEffect(() => {
    setCorreoDestino(competidorPrincipal.correo_electronico || "");
  }, [competidorPrincipal]);

  const mostrarMensajeTemporal = (msg, tipo = "info") => {
    setMensaje(msg);
    setEstadoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
      setEstadoMensaje("");
    }, 5000);
  };

  const descargarBoleta = async () => {
    try {
      setDescargando(true);
      mostrarMensajeTemporal("Generando PDF...", "info");

      if (datosBoleta) {
        const boletaPDF = await generarBoletaPDF(
          datosBoleta.competidores[0] || competidorPrincipal,
          datosBoleta.competidores[0]?.tutores || tutores,
          datosBoleta.seleccion?.areas || areasSeleccionadas,
          datosBoleta.boleta?.numero_boleta || numeroBoleta,
          datosBoleta.costo
        );

        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_Grupal_${datosBoleta.boleta?.numero_boleta || numeroBoleta}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        mostrarMensajeTemporal("Boleta descargada correctamente", "success");
      } else {
        const boletaPDF = await generarBoletaPDF(
          competidorPrincipal,
          tutores,
          areasSeleccionadas,
          numeroBoleta
        );
        
        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_Grupal_${numeroBoleta}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        mostrarMensajeTemporal("Boleta descargada correctamente", "success");
      }
    } catch (error) {
      console.error("Error al descargar boleta:", error);
      mostrarMensajeTemporal("Error al generar la boleta. Intente nuevamente.", "error");
    } finally {
      setDescargando(false);
    }
  };

  const enviarCorreo = async () => {
    if (!correoDestino) {
      mostrarMensajeTemporal("Ingrese un correo electrónico válido", "error");
      return;
    }

    try {
      setEnviando(true);
      mostrarMensajeTemporal("Preparando envío...", "info");

      const resumen = JSON.parse(localStorage.getItem("costosResumen"));
      const costos = resumen?.monto_unitario ?? 50;

      const enlaces = await generarEnlacesCorreo(
        competidorPrincipal,
        tutores,
        areasSeleccionadas,
        numeroBoleta,
        correoDestino,
        costos
      );

      setEnlacesCorreo(enlaces);
      setMostrarOpcionesCorreo(true);
      
      mostrarMensajeTemporal(
        "Seleccione su servicio de correo preferido",
        "info"
      );
    } catch (error) {
      console.error("Error al preparar el envío:", error);
      mostrarMensajeTemporal(
        "Error al preparar el envío. Intente nuevamente.",
        "error"
      );
    } finally {
      setEnviando(false);
    }
  };

  const abrirServicioCorreo = (servicio) => {
    if (!enlacesCorreo) {
      mostrarMensajeTemporal(
        "No se pudieron generar los enlaces de correo",
        "error"
      );
      return;
    }

    let url;
    switch (servicio) {
      case "gmail":
        url = enlacesCorreo.servicios.gmail;
        break;
      case "outlook":
        url = enlacesCorreo.servicios.outlook;
        break;
      case "predeterminado":
      default:
        url = enlacesCorreo.servicios.predeterminado;
        break;
    }

    if (!url) {
      mostrarMensajeTemporal(
        "Servicio de correo no disponible. Intente con otro.",
        "error"
      );
      return;
    }

    // Abrir en una nueva pestaña/ventana
    window.open(url, "_blank");

    // Cerrar el panel de opciones
    setMostrarOpcionesCorreo(false);

    mostrarMensajeTemporal(
      `Redirigiendo a ${servicio}. Adjunte la boleta descargada.`,
      "info"
    );
  };

  return (
    <div className="boleta-contenedor">
      <LoadingModal 
        isOpen={cargando} 
        title="Cargando datos de la boleta" 
        message="Por favor espere mientras obtenemos la información actualizada..."
      />
      {!cargando && (
        <>
          <div className="boleta-header">
            <button onClick={onVolver} className="btn-volver">
              <FaArrowLeft /> Volver
            </button>
            <h1 className="boleta-titulo">Boleta de Pago - Inscripción Grupal</h1>
          </div>

          <div className="boleta-contenido">
            <div className="boleta-info">              <p>
                <strong>Nº de Boleta:</strong> {numeroBoleta}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date().toLocaleDateString("es-BO")}
              </p>
              <p>
                <strong>Tipo de Inscripción:</strong> Grupal ({(() => {
                  const competidoresAMostrar = datosBoleta?.competidores?.length > 0 
                    ? datosBoleta.competidores 
                    : competidores || [];
                  
                  const competidoresUnicos = competidoresAMostrar.filter((competidor, index, arr) => {
                    const identificador = competidor.id || competidor.documento_identidad;
                    return arr.findIndex(c => (c.id || c.documento_identidad) === identificador) === index;
                  });
                  
                  return competidoresUnicos.length;
                })()} competidores)
              </p>
            </div><div className="boleta-seccion">
              <h2>Competidores Inscritos</h2>
              <div className="competidores-lista">
                {(() => {
                  // Usar datos de la boleta si están disponibles, sino usar competidores pasados como props
                  const competidoresAMostrar = datosBoleta?.competidores?.length > 0 
                    ? datosBoleta.competidores 
                    : competidores || [];
                  
                  // Eliminar duplicados basados en ID o documento_identidad
                  const competidoresUnicos = competidoresAMostrar.filter((competidor, index, arr) => {
                    const identificador = competidor.id || competidor.documento_identidad;
                    return arr.findIndex(c => (c.id || c.documento_identidad) === identificador) === index;
                  });
                  
                  return competidoresUnicos.map((competidor, idx) => (
                    <div key={competidor.id || competidor.documento_identidad || idx} className="competidor-item">
                      <p>
                        <strong>{idx + 1}. {competidor.nombres} {competidor.apellidos}</strong>
                      </p>                      <p>
                        <strong>Documento:</strong> CI: {String(competidor.documento_identidad)}
                      </p>
                      <p>
                        <strong>Institución:</strong> {competidor.colegio}
                      </p>
                      <p>
                        <strong>Curso:</strong> {competidor.curso}
                      </p>
                      {idx < competidoresUnicos.length - 1 && <hr style={{ margin: "10px 0" }} />}
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="boleta-seccion">
              <h2>Datos del Tutor Responsable</h2>
              {tutores?.map((tutor, idx) => (
                <div key={idx} style={{ marginBottom: "10px" }}>
                  <p>
                    <strong>Nombre:</strong> {tutor.nombres} {tutor.apellidos}
                  </p>
                  <p>
                    <strong>Contacto:</strong> {tutor.correo_electronico} /{" "}
                    {tutor.telefono}
                  </p>
                  {idx < tutores.length - 1 && <hr style={{ margin: "10px 0" }} />}
                </div>
              ))}
            </div>

            <div className="boleta-seccion">
              <h2>Áreas y Costos</h2>
              <table className="boleta-tabla">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Competidores</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(datosBoleta?.costo?.desglose_costos || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.area?.nombre || 'Área'}</td>
                      <td>{item.cantidad_competidores || 1}</td>
                      <td>Bs. {item.costo_unitario_formateado || item.costo_unitario?.toFixed(2) || '0.00'}</td>
                      <td>Bs. {item.subtotal_formateado || item.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="3">
                      <strong>Total a Pagar:</strong>
                    </td>
                    <td>
                      <strong>Bs. {totalPago}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="boleta-acciones">
            <div className="boleta-correo-seccion">
              <label htmlFor="correo-destino">Enviar boleta por correo:</label>
              <input
                type="email"
                id="correo-destino"
                value={correoDestino}
                onChange={(e) => setCorreoDestino(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="correo-input"
              />              <button
                onClick={enviarCorreo}
                disabled={enviando || !correoDestino}
                className="boleta-btn-pdf"
              >
                {enviando ? (
                  <>
                    <FaSpinner className="icono-spinner" /> Preparando...
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Enviar por Correo
                  </>
                )}
              </button>

              {mostrarOpcionesCorreo && enlacesCorreo && (
                <div className="opciones-correo">
                  <h4>Seleccione su servicio de correo:</h4>
                  <div className="servicios-correo">
                    <button
                      className="btn-servicio gmail"
                      onClick={() => abrirServicioCorreo("gmail")}
                    >
                      <FaGoogle /> Gmail
                    </button>
                    <button
                      className="btn-servicio outlook"
                      onClick={() => abrirServicioCorreo("outlook")}
                    >
                      <FaMicrosoft /> Outlook
                    </button>
                    <button
                      className="btn-servicio predeterminado"
                      onClick={() => abrirServicioCorreo("predeterminado")}
                    >
                      <FaEnvelope /> Otro
                    </button>
                  </div>
                  <p className="nota-correo">
                    Adjunte la boleta descargada al correo antes de enviarlo.
                  </p>
                  <button
                    className="btn-cancelar"
                    onClick={() => setMostrarOpcionesCorreo(false)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={descargarBoleta}
              disabled={descargando}
              className="boleta-btn-pdf"
            >
              {descargando ? (
                <>
                  <FaSpinner className="icono-spinner" /> Generando PDF...
                </>
              ) : (
                <>
                  <FaDownload /> Descargar Boleta
                </>
              )}
            </button>
            
            <button
              className="boleta-btn-pdf"
              onClick={() => navigate("/user/mis-inscripciones")}
            >
              <FaEye /> Ver mis inscripciones
            </button>   
          </div>

          {mensaje && (
            <div className={`boleta-mensaje boleta-mensaje-${estadoMensaje}`}>
              {estadoMensaje === "success" && <FaCheck className="icono-mensaje" />}
              {mensaje}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoletaPagoGrupal;
