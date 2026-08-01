import { parseScaffold } from '../../utils/blankValidator';
import './ScaffoldEditor.css';

/**
 * ScaffoldEditor.jsx
 *
 * Renders Phase 3's scaffoldCode (mostly-given code with {{blankId}} markers)
 * as monospace code with inline <input> fields dropped in place of each blank.
 * Kept separate from CodeBlock.jsx — CodeBlock renders static highlighted code
 * via dangerouslySetInnerHTML, which doesn't compose with live inline inputs.
 */
const ScaffoldEditor = ({
  scaffoldCode = '',
  blanks = [],
  userBlanks = {},
  onBlankChange,
  wrongBlankIds = [],
  revealSolution = false,
}) => {
  const blankMap = Object.fromEntries(blanks.map((b) => [b.id, b]));
  const parts = parseScaffold(scaffoldCode);

  // Group parts into lines (scaffoldCode uses \n inside text parts) so each
  // line renders as its own row, matching CodeBlock's line-by-line look.
  const lines = [[]];
  for (const part of parts) {
    if (part.type === 'text') {
      const segments = part.value.split('\n');
      segments.forEach((seg, i) => {
        if (i > 0) lines.push([]);
        if (seg) lines[lines.length - 1].push({ type: 'text', value: seg });
      });
    } else {
      lines[lines.length - 1].push(part);
    }
  }

  const solutionValue = (blankId) => {
    const spec = blankMap[blankId];
    if (!spec) return '';
    return Array.isArray(spec.answer) ? spec.answer[0] : spec.answer;
  };

  return (
    <div className="scaffold-editor">
      <pre className="scaffold-pre">
        <code>
          {lines.map((lineParts, i) => (
            <div key={i} className="scaffold-line">
              {lineParts.map((part, j) =>
                part.type === 'text' ? (
                  <span key={j}>{part.value}</span>
                ) : (
                  <input
                    key={j}
                    className={`scaffold-blank${
                      wrongBlankIds.includes(part.value) ? ' scaffold-blank--wrong' : ''
                    }`}
                    value={revealSolution ? solutionValue(part.value) : (userBlanks[part.value] || '')}
                    onChange={(e) => onBlankChange?.(part.value, e.target.value)}
                    disabled={revealSolution}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    size={Math.max(4, (userBlanks[part.value] || '').length || 4)}
                  />
                )
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default ScaffoldEditor;
