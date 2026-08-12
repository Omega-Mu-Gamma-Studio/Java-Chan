/**
 * evaluator.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": all arithmetic operators, all
 * control-flow structures, method calls, array operations, standard-library
 * methods, the timeout trigger, and each error type. Tests call run() from
 * ../index.js directly and assert on stdout — see fixtures/ for sample
 * programs (each one should also produce matching output on a real JVM).
 */

import { describe, it } from 'vitest';

describe('Evaluator', () => {
  it.todo('produces correct stdout for hello_world.java');
  it.todo('evaluates all arithmetic operators (+ - * / %) with correct int/double typing');
  it.todo('evaluates comparison and logical operators, including short-circuiting');
  it.todo('executes for/while/do-while loops with correct break/continue');
  it.todo('reads and writes 1D and 2D array elements');
  it.todo('calls and returns from static methods');
  it.todo('routes System.out.println/print and Math.* through StandardLibrary');
  it.todo('times out on an infinite loop instead of hanging');
  it.todo('surfaces a RuntimeError for division by zero and out-of-bounds access');
});
