/**
 * src/interpreter/index.js
 *
 * The ONLY file the rest of the app imports from the interpreter. See
 * INTERPRETER.md §"src/interpreter/index.js — the public API". Everything
 * else in this directory (Lexer, Parser, Evaluator, ...) is internal.
 *
 * STUB — not yet implemented. Milestone 1. Currently always returns a
 * not-implemented ExecutionResult so callers can integrate against the
 * real shape before the interpreter itself exists.
 */

// NOTE: run() will import Lexer, Parser, Evaluator, and InterpreterError
// once the pipeline below is implemented — left out for now so this file
// doesn't carry unused imports.

/**
 * @typedef {object} ExecutionResult
 * @property {string} stdout - everything printed via System.out
 * @property {string} stderr - compiler/runtime error message, if any
 * @property {boolean} success - true if execution completed without error
 * @property {string|null} errorType - 'LexError' | 'ParseError' | 'RuntimeError' | null
 * @property {number|null} errorLine - line number of the error, if known
 */

/**
 * Run a Java source string against the subset interpreter.
 *
 * @param {string} sourceCode - the Java source string to execute
 * @param {object} [options]
 * @param {string[]} [options.stdin] - pre-seeded input lines for Scanner
 * @param {number} [options.timeout] - max execution time in ms (default: 3000)
 * @returns {ExecutionResult}
 */
// eslint-disable-next-line no-unused-vars -- sourceCode/options used once the pipeline below is implemented
export function run(sourceCode, options = {}) {
  // TODO: implement — see INTERPRETER.md for the full Lexer → Parser →
  // Evaluator pipeline this should wire together. Placeholder below keeps
  // the return shape correct so SandboxEditor can integrate against it now.
  return {
    stdout: '',
    stderr: 'Interpreter not yet implemented.',
    success: false,
    errorType: null,
    errorLine: null,
  };
}
