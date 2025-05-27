import React from 'react';
import { FileTextIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import "../../../styles/boletas/PaymentReceiptsList.css";

const PaymentReceiptsList = ({ paymentReceipts }) => {
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

  return (
    <div className="payment-container">
      <h2 className="payment-title">Boletas de Pago por Olimpiada</h2>
      <div className="space-y-6">
        {paymentReceipts.map((olympiad) => (
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
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {olympiad.receipts.map((receipt) => (
                    <tr key={receipt.id} className="payment-table-row">
                      <td>{receipt.user}</td>
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
