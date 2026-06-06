import './PhaseIndicator.css';

const PHASES = [
  { id: 1, label: 'See It Work',  icon: '▶' },
  { id: 2, label: 'See It Break', icon: '✕' },
  { id: 3, label: 'You Try',      icon: '✎' },
];

const PhaseIndicator = ({ currentPhase, onPhaseClick }) => (
  <div className="phase-indicator" role="tablist">
    {PHASES.map((phase, i) => {
      const state =
        phase.id < currentPhase ? 'done' :
        phase.id === currentPhase ? 'active' : 'locked';

      return (
        <button
          key={phase.id}
          className={`phase-tab phase-tab--${state}`}
          onClick={() => state !== 'locked' && onPhaseClick?.(phase.id)}
          disabled={state === 'locked'}
          role="tab"
          aria-selected={state === 'active'}
        >
          <span className="phase-tab-icon">{state === 'done' ? '✓' : phase.icon}</span>
          <span className="phase-tab-label">{phase.label}</span>
        </button>
      );
    })}

    {/* Connector lines */}
    <div className="phase-connectors">
      {[0, 1].map(i => (
        <div
          key={i}
          className={`phase-connector ${currentPhase > i + 1 ? 'phase-connector--done' : ''}`}
        />
      ))}
    </div>
  </div>
);

export default PhaseIndicator;
