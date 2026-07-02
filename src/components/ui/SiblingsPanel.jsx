import SIBLING_SITES from '../../data/siblings';
import './SiblingsPanel.css';

/**
 * SiblingsPanel.jsx
 *
 * Right-side drawer — mirror of Sidebar.jsx but slides in from the
 * right edge. Lists the other -chan sites as external links.
 */
const SiblingsPanel = ({ isOpen, onClose }) => {
  return (
    <aside className={`siblings-panel ${isOpen ? 'siblings-panel--open' : ''}`}>
      <div className="siblings-header">
        <span className="siblings-title">Meet My Sisters</span>
        <button className="siblings-close" onClick={onClose} aria-label="Close sisters panel">✕</button>
      </div>

      <p className="siblings-subtitle">Same energy, different languages.</p>

      <ul className="siblings-list">
        {SIBLING_SITES.map((site) => (
          <li key={site.id}>
            {site.current ? (
              <div className="siblings-card siblings-card--current" style={{ '--accent': site.accent }}>
                <div className="siblings-card-text">
                  <span className="siblings-card-name">{site.name}</span>
                  <span className="siblings-card-tagline">{site.tagline}</span>
                </div>
                <span className="siblings-card-badge">You're here</span>
              </div>
            ) : (
              <a
                className="siblings-card"
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--accent': site.accent }}
              >
                <div className="siblings-card-text">
                  <span className="siblings-card-name">{site.name}</span>
                  <span className="siblings-card-tagline">{site.tagline}</span>
                </div>
                <span className="siblings-card-arrow">↗</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SiblingsPanel;
