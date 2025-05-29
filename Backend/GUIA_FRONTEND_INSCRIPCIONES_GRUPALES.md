# 📚 Guía para Desarrolladores Frontend - Sistema de Inscripciones Grupales

## 🎯 Resumen Ejecutivo

El sistema de inscripciones grupales permite cargar múltiples competidores mediante archivos Excel/CSV. Esta guía documenta cómo consumir la API desde el frontend.

## 🔌 Endpoints API Disponibles

### 1. **Cargar Archivo Excel/CSV**
```
POST /api/inscripcion/grupal/proceso/{proceso}/excel
```

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'multipart/form-data'
}
```

**Body (FormData):**
```javascript
const formData = new FormData();
formData.append('file', archivoSeleccionado); // File object
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "mensaje": "Archivo procesado correctamente",
  "competidores_creados": 15,
  "competidores": [
    {
      "id": 1,
      "nombres": "Juan Carlos",
      "apellidos": "Pérez González",
      "documento_identidad": "12345678",
      "fecha_nacimiento": "2010-05-15",
      "correo_electronico": "juan.perez@email.com",
      "colegio": "Colegio San José",
      "curso": "1ro Secundaria",
      "provincia": "La Paz",
      "area_id": 1,
      "nivel_id": 1
    }
    // ... más competidores
  ]
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "mensaje": "El archivo no tiene la estructura correcta. Falta el campo 'nombres'.",
  "error": "Detalles del error"
}
```

### 2. **Descargar Plantilla CSV**
```
GET /api/inscripcion/grupal/plantilla-excel
```

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}'
}
```

**Respuesta:** Descarga directa del archivo CSV (.csv)

### 3. **Obtener Resumen del Proceso**
```
GET /api/inscripcion/grupal/proceso/{proceso}/resumen
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "proceso": {
      "id": 1,
      "name": "Olimpiadas 2025",
      "status": "active"
    },
    "competidores": [...],
    "tutores": [...],
    "areas_niveles": [...],
    "total_competidores": 25,
    "costo_total": 1250.00
  }
}
```

## 🎨 Componente React de Ejemplo

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const CargaMasivaCompetidores = ({ procesoId }) => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const manejarSeleccionArchivo = (event) => {
    const file = event.target.files[0];
    
    // Validar tipo de archivo
    if (file && !['csv', 'xlsx', 'xls'].includes(
      file.name.split('.').pop().toLowerCase()
    )) {
      setError('Por favor seleccione un archivo CSV, XLSX o XLS');
      return;
    }
    
    setArchivo(file);
    setError(null);
  };

  const cargarArchivo = async () => {
    if (!archivo) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('file', archivo);

      const response = await axios.post(
        `/api/inscripcion/grupal/proceso/${procesoId}/excel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResultado(response.data);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 
        'Error al procesar el archivo'
      );
    } finally {
      setCargando(false);
    }
  };

  const descargarPlantilla = async () => {
    try {
      const response = await axios.get(
        '/api/inscripcion/grupal/plantilla-excel',
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_inscripcion_grupal.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar la plantilla');
    }
  };

  return (
    <div className="carga-masiva-container">
      <h3>Carga Masiva de Competidores</h3>
      
      {/* Botón descargar plantilla */}
      <div className="mb-4">
        <button 
          onClick={descargarPlantilla}
          className="btn btn-secondary"
        >
          📥 Descargar Plantilla Excel
        </button>
        <small className="text-muted ml-2">
          Descarga la plantilla con el formato correcto
        </small>
      </div>

      {/* Selector de archivo */}
      <div className="mb-4">
        <label htmlFor="archivo" className="form-label">
          Seleccionar archivo Excel/CSV:
        </label>
        <input
          type="file"
          id="archivo"
          accept=".csv,.xlsx,.xls"
          onChange={manejarSeleccionArchivo}
          className="form-control"
          disabled={cargando}
        />
        {archivo && (
          <small className="text-success">
            ✅ Archivo seleccionado: {archivo.name}
          </small>
        )}
      </div>

      {/* Botón cargar */}
      <div className="mb-4">
        <button
          onClick={cargarArchivo}
          disabled={!archivo || cargando}
          className="btn btn-primary"
        >
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Procesando...
            </>
          ) : (
            '📤 Cargar Competidores'
          )}
        </button>
      </div>

      {/* Resultados */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {resultado && resultado.success && (
        <div className="alert alert-success">
          <h5>✅ Archivo procesado exitosamente</h5>
          <p>
            <strong>Competidores creados:</strong> {resultado.competidores_creados}
          </p>
          <p>
            <strong>Mensaje:</strong> {resultado.mensaje}
          </p>
        </div>
      )}

      {/* Lista de competidores procesados */}
      {resultado && resultado.competidores && (
        <div className="mt-4">
          <h5>Competidores Procesados:</h5>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Colegio</th>
                </tr>
              </thead>
              <tbody>
                {resultado.competidores.slice(0, 5).map((competidor) => (
                  <tr key={competidor.id}>
                    <td>{competidor.nombres}</td>
                    <td>{competidor.apellidos}</td>
                    <td>{competidor.documento_identidad}</td>
                    <td>{competidor.correo_electronico}</td>
                    <td>{competidor.colegio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resultado.competidores.length > 5 && (
              <small className="text-muted">
                ... y {resultado.competidores.length - 5} competidores más
              </small>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CargaMasivaCompetidores;
```

## 📋 Estructura del Archivo Excel/CSV

### Encabezados Requeridos:
```
nombres,apellidos,documento_identidad,fecha_nacimiento,correo_electronico,colegio,curso,provincia,area_id,nivel_id
```

### Ejemplo de Datos:
```csv
nombres,apellidos,documento_identidad,fecha_nacimiento,correo_electronico,colegio,curso,provincia,area_id,nivel_id
Juan Carlos,Pérez González,12345678,2010-05-15,juan.perez@email.com,Colegio San José,1ro Secundaria,La Paz,1,1
María Elena,López Vargas,87654321,2009-08-22,maria.lopez@email.com,Unidad Educativa Central,2do Secundaria,Cochabamba,2,1
```

## 🔧 Validaciones del Sistema

### Campos Obligatorios:
- ✅ `nombres` - No puede estar vacío
- ✅ `apellidos` - No puede estar vacío  
- ✅ `documento_identidad` - Debe ser único
- ✅ `fecha_nacimiento` - Formatos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
- ✅ `correo_electronico` - Debe ser email válido y único
- ✅ `colegio` - No puede estar vacío
- ✅ `curso` - No puede estar vacío
- ✅ `provincia` - No puede estar vacío
- ✅ `area_id` - Debe ser número entero válido
- ✅ `nivel_id` - Debe ser número entero válido

### IDs de Áreas y Niveles:
```
Áreas:
1 = Matemáticas
2 = Física  
3 = Química
4 = Biología

Niveles:
1 = Secundaria Menor
2 = Secundaria Mayor
3 = Secundaria Superior
```

## 🚨 Manejo de Errores Comunes

### 1. **Archivo con formato incorrecto**
```javascript
{
  "success": false,
  "mensaje": "El archivo no tiene la estructura correcta. Falta el campo 'nombres'."
}
```

### 2. **Email duplicado**
```javascript
{
  "success": false,
  "mensaje": "Email inválido en fila 3: correo@ejemplo.com"
}
```

### 3. **Fecha inválida**
```javascript
{
  "success": false,
  "mensaje": "La fecha de nacimiento es requerida."
}
```

### 4. **Archivo vacío**
```javascript
{
  "success": false,
  "mensaje": "El archivo no contiene datos."
}
```

## 🎛️ Estados de Carga

```javascript
const [estados, setEstados] = useState({
  inicial: true,      // Sin archivo seleccionado
  archivo: false,     // Archivo seleccionado
  cargando: false,    // Procesando archivo
  exitoso: false,     // Procesado correctamente
  error: false        // Error en procesamiento
});
```

## 🔄 Flujo Completo de Uso

1. **Usuario descarga plantilla** → GET `/plantilla-excel`
2. **Usuario llena plantilla** → Agrega datos de competidores
3. **Usuario selecciona archivo** → Input file onChange
4. **Sistema valida formato** → Verificación en frontend
5. **Usuario envía archivo** → POST `/proceso/{id}/excel`
6. **Sistema procesa datos** → Validación backend
7. **Respuesta con resultados** → Lista de competidores creados

## ⚡ Optimizaciones Recomendadas

### 1. **Loading States**
```jsx
const LoadingSpinner = () => (
  <div className="d-flex align-items-center">
    <div className="spinner-border text-primary me-2" />
    <span>Procesando archivo...</span>
  </div>
);
```

### 2. **Validación Cliente**
```javascript
const validarArchivo = (file) => {
  const extensionesValidas = ['csv', 'xlsx', 'xls'];
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (!extensionesValidas.includes(extension)) {
    return { valido: false, mensaje: 'Formato de archivo no válido' };
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { valido: false, mensaje: 'El archivo es demasiado grande' };
  }
  
  return { valido: true };
};
```

### 3. **Progress Indicator**
```jsx
const ProgressBar = ({ progreso }) => (
  <div className="progress mb-3">
    <div 
      className="progress-bar" 
      style={{ width: `${progreso}%` }}
    >
      {progreso}%
    </div>
  </div>
);
```

## 🛡️ Seguridad

- ✅ **Autenticación:** Todos los endpoints requieren Bearer token
- ✅ **Validación:** Servidor valida estructura y tipos de datos
- ✅ **Sanitización:** Emails y datos son validados antes del guardado
- ✅ **Límites:** Archivos tienen límite de tamaño por seguridad

## 📞 Soporte

Si encuentras problemas o necesitas ayuda con la implementación:

1. Verifica que el token de autorización sea válido
2. Confirma que el archivo tenga la estructura correcta
3. Revisa los logs del servidor para errores específicos
4. Usa el archivo de prueba: `test_sistema_inscripciones.php`

---

**🎯 El sistema está 100% operativo y listo para uso en producción**
