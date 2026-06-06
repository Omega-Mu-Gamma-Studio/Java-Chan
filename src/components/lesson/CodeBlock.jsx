import './CodeBlock.css';

/**
 * CodeBlock.jsx
 * 
 * Renders syntax-highlighted Java code.
 * Uses a pure CSS approach with <span> tokens.
 * 
 * For Phase 1, we do simple keyword-based tokenization.
 * The tokenizer lives in utils/javaHighlighter.js
 */

import { tokenize } from '../../utils/javaHighlighter';

const CodeBlock = ({ code = '', label = '', showLineNumbers = true }) => {
  if (!code || code.trim() === '' || code.startsWith('// No code')) {
    return null;
  }

  const lines = code.split('\n');

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
                dangerouslySetInnerHTML={{ __html: tokenize(line) }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
