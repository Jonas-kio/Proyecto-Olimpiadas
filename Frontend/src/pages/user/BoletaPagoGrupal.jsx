/* eslint-disable react/prop-types */
// pages/user/BoletaPagoGrupal.jsx
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

  useEffect(() => {    
    const cargarDatosBoleta = async () => {
      try {
        if (registration_process_id && boleta_id) {
          setCargando(true);
          // Usar esGrupal=true para inscripciones grupales
          const respuesta = await obtenerDatosBoleta(registration_process_id, boleta_id, true);
          setDatosBoleta(respuesta.data);
          
          // Guardar en localStorage para mantener compatibilidad con el código existente
          localStorage.setItem("costosResumen", JSON.stringify(respuesta.data.costo));
          mostrarMensajeTemporal("¡Boleta generada exitosamente!", "success");
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
  const totalPago = resumenCostos?.monto_total_formateado || "0.00";

  // Para inscripciones grupales, usar el primer tutor como referencia para el correo
  const tutorPrincipal = useMemo(() => {
    return tutores?.[0] || {};
  }, [tutores]);

  useEffect(() => {
    setCorreoDestino(tutorPrincipal.correo_electronico || "");
  }, [tutorPrincipal]);

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
        // Para boletas grupales, usar el primer competidor como representativo para el PDF
        const competidorRepresentativo = datosBoleta.competidores?.[0] || competidores?.[0];
        const tutoresCompletos = datosBoleta.competidores?.[0]?.tutores || tutores;
          const boletaPDF = await generarBoletaPDF(
          competidorRepresentativo,
          tutoresCompletos,
          datosBoleta.seleccion?.areas || areasSeleccionadas,
          datosBoleta.boleta?.numero_boleta || numeroBoleta,
          datosBoleta.costo,
          true, // esGrupal
          datosBoleta.competidores?.length || competidores.length // totalCompetidores
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
      } else {        // Fallback con datos de props
        const boletaPDF = await generarBoletaPDF(
          competidores[0],
          tutores,
          areasSeleccionadas,
          numeroBoleta,
          null,
          true, // esGrupal
          competidores.length // totalCompetidores
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
      mostrarMensajeTemporal("Enviando correo...", "info");

      const competidorRepresentativo = datosBoleta?.competidores?.[0] || competidores?.[0];
      const tutoresCompletos = datosBoleta?.competidores?.[0]?.tutores || tutores;
      
      // Intentar generar enlaces de correo como alternativa
      const resultado = await generarEnlacesCorreo(
        competidorRepresentativo,
        tutoresCompletos,
        datosBoleta?.seleccion?.areas || areasSeleccionadas,
        datosBoleta?.boleta?.numero_boleta || numeroBoleta,
        correoDestino,
      );

      setEnlacesCorreo(resultado);
      setMostrarOpcionesCorreo(true);
      mostrarMensajeTemporal(
        "Use las opciones de correo alternativas",
        "info"
      );
    } catch (error2) {
      console.error("Error al generar opciones alternativas:", error2);
      mostrarMensajeTemporal("Error al preparar el correo. Intente nuevamente.", "error");
    } finally {
      setEnviando(false);
    }
  };

  const abrirServicioCorreo = (servicio) => {
    if (!enlacesCorreo || !enlacesCorreo.servicios) {
      mostrarMensajeTemporal(
        "No se han generado los enlaces de correo. Intente nuevamente.",
        "error"
      );
      return;
    }

    const url = enlacesCorreo.servicios[servicio];

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
        title="Generando boleta grupal" 
        message="Por favor espere mientras preparamos su boleta de pago..."
      />
      {!cargando && (
        <>
          <div className="boleta-header">
            <button onClick={onVolver} className="btn-volver">
              <FaArrowLeft /> Volver
            </button>
            <h1 className="boleta-titulo">Boleta de Pago - Inscripción Grupal</h1>
          </div>

          <div className="boleta-info">
            <p>
              <strong>Nº de Boleta:</strong> {datosBoleta?.boleta?.numero_boleta || numeroBoleta}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date().toLocaleDateString("es-BO")}
            </p>
            <p>
              <strong>Tipo:</strong> Inscripción Grupal ({(() => {
                // Calcular competidores únicos
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
          </div>

          <div className="boleta-seccion">
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
                    </p>
                    <p>
                      <strong>Documento:</strong> CI: {String(competidor.documento_identidad)}
                    </p>                    <p>
                      <strong>Colegio:</strong> {competidor.colegio}
                    </p>
                    <p>
                      <strong>Curso:</strong> {competidor.curso}
                    </p>
                    <p>
                      <strong>Ciudad:</strong> {competidor.provincia || 'No especificada'}
                    </p>
                    <p>
                      <strong>Email:</strong> {competidor.correo_electronico}
                    </p>
                    {idx < competidoresUnicos.length - 1 && <hr style={{ margin: "15px 0", borderColor: "#e2e8f0" }} />}
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="boleta-seccion">
            <h2>Datos de los Tutores</h2>
            {tutores.map((tutor, idx) => (
              <div key={idx} style={{ marginBottom: "15px" }}>
                <p>
                  <strong>{idx === 0 ? "Tutor Principal" : `Tutor ${idx + 1}`}:</strong> {tutor.nombres} {tutor.apellidos}
                </p>
                <p>
                  <strong>Contacto:</strong> {tutor.correo_electronico} / {tutor.telefono}
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

          <div className="boleta-acciones">
            <div className="boleta-email">
              <label htmlFor="correo-destino">Enviar boleta por correo:</label>
              <input
                type="email"
                id="correo-destino"
                value={correoDestino}
                onChange={(e) => setCorreoDestino(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="correo-input"
              />
              <button
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
