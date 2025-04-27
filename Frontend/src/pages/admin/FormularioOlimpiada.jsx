import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, UploadIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import {
  crearOlimpiada,
  actualizarOlimpiada,
  obtenerOlimpiadaPorId,
  obtenerAreas,
} from '../../services/apiConfig';
import '../../styles/components/FormularioOlimpiada.css';

function FormularioOlimpiada() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedAreas: [],
    minParticipants: '',
    modality: '',
    pdfFile: null,
    coverImage: null,
  });
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const [pdfFilename, setPdfFilename] = useState('');
  const modalities = ['Presencial', 'Virtual', 'Híbrida'];

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await obtenerAreas();
        setAreasDisponibles(res.data || []);
      } catch (error) {
        console.error('Error al obtener áreas:', error);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchOlimpiada = async () => {
        try {
          const res = await obtenerOlimpiadaPorId(id);
          const data = res.data?.olimpiada;
          if (!data) return;

          setFormData({
            name: data.nombre || '',
            description: data.descripcion || '',
            startDate: data.fecha_inicio?.split('T')[0] || '',
            endDate: data.fecha_fin?.split('T')[0] || '',
            selectedAreas: Array.isArray(data.areas) ? data.areas.map((a) => a.id) : [],
            minParticipants: data.cupo_minimo || '',
            modality: data.modalidad || '',
            pdfFile: null,
            coverImage: null,
          });

          if (data.ruta_imagen_portada) {
            setImagePreview(`http://localhost:8000/storage/${data.ruta_imagen_portada}`);
          }
        } catch (error) {
          console.error('Error al obtener la olimpiada:', error);
        }
      };
      fetchOlimpiada();
    }
  }, [id]);

  const handleAreaToggle = (areaId) => {
    setFormData((prev) => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(areaId)
        ? prev.selectedAreas.filter((a) => a !== areaId)
        : [...prev.selectedAreas, areaId],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid =
      formData.name &&
      formData.description &&
      formData.startDate &&
      formData.endDate &&
      formData.selectedAreas.length > 0 &&
      formData.minParticipants &&
      formData.modality;

    if (!isValid) {
      alert('Completa todos los campos');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('nombre', formData.name);
    data.append('descripcion', formData.description);
    data.append('fecha_inicio', formData.startDate);
    data.append('fecha_fin', formData.endDate);
    data.append('cupo_minimo', formData.minParticipants);
    data.append('modalidad', formData.modality);
    data.append('estado', 'Pendiente');
    data.append('activo', 'true');
    if (formData.pdfFile) data.append('pdf_detalles', formData.pdfFile);
    if (formData.coverImage) data.append('imagen_portada', formData.coverImage);
    data.append('areas', JSON.stringify(formData.selectedAreas));

    try {
      if (id) {
        await actualizarOlimpiada(id, data);
        alert('✅ Olimpiada actualizada exitosamente');
      } else {
        await crearOlimpiada(data);
        alert('✅ Olimpiada creada exitosamente');
      }
      navigate('/app/dasboardOlimpiada');
    } catch (error) {
      console.error('❌ Error al guardar olimpiada:', error);
      alert('❌ Ocurrió un error al guardar la olimpiada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-olympiad-container">
      <div className="create-olympiad-box">
        <h1 className="title">{id ? 'Editar Olimpiada' : 'Crear Nueva Olimpiada'}</h1>
        <form onSubmit={handleSubmit} className="form-content">
          {/* Imagen */}
          <div className="input-group">
            <label className="label">Imagen de Portada</label>
            <div className="image-upload">
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" onClick={() => { setImagePreview(''); setFormData((prev) => ({ ...prev, coverImage: null })); }} className="remove-btn">
                    <XIcon size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <UploadIcon className="upload-icon" />
                  <label className="upload-label">
                    <span className="upload-text">Subir imagen</span>
                    <input type="file" accept="image/*" className="file-hidden" onChange={handleImageChange} />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Nombre, descripción, fechas, modalidad, etc. */}
          <div className="input-group">
            <label className="label">Nombre de la Olimpiada</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
          </div>

          <div className="input-group">
            <label className="label">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="textarea" rows={4} required />
          </div>

          <div className="date-grid">
            <div>
              <label className="label">Fecha de inicio</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Fecha de fin</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input" required />
            </div>
          </div>

          {/* Áreas */}
          <div className="dropdown-container">
            <label className="dropdown-label">Áreas</label>
            <div className="dropdown-wrapper">
              <button type="button" onClick={() => setIsAreasOpen(!isAreasOpen)} className={`dropdown-button ${isAreasOpen ? 'open' : ''}`}>
                <span className="dropdown-selected">
                  {formData.selectedAreas.length ? `${formData.selectedAreas.length} áreas seleccionadas` : 'Seleccionar áreas'}
                </span>
                <ChevronDownIcon className={`chevron-icon ${isAreasOpen ? 'rotate' : ''}`} />
              </button>
              {isAreasOpen && (
                <div className="dropdown-options">
                  {areasDisponibles.map((area) => (
                    <div key={area.id} className="dropdown-option" onClick={() => handleAreaToggle(area.id)}>
                      <input type="checkbox" checked={formData.selectedAreas.includes(area.id)} readOnly className="checkbox" />
                      <span>{area.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="label">Cupo mínimo de participantes</label>
            <input type="number" value={formData.minParticipants} onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })} className="input" min="1" required />
          </div>

          <div className="input-group">
            <label className="label">Modalidad</label>
            <select value={formData.modality} onChange={(e) => setFormData({ ...formData, modality: e.target.value })} className="input" required>
              <option value="">Seleccione una modalidad</option>
              {modalities.map((modality) => (
                <option key={modality} value={modality}>{modality}</option>
              ))}
            </select>
          </div>

          <div className="pdf-upload-container">
            <label className="pdf-upload-label">Detalles de la olimpiada (PDF)</label>
            <div className="pdf-upload-wrapper">
              <input type="file" accept=".pdf" onChange={(e) => setFormData((prev) => ({ ...prev, pdfFile: e.target.files?.[0] || null }))} className="pdf-upload-input" />
              <UploadIcon className="pdf-upload-icon" />
            </div>
            {formData.pdfFile && (
              <p className="pdf-upload-filename">Archivo seleccionado: <span>{formData.pdfFile.name}</span></p>
            )}
          </div>


          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <CheckIcon size={20} /> {isSubmitting ? (id ? 'Actualizando...' : 'Guardando...') : (id ? 'Actualizar Olimpiada' : 'Guardar Olimpiada')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioOlimpiada;

/*if (data.ruta_pdf_detalles) {
  const parts = data.ruta_pdf_detalles.split('/');
  const fileName = parts[parts.length - 1];
  setPdfFilename(fileName);
}
{(formData.pdfFile || pdfFilename) && (
  <p className="pdf-upload-filename">
    Archivo seleccionado: <span>{formData.pdfFile ? formData.pdfFile.name : pdfFilename}</span>
  </p>
)} */