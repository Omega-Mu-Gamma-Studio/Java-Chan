/**
 * parser.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": one test per AST node type, plus
 * operator precedence and nested-block cases.
 *
 * Task 2 — complete implementation.
 */

import { describe, it, expect } from 'vitest';
import { Lexer } from '../Lexer.js';
import { Parser } from '../Parser.js';
import { InterpreterError } from '../InterpreterError.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Parse a full class-wrapped program and return the Program AST. */
function parseProgram(src) {
  const tokens = new Lexer(src).tokenize();
  return new Parser(tokens).parse();
}

/** Parse a single expression by wrapping it as an assignment RHS in a dummy method, return the expression AST. */
function parseExpr(exprSrc) {
  const program = parseProgram(`class T { void m() { x = ${exprSrc}; } }`);
  const stmt = program.body[0].members[0].body.body[0];
  return stmt.value; // AssignmentStatement.value
}

/** Parse a single statement inside a dummy method body, return the statement AST. */
function parseStmt(stmtSrc) {
  const program = parseProgram(`class T { void m() { ${stmtSrc} } }`);
  return program.body[0].members[0].body.body[0];
}

function expectParseError(src) {
  expect(() => parseProgram(src)).toThrow(InterpreterError);
}

// ─── Program / ClassDeclaration / MethodDeclaration ────────────────────────

describe('Parser — class with static main method', () => {
  it('parses a class with a static main method into a Program AST', () => {
    const ast = parseProgram(`
      public class Main {
        public static void main(String[] args) {
          System.out.println("hi");
        }
      }
    `);
    expect(ast.type).toBe('Program');
    expect(ast.body).toHaveLength(1);

    const cls = ast.body[0];
    expect(cls.type).toBe('ClassDeclaration');
    expect(cls.name).toBe('Main');
    expect(cls.members).toHaveLength(1);

    const method = cls.members[0];
    expect(method.type).toBe('MethodDeclaration');
    expect(method.name).toBe('main');
    expect(method.isStatic).toBe(true);
    expect(method.returnType).toEqual({ type: 'TypeAnnotation', name: 'void', arrayDims: 0, generic: false });
    expect(method.params).toEqual([
      { type: 'Param', paramType: { type: 'TypeAnnotation', name: 'String', arrayDims: 1, generic: false }, name: 'args' },
    ]);
    expect(method.body.type).toBe('BlockStatement');
  });

  it('parses multiple methods and a non-static, non-main static method', () => {
    const ast = parseProgram(`
      class Main {
        static int add(int a, int b) { return a + b; }
        public static void main(String[] args) { }
      }
    `);
    const [add, main] = ast.body[0].members;
    expect(add.name).toBe('add');
    expect(add.isStatic).toBe(true);
    expect(add.params.map((p) => p.name)).toEqual(['a', 'b']);
    expect(main.name).toBe('main');
  });

  it('parses extends and implements clauses', () => {
    const ast = parseProgram(`class Dog extends Animal implements Comparable { void m() {} }`);
    const cls = ast.body[0];
    expect(cls.superclass).toBe('Animal');
    expect(cls.interfaces).toEqual(['Comparable']);
  });
});

// ─── VariableDeclaration / AssignmentStatement / declaration-vs-assignment ──

describe('Parser — variable declarations and assignment statements', () => {
  it('parses a variable declaration with an initializer', () => {
    const stmt = parseStmt('int x = 5;');
    expect(stmt).toEqual({
      type: 'VariableDeclaration',
      varType: { type: 'TypeAnnotation', name: 'int', arrayDims: 0, generic: false },
      name: 'x',
      initializer: { type: 'NumberLiteral', value: 5, isDouble: false },
    });
  });

  it('parses a variable declaration with no initializer', () => {
    const stmt = parseStmt('double d;');
    expect(stmt.type).toBe('VariableDeclaration');
    expect(stmt.initializer).toBeNull();
  });

  it('parses an assignment statement to an existing variable', () => {
    const stmt = parseStmt('x = 5;');
    expect(stmt).toEqual({
      type: 'AssignmentStatement',
      target: { type: 'Identifier', name: 'x' },
      operator: '=',
      value: { type: 'NumberLiteral', value: 5, isDouble: false },
    });
  });

  it('parses compound assignment operators', () => {
    for (const op of ['+=', '-=', '*=', '/=']) {
      const stmt = parseStmt(`x ${op} 1;`);
      expect(stmt.type).toBe('AssignmentStatement');
      expect(stmt.operator).toBe(op);
    }
  });

  it('parses an array-typed declaration', () => {
    const stmt = parseStmt('int[] arr = new int[5];');
    expect(stmt.type).toBe('VariableDeclaration');
    expect(stmt.varType).toEqual({ type: 'TypeAnnotation', name: 'int', arrayDims: 1, generic: false });
    expect(stmt.initializer).toEqual({
      type: 'ArrayCreationExpression',
      elementType: 'int',
      dimensions: [{ type: 'NumberLiteral', value: 5, isDouble: false }],
    });
  });

  it('parses a 2D array declaration', () => {
    const stmt = parseStmt('int[][] grid = new int[3][3];');
    expect(stmt.varType.arrayDims).toBe(2);
    expect(stmt.initializer.dimensions).toHaveLength(2);
  });

  it('parses a class-typed declaration (e.g. String)', () => {
    const stmt = parseStmt('String s = "hi";');
    expect(stmt.type).toBe('VariableDeclaration');
    expect(stmt.varType.name).toBe('String');
  });

  it('disambiguates declaration vs. assignment via lookahead', () => {
    expect(parseStmt('int x = 1;').type).toBe('VariableDeclaration');
    expect(parseStmt('x = 1;').type).toBe('AssignmentStatement');
    expect(parseStmt('foo();').type).toBe('ExpressionStatement');
    expect(parseStmt('obj.bar();').type).toBe('ExpressionStatement');
    expect(parseStmt('x++;').type).toBe('ExpressionStatement');
    expect(parseStmt('ArrayList list;').type).toBe('VariableDeclaration');
  });

  it('parses an expression statement (bare method call)', () => {
    const stmt = parseStmt('System.out.println("hi");');
    expect(stmt.type).toBe('ExpressionStatement');
    expect(stmt.expression.type).toBe('CallExpression');
  });
});

// ─── control flow: if / for / while / do-while / switch ────────────────────

describe('Parser — if / else if / else', () => {
  it('parses if / else if / else with correct nesting', () => {
    const stmt = parseStmt(`
      if (x > 0) { y = 1; }
      else if (x < 0) { y = -1; }
      else { y = 0; }
    `);
    expect(stmt.type).toBe('IfStatement');
    expect(stmt.thenBranch.type).toBe('BlockStatement');
    expect(stmt.elseBranch.type).toBe('IfStatement'); // else-if chains via nested IfStatement
    expect(stmt.elseBranch.elseBranch.type).toBe('BlockStatement');
  });

  it('parses if with no else', () => {
    const stmt = parseStmt('if (x > 0) { y = 1; }');
    expect(stmt.elseBranch).toBeNull();
  });
});

describe('Parser — loops', () => {
  it('parses for, while, and do-while loops', () => {
    const forStmt = parseStmt('for (int i = 0; i < 10; i++) { sum += i; }');
    expect(forStmt.type).toBe('ForStatement');
    expect(forStmt.init.type).toBe('VariableDeclaration');
    expect(forStmt.condition.type).toBe('BinaryExpression');
    expect(forStmt.update).toEqual({
      type: 'UnaryExpression',
      operator: '++',
      operand: { type: 'Identifier', name: 'i' },
      prefix: false,
    });
    expect(forStmt.body.type).toBe('BlockStatement');

    const whileStmt = parseStmt('while (x > 0) { x--; }');
    expect(whileStmt.type).toBe('WhileStatement');
    expect(whileStmt.condition.type).toBe('BinaryExpression');

    const doWhileStmt = parseStmt('do { x--; } while (x > 0);');
    expect(doWhileStmt.type).toBe('DoWhileStatement');
    expect(doWhileStmt.body.type).toBe('BlockStatement');
    expect(doWhileStmt.condition.type).toBe('BinaryExpression');
  });

  it('parses a for loop with all clauses empty', () => {
    const forStmt = parseStmt('for (;;) { break; }');
    expect(forStmt.init).toBeNull();
    expect(forStmt.condition).toBeNull();
    expect(forStmt.update).toBeNull();
  });

  it('parses for-loop init as a plain assignment (not a declaration)', () => {
    const forStmt = parseStmt('for (i = 0; i < 10; i++) { }');
    expect(forStmt.init.type).toBe('AssignmentStatement');
  });

  it('parses break and continue', () => {
    expect(parseStmt('break;')).toEqual({ type: 'BreakStatement' });
    expect(parseStmt('continue;')).toEqual({ type: 'ContinueStatement' });
  });
});

describe('Parser — switch/case/default with fall-through', () => {
  it('parses switch/case/default with fall-through', () => {
    const stmt = parseStmt(`
      switch (x) {
        case 1:
        case 2:
          System.out.println("low");
          break;
        default:
          System.out.println("other");
      }
    `);
    expect(stmt.type).toBe('SwitchStatement');
    expect(stmt.discriminant).toEqual({ type: 'Identifier', name: 'x' });
    expect(stmt.cases).toHaveLength(3);
    expect(stmt.cases[0].test).toEqual({ type: 'NumberLiteral', value: 1, isDouble: false });
    expect(stmt.cases[0].body).toEqual([]); // falls through to case 2 — empty body
    expect(stmt.cases[1].test).toEqual({ type: 'NumberLiteral', value: 2, isDouble: false });
    expect(stmt.cases[1].body).toHaveLength(2); // println + break
    expect(stmt.cases[2].test).toBeNull(); // default
  });
});

describe('Parser — return statement', () => {
  it('parses return with a value', () => {
    const stmt = parseStmt('return a + b;');
    expect(stmt.type).toBe('ReturnStatement');
    expect(stmt.value.type).toBe('BinaryExpression');
  });

  it('parses bare return with no value', () => {
    const stmt = parseStmt('return;');
    expect(stmt.value).toBeNull();
  });
});

// ─── expression precedence ──────────────────────────────────────────────────

describe('Parser — operator precedence', () => {
  it('respects operator precedence (e.g. * before +)', () => {
    // 1 + 2 * 3  =>  BinaryExpression(1, '+', BinaryExpression(2, '*', 3))
    const expr = parseExpr('1 + 2 * 3');
    expect(expr.type).toBe('BinaryExpression');
    expect(expr.operator).toBe('+');
    expect(expr.left).toEqual({ type: 'NumberLiteral', value: 1, isDouble: false });
    expect(expr.right).toEqual({
      type: 'BinaryExpression',
      operator: '*',
      left: { type: 'NumberLiteral', value: 2, isDouble: false },
      right: { type: 'NumberLiteral', value: 3, isDouble: false },
    });
  });

  it('groups with parentheses over default precedence', () => {
    // (1 + 2) * 3 => BinaryExpression(BinaryExpression(1,'+',2), '*', 3)
    const expr = parseExpr('(1 + 2) * 3');
    expect(expr.operator).toBe('*');
    expect(expr.left.type).toBe('BinaryExpression');
    expect(expr.left.operator).toBe('+');
  });

  it('binds && tighter than ||', () => {
    // a || b && c => LogicalExpression(a, '||', LogicalExpression(b, '&&', c))
    const expr = parseExpr('a || b && c');
    expect(expr.operator).toBe('||');
    expect(expr.right).toEqual({
      type: 'LogicalExpression',
      operator: '&&',
      left: { type: 'Identifier', name: 'b' },
      right: { type: 'Identifier', name: 'c' },
    });
  });

  it('binds comparison tighter than equality', () => {
    // a < b == c > d => BinaryExpression(BinaryExpression(a,<,b), ==, BinaryExpression(c,>,d))
    const expr = parseExpr('a < b == c > d');
    expect(expr.operator).toBe('==');
    expect(expr.left.operator).toBe('<');
    expect(expr.right.operator).toBe('>');
  });

  it('is right-associative for assignment (chained assignment)', () => {
    // x = y = 5 => AssignmentStatement(x, '=', AssignmentExpression(y, '=', 5))
    const stmt = parseStmt('x = y = 5;');
    expect(stmt.type).toBe('AssignmentStatement');
    expect(stmt.target).toEqual({ type: 'Identifier', name: 'x' });
    expect(stmt.value).toEqual({
      type: 'AssignmentExpression',
      target: { type: 'Identifier', name: 'y' },
      operator: '=',
      value: { type: 'NumberLiteral', value: 5, isDouble: false },
    });
  });

  it('parses unary minus binding tighter than binary minus', () => {
    // -a - b => BinaryExpression(UnaryExpression(-,a), '-', b)
    const expr = parseExpr('-a - b');
    expect(expr.type).toBe('BinaryExpression');
    expect(expr.operator).toBe('-');
    expect(expr.left).toEqual({
      type: 'UnaryExpression',
      operator: '-',
      operand: { type: 'Identifier', name: 'a' },
      prefix: true,
    });
  });

  it('parses prefix vs postfix increment/decrement', () => {
    expect(parseExpr('++i')).toEqual({
      type: 'UnaryExpression', operator: '++', operand: { type: 'Identifier', name: 'i' }, prefix: true,
    });
    expect(parseExpr('i++')).toEqual({
      type: 'UnaryExpression', operator: '++', operand: { type: 'Identifier', name: 'i' }, prefix: false,
    });
    expect(parseExpr('i--')).toEqual({
      type: 'UnaryExpression', operator: '--', operand: { type: 'Identifier', name: 'i' }, prefix: false,
    });
  });

  it('parses logical not', () => {
    expect(parseExpr('!ok')).toEqual({
      type: 'UnaryExpression', operator: '!', operand: { type: 'Identifier', name: 'ok' }, prefix: true,
    });
  });
});

// ─── postfix chains: calls, member access, array access ────────────────────

describe('Parser — calls, member access, array access', () => {
  it('parses a bare function call with arguments', () => {
    const expr = parseExpr('add(3, 4)');
    expect(expr).toEqual({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'add' },
      args: [
        { type: 'NumberLiteral', value: 3, isDouble: false },
        { type: 'NumberLiteral', value: 4, isDouble: false },
      ],
    });
  });

  it('parses System.out.println(...) as a member chain ending in a call', () => {
    const expr = parseExpr('System.out.println("hi")');
    expect(expr.type).toBe('CallExpression');
    expect(expr.callee).toEqual({
      type: 'MemberExpression',
      object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'System' }, property: 'out' },
      property: 'println',
    });
    expect(expr.args).toEqual([{ type: 'StringLiteral', value: 'hi' }]);
  });

  it('parses a field access with no call (Math.PI)', () => {
    const expr = parseExpr('Math.PI');
    expect(expr).toEqual({
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: 'PI',
    });
  });

  it('parses array access', () => {
    const expr = parseExpr('arr[0]');
    expect(expr).toEqual({
      type: 'ArrayAccessExpression',
      array: { type: 'Identifier', name: 'arr' },
      index: { type: 'NumberLiteral', value: 0, isDouble: false },
    });
  });

  it('parses chained 2D array access', () => {
    const expr = parseExpr('grid[1][2]');
    expect(expr.type).toBe('ArrayAccessExpression');
    expect(expr.array).toEqual({
      type: 'ArrayAccessExpression',
      array: { type: 'Identifier', name: 'grid' },
      index: { type: 'NumberLiteral', value: 1, isDouble: false },
    });
    expect(expr.index).toEqual({ type: 'NumberLiteral', value: 2, isDouble: false });
  });
});

// ─── literals ────────────────────────────────────────────────────────────────

describe('Parser — literals', () => {
  it('parses number, string, boolean, char, and null literals', () => {
    expect(parseExpr('42')).toEqual({ type: 'NumberLiteral', value: 42, isDouble: false });
    expect(parseExpr('3.14')).toEqual({ type: 'NumberLiteral', value: 3.14, isDouble: true });
    expect(parseExpr('"hi"')).toEqual({ type: 'StringLiteral', value: 'hi' });
    expect(parseExpr('true')).toEqual({ type: 'BooleanLiteral', value: true });
    expect(parseExpr('false')).toEqual({ type: 'BooleanLiteral', value: false });
    expect(parseExpr("'A'")).toEqual({ type: 'CharLiteral', value: 'A' });
    expect(parseExpr('null')).toEqual({ type: 'NullLiteral' });
  });
});

// ─── casts, array/object creation ───────────────────────────────────────────

describe('Parser — casts and creation expressions', () => {
  it('parses a primitive type cast', () => {
    const expr = parseExpr('(int) 3.7');
    expect(expr).toEqual({
      type: 'CastExpression',
      castType: { type: 'TypeAnnotation', name: 'int', arrayDims: 0, generic: false },
      expression: { type: 'NumberLiteral', value: 3.7, isDouble: true },
    });
  });

  it('does not confuse a parenthesized identifier with a cast', () => {
    // (x) is a grouped expression, not a cast, since identifiers aren't
    // treated as cast types (see Parser.js doc comment on cast disambiguation).
    const expr = parseExpr('(x)');
    expect(expr).toEqual({ type: 'Identifier', name: 'x' });
  });

  it('parses 1D array creation', () => {
    const expr = parseExpr('new int[5]');
    expect(expr).toEqual({
      type: 'ArrayCreationExpression',
      elementType: 'int',
      dimensions: [{ type: 'NumberLiteral', value: 5, isDouble: false }],
    });
  });

  it('parses object creation (NewExpression)', () => {
    const expr = parseExpr('new Dog("Rex")');
    expect(expr).toEqual({
      type: 'NewExpression',
      className: 'Dog',
      args: [{ type: 'StringLiteral', value: 'Rex' }],
    });
  });

  it('parses and ignores generic type parameters on a declaration', () => {
    const stmt = parseStmt('ArrayList<Integer> list = new ArrayList<Integer>();');
    expect(stmt.varType).toEqual({ type: 'TypeAnnotation', name: 'ArrayList', arrayDims: 0, generic: true });
    expect(stmt.initializer.type).toBe('NewExpression');
  });
});

// ─── nested blocks ───────────────────────────────────────────────────────────

describe('Parser — nested blocks', () => {
  it('parses nested blocks and scoping constructs without losing structure', () => {
    const ast = parseProgram(`
      class Main {
        static void run() {
          int total = 0;
          for (int i = 0; i < 3; i++) {
            if (i == 1) {
              total += i;
            } else {
              while (total < 10) {
                total++;
              }
            }
          }
        }
      }
    `);
    const body = ast.body[0].members[0].body.body;
    expect(body).toHaveLength(2); // VariableDeclaration, ForStatement
    const forStmt = body[1];
    const ifStmt = forStmt.body.body[0];
    expect(ifStmt.type).toBe('IfStatement');
    expect(ifStmt.elseBranch.type).toBe('BlockStatement');
    expect(ifStmt.elseBranch.body[0].type).toBe('WhileStatement');
  });
});

// ─── malformed input ─────────────────────────────────────────────────────────

describe('Parser — malformed input', () => {
  it('throws a ParseError on a missing semicolon', () => {
    expectParseError('class T { void m() { int x = 5 } }');
  });

  it('throws a ParseError on a missing closing brace', () => {
    expectParseError('class T { void m() { ');
  });

  it('throws a ParseError on an unexpected token in expression position', () => {
    expectParseError('class T { void m() { x = ; } }');
  });

  it('throws a ParseError on an invalid assignment target', () => {
    expectParseError('class T { void m() { 5 = x; } }');
  });

  it('throws a ParseError when missing the class keyword', () => {
    expectParseError('T { void m() {} }');
  });
});
