// components/boleta/BoletaPago.jsx
// components/boleta/BoletaPago.jsx
import React, { useState, useEffect } from 'react';
import { 
  generarBoletaPDF, 
  generarEnlacesCorreo
} from '../../services/boletaService';
import "../../styles/components/BoletaPago.css";
import { 
  FaDownload, 
  FaEnvelope, 
  FaSpinner, 
  FaCheck, 
  FaArrowLeft, 
  FaGoogle, 
  FaMicrosoft, 
  
} from 'react-icons/fa';

const BoletaPago = ({ estudiante, tutores, areasSeleccionadas, numeroBoleta, registration_process_id, onVolver }) => {
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [estadoMensaje, setEstadoMensaje] = useState(''); // 'success', 'error', 'info'
  const [mostrarOpcionesCorreo, setMostrarOpcionesCorreo] = useState(false);
  const [enlacesCorreo, setEnlacesCorreo] = useState(null);
  
  // Calcular precio por áreas (50 Bs. por área)
  const precioArea = 50;
  const totalPago = areasSeleccionadas.length * precioArea;
  
  // Obtener el tutor principal
  const tutorPrincipal = tutores[0];
  
  // Determinar nivel basado en el curso
  const nivel = estudiante.curso?.includes('Primaria') ? 'Primaria' : 'Secundaria';
  
  // Establecer el correo por defecto al cargar el componente
  useEffect(() => {
    setCorreoDestino(estudiante.correo_electronico || '');
  }, [estudiante]);

  // Función para mostrar mensajes temporales
  const mostrarMensajeTemporal = (msg, tipo = 'info') => {
    setMensaje(msg);
    setEstadoMensaje(tipo);
    setTimeout(() => {
      setMensaje('');
      setEstadoMensaje('');
    }, 5000);
  };

  // Descargar boleta en PDF
  const descargarBoleta = async () => {
    try {
      setDescargando(true);
      mostrarMensajeTemporal('Generando PDF...', 'info');
      
      // Generar PDF en el frontend
      const boletaPDF = await generarBoletaPDF(estudiante, tutores, areasSeleccionadas, numeroBoleta);
      
      // Crear URL para descargar el PDF
      const url = URL.createObjectURL(boletaPDF);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Boleta_${numeroBoleta}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el objeto URL
      URL.revokeObjectURL(url);
      mostrarMensajeTemporal('Boleta descargada correctamente', 'success');
    } catch (error) {
      console.error('Error al descargar boleta:', error);
      mostrarMensajeTemporal('Error al generar la boleta. Intente nuevamente.', 'error');
    } finally {
      setDescargando(false);
    }
  };

  // Preparar enlace para enviar por correo
  const prepararEnvioCorreo = async () => {
    if (!correoDestino) {
      mostrarMensajeTemporal('Ingrese un correo electrónico válido', 'error');
      return;
    }
    
    try {
      setEnviando(true);
      mostrarMensajeTemporal('Preparando opciones de correo...', 'info');
      
      // Generar enlaces para servicios de correo
      const resultado = await generarEnlacesCorreo(
        estudiante, 
        tutores, 
        areasSeleccionadas, 
        numeroBoleta, 
        correoDestino
      );
      
      // Guardar los enlaces y mostrar opciones
      setEnlacesCorreo(resultado);
      setMostrarOpcionesCorreo(true);
      
      // Descargar el PDF para adjuntar
      const link = document.createElement('a');
      link.href = resultado.pdfUrl;
      link.download = `Boleta_${numeroBoleta}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      mostrarMensajeTemporal('Boleta descargada. Seleccione su servicio de correo preferido.', 'success');
    } catch (error) {
      console.error('Error al preparar opciones de correo:', error);
      mostrarMensajeTemporal('Error al preparar opciones de correo. Intente nuevamente.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  // Abrir servicio de correo seleccionado
  const abrirServicioCorreo = (servicio) => {
    if (!enlacesCorreo || !enlacesCorreo.servicios) {
      mostrarMensajeTemporal('No se han generado los enlaces de correo. Intente nuevamente.', 'error');
      return;
    }
    
    const url = enlacesCorreo.servicios[servicio];
    
    if (!url) {
      mostrarMensajeTemporal('Servicio de correo no disponible. Intente con otro.', 'error');
      return;
    }
    
    // Abrir en una nueva pestaña/ventana
    window.open(url, '_blank');
    
    // Cerrar el panel de opciones
    setMostrarOpcionesCorreo(false);
    
    mostrarMensajeTemporal(`Redirigiendo a ${servicio}. Adjunte la boleta descargada.`, 'info');
  };

  return (
    <div className="boleta-contenedor">
      <div className="boleta-header">
        <button onClick={onVolver} className="btn-volver">
          <FaArrowLeft /> Volver
        </button>
        <h1 className="boleta-titulo">Boleta de Pago</h1>
      </div>
      
      <div className="boleta-info">
        <p><strong>Nº de Boleta:</strong> {numeroBoleta}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-BO')}</p>
      </div>
      
      <div className="boleta-seccion">
        <h2>Datos del Estudiante</h2>
        <p><strong>Nombre:</strong> {estudiante.nombres} {estudiante.apellidos}</p>
        <p><strong>Documento:</strong> CI: {estudiante.documento_identidad}</p>
        <p><strong>Contacto:</strong> {estudiante.correo_electronico}</p>
      </div>
      
      <div className="boleta-seccion">
        <h2>Datos del Tutor</h2>
        <p><strong>Nombre:</strong> {tutorPrincipal.nombres} {tutorPrincipal.apellidos}</p>
        <p><strong>Contacto:</strong> {tutorPrincipal.correo_electronico} / {tutorPrincipal.telefono}</p>
      </div>
      
      <div className="boleta-seccion">
        <h2>Información Institucional</h2>
        <p><strong>Institución:</strong> {estudiante.colegio}</p>
        <p><strong>Nivel:</strong> {nivel}</p>
        <p><strong>Ciudad:</strong> {estudiante.provincia}</p>
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
            {areasSeleccionadas.map((area, index) => (
              <tr key={index}>
                <td>{area}</td>
                <td>Bs. {precioArea}</td>
                <td>Bs. {precioArea}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"><strong>Total a pagar</strong></td>
              <td><strong>Bs. {totalPago}</strong></td>
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
            onClick={prepararEnvioCorreo} 
            disabled={enviando || mostrarOpcionesCorreo}
            className="boleta-btn-enviar"
          >
            {enviando ? (
              <>
                <FaSpinner className="icono-spinner" /> Preparando...
              </>
            ) : (
              <>
                <FaEnvelope /> Preparar correo
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
                onClick={() => abrirServicioCorreo('gmail')}
              >
                <FaGoogle /> Gmail
              </button>
              <button 
                className="btn-servicio outlook"
                onClick={() => abrirServicioCorreo('outlook')}
              >
                <FaMicrosoft /> Outlook
              </button>
              
              <button 
                className="btn-servicio predeterminado"
                onClick={() => abrirServicioCorreo('predeterminado')}
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
          {estadoMensaje === 'success' && <FaCheck className="icono-mensaje" />}
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default BoletaPago;