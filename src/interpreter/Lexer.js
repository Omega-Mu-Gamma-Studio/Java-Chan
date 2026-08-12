/**
 * Lexer.js
 *
 * Tokenizer: source string → token array. See INTERPRETER.md §"1. Lexer" for
 * the full token type list and implementation notes (escape sequences,
 * int-vs-double detection, `++`/`--` matching order, keyword recognition).
 *
 * Task 1 — complete implementation.
 */

import { InterpreterError, ErrorType } from './InterpreterError.js';

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

/**
 * Maps identifier strings to their keyword TokenType.
 * `true` and `false` are also keywords but produce BOOLEAN literals directly.
 * `null` produces a NULL literal directly.
 */
const KEYWORDS = new Map([
  ['int',        TokenType.KEYWORD_INT],
  ['double',     TokenType.KEYWORD_DOUBLE],
  ['boolean',    TokenType.KEYWORD_BOOLEAN],
  ['char',       TokenType.KEYWORD_CHAR],
  ['String',     TokenType.KEYWORD_STRING],
  ['void',       TokenType.KEYWORD_VOID],
  ['return',     TokenType.KEYWORD_RETURN],
  ['if',         TokenType.KEYWORD_IF],
  ['else',       TokenType.KEYWORD_ELSE],
  ['for',        TokenType.KEYWORD_FOR],
  ['while',      TokenType.KEYWORD_WHILE],
  ['do',         TokenType.KEYWORD_DO],
  ['break',      TokenType.KEYWORD_BREAK],
  ['continue',   TokenType.KEYWORD_CONTINUE],
  ['new',        TokenType.KEYWORD_NEW],
  ['class',      TokenType.KEYWORD_CLASS],
  ['static',     TokenType.KEYWORD_STATIC],
  ['public',     TokenType.KEYWORD_PUBLIC],
  ['private',    TokenType.KEYWORD_PRIVATE],
  ['final',      TokenType.KEYWORD_FINAL],
  ['this',       TokenType.KEYWORD_THIS],
  ['super',      TokenType.KEYWORD_SUPER],
  ['extends',    TokenType.KEYWORD_EXTENDS],
  ['implements', TokenType.KEYWORD_IMPLEMENTS],
  ['interface',  TokenType.KEYWORD_INTERFACE],
  ['switch',     TokenType.KEYWORD_SWITCH],
  ['case',       TokenType.KEYWORD_CASE],
  ['default',    TokenType.KEYWORD_DEFAULT],
  ['null',       TokenType.KEYWORD_NULL],
  ['true',       TokenType.KEYWORD_TRUE],
  ['false',      TokenType.KEYWORD_FALSE],
]);

export class Lexer {
  /** @param {string} sourceCode */
  constructor(sourceCode) {
    this.source = sourceCode;
    this.pos = 0;
    this.line = 1;
    this.tokens = [];
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  /** Current character, or empty string at end. */
  current() { return this.source[this.pos] ?? ''; }

  /** Peek ahead by offset (default 1). */
  peek(offset = 1) { return this.source[this.pos + offset] ?? ''; }

  /** Advance and return the consumed character. */
  advance() {
    const ch = this.source[this.pos++];
    if (ch === '\n') this.line++;
    return ch;
  }

  /** Consume the current character only if it equals `expected`. */
  match(expected) {
    if (this.current() === expected) { this.advance(); return true; }
    return false;
  }

  /** Emit a token into this.tokens. */
  emit(type, value) {
    this.tokens.push({ type, value, line: this.line });
  }

  /** True while there are characters left to consume. */
  hasMore() { return this.pos < this.source.length; }

  // ─── comment / whitespace skipping ─────────────────────────────────────────

  skipWhitespaceAndComments() {
    while (this.hasMore()) {
      const ch = this.current();

      // Whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance();
        continue;
      }

      // Single-line comment //
      if (ch === '/' && this.peek() === '/') {
        while (this.hasMore() && this.current() !== '\n') this.advance();
        continue;
      }

      // Block comment /* ... */
      if (ch === '/' && this.peek() === '*') {
        this.advance(); this.advance(); // consume /*
        while (this.hasMore()) {
          if (this.current() === '*' && this.peek() === '/') {
            this.advance(); this.advance(); // consume */
            break;
          }
          this.advance();
        }
        continue;
      }

      break;
    }
  }

  // ─── string / char escape handling ─────────────────────────────────────────

  /**
   * Read one escape sequence after the leading backslash has been consumed.
   * Returns the decoded character.
   */
  readEscape() {
    const ch = this.advance();
    switch (ch) {
      case 'n':  return '\n';
      case 't':  return '\t';
      case 'r':  return '\r';
      case '\\': return '\\';
      case '"':  return '"';
      case "'":  return "'";
      case '0':  return '\0';
      default:
        throw new InterpreterError(
          `Invalid escape sequence '\\${ch}' on line ${this.line}`,
          ErrorType.LEX_ERROR,
          this.line
        );
    }
  }

  /** Consume a double-quoted string literal (opening " already consumed). */
  readString() {
    let str = '';
    while (this.hasMore() && this.current() !== '"') {
      if (this.current() === '\\') { this.advance(); str += this.readEscape(); }
      else if (this.current() === '\n') {
        throw new InterpreterError(
          `Unterminated string literal on line ${this.line}`,
          ErrorType.LEX_ERROR,
          this.line
        );
      } else {
        str += this.advance();
      }
    }
    if (!this.hasMore()) {
      throw new InterpreterError(
        `Unterminated string literal`,
        ErrorType.LEX_ERROR,
        this.line
      );
    }
    this.advance(); // closing "
    return str;
  }

  /** Consume a single-quoted char literal (opening ' already consumed). */
  readChar() {
    let ch;
    if (this.current() === '\\') {
      this.advance();
      ch = this.readEscape();
    } else {
      ch = this.advance();
    }
    if (this.current() !== "'") {
      throw new InterpreterError(
        `Char literal must contain exactly one character on line ${this.line}`,
        ErrorType.LEX_ERROR,
        this.line
      );
    }
    this.advance(); // closing '
    return ch;
  }

  // ─── number ────────────────────────────────────────────────────────────────

  /**
   * Consume an integer or double literal (first digit already consumed).
   * Returns { isDouble: boolean, value: number }.
   */
  readNumber(firstDigit) {
    let raw = firstDigit;
    while (this.hasMore() && /\d/.test(this.current())) raw += this.advance();
    let isDouble = false;
    if (this.current() === '.' && /\d/.test(this.peek())) {
      isDouble = true;
      raw += this.advance(); // consume '.'
      while (this.hasMore() && /\d/.test(this.current())) raw += this.advance();
    }
    // Optional exponent: 1e5, 2.5E-3
    if (this.current() === 'e' || this.current() === 'E') {
      isDouble = true;
      raw += this.advance();
      if (this.current() === '+' || this.current() === '-') raw += this.advance();
      while (this.hasMore() && /\d/.test(this.current())) raw += this.advance();
    }
    return { isDouble, value: isDouble ? parseFloat(raw) : parseInt(raw, 10) };
  }

  // ─── main tokenize loop ────────────────────────────────────────────────────

  /**
   * Tokenize the full source string.
   * @returns {{type: string, value: any, line: number}[]}
   */
  tokenize() {
    while (this.hasMore()) {
      this.skipWhitespaceAndComments();
      if (!this.hasMore()) break;

      const startLine = this.line;
      const ch = this.advance();

      // ── string literal ──────────────────────────────────────────────────
      if (ch === '"') {
        this.tokens.push({ type: TokenType.STRING, value: this.readString(), line: startLine });
        continue;
      }

      // ── char literal ────────────────────────────────────────────────────
      if (ch === "'") {
        this.tokens.push({ type: TokenType.CHAR, value: this.readChar(), line: startLine });
        continue;
      }

      // ── number literal ──────────────────────────────────────────────────
      if (/\d/.test(ch)) {
        const { isDouble, value } = this.readNumber(ch);
        this.tokens.push({
          type: TokenType.NUMBER,
          value,
          isDouble,   // extra field — Evaluator uses this for int vs double formatting
          line: startLine,
        });
        continue;
      }

      // ── identifier / keyword ─────────────────────────────────────────────
      if (/[a-zA-Z_$]/.test(ch)) {
        let ident = ch;
        while (this.hasMore() && /[a-zA-Z0-9_$]/.test(this.current())) ident += this.advance();

        const kwType = KEYWORDS.get(ident);
        if (kwType) {
          // Boolean and null literals get special literal token types
          if (kwType === TokenType.KEYWORD_TRUE)  { this.tokens.push({ type: TokenType.BOOLEAN, value: true,  line: startLine }); }
          else if (kwType === TokenType.KEYWORD_FALSE) { this.tokens.push({ type: TokenType.BOOLEAN, value: false, line: startLine }); }
          else if (kwType === TokenType.KEYWORD_NULL)  { this.tokens.push({ type: TokenType.NULL,    value: null,  line: startLine }); }
          else { this.tokens.push({ type: kwType, value: ident, line: startLine }); }
        } else {
          this.tokens.push({ type: TokenType.IDENTIFIER, value: ident, line: startLine });
        }
        continue;
      }

      // ── operators & delimiters ───────────────────────────────────────────
      switch (ch) {
        case '(': this.emit(TokenType.LEFT_PAREN,    ch); break;
        case ')': this.emit(TokenType.RIGHT_PAREN,   ch); break;
        case '{': this.emit(TokenType.LEFT_BRACE,    ch); break;
        case '}': this.emit(TokenType.RIGHT_BRACE,   ch); break;
        case '[': this.emit(TokenType.LEFT_BRACKET,  ch); break;
        case ']': this.emit(TokenType.RIGHT_BRACKET, ch); break;
        case ';': this.emit(TokenType.SEMICOLON,     ch); break;
        case ',': this.emit(TokenType.COMMA,         ch); break;
        case '.': this.emit(TokenType.DOT,           ch); break;

        case '+':
          if (this.match('+'))  this.emit(TokenType.PLUS_PLUS,   '++');
          else if (this.match('=')) this.emit(TokenType.PLUS_EQUALS, '+=');
          else this.emit(TokenType.PLUS, ch);
          break;

        case '-':
          if (this.match('-'))  this.emit(TokenType.MINUS_MINUS,  '--');
          else if (this.match('=')) this.emit(TokenType.MINUS_EQUALS, '-=');
          else this.emit(TokenType.MINUS, ch);
          break;

        case '*':
          if (this.match('=')) this.emit(TokenType.STAR_EQUALS,  '*=');
          else this.emit(TokenType.STAR, ch);
          break;

        case '/':
          // Comments are already handled in skipWhitespaceAndComments.
          // If we land here, it's a bare / or /=.
          if (this.match('=')) this.emit(TokenType.SLASH_EQUALS, '/=');
          else this.emit(TokenType.SLASH, ch);
          break;

        case '%': this.emit(TokenType.PERCENT, ch); break;

        case '=':
          if (this.match('=')) this.emit(TokenType.EQUALS_EQUALS, '==');
          else this.emit(TokenType.EQUALS, ch);
          break;

        case '!':
          if (this.match('=')) this.emit(TokenType.BANG_EQUALS, '!=');
          else this.emit(TokenType.BANG, ch);
          break;

        case '<':
          if (this.match('=')) this.emit(TokenType.LESS_EQUALS, '<=');
          else this.emit(TokenType.LESS, ch);
          break;

        case '>':
          if (this.match('=')) this.emit(TokenType.GREATER_EQUALS, '>=');
          else this.emit(TokenType.GREATER, ch);
          break;

        case '&':
          if (this.match('&')) this.emit(TokenType.AND_AND, '&&');
          else throw new InterpreterError(
            `Unexpected character '&' on line ${startLine} — did you mean '&&'?`,
            ErrorType.LEX_ERROR, startLine
          );
          break;

        case '|':
          if (this.match('|')) this.emit(TokenType.PIPE_PIPE, '||');
          else throw new InterpreterError(
            `Unexpected character '|' on line ${startLine} — did you mean '||'?`,
            ErrorType.LEX_ERROR, startLine
          );
          break;

        default:
          throw new InterpreterError(
            `Unexpected character '${ch}' on line ${startLine}`,
            ErrorType.LEX_ERROR,
            startLine
          );
      }
    }

    this.tokens.push({ type: TokenType.EOF, value: null, line: this.line });
    return this.tokens;
  }
}
