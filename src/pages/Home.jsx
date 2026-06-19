import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import useLessonStore from '../store/lessonStore';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { lastVisited, xp, level, isUnitUnlocked } = useProgress();
  const { setExpression, setDialogue } = useLessonStore();

  useEffect(() => {
    setExpression('idle');
    setDialogue("Welcome! Ready to learn Java? ✨");
  }, []);

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">
          Learn Java with <span className="home-title-accent">Java-chan</span>
        </h1>
        <p className="home-subtitle">
          No boring syntax lectures. Just you, Java-chan, and working code.
        </p>

        <div className="home-actions">
          {lastVisited ? (
            <button
              className="btn btn-primary home-btn-primary"
              onClick={() => navigate(`/lesson/${lastVisited}`)}
            >
              Continue: Lesson {lastVisited} →
            </button>
          ) : (
            <button
              className="btn btn-primary home-btn-primary"
              onClick={() => navigate('/lesson/1.1')}
            >
              Start Learning →
            </button>
          )}
        </div>

        {xp > 0 && (
          <p className="home-progress-note">
            Level {level} · {xp} XP earned so far
          </p>
        )}
      </div>

      <div className="home-shop-banner" onClick={() => navigate('/shop')}>
        <span className="home-shop-banner-icon">🛍️</span>
        <div className="home-shop-banner-text">
          <span className="home-shop-banner-title">Closet &amp; Decor</span>
          <span className="home-shop-banner-sub">New wallpaper or outfit unlocks every level — Lv.{level} now</span>
        </div>
        <span className="home-shop-banner-arrow">→</span>
      </div>

      <div className="home-units">
        <h2 className="home-section-title">Syllabus</h2>
        <div className="home-unit-list">
          {[
            { id: 1, title: 'OOP & Java Fundamentals', lessons: 15 },
            { id: 2, title: 'Inheritance & Interfaces',  lessons: 15 },
            { id: 3, title: 'Exception Handling & I/O',  lessons: 15 },
            { id: 4, title: 'Collections & Threads',     lessons: 15 },
            { id: 5, title: 'JavaFX & UI',               lessons: 15 },
          ].map(unit => {
            const unlocked = isUnitUnlocked(unit.id);
            return (
              <div
                key={unit.id}
                className={`home-unit-card ${unlocked ? 'home-unit-card--active' : 'home-unit-card--locked'}`}
                onClick={() => unlocked && navigate(`/unit/${unit.id}`)}
              >
                <span className="home-unit-number">Unit {unit.id}</span>
                <span className="home-unit-title">{unit.title}</span>
                <span className="home-unit-meta">{unlocked ? `${unit.lessons} lessons` : '🔒'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;