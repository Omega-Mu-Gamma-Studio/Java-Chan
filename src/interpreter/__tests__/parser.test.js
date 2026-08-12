/**
 * parser.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": one test per AST node type, plus
 * operator precedence and nested-block cases. Fill these in alongside
 * Parser.js.
 */

import { describe, it } from 'vitest';

describe('Parser', () => {
  it.todo('parses a class with a static main method into a Program AST');
  it.todo('parses variable declarations and assignment statements');
  it.todo('disambiguates declaration vs. assignment via lookahead');
  it.todo('parses if / else if / else with correct nesting');
  it.todo('parses for, while, and do-while loops');
  it.todo('parses switch/case/default with fall-through');
  it.todo('respects operator precedence (e.g. * before +)');
  it.todo('parses array declarations and ArrayCreationExpression');
});
