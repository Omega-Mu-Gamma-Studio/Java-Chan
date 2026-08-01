/**
 * emphasisParser.js
 *
 * Parses the lesson-content emphasis tag syntax:
 *   [[term:...]]  [[warn:...]]  [[key:...]]  [[fun:...]]
 *
 * Kept separate from EmphasisText.jsx (mirrors blankValidator.js/ScaffoldEditor.jsx's
 * split) so the component file only exports the component — react-refresh's
 * only-export-components rule wants plain functions/constants out of component files.
 */

const TAG_PATTERN = /\[\[(term|warn|key|fun):((?:[^[\]]|\[(?!\[)|\](?!\]))+?)\]\]/g;

/** Parse one line of text into an array of string | {category, text} parts. */
export function parseEmphasis(line) {
  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset lastIndex since TAG_PATTERN is a shared global-flag regex.
  TAG_PATTERN.lastIndex = 0;

  while ((match = TAG_PATTERN.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push({ category: match[1], text: match[2] });
    lastIndex = TAG_PATTERN.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}
