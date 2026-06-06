/**
 * xpCalculator.js
 * 
 * All XP math lives here. Keep this pure (no side effects).
 */

// XP thresholds per level
// Level N requires XP_THRESHOLDS[N-1] total XP
const XP_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  200,  // Level 3
  300,  // Level 4
  400,  // Level 5
  500,  // Level 6
  600,  // Level 7
  700,  // Level 8
  800,  // Level 9
  900,  // Level 10
];

const MAX_LEVEL = XP_THRESHOLDS.length;

/**
 * Given total XP, return the current level.
 */
export function calculateLevel(totalXP) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * XP threshold needed to reach the given level.
 * Used for progress bar math.
 */
export function xpForNextLevel(level) {
  if (level >= MAX_LEVEL) return XP_THRESHOLDS[MAX_LEVEL - 1];
  return XP_THRESHOLDS[level] ?? XP_THRESHOLDS[MAX_LEVEL - 1];
}

/**
 * Calculate XP earned for completing a lesson.
 * @param {object} params
 * @param {number} params.baseXP      - from lesson JSON (default 10)
 * @param {number} params.attempts    - how many tries it took
 * @param {boolean} params.usedHint   - did the student use a hint?
 * @param {boolean} params.usedSolution - did they view the solution?
 */
export function calculateEarnedXP({ baseXP = 10, attempts = 1, usedHint = false, usedSolution = false }) {
  if (usedSolution) return Math.floor(baseXP * 0.5); // Half XP for seeing solution

  let bonus = 0;
  if (attempts === 1) bonus += 5;   // First try bonus
  if (!usedHint) bonus += 5;         // No hints bonus

  return baseXP + bonus;
}

export { MAX_LEVEL, XP_THRESHOLDS };
