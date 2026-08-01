import { parseEmphasis } from '../../utils/emphasisParser';
import './EmphasisText.css';

/**
 * EmphasisText.jsx
 *
 * Parses a small inline-tag syntax inside lesson explanation/trivia text and
 * renders it as styled spans — the "Geronimo Stilton effect": specific words
 * get a distinct visual treatment (color, weight) so a skimming reader's eye
 * catches new vocabulary, warnings, key ideas, and fun-fact beats without
 * rereading the whole paragraph.
 *
 * Deliberately NOT dangerouslySetInnerHTML — lesson JSON is authored content,
 * but this keeps the renderer safe by construction rather than by care, and
 * composes as plain React children (spans), same as CodeBlock's approach
 * composes via tokenize() but without the HTML-string step.
 *
 * Tag vocabulary (four categories — deliberately not just one "highlight"),
 * parsing logic lives in utils/emphasisParser.js:
 *   [[term:...]]    New vocabulary — first time a concept name appears.
 *   [[warn:...]]    Gotchas / common mistakes / "this bites people."
 *   [[key:...]]     The one idea in this paragraph worth remembering.
 *   [[fun:...]]     Trivia / lighter aside, distinct from teaching voice.
 *
 * Example source text:
 *   "That rule has a name — [[term:WORA]], Write Once, Run Anywhere."
 *   "[[warn:Every statement needs a semicolon]] — the #1 beginner mistake."
 *
 * Plain newlines in the source are preserved as paragraph breaks, matching
 * the previous plain-text rendering (white-space: pre-wrap) behavior.
 */

const CATEGORY_CLASS = {
  term: 'emphasis-term',
  warn: 'emphasis-warn',
  key: 'emphasis-key',
  fun: 'emphasis-fun',
};

/**
 * Renders explanation/trivia text with emphasis tags parsed into styled
 * spans. Drop-in replacement for <p className="phase-explanation">{text}</p>.
 */
const EmphasisText = ({ text, className = '' }) => {
  if (!text) return null;

  // Preserve blank-line paragraph breaks, same as the old pre-wrap rendering.
  const paragraphs = text.split('\n\n');

  return (
    <div className={`emphasis-text ${className}`}>
      {paragraphs.map((para, pIdx) => (
        <p key={pIdx} className="phase-explanation">
          {para.split('\n').map((line, lIdx, arr) => (
            <span key={lIdx}>
              {parseEmphasis(line).map((part, partIdx) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <span key={partIdx} className={CATEGORY_CLASS[part.category]}>
                    {part.text}
                  </span>
                )
              )}
              {lIdx < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
};

export default EmphasisText;
