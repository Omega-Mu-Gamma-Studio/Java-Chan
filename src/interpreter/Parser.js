/**
 * Parser.js
 *
 * Token array → Abstract Syntax Tree, via recursive descent. See
 * INTERPRETER.md §"2. Parser" for the full AST node list and precedence
 * chain (assignment → logical-or → logical-and → equality → comparison →
 * addition → multiplication → unary → postfix → primary).
 *
 * STUB — not yet implemented. Milestone 1.
 */

export class Parser {
  /** @param {{type: string, value: any, line: number}[]} tokens */
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  /**
   * Parse the full token stream into a Program node.
   * @returns {{type: 'Program', body: object[]}}
   */
  parse() {
    // TODO: implement — see INTERPRETER.md §"2. Parser" for the AST node
    // shapes (ClassDeclaration, MethodDeclaration, statement/expression
    // nodes) and the recursive-descent grammar.
    throw new Error('Parser.parse() is not implemented yet');
  }
}
