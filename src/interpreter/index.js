/**
 * index.js
 *
 * Public interpreter entry point. Ties together Lexer → Parser → Evaluator
 * and returns a { output, error } result object.
 *
 * See INTERPRETER.md §"index.js (public API)" for the expected shape.
 */

import { Lexer } from './Lexer.js';
import { Parser } from './Parser.js';
import { Evaluator } from './Evaluator.js';
import { InterpreterError } from './InterpreterError.js';

/**
 * Run Java source code through the interpreter.
 *
 * @param {string} sourceCode
 * @param {object} [options]
 * @param {number} [options.timeout]  - max operation count (default 100_000)
 * @param {string[]} [options.stdin]  - pre-seeded Scanner input lines
 * @returns {{ output: string, error: string | null }}
 */
export function run(sourceCode, options = {}) {
  try {
    const tokens  = new Lexer(sourceCode).tokenize();
    const ast     = new Parser(tokens).parse();
    const ev      = new Evaluator(options);
    const output  = ev.run(ast);
    return { output, error: null };
  } catch (err) {
    if (err instanceof InterpreterError) {
      const loc = err.line ? ` (line ${err.line})` : '';
      return { output: '', error: `${err.type}${loc}: ${err.message}` };
    }
    // Unexpected JS error — surface it cleanly rather than swallowing.
    return { output: '', error: `InternalError: ${err.message}` };
  }
}
