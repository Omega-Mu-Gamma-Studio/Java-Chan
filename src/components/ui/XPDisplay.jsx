import './XPDisplay.css';

const XPDisplay = ({ xp, level }) => (
  <div className="xp-display">
    <span className="xp-icon">✦</span>
    <span className="xp-value">{xp}</span>
    <span className="xp-label">XP</span>
  </div>
);

export default XPDisplay;
