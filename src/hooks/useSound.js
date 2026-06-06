import { useCallback, useRef } from 'react';
import storageService from '../services/storageService';

/**
 * useSound()
 * 
 * Plays sound effects. Falls back silently if file is missing.
 * Sound files live in /public/sounds/
 * 
 * Phase 1: just effects (success, error, sparkle, levelup)
 * Phase 3: voice acting lines can be added here
 */

const SOUNDS = {
  success:  '/sounds/success.mp3',
  error:    '/sounds/error.mp3',
  sparkle:  '/sounds/sparkle.mp3',
  levelup:  '/sounds/levelup.mp3',
  click:    '/sounds/click.mp3',
  hint:     '/sounds/hint.mp3',
};

export function useSound() {
  const audioCache = useRef({});

  const play = useCallback((soundName) => {
    const settings = storageService.getSettings();
    if (settings.soundDisabled) return;

    const src = SOUNDS[soundName];
    if (!src) return;

    // Reuse cached Audio objects
    if (!audioCache.current[soundName]) {
      audioCache.current[soundName] = new Audio(src);
    }

    const audio = audioCache.current[soundName];
    audio.currentTime = 0;
    audio.play().catch(() => {
      // User hasn't interacted yet, or file missing — fail silently
    });
  }, []);

  return { play };
}
