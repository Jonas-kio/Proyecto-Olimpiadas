import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../styles/components/FormularioGrupal.css";
import { descargarPlantillaExcel, procesarArchivoGrupal } from "../../services/inscripcionGrupalService";

const FormCompetidoresGrupales = ({ competidores, setCompetidores, procesoId }) => {  const [modoRegistro, setModoRegistro] = useState("manual"); // "manual" o "excel"
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [archivo, setArchivo] = useState(null);
  // Inicializar con dos competidores vacíos para inscripción grupal si no hay competidores
  useEffect(() => {
    if (competidores.length === 0 && modoRegistro === "manual") {
      setCompetidores([
        {
          nombres: "",
          apellidos: "",
          documento_identidad: "",
          fecha_nacimiento: "",
          provincia: "",
          curso: "",
          correo_electronico: "",
          colegio: "",
        },
        {
          nombres: "",
          apellidos: "",
          documento_identidad: "",
          fecha_nacimiento: "",
          provincia: "",
          curso: "",
          correo_electronico: "",
          colegio: "",
        }
      ]);
    }
  }, [competidores.length, modoRegistro, setCompetidores]);

  const agregarCompetidor = () => {
    setCompetidores([
      ...competidores,
      {
        nombres: "",
        apellidos: "",
        documento_identidad: "",
        fecha_nacimiento: "",
        provincia: "",
        curso: "",
        correo_electronico: "",
        colegio: "",
      },
    ]);
  };
  const eliminarCompetidor = (index) => {
    if (competidores.length > 2) {
      const nuevosCompetidores = competidores.filter((_, i) => i !== index);
      setCompetidores(nuevosCompetidores);
    } else {
      alert("Para una inscripción grupal debe mantener al menos 2 competidores.");
    }
  };
  const manejarCambio = (index, campo, valor) => {
    // Validaciones específicas durante la escritura
    if (campo === "documento_identidad") {
      // Solo permitir números y máximo 10 dígitos
      if (!/^\d*$/.test(valor) || valor.length > 10) return;
    }
    
    if (campo === "telefono") {
      // Solo permitir números y máximo 8 dígitos
      if (!/^\d*$/.test(valor) || valor.length > 8) return;
    }
    
    if (campo === "nombres" || campo === "apellidos") {
      // Solo permitir letras, espacios y caracteres especiales del español
      if (valor && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(valor)) return;
      // Limitar longitud máxima
      if (valor.length > 50) return;
    }
    
    if (campo === "correo_electronico") {
      // Limitar longitud máxima del email
      if (valor.length > 100) return;
    }
    
    if (campo === "provincia" || campo === "colegio" || campo === "curso") {
      // Limitar longitud máxima
      if (valor.length > 100) return;
    }
    
    const nuevosCompetidores = [...competidores];
    nuevosCompetidores[index][campo] = valor;
    setCompetidores(nuevosCompetidores);
  };  // Funciones de validación
  const validarTexto = (texto) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto);
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarDocumento = (documento) => {
    return /^\d{7,10}$/.test(documento);
  };

  const validarFecha = (fecha) => {
    if (!fecha) return false;
    const fechaActual = new Date();
    const fechaNacimiento = new Date(fecha);
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiff = fechaActual.getMonth() - fechaNacimiento.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
      return edad - 1 >= 5 && edad - 1 <= 25;
    }
    return edad >= 5 && edad <= 25;
  };

  // Función para verificar si un competidor está completo
  const competidorCompleto = (competidor) => {
    return (
      competidor.nombres?.trim() &&
      competidor.apellidos?.trim() &&
      competidor.documento_identidad?.trim() &&
      competidor.fecha_nacimiento?.trim() &&
      competidor.provincia?.trim() &&
      competidor.curso?.trim() &&
      competidor.correo_electronico?.trim() &&
      competidor.colegio?.trim() &&
      validarTexto(competidor.nombres) &&
      validarTexto(competidor.apellidos) &&
      validarDocumento(competidor.documento_identidad) &&
      validarEmail(competidor.correo_electronico) &&
      validarFecha(competidor.fecha_nacimiento)
    );
  };

  // Contar competidores completos
  const competidoresCompletos = competidores.filter(competidorCompleto).length;
  const manejarCambioModo = (nuevoModo) => {
    setModoRegistro(nuevoModo);
    setArchivo(null);
    if (nuevoModo === "excel") {
      setCompetidores([]);
    } else if (competidores.length === 0) {
      // Para inscripción grupal, inicializar con 2 competidores mínimo
      setCompetidores([
        {
          nombres: "",
          apellidos: "",
          documento_identidad: "",
          fecha_nacimiento: "",
          provincia: "",
          curso: "",
          correo_electronico: "",
          colegio: "",
        },
        {
          nombres: "",
          apellidos: "",
          documento_identidad: "",
          fecha_nacimiento: "",
          provincia: "",
          curso: "",
          correo_electronico: "",
          colegio: "",
        }
      ]);
    }
  };
  const manejarArchivoSeleccionado = (event) => {
    const archivoSeleccionado = event.target.files[0];
    if (archivoSeleccionado) {
      // Validar que sea un archivo CSV
      if (!archivoSeleccionado.name.toLowerCase().endsWith('.csv')) {
        alert("Por favor seleccione un archivo CSV válido.");
        event.target.value = '';
        return;
      }
      
      // Validar tamaño del archivo (máximo 5MB)
      if (archivoSeleccionado.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB permitido.");
        event.target.value = '';
        return;
      }
      
      setArchivo(archivoSeleccionado);
    }
  };  const procesarArchivoExcel = async () => {
    if (!archivo) {
      alert("Por favor seleccione un archivo CSV");
      return;
    }

    setSubiendoArchivo(true);
    try {
      console.log("📤 Subiendo archivo CSV:", archivo.name);
      
      const response = await procesarArchivoGrupal(procesoId, archivo);
      
      if (response.data.success) {
        const competidoresCargados = response.data.competidores || [];
        setCompetidores(competidoresCargados);
        console.log("✅ Archivo procesado exitosamente");
        console.log(`✅ ${competidoresCargados.length} competidores cargados`);
        
        alert(`Archivo procesado correctamente. ${competidoresCargados.length} competidores cargados.`);
        setArchivo(null); // Limpiar archivo seleccionado
        
        // Limpiar el input de archivo
        const fileInput = document.getElementById('archivo-competidores');
        if (fileInput) fileInput.value = '';
        
      } else {
        throw new Error(response.data.mensaje || "Error al procesar el archivo");
      }
      
    } catch (error) {
      console.error("❌ Error al procesar archivo:", error);
      
      // Mejorar el manejo de errores específicos
      let mensajeError = "Error al procesar el archivo";
      
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const erroresDetallados = Object.values(errorData.errors).flat().join('\n');
          mensajeError = `Errores de validación en el archivo:\n${erroresDetallados}`;
        } else if (errorData.mensaje) {
          mensajeError = errorData.mensaje;
        }
      } else if (error.response?.status === 400) {
        mensajeError = error.response.data.mensaje || "Formato de archivo inválido";
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      alert(mensajeError);
    } finally {
      setSubiendoArchivo(false);
    }
  };  const descargarPlantilla = async () => {
    try {
      console.log("📥 Descargando plantilla CSV...");
      const result = await descargarPlantillaExcel();
      console.log("✅ Plantilla descargada exitosamente");
      
      if (result.success) {
        // Mostrar mensaje de éxito opcional
        const mensaje = "Plantilla descargada correctamente. Revise su carpeta de descargas.";
        
        // Crear notificación visual temporal
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4caf50;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: Arial, sans-serif;
          font-size: 14px;
        `;
        notificacion.textContent = "✅ " + mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
          if (document.body.contains(notificacion)) {
            document.body.removeChild(notificacion);
          }
        }, 4000);
      }
      
    } catch (error) {
      console.error("❌ Error al descargar plantilla:", error);
      
      let mensajeError = "Error al descargar la plantilla. Intente nuevamente.";
      
      if (error.message) {
        mensajeError = error.message;
      }
      
      alert(mensajeError);
    }
  };
  return (
    <div className="form-section">
      <h2>Información de Competidores</h2>
      <p>Registre la información de los estudiantes que participarán</p>
        {/* Mensaje informativo para requisitos grupales */}
      <div className="requisitos-grupales" style={{
        backgroundColor: "#e3f2fd",
        border: "1px solid #1976d2",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "20px",
        color: "#1976d2"
      }}>
        <strong>ℹ️ Requisitos para inscripción grupal:</strong>
        <br />• Mínimo 2 competidores con todos los campos completos
        <br />• Todos los datos son obligatorios para cada competidor
      </div>

      {/* Contador de competidores completos */}
      {modoRegistro === "manual" && competidores.length > 0 && (
        <div className="contador-competidores" style={{
          backgroundColor: competidoresCompletos >= 2 ? "#e8f5e8" : "#fff3e0",
          border: `1px solid ${competidoresCompletos >= 2 ? "#4caf50" : "#ff9800"}`,
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "20px",
          color: competidoresCompletos >= 2 ? "#2e7d32" : "#ef6c00"
        }}>
          <strong>
            {competidoresCompletos >= 2 ? "✅" : "⚠️"} 
            Competidores completos: {competidoresCompletos} de {competidores.length}
          </strong>
          {competidoresCompletos < 2 && (
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Necesita {2 - competidoresCompletos} competidor(es) más con todos los campos llenos para continuar.
            </div>
          )}
        </div>
      )}      {/* Selector de modo de registro */}
      <div className="modo-registro">
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="manual"
              checked={modoRegistro === "manual"}
              onChange={(e) => manejarCambioModo(e.target.value)}
            />
            Registro Manual
          </label>
          <label>
            <input
              type="radio"
              value="excel"
              checked={modoRegistro === "excel"}
              onChange={(e) => manejarCambioModo(e.target.value)}
            />
            Cargar desde CSV
          </label>
        </div>
      </div>

      {/* Indicador de competidores cargados desde CSV */}
      {modoRegistro === "excel" && competidores.length > 0 && (
        <div className="competidores-csv-cargados" style={{
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "20px",
          color: "#2e7d32"
        }}>
          <strong>✅ {competidores.length} competidores cargados desde CSV</strong>
          <div style={{ fontSize: "14px", marginTop: "4px" }}>
            Los datos han sido validados y están listos para continuar con la inscripción.
          </div>
          <button
            type="button"
            onClick={() => {
              setCompetidores([]);
              setArchivo(null);
              const fileInput = document.getElementById('archivo-competidores');
              if (fileInput) fileInput.value = '';
            }}
            style={{
              marginTop: "8px",
              padding: "4px 12px",
              backgroundColor: "#fff",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              color: "#2e7d32",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            🗑️ Limpiar y cargar nuevo archivo
          </button>
        </div>
      )}

      {/* Registro desde archivo CSV */}
      {modoRegistro === "excel" && (
        <div className="excel-section">
          <h3>Cargar competidores desde archivo CSV</h3>
          
          <div className="excel-actions">
            <button
              type="button"
              onClick={descargarPlantilla}
              className="btn-descargar"
            >
              📥 Descargar Plantilla CSV
            </button>
              <div className="file-input-wrapper">
              <input
                type="file"
                accept=".csv"
                onChange={manejarArchivoSeleccionado}
                id="archivo-competidores"
                className="file-input"
              />
              <label htmlFor="archivo-competidores" className="btn-seleccionar">
                📁 Seleccionar Archivo CSV
              </label>              {archivo && (
                <div className="archivo-seleccionado">
                  <small>Archivo seleccionado: {archivo.name}</small>
                  <div style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "4px",
                    padding: "8px",
                    marginTop: "8px",
                    color: "#856404",
                    fontSize: "12px"
                  }}>
                    ⚠️ <strong>Importante:</strong> Debe hacer clic en &quot;PROCESAR ARCHIVO&quot; para cargar los datos al sistema.
                  </div>
                </div>
              )}
            </div>            {archivo && (
              <button
                type="button"
                onClick={procesarArchivoExcel}
                disabled={subiendoArchivo}
                className="btn-procesar"
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: subiendoArchivo ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                {subiendoArchivo ? "⏳ Procesando..." : "🔄 PROCESAR ARCHIVO (OBLIGATORIO)"}
              </button>
            )}
          </div>          <div className="excel-info">
            <h4>Instrucciones:</h4>
            <ol>
              <li>Descargue la plantilla CSV haciendo clic en &quot;Descargar Plantilla CSV&quot;</li>
              <li>Abra el archivo con Excel, LibreOffice Calc o un editor de texto</li>
              <li>Complete los datos de los competidores siguiendo el formato:</li>
              <ul>
                <li><strong>Nombres y apellidos:</strong> Solo letras y espacios</li>
                <li><strong>Documento:</strong> Entre 7 y 10 dígitos</li>
                <li><strong>Fecha de nacimiento:</strong> Formato YYYY-MM-DD (ej: 2010-05-15)</li>
                <li><strong>Área:</strong> Use nombres descriptivos (ej: &quot;Matemáticas&quot;, &quot;Física&quot;)</li>
                <li><strong>Nivel:</strong> Use nombres descriptivos (ej: &quot;Básico Primaria&quot;, &quot;Física Secundaria&quot;)</li>
              </ul>
              <li>Guarde el archivo manteniendo el formato CSV (separado por punto y coma)</li>
              <li><strong>📁 Seleccione el archivo</strong> haciendo clic en &quot;Seleccionar Archivo CSV&quot;</li>
              <li><strong>🔄 OBLIGATORIO: Haga clic en &quot;Procesar Archivo&quot;</strong> para cargar los datos al sistema</li>
            </ol>
            
            <div className="excel-tips" style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              padding: "12px",
              marginTop: "15px"
            }}>
              <h5 style={{ margin: "0 0 8px 0", color: "#495057" }}>💡 Consejos importantes:</h5>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#6c757d" }}>
                <li>No modifique los encabezados de la plantilla</li>
                <li>Use punto y coma (;) como separador</li>
                <li>Mantenga la codificación UTF-8 para caracteres especiales</li>
                <li>Mínimo 2 competidores para inscripción grupal</li>
                <li><strong>⚠️ El botón &quot;Procesar Archivo&quot; es OBLIGATORIO - sin él, los datos no se cargan</strong></li>
              </ul>
            </div>
          </div></div>
      )}      {/* Vista previa de competidores cargados desde CSV */}
      {modoRegistro === "excel" && competidores.length > 0 && (
        <div className="competidores-csv-preview">
          <h3>Competidores cargados desde CSV ({competidores.length} competidores)</h3>
          <div className="competidores-tabla" style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              fontSize: "12px",
              minWidth: "800px"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "30px" }}>#</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "100px" }}>Nombres</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "100px" }}>Apellidos</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "80px" }}>Documento</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "85px" }}>F. Nacimiento</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "80px" }}>Provincia</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "60px" }}>Curso</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "150px" }}>Email</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "6px", textAlign: "left", minWidth: "120px" }}>Colegio</th>
                </tr>
              </thead>
              <tbody>
                {competidores.map((competidor, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.nombres || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.apellidos || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.documento_identidad || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.fecha_nacimiento || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.provincia || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.curso || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.correo_electronico || '—'}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "6px" }}>{competidor.colegio || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registro manual */}
      {modoRegistro === "manual" && (
        <div className="competidores-manuales">
          {competidores.map((competidor, index) => (
            <div key={index} className="competidor-form">              <div className="form-header">
                <h3>Competidor {index + 1}</h3>
                {competidores.length > 2 && (
                  <button
                    type="button"
                    onClick={() => eliminarCompetidor(index)}
                    className="btn-eliminar"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="form-grid">                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    value={competidor.nombres}
                    onChange={(e) => manejarCambio(index, "nombres", e.target.value)}
                    className={
                      competidor.nombres && !validarTexto(competidor.nombres) ? "error" : ""
                    }
                    placeholder="Ingrese los nombres"
                    required
                  />
                  {competidor.nombres && !validarTexto(competidor.nombres) && (
                    <span className="error-text">Solo se permiten letras y espacios</span>
                  )}
                  {!competidor.nombres && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    value={competidor.apellidos}
                    onChange={(e) => manejarCambio(index, "apellidos", e.target.value)}
                    className={
                      competidor.apellidos && !validarTexto(competidor.apellidos) ? "error" : ""
                    }
                    placeholder="Ingrese los apellidos"
                    required
                  />
                  {competidor.apellidos && !validarTexto(competidor.apellidos) && (
                    <span className="error-text">Solo se permiten letras y espacios</span>
                  )}
                  {!competidor.apellidos && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Documento de Identidad *</label>
                  <input
                    type="text"
                    value={competidor.documento_identidad}
                    onChange={(e) => manejarCambio(index, "documento_identidad", e.target.value)}
                    className={
                      competidor.documento_identidad && !validarDocumento(competidor.documento_identidad) ? "error" : ""
                    }
                    placeholder="1234567"
                    maxLength="10"
                    required
                  />
                  {competidor.documento_identidad && !validarDocumento(competidor.documento_identidad) && (
                    <span className="error-text">Debe contener entre 7 y 10 dígitos</span>
                  )}
                  {!competidor.documento_identidad && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    value={competidor.fecha_nacimiento}
                    onChange={(e) => manejarCambio(index, "fecha_nacimiento", e.target.value)}
                    className={
                      competidor.fecha_nacimiento && !validarFecha(competidor.fecha_nacimiento) ? "error" : ""
                    }
                    required
                  />
                  {competidor.fecha_nacimiento && !validarFecha(competidor.fecha_nacimiento) && (
                    <span className="error-text">La edad debe estar entre 5 y 25 años</span>
                  )}
                  {!competidor.fecha_nacimiento && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Provincia *</label>
                  <input
                    type="text"
                    value={competidor.provincia}
                    onChange={(e) => manejarCambio(index, "provincia", e.target.value)}
                    placeholder="Ingrese la provincia"
                    required
                  />
                  {!competidor.provincia && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Curso *</label>
                  <input
                    type="text"
                    value={competidor.curso}
                    onChange={(e) => manejarCambio(index, "curso", e.target.value)}
                    placeholder="Ej: 4to Secundaria"
                    required
                  />
                  {!competidor.curso && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    value={competidor.correo_electronico}
                    onChange={(e) => manejarCambio(index, "correo_electronico", e.target.value)}
                    className={
                      competidor.correo_electronico && !validarEmail(competidor.correo_electronico) ? "error" : ""
                    }
                    placeholder="ejemplo@correo.com"
                    required
                  />
                  {competidor.correo_electronico && !validarEmail(competidor.correo_electronico) && (
                    <span className="error-text">Formato de email inválido</span>
                  )}
                  {!competidor.correo_electronico && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>                <div className="form-group">
                  <label>Colegio *</label>
                  <input
                    type="text"
                    value={competidor.colegio}
                    onChange={(e) => manejarCambio(index, "colegio", e.target.value)}
                    placeholder="Nombre del colegio"
                    required
                  />
                  {!competidor.colegio && (
                    <span className="error-text">Este campo es obligatorio</span>
                  )}
                </div>
              </div>
            </div>
          ))}          <div className="form-actions">
            <button
              type="button"
              onClick={agregarCompetidor}
              className="btn-secundario"
            >
              + Agregar Otro Competidor
            </button>
          </div>        </div>
      )}
    </div>
  );
};

FormCompetidoresGrupales.propTypes = {
  competidores: PropTypes.array.isRequired,
  setCompetidores: PropTypes.func.isRequired,
  procesoId: PropTypes.string.isRequired,
};

export default FormCompetidoresGrupales;