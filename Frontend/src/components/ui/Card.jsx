import React from 'react';
import '../../styles/components/Card.css';

const Card = ({ title, children, action }) => {
  return (
    <div className="content-card">
      <div className="card-header">
        <h2>{title}</h2>
        {action && action}
      </div>
      {children}
    </div>
  );
};

export default Card;