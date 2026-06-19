import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import XPDisplay from './XPDisplay';
import ProgressBar from './ProgressBar';
import './BottomBar.css';

const BottomBar = () => {
  const navigate = useNavigate();
  const { xp, level, levelProgress, xpToNextLevel } = useProgress();

  return (
    <footer className="bottombar">
      <div className="bottombar-left">
        <XPDisplay xp={xp} level={level} />
      </div>

      <div className="bottombar-center">
        <ProgressBar
          value={levelProgress}
          label={`${xpToNextLevel} XP to level ${level + 1}`}
        />
      </div>

      <div className="bottombar-right">
        <button
          className="bottombar-shop-btn"
          onClick={() => navigate('/shop')}
          aria-label="Open shop"
        >
          🛍️
        </button>
        <span className="bottombar-level">
          Lv.<strong>{level}</strong>
        </span>
      </div>
    </footer>
  );
};

export default BottomBar;
