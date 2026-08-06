import './CodeBlock.css';

/**
 * CodeBlock.jsx
 *
 * Renders syntax-highlighted Java code.
 * Uses a pure CSS approach with <span> tokens.
 *
 * Hover tooltips: any word matching the shared keyword glossary (or a
 * lesson-specific override passed via `hoverNotes`) gets a CSS tooltip.
 *
 * Click-to-pin (§2.3 of split-screen update): when `enableClickToPin` is true,
 * clicking a `.hoverable-token` span pins it as a sticky note in the Journal.
 * Mobile-compatible successor to CSS-only hover tooltips.
 */

import { useRef } from 'react';
import { tokenize } from '../../utils/javaHighlighter';
import { KEYWORD_GLOSSARY } from '../../data/keywordGlossary';
import useJournalStore from '../../store/journalStore';

const CodeBlock = ({
  code = '',
  label = '',
  showLineNumbers = true,
  hoverNotes = {},
  lessonId = null,
  enableClickToPin = false,
}) => {
  if (!code || code.trim() === '' || code.startsWith('// No code')) {
    return null;
  }

  const lines = code.split('\n');
  const notes = { ...KEYWORD_GLOSSARY, ...hoverNotes };
  const { pinFromCode, hasTerm } = useJournalStore();

  const handleCodeClick = (e) => {
    if (!enableClickToPin) return;
    const span = e.target.closest('.hoverable-token');
    if (!span) return;

    const term = span.textContent;
    const definition = span.getAttribute('data-tooltip');
    if (!term || !definition) return;

    if (hasTerm(term)) {
      span.classList.add('token-already-pinned');
      setTimeout(() => span.classList.remove('token-already-pinned'), 900);
      return;
    }

    pinFromCode({ term, definition }, lessonId);
    span.classList.add('token-pinned-flash');
    setTimeout(() => span.classList.remove('token-pinned-flash'), 900);
  };

  return (
    <div className="code-block">
      {label && (
        <div className="code-block-label">
          {label}
          {enableClickToPin && (
            <span className="code-block-pin-hint">click a highlighted word to pin it →</span>
          )}
        </div>
      )}
      <pre className="code-block-pre" onClick={handleCodeClick}>
        <code>
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="code-line">
              {showLineNumbers && (
                <span className="code-line-number">{lineIdx + 1}</span>
              )}
              <span
                className="code-line-content"
                dangerouslySetInnerHTML={{ __html: tokenize(line, notes) }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
