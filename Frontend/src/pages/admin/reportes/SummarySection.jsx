import React from 'react';
import "../../../styles/reportes/SummarySection.css";

const SummarySection = ({ items }) => {
  return (
    <div className="summary-section">
      {items.map((item, index) => (
        <div key={index} className="summary-row">
          <span>{item.name}</span>
          <span className="summary-value">
            {item.count} {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SummarySection;
