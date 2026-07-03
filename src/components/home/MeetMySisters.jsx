import './MeetMySisters.css';

/**
 * MeetMySisters
 * A "family photo" rail — one card per sibling *-chan site in the studio.
 * Home page only, always visible (no longer buried in a drawer). Each card
 * carries that language's own accent color + a badge (glyph) instead of an
 * imported image, so there's no external asset dependency and every card
 * renders crisp regardless of what the target site looks like today.
 */

const SISTERS = [
  {
    id: 'java',
    name: 'Java-chan',
    lang: 'Java',
    glyph: '☕',
    tagline: 'Write once, run everywhere (eventually).',
    url: 'https://java-chan.vercel.app',
    accent: '#e76f00',
    accentDark: '#8a4300',
    isSelf: true,
  },
  {
    id: 'cpp',
    name: 'C++-chan',
    lang: 'C++',
    glyph: '⚙️',
    tagline: 'Manages her own memory. Judges you for not.',
    url: 'https://plusplus-chan.vercel.app',
    accent: '#659ad2',
    accentDark: '#2a4a75',
  },
  {
    id: 'rust',
    name: 'Rust-chan',
    lang: 'Rust',
    glyph: '🦀',
    tagline: "Won't let you ship until it's actually safe.",
    url: 'https://rust-chan.vercel.app',
    accent: '#dea584',
    accentDark: '#7a4f30',
  },
  {
    id: 'go',
    name: 'Go-chan',
    lang: 'Go',
    glyph: '⬡',
    tagline: 'Simple, concurrent, gopher-approved.',
    url: 'https://go-chan.vercel.app',
    accent: '#00add8',
    accentDark: '#00566c',
  },
  {
    id: 'kotlin',
    name: 'Kotlin-chan',
    lang: 'Kotlin',
    glyph: '◆',
    tagline: "Java's cooler younger cousin.",
    url: 'https://kotlin-chan.vercel.app',
    accent: '#7f52ff',
    accentDark: '#3f2880',
  },
  {
    id: 'csharp',
    name: 'C#-chan',
    lang: 'C#',
    glyph: '♯',
    tagline: 'Elegant, structured, semicolon-loyal.',
    url: 'https://sharp-chan.vercel.app',
    accent: '#9b4f96',
    accentDark: '#4d284b',
  },
  {
    id: 'python',
    name: 'Python-chan',
    lang: 'Python',
    glyph: '🐍',
    tagline: 'Friendly, readable, a little bit magical.',
    url: 'https://python-chan.vercel.app',
    accent: '#4f9ed6',
    accentDark: '#c9a227',
  },
];

const MeetMySisters = () => {
  return (
    <aside className="sisters-rail" aria-label="Meet my sisters">
      <h2 className="sisters-title">
        <span className="sisters-title-bar" />
        Meet My Sisters
      </h2>
      <p className="sisters-subtitle">Same studio. Different language. No mercy.</p>

      <div className="sisters-list">
        {SISTERS.map((s) => (
          <a
            key={s.id}
            className={`sister-card ${s.isSelf ? 'sister-card--self' : ''}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              '--sister-accent': s.accent,
              '--sister-accent-dark': s.accentDark,
            }}
          >
            <span className="sister-card-badge">{s.glyph}</span>
            <span className="sister-card-body">
              <span className="sister-card-name">
                {s.name}
                {s.isSelf && <span className="sister-card-you">that's me</span>}
              </span>
              <span className="sister-card-tagline">{s.tagline}</span>
            </span>
            <span className="sister-card-arrow">↗</span>
          </a>
        ))}
      </div>
    </aside>
  );
};

export default MeetMySisters;
