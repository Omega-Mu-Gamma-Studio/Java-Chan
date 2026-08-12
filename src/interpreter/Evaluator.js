/**
 * Evaluator.js
 *
 * AST → output + side effects (tree-walking). See INTERPRETER.md §"3.
 * Evaluator" for scope handling via Environment, the break/continue/return
 * signal-propagation approach, and the timeout guard against infinite loops.
 *
 * STUB — not yet implemented. Milestone 1.
 */

import { InterpreterError, ErrorType } from './InterpreterError';

// Non-local control flow sentinels — see INTERPRETER.md
// §"Execution control (break/continue/return)".
export const BREAK_SIGNAL = { __signal: 'break' };
export const CONTINUE_SIGNAL = { __signal: 'continue' };

export class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}

export class Evaluator {
  /**
   * @param {object} [options]
   * @param {number} [options.timeout] - max operation count before timeout (default 100_000)
   */
  constructor(options = {}) {
    this.output = [];
    this.opCount = 0;
    this.opLimit = options.timeout || 100_000;
  }

  /** Call at the top of every loop iteration and statement evaluation. */
  tick() {
    this.opCount++;
    if (this.opCount > this.opLimit) {
      throw new InterpreterError(
        'Execution timed out — check for an infinite loop~ 😓',
        ErrorType.RUNTIME_ERROR
      );
    }
  }

  /**
   * Walk an AST node and evaluate it.
   * @param {object} node
   * @param {import('./Environment').Environment} env
   * @returns {any}
   */
  // eslint-disable-next-line no-unused-vars -- node/env used once dispatch is implemented
  evaluate(node, env) {
    // TODO: implement — see INTERPRETER.md §"3. Evaluator" for the node-type
    // dispatch, and StandardLibrary.js for System.out / Math / String routing.
    throw new Error('Evaluator.evaluate() is not implemented yet');
  }
}
