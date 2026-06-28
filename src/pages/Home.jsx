import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import useLessonStore from '../store/lessonStore';
import './Home.css';

const UNITS = [
  { id: 1, title: 'OOP & Java Fundamentals', lessons: 15, emoji: '☕' },
  { id: 2, title: 'Inheritance & Interfaces',  lessons: 15, emoji: '🧬' },
  { id: 3, title: 'Exception Handling & I/O',  lessons: 15, emoji: '🛡️' },
  { id: 4, title: 'Collections & Threads',     lessons: 15, emoji: '🧵' },
  { id: 5, title: 'JavaFX & UI',               lessons: 15, emoji: '🖼️' },
];

const GREETINGS = [
  "Welcome back! Ready to write some Java? ✨",
  "Good to see you again! Let's pick up where we left off.",
  "Hey! Java-chan missed you. Shall we continue?",
  "You showed up. That's already half the battle. ☕",
];

const Home = () => {
  const navigate = useNavigate();
  const { lastVisited, xp, level, isUnitUnlocked, completedLessons } = useProgress();
  const { setExpression, setDialogue } = useLessonStore();

  const totalCompleted = completedLessons ? Object.keys(completedLessons).length : 0;
  const totalLessons = 75;

  useEffect(() => {
    setExpression('idle');
    const msg = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setDialogue(msg);
  }, []);

  return (
    <div className="home-page">

      {/* ── HERO ── */}
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
              className="home-cta-btn"
              onClick={() => navigate(`/lesson/${lastVisited}`)}
            >
              <span className="home-cta-icon">▶</span>
              Continue — Lesson {lastVisited}
            </button>
          ) : (
            <button
              className="home-cta-btn"
              onClick={() => navigate('/lesson/1.1')}
            >
              <span className="home-cta-icon">▶</span>
              Start Learning
            </button>
          )}
        </div>

        {xp > 0 && (
          <p className="home-progress-note">Level {level} · {xp} XP earned</p>
        )}
      </div>

      {/* ── STATS STRIP ── */}
      <div className="home-stats-strip">
        <div className="home-stat">
          <span className="home-stat-value">{level}</span>
          <span className="home-stat-label">Level</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat">
          <span className="home-stat-value">{xp.toLocaleString()}</span>
          <span className="home-stat-label">Total XP</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat">
          <span className="home-stat-value">{totalCompleted}<span className="home-stat-denom">/{totalLessons}</span></span>
          <span className="home-stat-label">Lessons</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat home-stat--shop" onClick={() => navigate('/shop')} role="button" tabIndex={0}>
          <span className="home-stat-value">🛍️</span>
          <span className="home-stat-label">Closet</span>
        </div>
      </div>

      {/* ── UNIT LIST ── */}
      <div className="home-units">
        <h2 className="home-section-title">
          <span className="home-section-bar" />
          Syllabus
        </h2>
        <div className="home-unit-list">
          {UNITS.map(unit => {
            const unlocked = isUnitUnlocked(unit.id);
            const unitDone = completedLessons
              ? Object.keys(completedLessons).filter(id => id.startsWith(`${unit.id}.`)).length
              : 0;
            const pct = Math.round((unitDone / unit.lessons) * 100);

            return (
              <div
                key={unit.id}
                className={`home-unit-card ${unlocked ? 'home-unit-card--active' : 'home-unit-card--locked'}`}
                onClick={() => unlocked && navigate(`/unit/${unit.id}`)}
                role={unlocked ? 'button' : undefined}
                tabIndex={unlocked ? 0 : undefined}
              >
                <span className="home-unit-emoji">{unit.emoji}</span>
                <div className="home-unit-body">
                  <div className="home-unit-top">
                    <span className="home-unit-number">Unit {unit.id}</span>
                    <span className="home-unit-title">{unit.title}</span>
                  </div>
                  {unlocked && (
                    <div className="home-unit-bar-track">
                      <div className="home-unit-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <span className="home-unit-meta">
                  {unlocked ? `${pct}%` : '🔒'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SISTER APP WHISPER ── */}
      <a
        className="home-sister-link"
        href="https://plusplus-chan.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="home-sister-icon">⬡</span>
        <span className="home-sister-text">
          Enjoying this? Meet <strong>PlusPlus-chan</strong> — Java-chan's C++ sister.
        </span>
        <span className="home-sister-arrow">↗</span>
      </a>

    </div>
  );
};

export default Home;