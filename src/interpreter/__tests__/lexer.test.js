/**
 * lexer.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": one test per token type, one test
 * per escape sequence, plus malformed-input cases.
 *
 * Task 1 — complete implementation.
 */

import { describe, it, expect } from 'vitest';
import { Lexer, TokenType } from '../Lexer.js';
import { InterpreterError } from '../InterpreterError.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Tokenize src and strip the trailing EOF token for conciseness. */
function lex(src) {
  return new Lexer(src).tokenize().slice(0, -1);
}

/** Tokenize src and return ALL tokens including EOF. */
function lexFull(src) {
  return new Lexer(src).tokenize();
}

/** Assert that lexing src throws an InterpreterError of type LexError. */
function expectLexError(src) {
  expect(() => new Lexer(src).tokenize()).toThrow(InterpreterError);
}

// ─── literals ───────────────────────────────────────────────────────────────

describe('Lexer — number literals', () => {
  it('tokenizes integer literals', () => {
    const [tok] = lex('42');
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(42);
    expect(tok.isDouble).toBe(false);
  });

  it('tokenizes double literals (decimal point)', () => {
    const [tok] = lex('3.14');
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBeCloseTo(3.14);
    expect(tok.isDouble).toBe(true);
  });

  it('tokenizes zero', () => {
    const [tok] = lex('0');
    expect(tok.value).toBe(0);
    expect(tok.isDouble).toBe(false);
  });

  it('tokenizes exponent notation as double', () => {
    const [tok] = lex('1e5');
    expect(tok.isDouble).toBe(true);
    expect(tok.value).toBe(1e5);
  });

  it('tokenizes multiple number tokens in sequence', () => {
    const tokens = lex('1 2 3');
    expect(tokens).toHaveLength(3);
    expect(tokens.map(t => t.value)).toEqual([1, 2, 3]);
  });
});

describe('Lexer — string literals', () => {
  it('tokenizes a simple string', () => {
    const [tok] = lex('"hello"');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe('hello');
  });

  it('handles escape: \\n', () => {
    const [tok] = lex('"line1\\nline2"');
    expect(tok.value).toBe('line1\nline2');
  });

  it('handles escape: \\t', () => {
    const [tok] = lex('"col1\\tcol2"');
    expect(tok.value).toBe('col1\tcol2');
  });

  it('handles escape: \\\\', () => {
    const [tok] = lex('"back\\\\slash"');
    expect(tok.value).toBe('back\\slash');
  });

  it('handles escape: \\"', () => {
    const [tok] = lex('"say \\"hi\\""');
    expect(tok.value).toBe('say "hi"');
  });

  it('handles empty string', () => {
    const [tok] = lex('""');
    expect(tok.value).toBe('');
  });

  it('throws LexError for unterminated string', () => {
    expectLexError('"unterminated');
  });

  it('throws LexError for newline inside string literal', () => {
    expectLexError('"bad\nnewline"');
  });
});

describe('Lexer — char literals', () => {
  it('tokenizes a plain char', () => {
    const [tok] = lex("'A'");
    expect(tok.type).toBe(TokenType.CHAR);
    expect(tok.value).toBe('A');
  });

  it('handles escape: \\n in char', () => {
    const [tok] = lex("'\\n'");
    expect(tok.value).toBe('\n');
  });

  it('handles escape: \\t in char', () => {
    const [tok] = lex("'\\t'");
    expect(tok.value).toBe('\t');
  });

  it("handles escaped single quote: '\\''", () => {
    const [tok] = lex("'\\''");
    expect(tok.value).toBe("'");
  });

  it('throws LexError for multi-char literal', () => {
    expectLexError("'ab'");
  });
});

describe('Lexer — boolean and null literals', () => {
  it('tokenizes true as BOOLEAN', () => {
    const [tok] = lex('true');
    expect(tok.type).toBe(TokenType.BOOLEAN);
    expect(tok.value).toBe(true);
  });

  it('tokenizes false as BOOLEAN', () => {
    const [tok] = lex('false');
    expect(tok.type).toBe(TokenType.BOOLEAN);
    expect(tok.value).toBe(false);
  });

  it('tokenizes null as NULL', () => {
    const [tok] = lex('null');
    expect(tok.type).toBe(TokenType.NULL);
    expect(tok.value).toBeNull();
  });
});

// ─── keywords ────────────────────────────────────────────────────────────────

describe('Lexer — keywords', () => {
  const cases = [
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
  ];

  it.each(cases)('tokenizes "%s" as %s', (word, expectedType) => {
    const [tok] = lex(word);
    expect(tok.type).toBe(expectedType);
    expect(tok.value).toBe(word);
  });

  it('does not tokenize a keyword-prefixed identifier as a keyword', () => {
    const [tok] = lex('integer');
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe('integer');
  });

  it('does not tokenize "forEach" as keyword FOR + identifier', () => {
    const tokens = lex('forEach');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
  });
});

// ─── identifiers ─────────────────────────────────────────────────────────────

describe('Lexer — identifiers', () => {
  it('tokenizes a simple identifier', () => {
    const [tok] = lex('myVar');
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe('myVar');
  });

  it('handles identifier with underscore and dollar', () => {
    const [tok] = lex('_my$Var');
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe('_my$Var');
  });

  it('handles identifier with digits after the first char', () => {
    const [tok] = lex('var2');
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe('var2');
  });
});

// ─── operators ───────────────────────────────────────────────────────────────

describe('Lexer — single-char operators', () => {
  const cases = [
    ['+', TokenType.PLUS],
    ['-', TokenType.MINUS],
    ['*', TokenType.STAR],
    ['/', TokenType.SLASH],
    ['%', TokenType.PERCENT],
    ['=', TokenType.EQUALS],
    ['!', TokenType.BANG],
    ['<', TokenType.LESS],
    ['>', TokenType.GREATER],
  ];
  it.each(cases)('tokenizes "%s"', (op, expectedType) => {
    const [tok] = lex(op);
    expect(tok.type).toBe(expectedType);
  });
});

describe('Lexer — multi-char operators', () => {
  const cases = [
    ['++',  TokenType.PLUS_PLUS],
    ['--',  TokenType.MINUS_MINUS],
    ['+=',  TokenType.PLUS_EQUALS],
    ['-=',  TokenType.MINUS_EQUALS],
    ['*=',  TokenType.STAR_EQUALS],
    ['/=',  TokenType.SLASH_EQUALS],
    ['==',  TokenType.EQUALS_EQUALS],
    ['!=',  TokenType.BANG_EQUALS],
    ['<=',  TokenType.LESS_EQUALS],
    ['>=',  TokenType.GREATER_EQUALS],
    ['&&',  TokenType.AND_AND],
    ['||',  TokenType.PIPE_PIPE],
  ];
  it.each(cases)('tokenizes "%s" as a single token', (op, expectedType) => {
    const [tok] = lex(op);
    expect(tok.type).toBe(expectedType);
    expect(tok.value).toBe(op);
  });

  it('tokenizes ++ before a lone +, not as two PLUSes', () => {
    const [tok] = lex('++');
    expect(tok.type).toBe(TokenType.PLUS_PLUS);
  });

  it('tokenizes -- before a lone -, not as two MINUSes', () => {
    const [tok] = lex('--');
    expect(tok.type).toBe(TokenType.MINUS_MINUS);
  });
});

// ─── delimiters ───────────────────────────────────────────────────────────────

describe('Lexer — delimiters', () => {
  const cases = [
    ['(', TokenType.LEFT_PAREN],
    [')', TokenType.RIGHT_PAREN],
    ['{', TokenType.LEFT_BRACE],
    ['}', TokenType.RIGHT_BRACE],
    ['[', TokenType.LEFT_BRACKET],
    [']', TokenType.RIGHT_BRACKET],
    [';', TokenType.SEMICOLON],
    [',', TokenType.COMMA],
    ['.', TokenType.DOT],
  ];
  it.each(cases)('tokenizes "%s"', (ch, expectedType) => {
    const [tok] = lex(ch);
    expect(tok.type).toBe(expectedType);
  });
});

// ─── line tracking ────────────────────────────────────────────────────────────

describe('Lexer — line number tracking', () => {
  it('starts at line 1', () => {
    const [tok] = lex('x');
    expect(tok.line).toBe(1);
  });

  it('increments line on newline', () => {
    const tokens = lex('a\nb');
    expect(tokens[0].line).toBe(1);
    expect(tokens[1].line).toBe(2);
  });

  it('correctly tracks lines across a multi-line program', () => {
    const src = 'int x = 1;\nint y = 2;\nint z = 3;';
    const tokens = lex(src);
    // 'int' on each line
    const ints = tokens.filter(t => t.type === TokenType.KEYWORD_INT);
    expect(ints.map(t => t.line)).toEqual([1, 2, 3]);
  });

  it('reports the correct line in a LexError', () => {
    let err;
    try { new Lexer('x\ny\n@').tokenize(); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(err.line).toBe(3);
  });
});

// ─── whitespace and comments ──────────────────────────────────────────────────

describe('Lexer — whitespace and comments', () => {
  it('skips spaces and tabs', () => {
    expect(lex('  \t  ')).toHaveLength(0);
  });

  it('skips a single-line comment', () => {
    const tokens = lex('x // this is a comment\ny');
    expect(tokens.map(t => t.value)).toEqual(['x', 'y']);
  });

  it('skips a block comment', () => {
    const tokens = lex('a /* block\ncomment */ b');
    expect(tokens.map(t => t.value)).toEqual(['a', 'b']);
  });

  it('does not confuse // inside a string as a comment', () => {
    const [tok] = lex('"http://example.com"');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe('http://example.com');
  });

  it('does not confuse /* inside a string as a block comment', () => {
    const [tok] = lex('"/* not a comment */"');
    expect(tok.value).toBe('/* not a comment */');
  });
});

// ─── EOF token ────────────────────────────────────────────────────────────────

describe('Lexer — EOF token', () => {
  it('always appends an EOF token', () => {
    const tokens = lexFull('x');
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });

  it('produces just an EOF token for empty input', () => {
    const tokens = lexFull('');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });
});

// ─── malformed input ──────────────────────────────────────────────────────────

describe('Lexer — malformed input', () => {
  it('throws LexError for a bare &', () => {
    expectLexError('&');
  });

  it('throws LexError for a bare |', () => {
    expectLexError('|');
  });

  it('throws LexError for an unknown character @', () => {
    expectLexError('@');
  });

  it('throws LexError for an invalid escape sequence', () => {
    expectLexError('"\\q"');
  });
});

// ─── integration: full Java snippet ──────────────────────────────────────────

describe('Lexer — integration: hello_world', () => {
  it('correctly tokenizes the hello_world fixture', () => {
    const src = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
    const tokens = lexFull(src);
    const types = tokens.map(t => t.type);

    // Spot-check key tokens in order
    expect(types[0]).toBe(TokenType.KEYWORD_PUBLIC);
    expect(types[1]).toBe(TokenType.KEYWORD_CLASS);
    expect(types[2]).toBe(TokenType.IDENTIFIER);       // Main
    expect(types[3]).toBe(TokenType.LEFT_BRACE);

    // String literal "Hello, World!"
    const strTok = tokens.find(t => t.type === TokenType.STRING);
    expect(strTok?.value).toBe('Hello, World!');

    // Final token is EOF
    expect(types[types.length - 1]).toBe(TokenType.EOF);
  });
});
