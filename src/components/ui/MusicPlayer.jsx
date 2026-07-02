import { useBgMusic } from '../../hooks/useBgMusic';
import './MusicPlayer.css';

/**
 * MusicPlayer.jsx
 *
 * Small pill in the topbar: mute toggle + volume slider for the
 * looping background track (see useBgMusic.js). If the browser
 * blocked autoplay, the icon prompts the user to tap to start it.
 */
const MusicPlayer = () => {
  const { volume, muted, setVolume, toggleMute, blocked } = useBgMusic();
  const isSilent = muted || volume === 0;

  return (
    <div className="music-player" title={blocked ? 'Tap to start music' : 'Background music'}>
      <button
        className="music-player-toggle"
        onClick={toggleMute}
        aria-label={isSilent ? 'Unmute background music' : 'Mute background music'}
      >
        {isSilent ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        className="music-player-slider"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        aria-label="Music volume"
      />
    </div>
  );
};

export default MusicPlayer;
