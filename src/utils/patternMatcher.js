/**
 * patternMatcher.js
 * 
 * Validates student code against lesson patterns.
 * No Java execution — this is intentional for Phase 1.
 * 
 * Pattern shape (from lesson JSON):
 * {
 *   required: ["int", "=", ";"],           // all must be present
 *   forbidden: ["\"", "float"],             // none must be present
 *   fullRegex: "int\\s+\\w+\\s*=...",      // optional strict match
 *   mcqAnswer: "C",                         // for multiple choice lessons
 *   caseSensitive: false,                   // default: false
 * }
 * 
 * Returns:
 * {
 *   passed: boolean,
 *   score: 'perfect' | 'partial' | 'fail',
 *   message: string,
 *   missingKeywords: string[],
 *   forbiddenFound: string[],
 * }
 */

/**
 * Main validation function.
 * @param {string} studentCode
 * @param {object} pattern
 * @returns {object} result
 */
export function validateCode(studentCode, pattern) {
  if (!studentCode || studentCode.trim() === '') {
    return {
      passed: false,
      score: 'fail',
      message: "Write something first! I can't grade air~ 💨",
      missingKeywords: [],
      forbiddenFound: [],
    };
  }

  // Multiple choice shortcut
  if (pattern.mcqAnswer !== undefined) {
    return validateMCQ(studentCode, pattern.mcqAnswer);
  }

  const code = pattern.caseSensitive ? studentCode : studentCode.toLowerCase();
  const missingKeywords = [];
  const forbiddenFound = [];

  // --- Check required keywords ---
  if (pattern.required && pattern.required.length > 0) {
    for (const keyword of pattern.required) {
      const kw = pattern.caseSensitive ? keyword : keyword.toLowerCase();
      if (!code.includes(kw)) {
        missingKeywords.push(keyword);
      }
    }
  }

  // --- Check forbidden keywords ---
  if (pattern.forbidden && pattern.forbidden.length > 0) {
    for (const keyword of pattern.forbidden) {
      const kw = pattern.caseSensitive ? keyword : keyword.toLowerCase();
      if (code.includes(kw)) {
        forbiddenFound.push(keyword);
      }
    }
  }

  // --- Try fullRegex if provided ---
  let regexPassed = null;
  if (pattern.fullRegex) {
    try {
      const flags = pattern.caseSensitive ? '' : 'i';
      const regex = new RegExp(pattern.fullRegex, flags);
      regexPassed = regex.test(studentCode);
    } catch (e) {
      console.warn('[patternMatcher] Invalid regex in lesson data:', pattern.fullRegex);
      regexPassed = null;
    }
  }

  // --- Determine result ---
  const keywordsFailed = missingKeywords.length > 0;
  const forbiddenFailed = forbiddenFound.length > 0;

  if (forbiddenFailed) {
    return {
      passed: false,
      score: 'fail',
      message: buildForbiddenMessage(forbiddenFound),
      missingKeywords,
      forbiddenFound,
    };
  }

  if (keywordsFailed) {
    return {
      passed: false,
      score: 'fail',
      message: buildMissingMessage(missingKeywords),
      missingKeywords,
      forbiddenFound,
    };
  }

  // Keywords passed. Check fullRegex for 'perfect' vs 'partial'
  if (regexPassed === false) {
    return {
      passed: true, // Keywords are there — give credit
      score: 'partial',
      message: "The pieces are there but the structure isn't quite right. Try running it in your IDE to check! ✨",
      missingKeywords: [],
      forbiddenFound: [],
    };
  }

  return {
    passed: true,
    score: 'perfect',
    message: "Perfect~! ✨",
    missingKeywords: [],
    forbiddenFound: [],
  };
}

function validateMCQ(studentAnswer, correctAnswer) {
  const answer = studentAnswer.trim().toUpperCase();
  const correct = correctAnswer.trim().toUpperCase();

  if (answer === correct) {
    return {
      passed: true,
      score: 'perfect',
      message: "That's correct~! ✨",
      missingKeywords: [],
      forbiddenFound: [],
    };
  }

  return {
    passed: false,
    score: 'fail',
    message: `Hmm, that's not quite right. Think it through again! 🤔`,
    missingKeywords: [],
    forbiddenFound: [],
  };
}

function buildMissingMessage(missing) {
  if (missing.length === 1) {
    return `Looks like \`${missing[0]}\` is missing... check your code! 🔍`;
  }
  return `A few things seem to be missing: ${missing.map(k => `\`${k}\``).join(', ')} — take another look!`;
}

function buildForbiddenMessage(forbidden) {
  if (forbidden.length === 1) {
    return `Hmm, \`${forbidden[0]}\` doesn't belong here... 🤨`;
  }
  return `Found something that shouldn't be there: ${forbidden.map(k => `\`${k}\``).join(', ')}`;
}
