/**
 * Evaluator.js
 *
 * AST → output + side effects (tree-walking). See INTERPRETER.md §"3.
 * Evaluator" for scope handling via Environment, the break/continue/return
 * signal-propagation approach, and the timeout guard against infinite loops.
 *
 * Task 3 — expressions, variables, if/switch.
 * Task 4 — loops (for/while/do-while), break/continue.
 * Task 5 — arrays, static methods, return.
 *
 * All values in this evaluator are JavaValue wrappers:
 *   { value: <JS primitive>, javaType: 'int'|'double'|'boolean'|'char'|'String'|'null'|'array'|'void' }
 *
 * This lets javaToString correctly distinguish 5 (int → "5") from 5.0
 * (double → "5.0") even after values pass through compound expressions.
 * See StandardLibrary.js for the full JavaValue spec and constructors.
 */

import { InterpreterError, ErrorType } from './InterpreterError.js';
import { Environment } from './Environment.js';
import {
  STD, MATH_PI,
  javaToString,
  mkInt, mkDouble, mkBool, mkChar, mkString, mkNull, mkVoid, mkArray,
  raw,
} from './StandardLibrary.js';

// ── Non-local control flow sentinels ──────────────────────────────────────
// See INTERPRETER.md §"Execution control (break/continue/return)".

export const BREAK_SIGNAL    = { __signal: 'break' };
export const CONTINUE_SIGNAL = { __signal: 'continue' };

export class ReturnSignal {
  constructor(value) { this.value = value; }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isSignal(v) {
  return (
    v === BREAK_SIGNAL ||
    v === CONTINUE_SIGNAL ||
    v instanceof ReturnSignal
  );
}

function isJavaValue(v) {
  return v !== null && typeof v === 'object' && 'javaType' in v;
}

/** Resolve a dotted callee path like "System.out.println" → string key. */
function resolveMemberKey(node) {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    const obj = resolveMemberKey(node.object);
    return obj ? `${obj}.${node.property}` : null;
  }
  return null;
}

// ── Evaluator class ───────────────────────────────────────────────────────

export class Evaluator {
  /**
   * @param {object} [options]
   * @param {number} [options.timeout] - max operation count (default 100_000)
   * @param {string[]} [options.stdin] - pre-seeded input lines for Scanner
   */
  constructor(options = {}) {
    this.output  = [];          // collected println/print strings
    this.opCount = 0;
    this.opLimit = options.timeout ?? 100_000;
    this.stdin   = options.stdin ?? [];
    this.stdinIdx = 0;

    // Method table populated when we encounter a ClassDeclaration.
    // Maps method name → MethodDeclaration AST node.
    this.methods = new Map();
  }

  /** Increment the operation counter; throw on overflow (infinite loop guard). */
  tick() {
    this.opCount++;
    if (this.opCount > this.opLimit) {
      throw new InterpreterError(
        'Execution timed out — check for an infinite loop~ 😓',
        ErrorType.RUNTIME_ERROR,
      );
    }
  }

  // ── Entry point ──────────────────────────────────────────────────────────

  /**
   * Evaluate the root Program node and return collected stdout as a string.
   * @param {object} program - AST Program node from Parser
   * @returns {string}
   */
  run(program) {
    // Build global environment.
    const globalEnv = new Environment(null);

    // Register all classes (collect their static methods first so mutual
    // recursion within the same class works).
    for (const classDecl of program.body) {
      this.registerClass(classDecl);
    }

    // Find and invoke main().
    const mainMethod = this.methods.get('main');
    if (!mainMethod) {
      throw new InterpreterError(
        'No main() method found — every Java-Chan program needs `public static void main(String[] args)`',
        ErrorType.RUNTIME_ERROR,
      );
    }

    const mainEnv = new Environment(globalEnv);
    // Java signature: main(String[] args) — provide an empty array.
    mainEnv.define('args', mkArray([]));

    this.executeBlock(mainMethod.body, mainEnv);

    return this.output.join('');
  }

  /** Register all static methods from a ClassDeclaration into this.methods. */
  registerClass(classDecl) {
    for (const member of classDecl.members) {
      if (member.type === 'MethodDeclaration') {
        this.methods.set(member.name, member);
      }
    }
  }

  // ── Statement execution ───────────────────────────────────────────────────

  /**
   * Execute a statement node. Returns a signal (BREAK/CONTINUE/ReturnSignal)
   * or undefined for normal flow.
   */
  executeStatement(node, env) {
    this.tick();

    switch (node.type) {
      case 'BlockStatement':
        return this.executeBlock(node, env);

      case 'VariableDeclaration':
        return this.executeVariableDeclaration(node, env);

      case 'AssignmentStatement':
        this.executeAssignment(node.target, node.operator, node.value, env);
        return undefined;

      case 'ExpressionStatement':
        this.evaluate(node.expression, env);
        return undefined;

      case 'IfStatement':
        return this.executeIf(node, env);

      case 'SwitchStatement':
        return this.executeSwitch(node, env);

      case 'ForStatement':
        return this.executeFor(node, env);

      case 'WhileStatement':
        return this.executeWhile(node, env);

      case 'DoWhileStatement':
        return this.executeDoWhile(node, env);

      case 'ReturnStatement': {
        const val = node.value ? this.evaluate(node.value, env) : mkVoid();
        return new ReturnSignal(val);
      }

      case 'BreakStatement':
        return BREAK_SIGNAL;

      case 'ContinueStatement':
        return CONTINUE_SIGNAL;

      default:
        throw new InterpreterError(
          `Unknown statement type: ${node.type}`,
          ErrorType.RUNTIME_ERROR,
        );
    }
  }

  executeBlock(blockNode, parentEnv) {
    const blockEnv = new Environment(parentEnv);
    for (const stmt of blockNode.body) {
      const sig = this.executeStatement(stmt, blockEnv);
      if (isSignal(sig)) return sig;
    }
    return undefined;
  }

  executeVariableDeclaration(node, env) {
    let val = mkNull();
    if (node.initializer) {
      val = this.evaluate(node.initializer, env);
    } else {
      // Java's default values.
      val = this.defaultValue(node.varType?.name ?? 'int');
    }
    env.define(node.name, val);
    return undefined;
  }

  defaultValue(typeName) {
    switch (typeName) {
      case 'int':     return mkInt(0);
      case 'double':  return mkDouble(0.0);
      case 'boolean': return mkBool(false);
      case 'char':    return mkChar('\0');
      default:        return mkNull();
    }
  }

  executeAssignment(target, operator, valueNode, env) {
    const newVal = this.evaluate(valueNode, env);

    if (target.type === 'Identifier') {
      const name = target.name;
      const current = operator === '=' ? null : env.get(name);
      const result = operator === '=' ? newVal : this.applyCompoundOp(operator, current, newVal);
      env.set(name, result);
      return result;
    }

    if (target.type === 'ArrayAccessExpression') {
      const arrayJV = this.evaluate(target.array, env);
      const indexJV = this.evaluate(target.index, env);
      const arr = raw(arrayJV);
      const idx = raw(indexJV);
      this.boundsCheck(arr, idx);
      const current = operator === '=' ? null : arr[idx];
      const result = operator === '=' ? newVal : this.applyCompoundOp(operator, current, newVal);
      arr[idx] = result;
      return result;
    }

    throw new InterpreterError(
      `Invalid assignment target: ${target.type}`,
      ErrorType.RUNTIME_ERROR,
    );
  }

  applyCompoundOp(operator, left, right) {
    switch (operator) {
      case '+=': return this.binaryPlus(left, right);
      case '-=': return this.binaryArith('-', left, right);
      case '*=': return this.binaryArith('*', left, right);
      case '/=': return this.binaryArith('/', left, right);
      default:
        throw new InterpreterError(`Unknown compound operator: ${operator}`, ErrorType.RUNTIME_ERROR);
    }
  }

  executeIf(node, env) {
    const cond = this.evaluate(node.condition, env);
    if (raw(cond)) {
      return this.executeStatement(node.thenBranch, env);
    } else if (node.elseBranch) {
      return this.executeStatement(node.elseBranch, env);
    }
    return undefined;
  }

  executeSwitch(node, env) {
    const disc = this.evaluate(node.discriminant, env);
    const discRaw = raw(disc);

    let matched = false;
    for (const switchCase of node.cases) {
      if (!matched) {
        if (switchCase.test === null) {
          // default — will match below if nothing else matched
          matched = true;
        } else {
          const testVal = raw(this.evaluate(switchCase.test, env));
          matched = (discRaw === testVal);
        }
      }

      if (matched) {
        for (const stmt of switchCase.body) {
          const sig = this.executeStatement(stmt, env);
          if (sig === BREAK_SIGNAL) return undefined;   // break exits switch
          if (isSignal(sig)) return sig;               // continue/return propagate
        }
      }
    }

    // If nothing matched yet, try the default case (it parses at its position
    // but should run as the final fallback if not yet executed).
    // The loop above handles default if it appears last; if it appears first
    // and nothing else matched — already handled by `matched = true` on default.
    return undefined;
  }

  executeFor(node, env) {
    const loopEnv = new Environment(env);  // init variable scoped to loop

    if (node.init) {
      this.executeStatement(node.init, loopEnv);
    }

    while (true) {
      this.tick();
      if (node.condition) {
        const cond = this.evaluate(node.condition, loopEnv);
        if (!raw(cond)) break;
      }

      const sig = this.executeStatement(node.body, loopEnv);
      if (sig === BREAK_SIGNAL) break;
      if (sig instanceof ReturnSignal) return sig;
      // CONTINUE_SIGNAL: fall through to update

      if (node.update) {
        this.evaluate(node.update, loopEnv);
      }
    }
    return undefined;
  }

  executeWhile(node, env) {
    while (true) {
      this.tick();
      const cond = this.evaluate(node.condition, env);
      if (!raw(cond)) break;

      const sig = this.executeStatement(node.body, env);
      if (sig === BREAK_SIGNAL) break;
      if (sig instanceof ReturnSignal) return sig;
      // CONTINUE_SIGNAL: loop back to condition check
    }
    return undefined;
  }

  executeDoWhile(node, env) {
    do {
      this.tick();
      const sig = this.executeStatement(node.body, env);
      if (sig === BREAK_SIGNAL) break;
      if (sig instanceof ReturnSignal) return sig;

      const cond = this.evaluate(node.condition, env);
      if (!raw(cond)) break;
    } while (true);
    return undefined;
  }

  // ── Expression evaluation ─────────────────────────────────────────────────

  /**
   * Evaluate an expression node and return a JavaValue.
   * @param {object} node
   * @param {Environment} env
   * @returns {any} JavaValue
   */
  evaluate(node, env) {
    switch (node.type) {

      // ── Literals ─────────────────────────────────────────────────────────

      case 'NumberLiteral':
        return node.isDouble ? mkDouble(node.value) : mkInt(node.value);

      case 'StringLiteral':
        return mkString(node.value);

      case 'BooleanLiteral':
        return mkBool(node.value);

      case 'CharLiteral':
        return mkChar(node.value);

      case 'NullLiteral':
        return mkNull();

      // ── Identifier ───────────────────────────────────────────────────────

      case 'Identifier':
        return env.get(node.name);

      // ── Member expression (field access) ─────────────────────────────────

      case 'MemberExpression': {
        // Math.PI special case.
        if (node.object.type === 'Identifier' && node.object.name === 'Math' && node.property === 'PI') {
          return MATH_PI;
        }
        // String .length field (Java allows str.length() but not str.length — handled in call below).
        // All other member access: evaluate the object and return the property.
        // For chained member access (System.out), we just return an opaque handle
        // that CallExpression will resolve via the dotted key.
        const objVal = this.evaluate(node.object, env);
        // .length field — works on both String and array JavaValues.
        if (node.property === 'length') {
          if (isJavaValue(objVal) && (objVal.javaType === 'String' || objVal.javaType === 'array')) {
            return mkInt(raw(objVal).length);
          }
        }
        // Otherwise return a "member reference" object so CallExpression can
        // look it up in STD as an instance method.
        return { __memberRef: true, object: objVal, property: node.property };
      }

      // ── Array access ──────────────────────────────────────────────────────

      case 'ArrayAccessExpression': {
        const arrayJV = this.evaluate(node.array, env);
        const indexJV = this.evaluate(node.index, env);
        const arr = raw(arrayJV);
        const idx = raw(indexJV);
        if (!Array.isArray(arr)) {
          throw new InterpreterError('Attempted array access on a non-array value', ErrorType.RUNTIME_ERROR);
        }
        this.boundsCheck(arr, idx);
        return arr[idx];
      }

      // ── Array creation ────────────────────────────────────────────────────

      case 'ArrayCreationExpression': {
        if (node.dimensions.length === 1) {
          const sizeJV = this.evaluate(node.dimensions[0], env);
          const size = raw(sizeJV);
          const defaultVal = this.defaultValue(node.elementType);
          const elements = Array.from({ length: size }, () => ({ ...defaultVal }));
          return mkArray(elements);
        }
        if (node.dimensions.length === 2) {
          const rows = raw(this.evaluate(node.dimensions[0], env));
          const cols = raw(this.evaluate(node.dimensions[1], env));
          const defaultVal = this.defaultValue(node.elementType);
          const elements = Array.from({ length: rows }, () =>
            mkArray(Array.from({ length: cols }, () => ({ ...defaultVal })))
          );
          return mkArray(elements);
        }
        throw new InterpreterError('Only 1D and 2D arrays are supported', ErrorType.RUNTIME_ERROR);
      }

      // ── Binary expression ─────────────────────────────────────────────────

      case 'BinaryExpression':
        return this.evaluateBinary(node, env);

      // ── Logical expression (short-circuit) ────────────────────────────────

      case 'LogicalExpression': {
        const left = this.evaluate(node.left, env);
        if (node.operator === '&&') {
          if (!raw(left)) return mkBool(false);
          return mkBool(!!raw(this.evaluate(node.right, env)));
        }
        if (node.operator === '||') {
          if (raw(left)) return mkBool(true);
          return mkBool(!!raw(this.evaluate(node.right, env)));
        }
        throw new InterpreterError(`Unknown logical operator: ${node.operator}`, ErrorType.RUNTIME_ERROR);
      }

      // ── Unary expression ──────────────────────────────────────────────────

      case 'UnaryExpression':
        return this.evaluateUnary(node, env);

      // ── Assignment expression (returns the new value) ─────────────────────

      case 'AssignmentExpression':
        return this.executeAssignment(node.target, node.operator, node.value, env);

      // ── Cast ──────────────────────────────────────────────────────────────

      case 'CastExpression': {
        const val = this.evaluate(node.expression, env);
        const v = raw(val);
        switch (node.castType.name) {
          case 'int':     return mkInt(Math.trunc(typeof v === 'string' ? v.charCodeAt(0) : v));
          case 'double':  return mkDouble(Number(v));
          case 'char':    return mkChar(typeof v === 'number' ? String.fromCharCode(Math.trunc(v)) : String(v));
          case 'boolean': return mkBool(!!v);
          default:
            throw new InterpreterError(`Unsupported cast to type: ${node.castType.name}`, ErrorType.RUNTIME_ERROR);
        }
      }

      // ── Call expression ───────────────────────────────────────────────────

      case 'CallExpression':
        return this.evaluateCall(node, env);

      // ── NewExpression (Phase 2 — not yet implemented) ─────────────────────

      case 'NewExpression':
        throw new InterpreterError(
          `Object instantiation ('new ${node.className}()') is not yet supported — that's Milestone 2!`,
          ErrorType.RUNTIME_ERROR,
        );

      default:
        throw new InterpreterError(
          `Unknown expression node type: ${node.type}`,
          ErrorType.RUNTIME_ERROR,
        );
    }
  }

  // ── Binary operator dispatch ──────────────────────────────────────────────

  evaluateBinary(node, env) {
    const left  = this.evaluate(node.left,  env);
    const right = this.evaluate(node.right, env);
    const op    = node.operator;

    // Equality / inequality work on any type.
    if (op === '==') return mkBool(raw(left) === raw(right));
    if (op === '!=') return mkBool(raw(left) !== raw(right));

    // Comparison operators — numeric only.
    if (op === '<')  return mkBool(raw(left) <  raw(right));
    if (op === '>')  return mkBool(raw(left) >  raw(right));
    if (op === '<=') return mkBool(raw(left) <= raw(right));
    if (op === '>=') return mkBool(raw(left) >= raw(right));

    // Arithmetic — + might be string concatenation.
    if (op === '+') return this.binaryPlus(left, right);
    return this.binaryArith(op, left, right);
  }

  /**
   * Java's + operator: string concatenation if either side is a String,
   * arithmetic otherwise.
   */
  binaryPlus(left, right) {
    const isStr = (v) => isJavaValue(v) && v.javaType === 'String';
    if (isStr(left) || isStr(right)) {
      return mkString(javaToString(left) + javaToString(right));
    }
    return this.binaryArith('+', left, right);
  }

  /** Pure arithmetic — returns int if both operands are int, double otherwise. */
  binaryArith(op, left, right) {
    const lv = raw(left);
    const rv = raw(right);
    const bothInt = isJavaValue(left) && left.javaType === 'int' &&
                    isJavaValue(right) && right.javaType === 'int';

    let result;
    switch (op) {
      case '+': result = lv + rv; break;
      case '-': result = lv - rv; break;
      case '*': result = lv * rv; break;
      case '/':
        if (rv === 0) {
          if (bothInt) {
            throw new InterpreterError(
              "Runtime error: Can't divide by zero! Java throws ArithmeticException here 📖",
              ErrorType.RUNTIME_ERROR,
            );
          }
          result = lv / rv; // double division by zero → Infinity (Java behavior)
          break;
        }
        result = bothInt ? Math.trunc(lv / rv) : lv / rv;
        break;
      case '%':
        if (rv === 0) {
          throw new InterpreterError(
            "Runtime error: Can't take modulo by zero!",
            ErrorType.RUNTIME_ERROR,
          );
        }
        result = lv % rv;
        break;
      default:
        throw new InterpreterError(`Unknown arithmetic operator: ${op}`, ErrorType.RUNTIME_ERROR);
    }
    return bothInt ? mkInt(result) : mkDouble(result);
  }

  // ── Unary operator dispatch ───────────────────────────────────────────────

  evaluateUnary(node, env) {
    const { operator, operand, prefix } = node;

    // Prefix !, -,  unary +
    if (prefix) {
      if (operator === '!') {
        const val = this.evaluate(operand, env);
        return mkBool(!raw(val));
      }
      if (operator === '-') {
        const val = this.evaluate(operand, env);
        const v = raw(val);
        return isJavaValue(val) && val.javaType === 'int' ? mkInt(-v) : mkDouble(-v);
      }
      if (operator === '+') {
        return this.evaluate(operand, env);
      }
      // Prefix ++ / --
      if (operator === '++' || operator === '--') {
        const current = this.evaluate(operand, env);
        const delta = operator === '++' ? 1 : -1;
        const updated = isJavaValue(current) && current.javaType === 'int'
          ? mkInt(raw(current) + delta)
          : mkDouble(raw(current) + delta);
        this.assignToTarget(operand, updated, env);
        return updated;
      }
    }

    // Postfix ++ / --
    if (!prefix && (operator === '++' || operator === '--')) {
      const current = this.evaluate(operand, env);
      const delta = operator === '++' ? 1 : -1;
      const updated = isJavaValue(current) && current.javaType === 'int'
        ? mkInt(raw(current) + delta)
        : mkDouble(raw(current) + delta);
      this.assignToTarget(operand, updated, env);
      return current; // postfix returns the OLD value
    }

    throw new InterpreterError(`Unknown unary operator: ${operator}`, ErrorType.RUNTIME_ERROR);
  }

  /** Write a value back to an lvalue node (Identifier or ArrayAccessExpression). */
  assignToTarget(target, value, env) {
    if (target.type === 'Identifier') {
      env.set(target.name, value);
    } else if (target.type === 'ArrayAccessExpression') {
      const arr = raw(this.evaluate(target.array, env));
      const idx = raw(this.evaluate(target.index, env));
      this.boundsCheck(arr, idx);
      arr[idx] = value;
    } else {
      throw new InterpreterError(`Cannot assign to ${target.type}`, ErrorType.RUNTIME_ERROR);
    }
  }

  // ── Call expression dispatch ──────────────────────────────────────────────

  evaluateCall(node, env) {
    const { callee, args } = node;

    // ── Static dotted calls: System.out.println, Math.sqrt, String.valueOf ──
    const dottedKey = resolveMemberKey(callee);
    if (dottedKey && STD[dottedKey]) {
      const evaluatedArgs = args.map(a => this.evaluate(a, env));
      return STD[dottedKey](evaluatedArgs, this.output);
    }

    // ── System.out.println / System.out.print (via member reference) ──
    if (callee.type === 'MemberExpression') {
      const objVal = this.evaluate(callee.object, env);

      // Instance method on a string: str.length(), str.charAt(0), etc.
      if (isJavaValue(objVal) && objVal.javaType === 'String') {
        const methodKey = '.' + callee.property;
        if (STD[methodKey]) {
          const evaluatedArgs = args.map(a => this.evaluate(a, env));
          return STD[methodKey](objVal, evaluatedArgs);
        }
        throw new InterpreterError(
          `String has no method '${callee.property}()'`,
          ErrorType.RUNTIME_ERROR,
        );
      }

      // MemberRef returned by a chained MemberExpression — look up in STD.
      if (objVal?.__memberRef) {
        const recv = objVal.object;
        if (isJavaValue(recv) && recv.javaType === 'String') {
          const methodKey = '.' + objVal.property;
          if (STD[methodKey]) {
            const evaluatedArgs = args.map(a => this.evaluate(a, env));
            return STD[methodKey](recv, evaluatedArgs);
          }
        }
      }
    }

    // ── Static method call within the same class: add(a, b) ──────────────
    if (callee.type === 'Identifier') {
      const method = this.methods.get(callee.name);
      if (method) {
        return this.callMethod(method, args, env);
      }
      throw new InterpreterError(
        `Undefined method or variable: '${callee.name}'`,
        ErrorType.RUNTIME_ERROR,
      );
    }

    throw new InterpreterError(
      `Cannot call expression of type: ${callee.type}`,
      ErrorType.RUNTIME_ERROR,
    );
  }

  /** Invoke a MethodDeclaration node with the given argument expressions. */
  callMethod(method, argNodes, callerEnv) {
    const evaluatedArgs = argNodes.map(a => this.evaluate(a, callerEnv));

    if (evaluatedArgs.length !== method.params.length) {
      throw new InterpreterError(
        `Method '${method.name}' expects ${method.params.length} argument(s) but got ${evaluatedArgs.length}`,
        ErrorType.RUNTIME_ERROR,
      );
    }

    const methodEnv = new Environment(null); // static: no closure over caller
    for (let i = 0; i < method.params.length; i++) {
      methodEnv.define(method.params[i].name, evaluatedArgs[i]);
    }

    const sig = this.executeBlock(method.body, methodEnv);
    if (sig instanceof ReturnSignal) return sig.value;
    return mkVoid();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  boundsCheck(arr, idx) {
    if (!Array.isArray(arr)) {
      throw new InterpreterError('Array access on a non-array value', ErrorType.RUNTIME_ERROR);
    }
    if (idx < 0 || idx >= arr.length) {
      throw new InterpreterError(
        `Runtime error: That index is out of range! Array has ${arr.length} element(s), you tried index ${idx} 🙈`,
        ErrorType.RUNTIME_ERROR,
      );
    }
  }
}
