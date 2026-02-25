import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/_assignment-card.scss';

const DIFFICULTY_ICONS = {
  beginner: '🟢',
  intermediate: '🟡',
  advanced: '🔴',
};

export default function AssignmentCard({ assignment }) {
  const navigate = useNavigate();

  return (
    <div
      className="assignment-card"
      onClick={() => navigate(`/assignments/${assignment._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/assignments/${assignment._id}`)}
    >
      <div className="assignment-card__header">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        <span className={`badge badge--${assignment.difficulty}`}>
          {DIFFICULTY_ICONS[assignment.difficulty]} {assignment.difficulty}
        </span>
      </div>

      <p className="assignment-card__description">{assignment.description}</p>

      <div className="assignment-card__footer">
        <div className="assignment-card__tags">
          {(assignment.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="assignment-card__tag">{tag}</span>
          ))}
          {assignment.tags?.length > 3 && (
            <span className="assignment-card__tag">+{assignment.tags.length - 3}</span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          📋 {(assignment.relevantTables || []).join(', ')}
        </span>
      </div>
    </div>
  );
}
