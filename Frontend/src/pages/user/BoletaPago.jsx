/* eslint-disable react/prop-types */
// components/boleta/BoletaPago.jsx
import { useState, useEffect } from "react";
import {
  generarBoletaPDF,
  generarEnlacesCorreo,
  enviarBoletaPorEmail,
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
} from "react-icons/fa";

// Costo predeterminado por área

const BoletaPago = ({
  estudiante,
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

  useEffect(() => {
    const cargarDatosBoleta = async () => {
      try {
        if (registration_process_id && boleta_id) {
          setCargando(true);
          const respuesta = await obtenerDatosBoleta(registration_process_id, boleta_id);
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

  const nivel = estudiante.curso?.includes("Primaria")
    ? "Primaria"
    : "Secundaria";

  useEffect(() => {
    setCorreoDestino(estudiante.correo_electronico || "");
  }, [estudiante]);

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
          datosBoleta.competidores[0] || estudiante,
          datosBoleta.competidores[0]?.tutores || tutores,
          datosBoleta.seleccion?.areas || areasSeleccionadas,
          datosBoleta.boleta?.numero_boleta || numeroBoleta,
          datosBoleta.costo
        );

        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_${datosBoleta.boleta?.numero_boleta || numeroBoleta}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        mostrarMensajeTemporal("Boleta descargada correctamente", "success");
      } else {

        const boletaPDF = await generarBoletaPDF(
          estudiante,
          tutores,
          areasSeleccionadas,
          numeroBoleta
        );
        
        const url = URL.createObjectURL(boletaPDF);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Boleta_${numeroBoleta}.pdf`;
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

      // Intenta enviar usando el backend primero, luego fallback al método alternativo
      const resultado = await enviarBoletaPorEmail(
        estudiante,
        tutores,
        areasSeleccionadas,
        numeroBoleta,
        correoDestino
      );

      // Si llegamos aquí, el envío tuvo éxito (ya sea por backend o método alternativo)
      mostrarMensajeTemporal(
        resultado.message || "Boleta enviada correctamente",
        "success"
      );

      // Si hay opciones de correo para mostrar (en caso de método alternativo)
      if (resultado.opciones) {
        setEnlacesCorreo(resultado.opciones);
        setMostrarOpcionesCorreo(true);
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      mostrarMensajeTemporal(
        "Error al enviar el correo. Intente nuevamente.",
        "error"
      );

      // En caso de error, mostrar opciones de correo alternativas
      try {
        const resultado = await generarEnlacesCorreo(
          estudiante,
          tutores,
          areasSeleccionadas,
          numeroBoleta,
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
      }
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
        title="Cargando datos de la boleta" 
        message="Por favor espere mientras obtenemos la información actualizada..."
      />
      {!cargando && (
        <>
          <div className="boleta-header">
          <button onClick={onVolver} className="btn-volver">
            <FaArrowLeft /> Volver
          </button>
          <h1 className="boleta-titulo">Boleta de Pago</h1>
        </div>

        <div className="boleta-info">
          <p>
            <strong>Nº de Boleta:</strong> {numeroBoleta}
          </p>
          <p>
            <strong>Fecha:</strong> {new Date().toLocaleDateString("es-BO")}
          </p>
        </div>

        <div className="boleta-seccion">
          <h2>Datos del Estudiante</h2>
          <p>
            <strong>Nombre:</strong> {estudiante.nombres} {estudiante.apellidos}
          </p>
          <p>
            <strong>Documento:</strong> CI: {estudiante.documento_identidad}
          </p>
          <p>
            <strong>Contacto:</strong> {estudiante.correo_electronico}
          </p>
        </div>

        <div className="boleta-seccion">
          <h2>Datos del Tutor</h2>
          {tutores.map((tutor, idx) => (
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
          <h2>Información Institucional</h2>
          <p>
            <strong>Institución:</strong> {estudiante.colegio}
          </p>
          <p>
            <strong>Nivel:</strong> {nivel}
          </p>
          <p>
            <strong>Ciudad:</strong> {estudiante.provincia}
          </p>
        </div>

        <div className="boleta-seccion">
          <h2>Áreas y Costos</h2>
          <table className="boleta-tabla">
            <thead>
              <tr>
                <th>Área</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {resumenCostos?.desglose_costos?.map((item, index) => (
                <tr key={index}>
                  <td>{item.area.nombre}</td>
                  <td>Bs. {item.costo_unitario_formateado}</td>
                  <td>Bs. {item.subtotal_formateado}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">
                  <strong>Total a pagar</strong>
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
            <input
              type="email"
              value={correoDestino}
              onChange={(e) => setCorreoDestino(e.target.value)}
              placeholder="Correo electrónico"
              disabled={enviando || mostrarOpcionesCorreo}
            />
            <button
              onClick={enviarCorreo}
              disabled={enviando || mostrarOpcionesCorreo}
              className="boleta-btn-enviar"
            >
              {enviando ? (
                <>
                  <FaSpinner className="icono-spinner" /> Enviando...
                </>
              ) : (
                <>
                  <FaEnvelope /> Enviar por correo
                </>
              )}
            </button>
          </div>

          {mostrarOpcionesCorreo && (
            <div className="opciones-correo">
              <h3>Seleccione su servicio de correo:</h3>
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
                <FaDownload /> Descargar PDF
              </>
            )}
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

export default BoletaPago;
