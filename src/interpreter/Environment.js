/**
 * Environment.js
 *
 * Scope chain for variable lookup. Per INTERPRETER.md §"Evaluator", a new
 * child Environment is created on entering a block (`{}`) and discarded on
 * leaving it — this gives correct block scoping with no manual cleanup.
 *
 * This is a small, self-contained piece with no dependency on Lexer/Parser,
 * so it's implemented in full here rather than stubbed — Evaluator.js needs
 * something real to hold onto from day one.
 */

import { InterpreterError, ErrorType } from './InterpreterError';

export class Environment {
  /** @param {Environment|null} [parent] - enclosing scope, or null for global */
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }

  /** Look up a variable, walking up the scope chain. */
  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    throw new InterpreterError(`Variable '${name}' is not defined`, ErrorType.RUNTIME_ERROR);
  }

  /** Assign to an already-declared variable, walking up the scope chain. */
  set(name, value) {
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new InterpreterError(`Variable '${name}' is not defined`, ErrorType.RUNTIME_ERROR);
  }

  /** Declare (or redeclare) a variable in the current scope only. */
  define(name, value) {
    this.vars.set(name, value);
  }
}
