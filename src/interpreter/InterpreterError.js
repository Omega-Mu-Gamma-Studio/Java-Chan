/**
 * InterpreterError.js
 *
 * Structured error type shared by every interpreter module. Per INTERPRETER.md
 * §"Error Message Design", every error has a `type` (LexError | ParseError |
 * RuntimeError), a `message`, and optionally a `line`. SandboxEditor renders
 * these with Java-Chan's voice — new contributors should add display-string
 * mappings there, not scatter strings through the evaluator.
 *
 * This file is intentionally the one piece of the interpreter that's fully
 * implemented from the start — everything else (Lexer, Parser, Evaluator)
 * throws these, so the shape needs to exist before any of that lands.
 */

export const ErrorType = {
  LEX_ERROR: 'LexError',
  PARSE_ERROR: 'ParseError',
  RUNTIME_ERROR: 'RuntimeError',
};

export class InterpreterError extends Error {
  /**
   * @param {string} message
   * @param {string} [type] - one of ErrorType; defaults to RuntimeError
   * @param {number|null} [line] - 1-indexed source line, if known
   */
  constructor(message, type = ErrorType.RUNTIME_ERROR, line = null) {
    super(message);
    this.name = 'InterpreterError';
    this.type = type;
    this.line = line;
  }
}
