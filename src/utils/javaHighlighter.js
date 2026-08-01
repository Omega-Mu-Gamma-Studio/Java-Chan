/**
 * javaHighlighter.js
 * 
 * Zero-dependency Java tokenizer.
 * Returns an HTML string with <span class="token-*"> wrappers.
 * Used by CodeBlock.jsx.
 * 
 * Token classes:
 *   token-keyword    → blue  (public, class, int, etc.)
 *   token-type       → teal  (String, int, boolean, etc.)
 *   token-string     → green (quoted strings)
 *   token-comment    → gray  (// and block comments)
 *   token-number     → orange
 *   token-method     → pink  (identifier followed by '(')
 *   token-annotation → purple (@Override etc.)
 *   token-class-name → yellow (after 'class' keyword)
 *
 * Hover tooltips: any word-token with a matching entry in the `notes`
 * lookup (global keyword glossary + lesson-specific overrides, merged by
 * CodeBlock.jsx) gets wrapped in a `.hoverable-token` span carrying a
 * `data-tooltip` attribute — CSS-only tooltip, no JS state needed. Tokens
 * with neither a color class nor a note stay as plain text (no span) to
 * avoid bloating the DOM with empty wrappers.
 */

const KEYWORDS = new Set([
  'abstract','assert','break','case','catch','class','const','continue',
  'default','do','else','enum','extends','final','finally','for',
  'goto','if','implements','import','instanceof','interface','native',
  'new','package','private','protected','public','return','static',
  'strictfp','super','switch','synchronized','this','throw','throws',
  'transient','try','volatile','while','void',
]);

const TYPES = new Set([
  'int','long','short','byte','char','float','double','boolean',
  'String','Integer','Long','Short','Byte','Character','Float','Double',
  'Boolean','Object','Array','List','ArrayList','HashMap','Map',
  'Set','HashSet','LinkedList','Queue','Stack','System',
]);

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Build the HTML for one word token, adding a hover tooltip span if `note` is given. */
function buildToken(word, cls, note) {
  const escapedWord = escapeHtml(word);
  const classes = [cls, note ? 'hoverable-token' : null].filter(Boolean).join(' ');

  if (!classes) return escapedWord;

  const tooltipAttr = note
    ? ` data-tooltip="${escapeHtml(note)}" tabindex="0" role="button" aria-label="${escapeHtml(note)}"`
    : '';
  return `<span class="${classes}"${tooltipAttr}>${escapedWord}</span>`;
}

export function tokenize(line, notes = {}) {
  // Handle full-line comments
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//')) {
    return `<span class="token-comment">${escapeHtml(line)}</span>`;
  }

  let result = '';
  let i = 0;
  const len = line.length;

  while (i < len) {
    // Single-line comment mid-line
    if (line[i] === '/' && line[i + 1] === '/') {
      result += `<span class="token-comment">${escapeHtml(line.slice(i))}</span>`;
      break;
    }

    // String literal
    if (line[i] === '"') {
      let end = i + 1;
      while (end < len && !(line[end] === '"' && line[end - 1] !== '\\')) end++;
      end++;
      result += `<span class="token-string">${escapeHtml(line.slice(i, end))}</span>`;
      i = end;
      continue;
    }

    // Char literal
    if (line[i] === "'") {
      let end = i + 1;
      while (end < len && !(line[end] === "'" && line[end - 1] !== '\\')) end++;
      end++;
      result += `<span class="token-string">${escapeHtml(line.slice(i, end))}</span>`;
      i = end;
      continue;
    }

    // Annotation
    if (line[i] === '@') {
      let end = i + 1;
      while (end < len && /\w/.test(line[end])) end++;
      result += `<span class="token-annotation">${escapeHtml(line.slice(i, end))}</span>`;
      i = end;
      continue;
    }

    // Number
    if (/[0-9]/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let end = i;
      while (end < len && /[0-9._xXbBfFlL]/.test(line[end])) end++;
      result += `<span class="token-number">${escapeHtml(line.slice(i, end))}</span>`;
      i = end;
      continue;
    }

    // Word (keyword / type / method / identifier)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let end = i;
      while (end < len && /\w/.test(line[end])) end++;
      const word = line.slice(i, end);

      // Peek ahead for '(' to detect method call
      let j = end;
      while (j < len && line[j] === ' ') j++;
      const isMethod = line[j] === '(';

      let cls = '';
      if (KEYWORDS.has(word))     cls = 'token-keyword';
      else if (TYPES.has(word))   cls = 'token-type';
      else if (isMethod)          cls = 'token-method';
      else if (/^[A-Z]/.test(word)) cls = 'token-class-name';

      result += buildToken(word, cls, notes[word]);

      i = end;
      continue;
    }

    // Everything else
    result += escapeHtml(line[i]);
    i++;
  }

  return result;
}
