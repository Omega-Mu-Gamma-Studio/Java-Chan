import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLesson } from '../hooks/useLesson';
import { useProgress } from '../hooks/useProgress';
import LessonCanvas from '../components/lesson/LessonCanvas';
import './LessonPage.css';

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lesson, loading, error } = useLesson(lessonId);
  const { setLastVisited } = useProgress();

  useEffect(() => {
    if (lessonId) setLastVisited(lessonId);
  }, [lessonId]);

  const handleComplete = () => {
    // Navigate to next lesson or home
    const [unit, num] = lessonId.split('.').map(Number);
    const nextId = `${unit}.${num + 1}`;
    // Try next — LessonPage will show error if it doesn't exist
    navigate(`/lesson/${nextId}`);
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
