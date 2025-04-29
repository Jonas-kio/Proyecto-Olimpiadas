import React, { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OlympicCard from "../../components/layout/OlimpiadaCard";
import { obtenerOlimpiadas, eliminarOlimpiada } from "../../services/apiConfig";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import SuccessModal from "../../components/common/SuccessModal";
import LoadingModal from "../../components/modals/LoadingModal";
import "../../styles/components/DasboardOlimpiada.css";

function DasboardOlimpiada() {
  const navigate = useNavigate();
  const [olympicsData, setOlympicsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState(null);
  const [selectedOlimpiadaName, setSelectedOlimpiadaName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true); //Empieza la carga del modal
    try {
      const res = await obtenerOlimpiadas();
      const lista = res.data?.data?.olimpiadas?.data || [];
      const parsed = lista.map((item) => ({
        id: item.id,
        title: item.nombre,
        status: item.estado,
        statusColor:
          item.estado === "En Proceso"
            ? "text-green-600 bg-green-100"
            : item.estado === "Terminado"
            ? "text-red-600 bg-red-100"
            : "text-blue-600 bg-blue-100",
        areas: item.areas.map((a) => a.nombre).join(", "),
        participants: 0, // valor fijo por ahora
        modality: item.modalidad,
        imageUrl: `http://localhost:8000/storage/${item.ruta_imagen_portada}`,
      }));
      setOlympicsData(parsed);
    } catch (err) {
      console.error("Error al obtener olimpiadas:", err);
    } finally {
      setIsLoading(false); // <--- Desactivar el modal después de cargar
    }
  };

  const handleDelete = (id, name) => {
    setSelectedOlimpiadaId(id);
    setSelectedOlimpiadaName(name);
    setIsModalOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!selectedOlimpiadaId) return;
    try {
      await eliminarOlimpiada(selectedOlimpiadaId);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar la olimpiada");
    } finally {
      setIsModalOpen(false);
      setSelectedOlimpiadaId(null);
      setSelectedOlimpiadaName("");
    }
  };

  const cancelarEliminacion = () => {
    setIsModalOpen(false);
    setSelectedOlimpiadaId(null);
    setSelectedOlimpiadaName("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    fetchData(); // Recargar lista de olimpiadas
  };

  const handleEdit = (id) => {
    navigate(`/app/formulario_Olimpiada/${id}`);
  };

  return (
    <div className="dashboard-olimpiada">
      <div className="dashboard-header card-style">
        <div>
          <h2 className="dashboard-title">Olimpiadas</h2>
          <p className="dashboard-subtitle">
            Historial de las olimpiadas creadas
          </p>
        </div>
        <button
          className="create-btn"
          onClick={() => navigate("/app/formulario_Olimpiada")}
        >
          <PlusIcon size={16} /> Crear nueva olimpiada
        </button>
      </div>

      <div className="dashboard-grid">
        {olympicsData.map((olympic) => (
          <OlympicCard
            key={olympic.id}
            olympic={olympic}
            onDelete={() => handleDelete(olympic.id, olympic.title)}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        itemName={selectedOlimpiadaName}
        itemType="olimpiada"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        tittleMessage="¡Eliminación Exitosa!"
        successMessage="La olimpiada fue eliminada correctamente."
        detailMessage="Ahora puedes gestionar el resto de las olimpiadas."
      />

      <LoadingModal isOpen={isLoading} />
    </div>
  );
}

export default DasboardOlimpiada;
