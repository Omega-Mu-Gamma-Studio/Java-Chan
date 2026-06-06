import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadUnit } from '../services/lessonService';
import { useProgress } from '../hooks/useProgress';
import './UnitPage.css';

const UnitPage = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { isCompleted } = useProgress();
  const [unit, setUnit] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUnit(Number(unitId))
      .then(setUnit)
      .catch(e => setError(e.message));
  }, [unitId]);

  if (error) return (
    <div className="unit-page-state">
      <p>Unit not found.</p>
      <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
    </div>
  );

  if (!unit) return (
    <div className="unit-page-state">
      <span className="loading-spinner" />
    </div>
  );

  const completed = unit.lessons.filter(id => isCompleted(id)).length;

  return (
    <div className="unit-page">
      <div className="unit-page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Home</button>
        <div>
          <span className="unit-page-badge">Unit {unit.id}</span>
          <h1 className="unit-page-title">{unit.title}</h1>
          <p className="unit-page-progress">{completed} / {unit.lessons.length} lessons complete</p>
        </div>
      </div>

      <div className="unit-lessons-grid">
        {unit.lessons.map(id => {
          const done = isCompleted(id);
          return (
            <button
              key={id}
              className={`unit-lesson-card ${done ? 'unit-lesson-card--done' : ''}`}
              onClick={() => navigate(`/lesson/${id}`)}
            >
              <span className="unit-lesson-check">{done ? '✓' : '○'}</span>
              <span className="unit-lesson-id">Lesson {id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnitPage;
