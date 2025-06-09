import { useState, useEffect } from 'react';
import PaymentReceiptsList from './PaymentReceiptsList';
import {obtenerBoletasPorOlimpiadas} from '../../../services/olimpiadaService'; // Asegúrate de que la ruta sea correcta
import ErrorModal from '../../../components/common/ErrorModal';
import LoadingModal from '../../../components/modals/LoadingModal';

const Tickets = () => {
  const [paymentReceipts, setPaymentReceipts] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarBoletas = async () => {
      try {
        setLoading(true);
        const response = await obtenerBoletasPorOlimpiadas();
        
        if (response.success) {
          setPaymentReceipts(response.data);
        } else {
          setError('Error al cargar las boletas');
        }
      } catch (err) {
        console.error('Error al cargar boletas:', err);
        setError('No se pudieron cargar las boletas. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarBoletas();
  }, []);

  const handleCloseError = () => {
    setError(null);
  };


  return (
    <div className="space-y-8">
      <LoadingModal isOpen={loading} message="Cargando boletas..." />
      <ErrorModal 
        isOpen={!!error} 
        message={error || ''} 
        onClose={handleCloseError} 
      />
      {/* <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} /> */}
      {!loading && !error && paymentReceipts && (
        <PaymentReceiptsList paymentReceipts={paymentReceipts} />
      )}
    </div>
  );
};

export default Tickets;
