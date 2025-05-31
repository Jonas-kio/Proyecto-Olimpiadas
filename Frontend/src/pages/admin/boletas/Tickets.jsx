import { useState } from 'react';
import FileUpload from './FileUpload';
import PaymentReceiptsList from './PaymentReceiptsList'; 

const Tickets = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [paymentReceipts, setPaymentReceipts] = useState([
    {
      id: 1,
      olympiad: 'Olimpiada Nacional de Matemáticas 2024',
      receipts: [
        {
          id: 1,
          user: 'Ana García López',
          amount: 150,
          date: '2024-01-15',
          status: 'Pagado'
        },
        {
          id: 2,
          user: 'Carlos Mendoza',
          amount: 150,
          date: '2024-01-16',
          status: 'Pendiente'
        },
        {
          id: 3,
          user: 'Ismael',
          amount: 300,
          date: '2025-05-26',
          status: 'Pagado'
        }
      ]
    },
    {
      id: 2,
      olympiad: 'Olimpiada de Física 2024',
      receipts: [
        {
          id: 3,
          user: 'María Rodríguez',
          amount: 200,
          date: '2024-01-18',
          status: 'Pagado'
        },
        {
          id: 4,
          user: 'José Martínez',
          amount: 200,
          date: '2024-01-19',
          status: 'Pagado'
        }
      ]
    }
  ]);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    console.log('Archivo CSV subido:', file.name);
    // Aquí puedes procesar el archivo CSV si lo deseas
  };

  return (
    <div className="space-y-8">
      {/* <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} /> */}
      <PaymentReceiptsList paymentReceipts={paymentReceipts} />
    </div>
  );
};

export default Tickets;
