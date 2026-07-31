import './PhaseIndicator.css';

const PHASES = [
  { id: 1, label: 'Learn It With Me',   icon: '▶' },
  { id: 2, label: 'See the Code',       icon: '✕' },
  { id: 3, label: 'Code It With Me',    icon: '✎' },
  { id: 4, label: 'Challenge',          icon: '❓' },
  { id: 5, label: 'Fun Facts & Trivia', icon: '✨' },
];

const PhaseIndicator = ({ currentPhase, onPhaseClick }) => (
  <div className="phase-indicator" role="tablist">
    {PHASES.map((phase) => {
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

    {/* Connector lines — generalized for any PHASES length */}
    <div className="phase-connectors">
      {Array.from({ length: PHASES.length - 1 }, (_, i) => (
        <div
          key={i}
          className={`phase-connector ${currentPhase > i + 1 ? 'phase-connector--done' : ''}`}
        />
      ))}
    </div>
  </div>
);

export default PhaseIndicator;
