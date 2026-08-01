import './CodeBlock.css';

/**
 * CodeBlock.jsx
 * 
 * Renders syntax-highlighted Java code.
 * Uses a pure CSS approach with <span> tokens.
 * 
 * For Phase 1, we do simple keyword-based tokenization.
 * The tokenizer lives in utils/javaHighlighter.js
 *
 * Hover tooltips: any word matching the shared keyword glossary (or a
 * lesson-specific override passed via `hoverNotes`) gets a CSS tooltip —
 * see javaHighlighter.js's `notes` param and CodeBlock.css's
 * `.hoverable-token` rules.
 */

import { tokenize } from '../../utils/javaHighlighter';
import { KEYWORD_GLOSSARY } from '../../data/keywordGlossary';

const CodeBlock = ({ code = '', label = '', showLineNumbers = true, hoverNotes = {} }) => {
  if (!code || code.trim() === '' || code.startsWith('// No code')) {
    return null;
  }

  const lines = code.split('\n');
  // Lesson-specific notes win over the shared glossary for the same token —
  // lets a lesson override or add hover text for a method unique to its example.
  const notes = { ...KEYWORD_GLOSSARY, ...hoverNotes };

  return (
    <div className="code-block">
      {label && <div className="code-block-label">{label}</div>}
      <pre className="code-block-pre">
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
