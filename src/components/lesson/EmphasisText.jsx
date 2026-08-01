import { motion } from 'framer-motion';
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

// Each category gets its own little "personality" of motion, same spirit as
// the four distinct visual treatments in the CSS — not just one bounce reused
// four times. Rotation stays small so text never becomes hard to read.
const CATEGORY_MOTION = {
  term: {
    initial: { opacity: 0, scale: 0.9, rotate: -1 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    hover: { scale: 1.06, rotate: -1 },
  },
  warn: {
    initial: { opacity: 0, scale: 0.85, rotate: 0 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: [0, -3, 3, 0] },
  },
  key: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.1 },
  },
  fun: {
    initial: { opacity: 0, scale: 0.9, rotate: -8 },
    animate: { opacity: 1, scale: 1, rotate: -4 },
    hover: { scale: 1.08, rotate: -8 },
  },
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
              {parseEmphasis(line).map((part, partIdx) => {
                if (typeof part === 'string') return part;
                const motionProps = CATEGORY_MOTION[part.category];
                return (
                  <motion.span
                    key={partIdx}
                    className={CATEGORY_CLASS[part.category]}
                    initial={motionProps.initial}
                    animate={motionProps.animate}
                    whileHover={motionProps.hover}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {part.text}
                  </motion.span>
                );
              })}
              {lIdx < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
};

export default EmphasisText;
