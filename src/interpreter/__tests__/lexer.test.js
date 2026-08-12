/**
 * lexer.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": one test per token type, one test
 * per escape sequence, plus malformed-input cases. Fill these in alongside
 * Lexer.js — see §"Contributing: How to Add a Feature" for the fixture-first
 * workflow.
 */

import { describe, it } from 'vitest';

describe('Lexer', () => {
  it.todo('tokenizes number, string, boolean, char, and null literals');
  it.todo('tokenizes all keywords (int, if, for, class, ...)');
  it.todo('tokenizes all operators, including multi-char ones (++, ==, &&)');
  it.todo('tracks line numbers across multi-line source');
  it.todo('skips whitespace and both comment styles (// and /* */)');
  it.todo('handles string escape sequences (\\", \\\\, \\n, \\t)');
  it.todo('reports a LexError for malformed input');
});
