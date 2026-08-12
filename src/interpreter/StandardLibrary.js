/**
 * StandardLibrary.js
 *
 * System.out, Math, and String instance methods that appear in CS22301
 * lessons — not a real Java standard library, just the subset we need. See
 * INTERPRETER.md §"Standard Library (StandardLibrary.js)" for the exact
 * method list (Math.sqrt/abs/max/min/pow/floor/ceil/round, String.valueOf,
 * .length/.charAt/.substring/etc.) and the javaToString conversion rules.
 *
 * STUB — not yet implemented. Milestone 1.
 */

/**
 * Registry of standard-library callables, keyed by dotted name
 * ('System.out.println', 'Math.sqrt', '.length', ...). The evaluator
 * consults this when it sees a CallExpression on a known receiver.
 */
export const STD = {
  // TODO: implement — see INTERPRETER.md §"Standard Library" for the full
  // method list and signatures.
};

/**
 * Java's string conversion rules for System.out / concatenation:
 * null → "null", boolean → "true"/"false", int prints without a decimal,
 * double always shows one (5 vs 5.0).
 * @param {any} val
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars -- val used once the conversion rules are implemented
export function javaToString(val) {
  // TODO: implement — see INTERPRETER.md §"Standard Library" for the
  // int-vs-double formatting rule this needs to track through evaluation.
  throw new Error('javaToString() is not implemented yet');
}
