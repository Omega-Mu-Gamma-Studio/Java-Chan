import { useEffect, useState } from 'react';
import { loadLesson } from '../services/lessonService';
import useLessonStore from '../store/lessonStore';

/**
 * useLesson(lessonId)
 * 
 * Loads a lesson by ID and syncs it into lessonStore.
 * Components use this hook instead of calling the service directly.
 * 
 * Returns: { lesson, loading, error }
 */
export function useLesson(lessonId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentLesson, loadLesson: storeLoad, clearLesson } = useLessonStore();

  useEffect(() => {
    if (!lessonId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadLesson(lessonId)
      .then((data) => {
        if (!cancelled) {
          storeLoad(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      clearLesson();
    };
  }, [lessonId]);

  return { lesson: currentLesson, loading, error };
}
