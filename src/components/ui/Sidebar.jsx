import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAllUnits } from '../../services/lessonService';
import { useProgress } from '../../hooks/useProgress';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isCompleted, isUnitUnlocked } = useProgress();
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({ 1: true });

  useEffect(() => {
    loadAllUnits()
      .then(setUnits)
      .catch(console.error);
  }, []);

  const handleLessonClick = (id) => {
    navigate(`/lesson/${id}`);
    onClose();
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Lessons</span>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>

      <nav className="sidebar-nav">
        {units.map(unit => {
          const unlocked = isUnitUnlocked(unit.id);
          const expanded = expandedUnits[unit.id];

          return (
            <div key={unit.id} className="sidebar-unit">
              <button
                className={`sidebar-unit-header ${!unlocked ? 'sidebar-unit-header--locked' : ''}`}
                onClick={() => unlocked && toggleUnit(unit.id)}
                disabled={!unlocked}
              >
                <span className="sidebar-unit-icon">
                  {unlocked ? (expanded ? '▾' : '▸') : '🔒'}
                </span>
                <span className="sidebar-unit-title">Unit {unit.id}</span>
                <span className="sidebar-unit-name">{unit.title}</span>
              </button>

              {unlocked && expanded && (
                <ul className="sidebar-lessons">
                  {unit.lessons.map(id => {
                    const done = isCompleted(id);
                    const active = id === lessonId;
                    return (
                      <li key={id}>
                        <button
                          className={`sidebar-lesson-btn
                            ${active ? 'sidebar-lesson-btn--active' : ''}
                            ${done ? 'sidebar-lesson-btn--done' : ''}
                          `}
                          onClick={() => handleLessonClick(id)}
                        >
                          <span className="sidebar-lesson-indicator">
                            {done ? '✓' : active ? '▶' : '○'}
                          </span>
                          <span>Lesson {id}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
