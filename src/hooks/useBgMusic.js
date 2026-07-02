import { useCallback, useEffect, useRef, useState } from 'react';
import storageService from '../services/storageService';

/**
 * useBgMusic()
 *
 * Loops a background music track for the whole app.
 * Drop your track at /public/audio/bgm-main.mp3 (any filename works,
 * just update BGM_SRC below).
 *
 * - Volume + mute are persisted to the same 'javachan-settings' bucket
 *   useSound() already uses, under bgmVolume / bgmMuted.
 * - Browsers block autoplay-with-sound until the user interacts with
 *   the page, so this tries to play immediately, and if that's
 *   blocked, retries on the first click/keydown anywhere on the page.
 * - Uses a module-level singleton Audio element so the track keeps
 *   playing (and doesn't restart) across re-renders / route changes,
 *   since AppLayout stays mounted for the life of the app.
 */

const BGM_SRC = '/audio/bgm-main.mpeg';
const DEFAULT_VOLUME = 0.4;

let sharedAudio = null;
function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio(BGM_SRC);
    sharedAudio.loop = true;
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

export function useBgMusic() {
  const audioRef = useRef(getAudio());
  const initial = storageService.getSettings();

  const [volume, setVolumeState] = useState(initial.bgmVolume ?? DEFAULT_VOLUME);
  const [muted, setMutedState] = useState(initial.bgmMuted ?? false);
  const [blocked, setBlocked] = useState(false); // true if autoplay was refused

  // Keep the <audio> element's actual volume in sync with state
  useEffect(() => {
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Try to start playback on mount; fall back to first user gesture
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = muted ? 0 : volume;

    const tryPlay = () => audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    tryPlay();

    const unlock = () => tryPlay();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (patch) => {
    storageService.saveSettings({ ...storageService.getSettings(), ...patch });
  };

  const setVolume = useCallback((v) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    setMutedState((prevMuted) => {
      const nextMuted = clamped === 0 ? prevMuted : false;
      persist({ bgmVolume: clamped, bgmMuted: nextMuted });
      return nextMuted;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      persist({ bgmMuted: next });
      return next;
    });
  }, []);

  return { volume, muted, setVolume, toggleMute, blocked };
}

export default useBgMusic;
