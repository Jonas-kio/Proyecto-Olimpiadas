/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FileTextIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { CiFilter } from "react-icons/ci";
import "../../../styles/boletas/PaymentReceiptsList.css";

const PaymentReceiptsList = ({paymentReceipts }) => {
  const [selectedOlympiad, setSelectedOlympiad] = useState("");

  const getStatusIcon = (status) => {
    return status === 'Pagado' ? (
      <CheckCircleIcon className="payment-status-icon" style={{ color: '#10b981' }} />
    ) : (
      <ClockIcon className="payment-status-icon" style={{ color: '#facc15' }} />
    );
  };

  const getStatusClass = (status) => {
    return status === 'Pagado' ? 'payment-status-paid' : 'payment-status-pending';
  };

  const handleFilterChange = (e) => {
    setSelectedOlympiad(e.target.value);
  };

  const filteredReceipts = selectedOlympiad 
    ? paymentReceipts.filter(olympiad => olympiad.id.toString() === selectedOlympiad)
    : paymentReceipts;

  const availableOlympiads = paymentReceipts.map(olympiad => ({
    id: olympiad.id,
    olympiad: olympiad.olympiad,
  }));

  return (
    <div className="payment-container">
      <h2 className="payment-title">Boletas de Pago por Olimpiada</h2>
      <div className='filter-container'>
        <label className="filter-label">
          <CiFilter className="payment-header-icon" />
          <span className="filter-text">Filtrar por olimpiada</span>
        </label>
        <select 
          className="filter-select" 
          value={selectedOlympiad} 
          onChange={handleFilterChange}
        >
          <option value="">Todas las Olimpiadas</option>
          {availableOlympiads.map(olympiad => (
            <option key={olympiad.id} value={olympiad.id.toString()}>
              {olympiad.olympiad}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        {filteredReceipts.map((olympiad) => (
          <div key={olympiad.id} className="payment-olympiad">
            <div className="payment-header">
              <div className="payment-header-left">
                <FileTextIcon className="payment-header-icon" />
                <h3 className="payment-header-text">{olympiad.olympiad}</h3>
              </div>
              <span className="payment-header-count">
                ({olympiad.receipts.length} boletas)
              </span>
            </div>

            <div className="payment-table-container">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Boleta</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {olympiad.receipts.map((receipt) => (
                    <tr key={receipt.id} className="payment-table-row">
                      <td>{receipt.user}</td>
                      <td>
                        {receipt.boleta}
                      </td>
                      <td>${receipt.amount.toLocaleString()}</td>
                      <td>{new Date(receipt.date).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div className="payment-flex">
                          {getStatusIcon(receipt.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(receipt.status)}`}>
                            {receipt.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentReceiptsList;
