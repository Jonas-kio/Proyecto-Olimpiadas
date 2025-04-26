import React from 'react';
import { Edit2Icon, TrashIcon } from 'lucide-react';
import '../../styles/components/OlimpiadaCard.css';

function OlimpiadaCard({ olympic, onDelete, onEdit }) {
  return (
    <div className="olympiad-card">
      <div className="olympiad-header">
        <h3 className="olympiad-title">{olympic.title}</h3>
        <span className={`olympiad-status ${olympic.statusColor}`}>{olympic.status}</span>
      </div>

      <div className="olympiad-image">
        <img src={olympic.imageUrl} alt={olympic.title} />
      </div>

      <div className="olympiad-info">
        <div>
          <p className="label">Áreas:</p>
          <p className="value">{olympic.areas}</p>
        </div>
        <div>
          <p className="label">Inscritos:</p>
          <p className="value">{olympic.participants} participantes</p>
        </div>
        <div>
          <p className="label">Modalidad:</p>
          <p className="value">{olympic.modality}</p>
        </div>
      </div>

      <div className="olympiad-actions">
        <button className="edit-btn" onClick={() => onEdit(olympic.id)}>
          <Edit2Icon size={16} className="icon-blue" />
        </button>
        <button className="delete-btn" onClick={() => onDelete(olympic.id)}>
          <TrashIcon size={16} className="icon-red" />
        </button>
      </div>
    </div>
  );
}

export default OlimpiadaCard;
