import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLesson } from '../hooks/useLesson';
import { useProgress } from '../hooks/useProgress';
import { loadUnit } from '../services/lessonService';
import LessonCanvas from '../components/lesson/LessonCanvas';
import './LessonPage.css';

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lesson, loading, error } = useLesson(lessonId);
  const { setLastVisited, unlockUnit } = useProgress();

  useEffect(() => {
    if (lessonId) setLastVisited(lessonId);
  }, [lessonId]);

  const handleComplete = async () => {
    const [unit, num] = lessonId.split('.').map(Number);

    // Check if this is the last lesson of the current unit
    try {
      const unitData = await loadUnit(unit);
      const isLastLesson = unitData.lessons[unitData.lessons.length - 1] === lessonId;

      if (isLastLesson) {
        // Unlock the next unit and send the student home
        unlockUnit(unit + 1);
        navigate('/');
      } else {
        navigate(`/lesson/${unit}.${num + 1}`);
      }
    } catch {
      // Fallback: just try to go to the next lesson
      navigate(`/lesson/${unit}.${num + 1}`);
    }
  };

  if (loading) {
    return (
      <div className="lesson-page-state">
        <span className="loading-spinner" />
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-page-state">
        <p className="lesson-error">Lesson not found.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className="lesson-page-header">
        <button className="btn btn-ghost lesson-back-btn" onClick={() => navigate('/')}>
          ← Home
        </button>
        <div className="lesson-page-meta">
          <span className="lesson-id-badge">{lessonId}</span>
          <h1 className="lesson-title">{lesson?.title}</h1>
        </div>
      </div>

      <LessonCanvas onComplete={handleComplete} />
    </div>
  );
};

export default LessonPage;