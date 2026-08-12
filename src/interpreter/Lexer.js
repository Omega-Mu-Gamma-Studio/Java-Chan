/**
 * Lexer.js
 *
 * Tokenizer: source string → token array. See INTERPRETER.md §"1. Lexer" for
 * the full token type list and implementation notes (escape sequences,
 * int-vs-double detection, `++`/`--` matching order, keyword recognition).
 *
 * STUB — not yet implemented. Milestone 1.
 */

/** Token shape produced by tokenize(): { type: TokenType, value: any, line: number } */
export const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
  CHAR: 'CHAR',

  // Identifiers & keywords
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD_INT: 'KEYWORD_INT',
  KEYWORD_DOUBLE: 'KEYWORD_DOUBLE',
  KEYWORD_BOOLEAN: 'KEYWORD_BOOLEAN',
  KEYWORD_CHAR: 'KEYWORD_CHAR',
  KEYWORD_STRING: 'KEYWORD_STRING',
  KEYWORD_VOID: 'KEYWORD_VOID',
  KEYWORD_RETURN: 'KEYWORD_RETURN',
  KEYWORD_IF: 'KEYWORD_IF',
  KEYWORD_ELSE: 'KEYWORD_ELSE',
  KEYWORD_FOR: 'KEYWORD_FOR',
  KEYWORD_WHILE: 'KEYWORD_WHILE',
  KEYWORD_DO: 'KEYWORD_DO',
  KEYWORD_BREAK: 'KEYWORD_BREAK',
  KEYWORD_CONTINUE: 'KEYWORD_CONTINUE',
  KEYWORD_NEW: 'KEYWORD_NEW',
  KEYWORD_CLASS: 'KEYWORD_CLASS',
  KEYWORD_STATIC: 'KEYWORD_STATIC',
  KEYWORD_PUBLIC: 'KEYWORD_PUBLIC',
  KEYWORD_PRIVATE: 'KEYWORD_PRIVATE',
  KEYWORD_FINAL: 'KEYWORD_FINAL',
  KEYWORD_THIS: 'KEYWORD_THIS',
  KEYWORD_SUPER: 'KEYWORD_SUPER',
  KEYWORD_EXTENDS: 'KEYWORD_EXTENDS',
  KEYWORD_IMPLEMENTS: 'KEYWORD_IMPLEMENTS',
  KEYWORD_INTERFACE: 'KEYWORD_INTERFACE',
  KEYWORD_SWITCH: 'KEYWORD_SWITCH',
  KEYWORD_CASE: 'KEYWORD_CASE',
  KEYWORD_DEFAULT: 'KEYWORD_DEFAULT',
  KEYWORD_NULL: 'KEYWORD_NULL',
  KEYWORD_TRUE: 'KEYWORD_TRUE',
  KEYWORD_FALSE: 'KEYWORD_FALSE',

  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  EQUALS: 'EQUALS',
  EQUALS_EQUALS: 'EQUALS_EQUALS',
  BANG_EQUALS: 'BANG_EQUALS',
  BANG: 'BANG',
  LESS: 'LESS',
  LESS_EQUALS: 'LESS_EQUALS',
  GREATER: 'GREATER',
  GREATER_EQUALS: 'GREATER_EQUALS',
  AND_AND: 'AND_AND',
  PIPE_PIPE: 'PIPE_PIPE',
  PLUS_EQUALS: 'PLUS_EQUALS',
  MINUS_EQUALS: 'MINUS_EQUALS',
  STAR_EQUALS: 'STAR_EQUALS',
  SLASH_EQUALS: 'SLASH_EQUALS',
  PLUS_PLUS: 'PLUS_PLUS',
  MINUS_MINUS: 'MINUS_MINUS',

  // Delimiters
  LEFT_PAREN: 'LEFT_PAREN',
  RIGHT_PAREN: 'RIGHT_PAREN',
  LEFT_BRACE: 'LEFT_BRACE',
  RIGHT_BRACE: 'RIGHT_BRACE',
  LEFT_BRACKET: 'LEFT_BRACKET',
  RIGHT_BRACKET: 'RIGHT_BRACKET',
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  DOT: 'DOT',

  // Meta
  EOF: 'EOF',
};

export class Lexer {
  /** @param {string} sourceCode */
  constructor(sourceCode) {
    this.source = sourceCode;
    this.line = 1;
  }

  /**
   * Tokenize the full source string.
   * @returns {{type: string, value: any, line: number}[]}
   */
  tokenize() {
    // TODO: implement — see INTERPRETER.md §"1. Lexer" for token rules,
    // whitespace/comment skipping, and string/char escape handling.
    throw new Error('Lexer.tokenize() is not implemented yet');
  }
}
