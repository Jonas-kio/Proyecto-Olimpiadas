// components/boleta/BoletaPago.jsx
import React, { useState, useEffect } from 'react';
import { generarBoletaPDF, enviarBoletaPorEmail } from '../../services/boletaService';
import './BoletaPago.css';

const BoletaPago = ({ estudiante, tutores, areasSeleccionadas, numeroBoleta, onVolver }) => {
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // Calcular precio por áreas (50 Bs. por área)
  const precioArea = 50;
  const totalPago = areasSeleccionadas.length * precioArea;
  
  // Obtener el tutor principal
  const tutorPrincipal = tutores[0];
  
  // Determinar nivel basado en el curso
  const nivel = estudiante.curso?.includes('Primaria') ? 'Primaria' : 'Secundaria';
  
  // Establecer el correo por defecto
  useEffect(() => {
    setCorreoDestino(estudiante.correo_electronico);
  }, [estudiante]);

  // Descargar boleta en PDF
  const descargarBoleta = async () => {
    try {
      setDescargando(true);
      setMensaje('Generando PDF...');
      
      const boletaPDF = await generarBoletaPDF(estudiante, tutores, areasSeleccionadas, numeroBoleta);
      
      // Crear URL para descargar el PDF
      const url = URL.createObjectURL(boletaPDF);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Boleta_${numeroBoleta}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      setMensaje('Boleta descargada correctamente');
    } catch (error) {
      console.error('Error al descargar boleta:', error);
      setMensaje('Error al generar la boleta. Intente nuevamente.');
    } finally {
      setDescargando(false);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  // Enviar boleta por correo
  const enviarBoleta = async () => {
    if (!correoDestino) {
      setMensaje('Ingrese un correo electrónico válido');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }
    
    try {
      setEnviando(true);
      setMensaje('Enviando boleta al correo...');
      
      await enviarBoletaPorEmail(estudiante, tutores, areasSeleccionadas, numeroBoleta, correoDestino);
      
      setMensaje(`Boleta enviada correctamente a ${correoDestino}`);
    } catch (error) {
      console.error('Error al enviar boleta:', error);
      setMensaje('Error al enviar la boleta. Intente nuevamente.');
    } finally {
      setEnviando(false);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  return (
    <div className="boleta-contenedor">
      <h1 className="boleta-titulo">Boleta de Pago</h1>
      
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
          />
          <button onClick={enviarBoleta} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar por correo'}
          </button>
        </div>
        
        <button onClick={descargarBoleta} disabled={descargando} className="boleta-btn-pdf">
          {descargando ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
        
        <button onClick={onVolver} className="boleta-btn-volver">
          Volver
        </button>
      </div>
      
      {mensaje && <div className="boleta-mensaje">{mensaje}</div>}
    </div>
  );
};

export default BoletaPago;