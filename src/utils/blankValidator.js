/**
 * blankValidator.js
 *
 * Validates Phase 3 fill-in-the-blank answers.
 * Per java-chan-next-update.md §4.2: regex/pattern matching is gone from Phase 3.
 * Each blank has a small, known set of correct fills — checked with plain
 * equality against an accepted-answers list, not a pattern.
 *
 * Blank shape (from lesson JSON):
 * {
 *   id: "b1",
 *   answer: ["i++", "i += 1"],  // always an array, even for single-answer blanks
 *   caseSensitive: true,         // defaults true — Java itself is case-sensitive
 * }
 *
 * scaffoldCode shape: a code string with {{blankId}} markers, e.g.
 *   "for (int i = 0; {{b1}}; i++) {"
 */

/** Trim + strip all internal whitespace so `i < arr.length` === `i<arr.length`. */
export function normalizeAnswer(str) {
  return (str ?? '').trim().replace(/\s+/g, '');
}

/** Check one blank's student answer against its accepted-answers list. */
export function checkBlank(userAnswer, blankSpec) {
  const { answer, caseSensitive = true } = blankSpec;
  const accepted = Array.isArray(answer) ? answer : [answer];
  const normalizedUser = normalizeAnswer(userAnswer);
  const cmpUser = caseSensitive ? normalizedUser : normalizedUser.toLowerCase();

  return accepted.some((a) => {
    const normalizedAccepted = normalizeAnswer(a);
    return caseSensitive
      ? normalizedAccepted === cmpUser
      : normalizedAccepted.toLowerCase() === cmpUser;
  });
}

/**
 * Check every blank in a lesson's phase3.
 * @param {Object} userAnswers - { blankId: userInput, ... }
 * @param {Array} blanks - phase3.blanks
 * @returns {{ allCorrect: boolean, results: Object<string, boolean> }}
 */
export function checkAllBlanks(userAnswers, blanks) {
  const results = {};
  let allCorrect = true;

  for (const blank of blanks) {
    const passed = checkBlank(userAnswers[blank.id] || '', blank);
    results[blank.id] = passed;
    if (!passed) allCorrect = false;
  }

  return { allCorrect, results };
}

/**
 * Split scaffoldCode on {{blankId}} markers into an ordered list of
 * { type: 'text', value } / { type: 'blank', value: blankId } parts.
 * Consumed by ScaffoldEditor to render inline inputs mid-code.
 */
export function parseScaffold(scaffoldCode) {
  const parts = [];
  const regex = /\{\{(\w+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(scaffoldCode)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: scaffoldCode.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'blank', value: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < scaffoldCode.length) {
    parts.push({ type: 'text', value: scaffoldCode.slice(lastIndex) });
  }

  return parts;
}
