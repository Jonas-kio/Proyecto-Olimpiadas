import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckIcon,
  UploadIcon,
  ChevronDownIcon,
  Loader2,
} from "lucide-react";
import {
  crearOlimpiada,
  actualizarOlimpiada,
  obtenerOlimpiadaPorId,
} from "../../../services/apiConfig";
import LoadingModal from "../../../components/modals/LoadingModal";
import ProcesandoModal from "../../../components/common/ProcesandoModal";
import SuccessModal from "../../../components/common/SuccessModal";
import ErrorModal from "../../../components/common/ErrorModal";
import "../../../styles/components/FormularioOlimpiada.css";
import ImageUploader from "./ImageUploader";


import { getAllAreas } from "../../../services/areasService";

function FormularioOlimpiada() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dropdownRef = useRef(null);

  // Modals
  const [isLoading, setIsLoading] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorFields, setErrorFields] = useState([]);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetailMessage, setSuccessDetailMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedAreas: [],
    minParticipants: "",
    modality: "",
    pdfFile: null,
    coverImage: null,
    maxAreas: "", // NUEVO CAMPO
  });
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalities = ["Presencial", "Virtual", "Híbrida"];

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasData = await getAllAreas();
        const validAreas = Array.isArray(areasData) ? areasData : [];
        setAreasDisponibles(validAreas);
        console.log("Áreas disponibles:", validAreas);
      } catch (error) {
        console.error("Error al obtener áreas:", error);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAreasOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (id) {
      const fetchOlimpiada = async () => {
        setIsLoading(true);
        try {
          const res = await obtenerOlimpiadaPorId(id);
          const data = res.data?.olimpiada;
          if (!data) return;

          const areaIds = Array.isArray(data.areas)
            ? data.areas.map((a) => a.id)
            : [];

          setFormData((prev) => {
            const updated = {
              ...prev,
              name: data.nombre || "",
              description: data.descripcion || "",
              startDate: data.fecha_inicio?.split("T")[0] || "",
              endDate: data.fecha_fin?.split("T")[0] || "",
              selectedAreas: areaIds,
              minParticipants: data.cupo_minimo || "",
              modality: data.modalidad || "",
              pdfFile: null,
              coverImage: null,
              maxAreas: data.maximo_areas || "",
            };
            data.areas?.forEach((a) => {
              updated[`nivel_unico_${a.id}`] = a.pivot?.nivel_unico || false;
              updated[`area_exclusiva_${a.id}`] =
                a.pivot?.area_exclusiva || false;
            });
            return updated;
          });

          if (data.ruta_imagen_portada) {
            setImagePreview(
              `http://localhost:8000/storage/${data.ruta_imagen_portada}`
            );
          }
        } catch (error) {
          console.error("Error al obtener la olimpiada:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOlimpiada();
    }
  }, [id]);

  const handleAreaToggle = (areaId) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (prev.selectedAreas.includes(areaId)) {
        updated.selectedAreas = prev.selectedAreas.filter((a) => a !== areaId);
        delete updated[`nivel_unico_${areaId}`];
        delete updated[`area_exclusiva_${areaId}`];
      } else {
        updated.selectedAreas = [...prev.selectedAreas, areaId];
        updated[`nivel_unico_${areaId}`] = false;
        updated[`area_exclusiva_${areaId}`] = false;
      }
      return updated;
    });
  };


  const handleImageChange = (file) => {
  setFormData((prev) => ({ ...prev, coverImage: file }));
  const reader = new FileReader();
  reader.onload = () => setImagePreview(reader.result);
  reader.readAsDataURL(file);
};


  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/app/dasboardOlimpiada");
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
    setErrorFields([]);
  };

  const isFechaValida = () => {
    if (!formData.startDate || !formData.endDate) return true;
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const diferenciaDias = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return diferenciaDias >= 10;
  };

  const esFechaNoPasada = (fecha) => {
    if (!fecha) return true;

    // Convertimos fecha manualmente a local (ignorar zona horaria)
    const [year, month, day] = fecha.split("-").map(Number);
    const selected = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // limpiar hora
    selected.setHours(0, 0, 0, 0); // limpiar hora

    return selected >= today;
  };

  const isFormValid = () => {
    const fechaInicioValida = esFechaNoPasada(formData.startDate);
    const fechaFinValida = esFechaNoPasada(formData.endDate);
    const fechasConDiferenciaValida = isFechaValida();
    const pdfObligatorio = !id ? formData.pdfFile !== null : true;
    const imagenObligatoria = !id
      ? formData.coverImage !== null
      : !!imagePreview || formData.coverImage !== null;

    return (
      formData.name.trim() !== "" &&
      formData.name.length <= 100 &&
      formData.description.trim() !== "" &&
      formData.description.length <= 300 &&
      formData.startDate !== "" &&
      formData.endDate !== "" &&
      fechaInicioValida &&
      fechaFinValida &&
      fechasConDiferenciaValida &&
      formData.selectedAreas.length > 0 &&
      formData.minParticipants !== "" &&
      formData.modality !== "" &&
      formData.maxAreas !== "" &&
      formData.maxAreas > 0 && // NUEVO
      imagenObligatoria &&
      pdfObligatorio
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowProcessingModal(true);

    if (!isFormValid()) {
      alert("Completa todos los campos correctamente antes de guardar.");
      setIsSubmitting(false);
      setShowProcessingModal(false);
      return;
    }

    const data = new FormData();
    data.append("nombre", formData.name);
    data.append("descripcion", formData.description);
    data.append("fecha_inicio", formData.startDate);
    data.append("fecha_fin", formData.endDate);
    data.append("cupo_minimo", formData.minParticipants);
    data.append("modalidad", formData.modality);
    data.append("estado", "Pendiente");
    data.append("activo", "true");
    if (formData.pdfFile) data.append("pdf_detalles", formData.pdfFile);
    if (formData.coverImage) data.append("imagen_portada", formData.coverImage);
    data.append("areas", JSON.stringify(formData.selectedAreas));
    data.append("maximo_areas", formData.maxAreas);

    // 🚀 NUEVO: Crear el array de condiciones [{area_id, nivel_unico, area_exclusiva}]
    const condiciones = formData.selectedAreas.map((areaId) => ({
      area_id: areaId,
      nivel_unico: !!formData[`nivel_unico_${areaId}`], // Aseguramos boolean
      area_exclusiva: !!formData[`area_exclusiva_${areaId}`],
    }));

    data.append("condiciones", JSON.stringify(condiciones));

    // 🚨 Elimina las líneas anteriores de envío de nivel_unico[7], etc.
    /*
    formData.selectedAreas.forEach((areaId) => {
      const nivelUnico = String(!!formData[`nivel_unico_${areaId}`]);
      const areaExclusiva = String(!!formData[`area_exclusiva_${areaId}`]);
      data.append(`nivel_unico[${areaId}]`, nivelUnico);
      data.append(`area_exclusiva[${areaId}]`, areaExclusiva);
    });
    */

    // 🔍 LOG general para revisar toda la información
    console.log("📢 Data completa antes del envío (FormData):");
    for (let pair of data.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      if (id) {
        await actualizarOlimpiada(id, data);
        setSuccessTitle("¡Olimpiada actualizada exitosamente!");
        setSuccessMessage("Los cambios fueron guardados correctamente.");
        setSuccessDetailMessage(
          "Puedes ver la olimpiada actualizada en el Dashboard."
        );
      } else {
        await crearOlimpiada(data);
        setSuccessTitle("¡Olimpiada creada exitosamente!");
        setSuccessMessage("La nueva olimpiada fue registrada correctamente.");
        setSuccessDetailMessage("Puedes verla en el Dashboard.");
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Error al guardar olimpiada:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "No se pudo guardar la olimpiada. Intenta nuevamente."
      );
      setErrorFields(["Nombre", "Descripción", "Fechas", "Áreas", "Modalidad"]);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
      setShowProcessingModal(false);
    }
  };

  return (
    <>
      <div className="create-olympiad-container">
        <div className="create-olympiad-box">
          <h1 className="title">
            {id ? "Editar Olimpiada" : "Crear Nueva Olimpiada"}
          </h1>
          <form onSubmit={handleSubmit} className="form-content">

            {/* Imagen */}
            <ImageUploader
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemove={() => {
                setImagePreview("");
                setFormData((prev) => ({ ...prev, coverImage: null }));
              }}
            />

            {/* Nombre, descripción, fechas, modalidad, etc. */}
            <div className="input-group">
              <label className="label">
                Nombre de la Olimpiada <span className="asterisco">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                required
              />
              {formData.name.length >= 100 && (
                <p style={{ color: "red", marginTop: "5px", fontSize: "14px" }}>
                  Límite de 100 caracteres excedido.
                </p>
              )}
            </div>

            <div className="input-group">
              <label className="label">
                Descripción <span className="asterisco">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setFormData({ ...formData, description: e.target.value });
                  }
                }}
                className="textarea"
                rows={4}
                required
              />
              {formData.description.length === 300 && (
                <p style={{ color: "red", marginTop: "5px", fontSize: "14px" }}>
                  Límite máximo de 300 caracteres alcanzado.
                </p>
              )}
            </div>

            <div className="date-grid">
              <div>
                <label className="label">
                  Fecha de inicio <span className="asterisco">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="input"
                  required
                />
                {formData.startDate && !esFechaNoPasada(formData.startDate) && (
                  <p
                    style={{ color: "red", marginTop: "5px", fontSize: "14px" }}
                  >
                    No se puede elegir una fecha de inicio pasada.
                  </p>
                )}
              </div>
              <div>
                <label className="label">
                  Fecha de fin <span className="asterisco">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="input"
                  required
                />
                {formData.endDate && !esFechaNoPasada(formData.endDate) && (
                  <p
                    style={{ color: "red", marginTop: "5px", fontSize: "14px" }}
                  >
                    No se puede elegir una fecha de fin pasada.
                  </p>
                )}
                {formData.startDate && formData.endDate && !isFechaValida() && (
                  <p
                    style={{ color: "red", marginTop: "5px", fontSize: "14px" }}
                  >
                    El lapso mínimo de una olimpiada debe ser de 10 días.
                  </p>
                )}
              </div>
            </div>

            <div className="input-group">
              <label className="label">
                Máximo de áreas permitidas <span className="asterisco">*</span>
              </label>
              <input
                type="number"
                value={formData.maxAreas}
                onChange={(e) =>
                  setFormData({ ...formData, maxAreas: e.target.value })
                }
                className="input"
                min="1"
                required
              />
            </div>

            {/* Áreas */}
            <div className="dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsAreasOpen(!isAreasOpen)}
                className={`dropdown-button ${isAreasOpen ? "open" : ""}`}
              >
                <span className="dropdown-selected">
                  {formData.selectedAreas.length
                    ? `${formData.selectedAreas.length} áreas seleccionadas`
                    : "Seleccionar áreas"}
                </span>
                <ChevronDownIcon
                  className={`chevron-icon ${isAreasOpen ? "rotate" : ""}`}
                />
              </button>

              {isAreasOpen && (
                <div className="dropdown-options">
                  {areasDisponibles.map((area) => (
                    <div
                      key={area.id}
                      className="dropdown-option"
                      onClick={() => handleAreaToggle(area.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedAreas.includes(area.id)}
                        readOnly
                        className="checkbox"
                      />
                      <span>{area.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tabla-areas-wrapper">
              <h2>Áreas seleccionadas</h2>
              <table className="tabla-areas">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Nivel Único</th>
                    <th>Área Exclusiva</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.selectedAreas.map((areaId) => {
                    const area = areasDisponibles.find((a) => a.id === areaId);
                    const nivelKey = `nivel_unico_${areaId}`;
                    const exclusivaKey = `area_exclusiva_${areaId}`;
                    return (
                      <tr key={areaId}>
                        <td>{area?.name || "Área desconocida"}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!formData[nivelKey]}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                [nivelKey]: !prev[nivelKey],
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!formData[exclusivaKey]}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                [exclusivaKey]: !prev[exclusivaKey],
                              }))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="input-group">
              <label className="label">
                Cupo mínimo de participantes{" "}
                <span className="asterisco">*</span>
              </label>              <input                type="number"
                value={formData.minParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, minParticipants: e.target.value })
                }
                className="input"
                min="1"
                required
              />
            </div>

            <div className="input-group">
              <label className="label">
                Modalidad <span className="asterisco">*</span>
              </label>
              <select
                value={formData.modality}
                onChange={(e) =>
                  setFormData({ ...formData, modality: e.target.value })
                }
                className="input"
                required
              >
                <option value="">Seleccione una modalidad</option>
                {modalities.map((modality) => (
                  <option key={modality} value={modality}>
                    {modality}
                  </option>
                ))}
              </select>
            </div>

            <div className="pdf-upload-container">
              <label className="pdf-upload-label">
                Detalles de la olimpiada (PDF){" "}
                <span className="asterisco">*</span>
              </label>
              <div className="pdf-upload-wrapper">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pdfFile: e.target.files?.[0] || null,
                    }))
                  }
                  className="pdf-upload-input"
                />
                <UploadIcon className="pdf-upload-icon" />
              </div>
              {formData.pdfFile && (
                <p className="pdf-upload-filename">
                  Archivo seleccionado: <span>{formData.pdfFile.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />{" "}
                  {id ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <CheckIcon size={20} />{" "}
                  {id ? "Actualizar Olimpiada" : "Guardar Olimpiada"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <LoadingModal
        isOpen={isLoading}
        message={
          id
            ? "Cargando campos de olimpiada..."
            : "Cargando datos, por favor espere..."
        }
      />
      {showProcessingModal && (
        <ProcesandoModal
          isOpen={showProcessingModal}
          title="Guardando..."
          message="Por favor espere un momento..."
        />
      )}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        tittleMessage={successTitle}
        successMessage={successMessage}
        detailMessage={successDetailMessage}
      />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleCloseErrorModal}
        errorMessage={errorMessage}
        errorFields={errorFields}
      />
    </>
  );
}

export default FormularioOlimpiada;
