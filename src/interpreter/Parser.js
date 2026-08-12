/**
 * Parser.js
 *
 * Token array → Abstract Syntax Tree, via recursive descent. See
 * INTERPRETER.md §"2. Parser" for the full AST node list and precedence
 * chain (assignment → logical-or → logical-and → equality → comparison →
 * addition → multiplication → unary → postfix → primary).
 *
 * Task 2 — complete implementation.
 *
 * Node-shape decisions not spelled out verbatim in the doc:
 * - Statement-level `AssignmentStatement` and expression-level
 *   `AssignmentExpression` share one code path: assignment() always builds
 *   an AssignmentExpression, and parseExpressionOrAssignmentStatement()
 *   rewraps it as AssignmentStatement{target,operator,value} when it's used
 *   as a full statement. Keeps both node types the doc lists without two
 *   parallel implementations.
 * - TypeAnnotation is { type: 'TypeAnnotation', name, arrayDims, generic }.
 *   `generic` is a raw flag (true if `<...>` was present) — per §"Scope",
 *   generic type args parse but carry no semantic weight, so we skip their
 *   contents rather than build a real AST for them.
 * - Declaration-vs-assignment lookahead (see isDeclarationStart /
 *   looksLikeTypedDeclaration): primitive-type keywords are always a
 *   declaration; an IDENTIFIER only starts a declaration if, after
 *   optionally skipping a `<...>` generic and any `[]` array-dim pairs, the
 *   token that follows is itself an IDENTIFIER (the variable name). This is
 *   what distinguishes `ArrayList<Integer> list` and `int[] arr` (decl)
 *   from `x = 5`, `foo()`, `obj.bar()`, `x++` (not decl).
 * - Cast vs. grouped expression: `(` is only treated as the start of a
 *   CastExpression when it's immediately followed by one of the primitive
 *   type keywords (int/double/boolean/char) and then `)`. `(x)` with an
 *   identifier is always a grouping, since identifiers aren't reliably
 *   types in this grammar (avoids the classic C-style cast/paren ambiguity
 *   without a symbol table).
 * - `new` dispatches on what follows the type name: `[` →
 *   ArrayCreationExpression (1D or 2D, one entry in `dimensions` per `[]`,
 *   `null` for an empty `[]` in the size-inferred-by-initializer case isn't
 *   supported — Phase 1 arrays always give an explicit size); `(` →
 *   NewExpression (Phase 2 object construction — parsed now since the
 *   grammar falls out for free, even though the evaluator won't support it
 *   until Milestone 2).
 */

import { TokenType } from './Lexer.js';
import { InterpreterError, ErrorType } from './InterpreterError.js';

const PRIMITIVE_TYPES = new Set([
  TokenType.KEYWORD_INT,
  TokenType.KEYWORD_DOUBLE,
  TokenType.KEYWORD_BOOLEAN,
  TokenType.KEYWORD_CHAR,
]);

const TYPE_START_TOKENS = new Set([
  TokenType.KEYWORD_INT,
  TokenType.KEYWORD_DOUBLE,
  TokenType.KEYWORD_BOOLEAN,
  TokenType.KEYWORD_CHAR,
  TokenType.KEYWORD_STRING,
  TokenType.KEYWORD_VOID,
]);

const PRIMITIVE_TYPE_NAMES = new Map([
  [TokenType.KEYWORD_INT, 'int'],
  [TokenType.KEYWORD_DOUBLE, 'double'],
  [TokenType.KEYWORD_BOOLEAN, 'boolean'],
  [TokenType.KEYWORD_CHAR, 'char'],
]);

const ASSIGNMENT_OPERATORS = new Set([
  TokenType.EQUALS,
  TokenType.PLUS_EQUALS,
  TokenType.MINUS_EQUALS,
  TokenType.STAR_EQUALS,
  TokenType.SLASH_EQUALS,
]);

export class Parser {
  /** @param {{type: string, value: any, line: number}[]} tokens */
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  // ─── token stream helpers ──────────────────────────────────────────────

  /** Token at current + offset, or the EOF token if past the end. */
  peekAt(offset = 0) {
    const idx = this.current + offset;
    return idx < this.tokens.length ? this.tokens[idx] : this.tokens[this.tokens.length - 1];
  }

  peek() { return this.peekAt(0); }

  previous() { return this.tokens[this.current - 1]; }

  isAtEnd() { return this.peek().type === TokenType.EOF; }

  /** True if the current token's type is `type`. */
  check(type) { return !this.isAtEnd() && this.peek().type === type; }

  /** True if the current token's type is one of `types`. */
  checkAny(types) { return !this.isAtEnd() && types.includes(this.peek().type); }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /** Consume the current token if it matches `type`, returning whether it did. */
  match(type) {
    if (this.check(type)) { this.advance(); return true; }
    return false;
  }

  matchAny(types) {
    if (this.checkAny(types)) { this.advance(); return true; }
    return false;
  }

  /** Consume the current token if it matches `type`, else throw a ParseError. */
  expect(type, messageIfMissing) {
    if (this.check(type)) return this.advance();
    const tok = this.peek();
    throw new InterpreterError(
      messageIfMissing ?? `Expected ${type} but got ${tok.type} on line ${tok.line}`,
      ErrorType.PARSE_ERROR,
      tok.line,
    );
  }

  error(message) {
    const tok = this.peek();
    return new InterpreterError(message, ErrorType.PARSE_ERROR, tok.line);
  }

  // ─── entry point ────────────────────────────────────────────────────────

  /**
   * Parse the full token stream into a Program node.
   * @returns {{type: 'Program', body: object[]}}
   */
  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      body.push(this.parseClassDeclaration());
    }
    return { type: 'Program', body };
  }

  // ─── class / method declarations ───────────────────────────────────────

  parseClassDeclaration() {
    // Modifiers before `class` (public, final, ...) are accepted and ignored —
    // they don't affect Phase 1 semantics (a single top-level class per file).
    while (this.matchAny([TokenType.KEYWORD_PUBLIC, TokenType.KEYWORD_FINAL])) { /* skip */ }
    this.expect(TokenType.KEYWORD_CLASS, `Expected 'class' on line ${this.peek().line}`);
    const name = this.expect(TokenType.IDENTIFIER, `Expected class name on line ${this.peek().line}`).value;

    let superclass = null;
    if (this.match(TokenType.KEYWORD_EXTENDS)) {
      superclass = this.expect(TokenType.IDENTIFIER, 'Expected superclass name after \'extends\'').value;
    }
    const interfaces = [];
    if (this.match(TokenType.KEYWORD_IMPLEMENTS)) {
      interfaces.push(this.expect(TokenType.IDENTIFIER, 'Expected interface name after \'implements\'').value);
      while (this.match(TokenType.COMMA)) {
        interfaces.push(this.expect(TokenType.IDENTIFIER, 'Expected interface name').value);
      }
    }

    this.expect(TokenType.LEFT_BRACE, `Expected '{' to open class body on line ${this.peek().line}`);
    const members = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      members.push(this.parseMethodDeclaration());
    }
    this.expect(TokenType.RIGHT_BRACE, `Expected '}' to close class body on line ${this.peek().line}`);

    return { type: 'ClassDeclaration', name, superclass, interfaces, members };
  }

  /**
   * Phase 1 class members are static methods only (Unit 1 scope: "Static
   * method declaration ... within the main class"). Fields/constructors are
   * Milestone 2 (object system) and aren't parsed here yet.
   */
  parseMethodDeclaration() {
    let isStatic = false;
    // Modifiers: public/private/static, in any order, zero or more.
    while (this.checkAny([TokenType.KEYWORD_PUBLIC, TokenType.KEYWORD_PRIVATE, TokenType.KEYWORD_STATIC])) {
      if (this.check(TokenType.KEYWORD_STATIC)) isStatic = true;
      this.advance();
    }

    const returnType = this.parseType();
    const name = this.expect(TokenType.IDENTIFIER, `Expected method name on line ${this.peek().line}`).value;

    this.expect(TokenType.LEFT_PAREN, `Expected '(' after method name on line ${this.peek().line}`);
    const params = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      params.push(this.parseParam());
      while (this.match(TokenType.COMMA)) params.push(this.parseParam());
    }
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after parameter list on line ${this.peek().line}`);

    const body = this.parseBlock();
    return { type: 'MethodDeclaration', name, params, returnType, isStatic, body };
  }

  parseParam() {
    const paramType = this.parseType();
    const name = this.expect(TokenType.IDENTIFIER, `Expected parameter name on line ${this.peek().line}`).value;
    return { type: 'Param', paramType, name };
  }

  /**
   * TypeAnnotation: base type name + array dimension count + whether a
   * (semantically-ignored) generic argument list was present.
   */
  parseType() {
    const tok = this.peek();
    let name;
    if (TYPE_START_TOKENS.has(tok.type)) {
      this.advance();
      name = PRIMITIVE_TYPE_NAMES.get(tok.type) ?? (tok.type === TokenType.KEYWORD_STRING ? 'String' : 'void');
    } else if (tok.type === TokenType.IDENTIFIER) {
      this.advance();
      name = tok.value;
    } else {
      throw this.error(`Expected a type on line ${tok.line}`);
    }

    let generic = false;
    if (this.check(TokenType.LESS)) {
      generic = true;
      this.skipGenericArgs();
    }

    let arrayDims = 0;
    while (this.check(TokenType.LEFT_BRACKET) && this.peekAt(1).type === TokenType.RIGHT_BRACKET) {
      this.advance();
      this.advance();
      arrayDims++;
    }

    return { type: 'TypeAnnotation', name, arrayDims, generic };
  }

  /** Skip a balanced `<...>` generic argument list. Assumes current is LESS. */
  skipGenericArgs() {
    this.advance(); // consume '<'
    let depth = 1;
    while (depth > 0 && !this.isAtEnd()) {
      if (this.check(TokenType.LESS)) depth++;
      else if (this.check(TokenType.GREATER)) depth--;
      else if (this.check(TokenType.GREATER_EQUALS)) {
        // '>=' inside e.g. Map<A,B>= is not valid Java, but be defensive:
        // treat as closing one level then leave the rest for the caller.
        depth--;
      }
      this.advance();
    }
  }

  // ─── statements ─────────────────────────────────────────────────────────

  parseStatement() {
    const tok = this.peek();
    switch (tok.type) {
      case TokenType.LEFT_BRACE: return this.parseBlock();
      case TokenType.KEYWORD_IF: return this.parseIfStatement();
      case TokenType.KEYWORD_FOR: return this.parseForStatement();
      case TokenType.KEYWORD_WHILE: return this.parseWhileStatement();
      case TokenType.KEYWORD_DO: return this.parseDoWhileStatement();
      case TokenType.KEYWORD_SWITCH: return this.parseSwitchStatement();
      case TokenType.KEYWORD_RETURN: return this.parseReturnStatement();
      case TokenType.KEYWORD_BREAK: {
        this.advance();
        this.expect(TokenType.SEMICOLON, `Expected ';' after 'break' on line ${tok.line}`);
        return { type: 'BreakStatement' };
      }
      case TokenType.KEYWORD_CONTINUE: {
        this.advance();
        this.expect(TokenType.SEMICOLON, `Expected ';' after 'continue' on line ${tok.line}`);
        return { type: 'ContinueStatement' };
      }
      default:
        if (this.isDeclarationStart()) return this.parseVariableDeclaration();
        return this.parseExpressionOrAssignmentStatement();
    }
  }

  parseBlock() {
    this.expect(TokenType.LEFT_BRACE, `Expected '{' on line ${this.peek().line}`);
    const body = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    this.expect(TokenType.RIGHT_BRACE, `Expected '}' on line ${this.peek().line}`);
    return { type: 'BlockStatement', body };
  }

  /**
   * Lookahead used to disambiguate `int x = 5;` / `ArrayList<T> list;` /
   * `int[] arr;` (declarations) from `x = 5;`, `foo();`, `obj.bar();`,
   * `x++;` (assignment/expression statements) without backtracking.
   */
  isDeclarationStart() {
    const tok = this.peek();
    if (TYPE_START_TOKENS.has(tok.type) && tok.type !== TokenType.KEYWORD_VOID) return true;
    if (tok.type !== TokenType.IDENTIFIER) return false;

    let idx = this.current + 1;
    if (this.tokens[idx]?.type === TokenType.LESS) {
      // Skip a balanced generic arg list without consuming real tokens.
      let depth = 1;
      idx++;
      while (depth > 0 && idx < this.tokens.length && this.tokens[idx].type !== TokenType.EOF) {
        if (this.tokens[idx].type === TokenType.LESS) depth++;
        else if (this.tokens[idx].type === TokenType.GREATER) depth--;
        idx++;
      }
    }
    while (
      this.tokens[idx]?.type === TokenType.LEFT_BRACKET &&
      this.tokens[idx + 1]?.type === TokenType.RIGHT_BRACKET
    ) {
      idx += 2;
    }
    return this.tokens[idx]?.type === TokenType.IDENTIFIER;
  }

  parseVariableDeclaration() {
    const varType = this.parseType();
    const name = this.expect(TokenType.IDENTIFIER, `Expected variable name on line ${this.peek().line}`).value;
    let initializer = null;
    if (this.match(TokenType.EQUALS)) initializer = this.assignment();
    this.expect(TokenType.SEMICOLON, `Expected ';' after variable declaration on line ${this.previous().line}`);
    return { type: 'VariableDeclaration', varType, name, initializer };
  }

  /**
   * Parses `x = 5;`, `x += 1;`, `foo();`, `obj.bar();`, `x++;`, etc.
   * Rewraps a top-level AssignmentExpression as an AssignmentStatement so
   * both node shapes in the doc's AST list are produced correctly.
   */
  parseExpressionOrAssignmentStatement() {
    const expr = this.assignment();
    this.expect(TokenType.SEMICOLON, `Expected ';' on line ${this.previous().line}`);
    if (expr.type === 'AssignmentExpression') {
      return { type: 'AssignmentStatement', target: expr.target, operator: expr.operator, value: expr.value };
    }
    return { type: 'ExpressionStatement', expression: expr };
  }

  parseIfStatement() {
    this.advance(); // 'if'
    this.expect(TokenType.LEFT_PAREN, `Expected '(' after 'if' on line ${this.previous().line}`);
    const condition = this.expression();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after if condition on line ${this.previous().line}`);
    const thenBranch = this.parseStatement();
    let elseBranch = null;
    if (this.match(TokenType.KEYWORD_ELSE)) elseBranch = this.parseStatement();
    return { type: 'IfStatement', condition, thenBranch, elseBranch };
  }

  parseForStatement() {
    this.advance(); // 'for'
    this.expect(TokenType.LEFT_PAREN, `Expected '(' after 'for' on line ${this.previous().line}`);

    let init = null;
    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
    } else {
      init = this.isDeclarationStart() ? this.parseVariableDeclaration() : this.parseExpressionOrAssignmentStatement();
    }

    const condition = this.check(TokenType.SEMICOLON) ? null : this.expression();
    this.expect(TokenType.SEMICOLON, `Expected ';' after for-loop condition on line ${this.previous().line}`);

    const update = this.check(TokenType.RIGHT_PAREN) ? null : this.assignment();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after for-loop clauses on line ${this.previous().line}`);

    const body = this.parseStatement();
    return { type: 'ForStatement', init, condition, update, body };
  }

  parseWhileStatement() {
    this.advance(); // 'while'
    this.expect(TokenType.LEFT_PAREN, `Expected '(' after 'while' on line ${this.previous().line}`);
    const condition = this.expression();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after while condition on line ${this.previous().line}`);
    const body = this.parseStatement();
    return { type: 'WhileStatement', condition, body };
  }

  parseDoWhileStatement() {
    this.advance(); // 'do'
    const body = this.parseStatement();
    this.expect(TokenType.KEYWORD_WHILE, `Expected 'while' after do-block on line ${this.peek().line}`);
    this.expect(TokenType.LEFT_PAREN, `Expected '(' after 'while' on line ${this.previous().line}`);
    const condition = this.expression();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after do-while condition on line ${this.previous().line}`);
    this.expect(TokenType.SEMICOLON, `Expected ';' after do-while statement on line ${this.previous().line}`);
    return { type: 'DoWhileStatement', body, condition };
  }

  parseSwitchStatement() {
    this.advance(); // 'switch'
    this.expect(TokenType.LEFT_PAREN, `Expected '(' after 'switch' on line ${this.previous().line}`);
    const discriminant = this.expression();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after switch discriminant on line ${this.previous().line}`);
    this.expect(TokenType.LEFT_BRACE, `Expected '{' to open switch body on line ${this.peek().line}`);

    const cases = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      let test = null;
      if (this.match(TokenType.KEYWORD_CASE)) {
        test = this.expression();
      } else {
        this.expect(TokenType.KEYWORD_DEFAULT, `Expected 'case' or 'default' on line ${this.peek().line}`);
      }
      this.expect(TokenType.COLON, `Expected ':' after switch case label on line ${this.previous().line}`);

      const body = [];
      // Fall-through: a case's statements run until the next case/default/'}'.
      while (
        !this.checkAny([TokenType.KEYWORD_CASE, TokenType.KEYWORD_DEFAULT, TokenType.RIGHT_BRACE]) &&
        !this.isAtEnd()
      ) {
        body.push(this.parseStatement());
      }
      cases.push({ type: 'SwitchCase', test, body });
    }
    this.expect(TokenType.RIGHT_BRACE, `Expected '}' to close switch body on line ${this.peek().line}`);
    return { type: 'SwitchStatement', discriminant, cases };
  }

  parseReturnStatement() {
    const line = this.peek().line;
    this.advance(); // 'return'
    const value = this.check(TokenType.SEMICOLON) ? null : this.expression();
    this.expect(TokenType.SEMICOLON, `Expected ';' after return statement on line ${line}`);
    return { type: 'ReturnStatement', value };
  }

  // ─── expressions (precedence climbing) ─────────────────────────────────
  // assignment → logical-or → logical-and → equality → comparison →
  // addition → multiplication → unary → postfix → primary

  expression() { return this.assignment(); }

  assignment() {
    const left = this.logicalOr();
    if (this.checkAny([...ASSIGNMENT_OPERATORS])) {
      const operator = this.advance().value;
      const value = this.assignment(); // right-associative
      this.assertAssignmentTarget(left);
      return { type: 'AssignmentExpression', target: left, operator, value };
    }
    return left;
  }

  assertAssignmentTarget(node) {
    if (node.type !== 'Identifier' && node.type !== 'ArrayAccessExpression' && node.type !== 'MemberExpression') {
      throw this.error(`Invalid assignment target on line ${this.previous().line}`);
    }
  }

  logicalOr() {
    let left = this.logicalAnd();
    while (this.check(TokenType.PIPE_PIPE)) {
      const operator = this.advance().value;
      const right = this.logicalAnd();
      left = { type: 'LogicalExpression', left, operator, right };
    }
    return left;
  }

  logicalAnd() {
    let left = this.equality();
    while (this.check(TokenType.AND_AND)) {
      const operator = this.advance().value;
      const right = this.equality();
      left = { type: 'LogicalExpression', left, operator, right };
    }
    return left;
  }

  equality() {
    let left = this.comparison();
    while (this.checkAny([TokenType.EQUALS_EQUALS, TokenType.BANG_EQUALS])) {
      const operator = this.advance().value;
      const right = this.comparison();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  comparison() {
    let left = this.addition();
    while (this.checkAny([TokenType.LESS, TokenType.LESS_EQUALS, TokenType.GREATER, TokenType.GREATER_EQUALS])) {
      const operator = this.advance().value;
      const right = this.addition();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  addition() {
    let left = this.multiplication();
    while (this.checkAny([TokenType.PLUS, TokenType.MINUS])) {
      const operator = this.advance().value;
      const right = this.multiplication();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  multiplication() {
    let left = this.unary();
    while (this.checkAny([TokenType.STAR, TokenType.SLASH, TokenType.PERCENT])) {
      const operator = this.advance().value;
      const right = this.unary();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  unary() {
    if (this.checkAny([TokenType.BANG, TokenType.MINUS, TokenType.PLUS, TokenType.PLUS_PLUS, TokenType.MINUS_MINUS])) {
      const operator = this.advance().value;
      const operand = this.unary();
      return { type: 'UnaryExpression', operator, operand, prefix: true };
    }
    if (this.isCastAhead()) return this.parseCast();
    return this.postfix();
  }

  /** True if the tokens at `current` form `(` primitive-type `)`. */
  isCastAhead() {
    return (
      this.check(TokenType.LEFT_PAREN) &&
      PRIMITIVE_TYPES.has(this.peekAt(1).type) &&
      this.peekAt(2).type === TokenType.RIGHT_PAREN
    );
  }

  parseCast() {
    this.advance(); // '('
    const castType = this.parseType();
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after cast type on line ${this.previous().line}`);
    const expr = this.unary();
    return { type: 'CastExpression', castType, expression: expr };
  }

  postfix() {
    let expr = this.primary();
    for (;;) {
      if (this.checkAny([TokenType.PLUS_PLUS, TokenType.MINUS_MINUS])) {
        const operator = this.advance().value;
        this.assertAssignmentTarget(expr);
        expr = { type: 'UnaryExpression', operator, operand: expr, prefix: false };
        continue;
      }
      if (this.match(TokenType.LEFT_BRACKET)) {
        const index = this.expression();
        this.expect(TokenType.RIGHT_BRACKET, `Expected ']' after array index on line ${this.previous().line}`);
        expr = { type: 'ArrayAccessExpression', array: expr, index };
        continue;
      }
      if (this.match(TokenType.DOT)) {
        const property = this.expect(TokenType.IDENTIFIER, `Expected property/method name after '.' on line ${this.previous().line}`).value;
        const member = { type: 'MemberExpression', object: expr, property };
        if (this.check(TokenType.LEFT_PAREN)) {
          const args = this.parseArgs();
          expr = { type: 'CallExpression', callee: member, args };
        } else {
          expr = member;
        }
        continue;
      }
      if (this.check(TokenType.LEFT_PAREN)) {
        const args = this.parseArgs();
        expr = { type: 'CallExpression', callee: expr, args };
        continue;
      }
      break;
    }
    return expr;
  }

  parseArgs() {
    this.expect(TokenType.LEFT_PAREN, `Expected '(' on line ${this.peek().line}`);
    const args = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      args.push(this.assignment());
      while (this.match(TokenType.COMMA)) args.push(this.assignment());
    }
    this.expect(TokenType.RIGHT_PAREN, `Expected ')' after argument list on line ${this.previous().line}`);
    return args;
  }

  primary() {
    const tok = this.peek();

    if (this.match(TokenType.NUMBER)) {
      return { type: 'NumberLiteral', value: tok.value, isDouble: !!tok.isDouble };
    }
    if (this.match(TokenType.STRING)) return { type: 'StringLiteral', value: tok.value };
    if (this.match(TokenType.BOOLEAN)) return { type: 'BooleanLiteral', value: tok.value };
    if (this.match(TokenType.CHAR)) return { type: 'CharLiteral', value: tok.value };
    if (this.match(TokenType.NULL)) return { type: 'NullLiteral' };
    if (this.match(TokenType.KEYWORD_THIS)) return { type: 'Identifier', name: 'this' };
    if (this.match(TokenType.IDENTIFIER)) return { type: 'Identifier', name: tok.value };
    if (this.check(TokenType.KEYWORD_NEW)) return this.parseNewExpression();

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.expect(TokenType.RIGHT_PAREN, `Expected ')' after expression on line ${this.previous().line}`);
      return expr;
    }

    throw this.error(`Unexpected token '${tok.value ?? tok.type}' on line ${tok.line}`);
  }

  parseNewExpression() {
    this.advance(); // 'new'
    const typeTok = this.peek();
    let className;
    if (TYPE_START_TOKENS.has(typeTok.type) && typeTok.type !== TokenType.KEYWORD_VOID) {
      this.advance();
      className = PRIMITIVE_TYPE_NAMES.get(typeTok.type) ?? (typeTok.type === TokenType.KEYWORD_STRING ? 'String' : 'void');
    } else {
      className = this.expect(TokenType.IDENTIFIER, `Expected a type name after 'new' on line ${typeTok.line}`).value;
    }

    if (this.check(TokenType.LESS)) this.skipGenericArgs();

    if (this.check(TokenType.LEFT_BRACKET)) {
      const dimensions = [];
      while (this.match(TokenType.LEFT_BRACKET)) {
        dimensions.push(this.check(TokenType.RIGHT_BRACKET) ? null : this.expression());
        this.expect(TokenType.RIGHT_BRACKET, `Expected ']' in array creation on line ${this.previous().line}`);
      }
      return { type: 'ArrayCreationExpression', elementType: className, dimensions };
    }

    if (this.check(TokenType.LEFT_PAREN)) {
      const args = this.parseArgs();
      return { type: 'NewExpression', className, args };
    }

    throw this.error(`Expected '[' or '(' after 'new ${className}' on line ${this.peek().line}`);
  }
}
