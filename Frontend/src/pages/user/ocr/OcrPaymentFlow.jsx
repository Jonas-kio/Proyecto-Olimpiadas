import { useState,useEffect } from 'react'
import OcrResults from './OcrResults'
import { Navigate, useParams } from 'react-router-dom';

import { obtenerAsociadosPagador } from '../../../services/inscripcionService';
import LoadingModal from '../../../components/modals/LoadingModal';
import ErrorModal from '../../../components/common/ErrorModal';

const OcrPaymentFlow = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [tutor, setTutor] = useState(null);
  const [competidores, setCompetidores] = useState([]);
  const { procesoId } = useParams();

  useEffect(() => {
    const cargarDatosAsociados = async () => {
      try {
        setLoading(true);
        setShowError(false);

        if (!procesoId) {
          throw new Error("ID del proceso no encontrado");
        }

        const resultado = await obtenerAsociadosPagador(procesoId);
        
        if (resultado && resultado.data) {

          const tutor = {
            id: resultado.data.tutor?.id || null,
            name: resultado.data.tutor.nombre_completo,
          }
          setTutor(tutor);
          
          const competidoresFormateados = resultado.data.competidores.map(comp => ({
            id: comp.id,
            name: `${comp.nombres} ${comp.apellidos}`,
            tutorId: resultado.data.tutor.id,
            grade: `${comp.curso} ${comp.nivel}`
          }));
          
          setCompetidores(competidoresFormateados);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message || 'No se pudieron cargar los datos asociados. Por favor, inténtalo nuevamente.');
        setLoading(false);
        setShowError(true);
      }
    };

    if (procesoId) {
      cargarDatosAsociados();
    }
  }, [procesoId]);

  const handleCloseError = () => {
    setShowError(false);
    Navigate('/user/mis-inscripciones'); 
  };

  const handleRetry = () => {
    setShowError(false);
    // Reintentar la carga de datos
    const cargarDatosAsociados = async () => {
      try {
        setLoading(true);
        const resultado = await obtenerAsociadosPagador(procesoId);
        
        if (resultado && resultado.data) {
          const tutor = {
            id: resultado.data.tutor?.id || null,
            name: resultado.data.tutor.nombre_completo,
          }
          setTutor(tutor);
          
          const competidoresFormateados = resultado.data.competidores.map(comp => ({
            id: comp.id,
            name: `${comp.nombres} ${comp.apellidos}`,
            tutorId: resultado.data.tutor.id,
            grade: `${comp.curso} ${comp.nivel}`
          }));
          
          setCompetidores(competidoresFormateados);
        } else {
          throw new Error("No se recibieron datos válidos del servidor");
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al reintentar cargar los datos:', error);
        setError(error.message || 'No se pudieron cargar los datos asociados. Por favor, inténtalo nuevamente.');
        setShowError(true);
        setLoading(false);
      }
    };

    cargarDatosAsociados();
  };

  return (
    <>
      <LoadingModal
        isOpen={loading}
        title="Cargando información"
        message="Obteniendo datos de estudiantes asociados..."
      />

      <ErrorModal
        isOpen={showError}
        title="Error al cargar datos"
        message={error || "Ha ocurrido un error inesperado"}
        onClose={handleCloseError}
        onRetry={handleRetry}
      />

      {!loading && (
        <OcrResults
          detectedName={tutor ? tutor.name : 'No se encontró información del tutor'}
          students={competidores}
        />
      )}
    </>
  )
}

export default OcrPaymentFlow
