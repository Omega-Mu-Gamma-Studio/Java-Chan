import './ProgressBar.css';

const ProgressBar = ({ value = 0, label = '' }) => (
  <div className="progress-bar-wrapper">
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    {label && <span className="progress-bar-label">{label}</span>}
  </div>
);

export default ProgressBar;
