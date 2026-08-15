/**
 * evaluator.test.js
 *
 * Per INTERPRETER.md §"Testing Strategy": all arithmetic operators, all
 * control-flow structures, method calls, array operations, standard-library
 * methods, the timeout trigger, and each error type. Tests call run() from
 * ../index.js directly and assert on stdout — see fixtures/ for sample
 * programs (each one should also produce matching output on a real JVM).
 */

import { describe, it, expect } from 'vitest';
import { run } from '../index.js';

// ── Fixture helpers ────────────────────────────────────────────────────────

function wrap(body) {
  return `public class Main { public static void main(String[] args) { ${body} } }`;
}

function out(src, opts) {
  const { output, error } = run(src, opts);
  if (error) throw new Error(`Interpreter error: ${error}`);
  return output;
}

function err(src, opts) {
  return run(src, opts).error;
}

// ── Fixture-based tests ────────────────────────────────────────────────────

describe('Evaluator — fixture programs', () => {
  it('produces correct stdout for hello_world.java', async () => {
    const { readFile } = await import('fs/promises');
    const src = await readFile(
      new URL('./fixtures/unit1/hello_world.java', import.meta.url), 'utf8'
    );
    expect(out(src)).toBe('Hello, World!\n');
  });

  it('produces correct stdout for variables_basic.java', async () => {
    const { readFile } = await import('fs/promises');
    const src = await readFile(
      new URL('./fixtures/unit1/variables_basic.java', import.meta.url), 'utf8'
    );
    expect(out(src)).toBe('10\n3.14\ntrue\nA\nHello\n');
  });

  it('produces correct stdout for for_loop_sum.java', async () => {
    const { readFile } = await import('fs/promises');
    const src = await readFile(
      new URL('./fixtures/unit1/for_loop_sum.java', import.meta.url), 'utf8'
    );
    expect(out(src)).toBe('15\n');
  });

  it('produces correct stdout for array_access.java', async () => {
    const { readFile } = await import('fs/promises');
    const src = await readFile(
      new URL('./fixtures/unit1/array_access.java', import.meta.url), 'utf8'
    );
    expect(out(src)).toBe('10\n20\n30\n');
  });

  it('produces correct stdout for static_method.java', async () => {
    const { readFile } = await import('fs/promises');
    const src = await readFile(
      new URL('./fixtures/unit1/static_method.java', import.meta.url), 'utf8'
    );
    expect(out(src)).toBe('7\n8\n');
  });
});

// ── Arithmetic — int vs double typing ─────────────────────────────────────

describe('Evaluator — arithmetic operators', () => {
  it('basic int arithmetic', () => {
    expect(out(wrap(`
      System.out.println(3 + 4);
      System.out.println(10 - 3);
      System.out.println(6 * 7);
      System.out.println(15 / 4);
      System.out.println(17 % 5);
    `))).toBe('7\n7\n42\n3\n2\n');
  });

  it('double arithmetic preserves decimal point', () => {
    expect(out(wrap('System.out.println(1.5 + 1.5);'))).toBe('3.0\n');
    expect(out(wrap('System.out.println(7.0 / 2.0);'))).toBe('3.5\n');
  });

  it('int / int is integer division', () => {
    expect(out(wrap('System.out.println(7 / 2);'))).toBe('3\n');
  });

  it('int + double promotes to double', () => {
    expect(out(wrap('System.out.println(3 + 1.0);'))).toBe('4.0\n');
  });

  it('string + int concatenates', () => {
    expect(out(wrap('System.out.println("x=" + 5);'))).toBe('x=5\n');
  });

  it('int + string concatenates', () => {
    expect(out(wrap('System.out.println(5 + " things");'))).toBe('5 things\n');
  });

  it('compound assignment operators', () => {
    expect(out(wrap(`
      int n = 10;
      n += 5;  System.out.println(n);
      n -= 3;  System.out.println(n);
      n *= 2;  System.out.println(n);
      n /= 4;  System.out.println(n);
    `))).toBe('15\n12\n24\n6\n');
  });

  it('prefix ++ returns new value', () => {
    expect(out(wrap('int x = 5; System.out.println(++x);'))).toBe('6\n');
  });

  it('postfix ++ returns old value', () => {
    expect(out(wrap('int x = 5; System.out.println(x++); System.out.println(x);'))).toBe('5\n6\n');
  });

  it('prefix -- returns new value', () => {
    expect(out(wrap('int x = 3; System.out.println(--x);'))).toBe('2\n');
  });
});

// ── Comparison & logical operators ─────────────────────────────────────────

describe('Evaluator — comparison and logical operators', () => {
  it('comparison operators', () => {
    expect(out(wrap(`
      System.out.println(3 < 5);
      System.out.println(5 > 3);
      System.out.println(3 <= 3);
      System.out.println(4 >= 5);
      System.out.println(4 == 4);
      System.out.println(4 != 5);
    `))).toBe('true\ntrue\ntrue\nfalse\ntrue\ntrue\n');
  });

  it('logical AND short-circuits', () => {
    // Second condition never evaluated (would cause division by zero if it ran).
    const src = wrap('System.out.println(false && 1/0 == 0);');
    expect(out(src)).toBe('false\n');
  });

  it('logical OR short-circuits', () => {
    const src = wrap('System.out.println(true || 1/0 == 0);');
    expect(out(src)).toBe('true\n');
  });

  it('logical NOT', () => {
    expect(out(wrap('System.out.println(!true); System.out.println(!false);'))).toBe('false\ntrue\n');
  });
});

// ── Control flow ───────────────────────────────────────────────────────────

describe('Evaluator — control flow', () => {
  it('if / else if / else', () => {
    expect(out(wrap(`
      int x = 5;
      if (x > 10) { System.out.println("big"); }
      else if (x == 5) { System.out.println("five"); }
      else { System.out.println("other"); }
    `))).toBe('five\n');
  });

  it('switch / case / break / default', () => {
    expect(out(wrap(`
      int day = 2;
      switch (day) {
        case 1: System.out.println("Mon"); break;
        case 2: System.out.println("Tue"); break;
        case 3: System.out.println("Wed"); break;
        default: System.out.println("Other"); break;
      }
    `))).toBe('Tue\n');
  });

  it('switch default fires when no case matches', () => {
    expect(out(wrap(`
      int x = 99;
      switch (x) {
        case 1: System.out.println("one"); break;
        default: System.out.println("nope"); break;
      }
    `))).toBe('nope\n');
  });

  it('switch fall-through (no break)', () => {
    expect(out(wrap(`
      int x = 1;
      switch (x) {
        case 1: System.out.println("one");
        case 2: System.out.println("two"); break;
        case 3: System.out.println("three"); break;
      }
    `))).toBe('one\ntwo\n');
  });

  it('while loop', () => {
    expect(out(wrap(`
      int i = 0;
      while (i < 3) { System.out.println(i); i++; }
    `))).toBe('0\n1\n2\n');
  });

  it('do-while loop executes body at least once', () => {
    expect(out(wrap(`
      int i = 0;
      do { System.out.println(i); i++; } while (i < 3);
    `))).toBe('0\n1\n2\n');
  });

  it('do-while with false condition executes exactly once', () => {
    expect(out(wrap('do { System.out.println("once"); } while (false);'))).toBe('once\n');
  });

  it('break exits loop early', () => {
    expect(out(wrap(`
      for (int i = 0; i < 10; i++) {
        if (i == 3) break;
        System.out.println(i);
      }
    `))).toBe('0\n1\n2\n');
  });

  it('continue skips the current iteration', () => {
    expect(out(wrap(`
      for (int i = 0; i < 5; i++) {
        if (i == 2) continue;
        System.out.println(i);
      }
    `))).toBe('0\n1\n3\n4\n');
  });

  it('nested for loops', () => {
    expect(out(wrap(`
      for (int i = 1; i <= 2; i++) {
        for (int j = 1; j <= 2; j++) {
          System.out.println(i * j);
        }
      }
    `))).toBe('1\n2\n2\n4\n');
  });
});

// ── Arrays ─────────────────────────────────────────────────────────────────

describe('Evaluator — arrays', () => {
  it('1D array read and write', () => {
    expect(out(wrap(`
      int[] arr = new int[3];
      arr[0] = 10; arr[1] = 20; arr[2] = 30;
      System.out.println(arr[0]);
      System.out.println(arr[2]);
    `))).toBe('10\n30\n');
  });

  it('1D array default values are 0', () => {
    expect(out(wrap(`
      int[] arr = new int[3];
      System.out.println(arr[1]);
    `))).toBe('0\n');
  });

  it('array .length property', () => {
    expect(out(wrap(`
      int[] arr = new int[5];
      System.out.println(arr.length);
    `))).toBe('5\n');
  });

  it('2D array read and write', () => {
    expect(out(wrap(`
      int[][] grid = new int[2][2];
      grid[0][0] = 1; grid[0][1] = 2;
      grid[1][0] = 3; grid[1][1] = 4;
      System.out.println(grid[1][1]);
    `))).toBe('4\n');
  });

  it('iterates array with for loop', () => {
    expect(out(wrap(`
      int[] arr = new int[4];
      for (int i = 0; i < 4; i++) arr[i] = i * i;
      for (int i = 0; i < 4; i++) System.out.println(arr[i]);
    `))).toBe('0\n1\n4\n9\n');
  });
});

// ── Static methods ─────────────────────────────────────────────────────────

describe('Evaluator — static methods', () => {
  it('calls a static method and returns a value', () => {
    const src = `
      public class Main {
        static int square(int n) { return n * n; }
        public static void main(String[] args) {
          System.out.println(square(7));
        }
      }`;
    expect(out(src)).toBe('49\n');
  });

  it('recursive static method (factorial)', () => {
    const src = `
      public class Main {
        static int fact(int n) {
          if (n <= 1) return 1;
          return n * fact(n - 1);
        }
        public static void main(String[] args) {
          System.out.println(fact(5));
        }
      }`;
    expect(out(src)).toBe('120\n');
  });

  it('static method with no return (void)', () => {
    const src = `
      public class Main {
        static void greet(String name) {
          System.out.println("Hello, " + name + "!");
        }
        public static void main(String[] args) {
          greet("Java-Chan");
        }
      }`;
    expect(out(src)).toBe('Hello, Java-Chan!\n');
  });
});

// ── Standard library ────────────────────────────────────────────────────────

describe('Evaluator — standard library', () => {
  it('System.out.print does not append newline', () => {
    // print() has no newline; println() with no args emits just \n
    expect(out(wrap('System.out.print("hi"); System.out.print("!"); System.out.println();'))).toBe('hi!\n');
  });

  it('Math.sqrt', () => {
    expect(out(wrap('System.out.println(Math.sqrt(16.0));'))).toBe('4.0\n');
  });

  it('Math.abs with int', () => {
    expect(out(wrap('System.out.println(Math.abs(-5));'))).toBe('5\n');
  });

  it('Math.pow', () => {
    expect(out(wrap('System.out.println(Math.pow(2.0, 10.0));'))).toBe('1024.0\n');
  });

  it('Math.max and Math.min', () => {
    expect(out(wrap(`
      System.out.println(Math.max(3, 7));
      System.out.println(Math.min(3, 7));
    `))).toBe('7\n3\n');
  });

  it('Math.round', () => {
    expect(out(wrap('System.out.println(Math.round(3.7));'))).toBe('4\n');
  });

  it('Math.PI is approximately 3.14', () => {
    const result = out(wrap('System.out.println(Math.PI);'));
    expect(result).toContain('3.14');
  });

  it('String.length()', () => {
    expect(out(wrap('System.out.println("hello".length());'))).toBe('5\n');
  });

  it('String.charAt()', () => {
    expect(out(wrap('System.out.println("hello".charAt(1));'))).toBe('e\n');
  });

  it('String.toUpperCase() and toLowerCase()', () => {
    expect(out(wrap(`
      System.out.println("hello".toUpperCase());
      System.out.println("WORLD".toLowerCase());
    `))).toBe('HELLO\nworld\n');
  });

  it('String.substring()', () => {
    expect(out(wrap('System.out.println("hello".substring(1, 3));'))).toBe('el\n');
  });

  it('String.contains()', () => {
    expect(out(wrap('System.out.println("hello world".contains("world"));'))).toBe('true\n');
  });

  it('String + concatenation across types', () => {
    expect(out(wrap('System.out.println("n=" + 42 + " f=" + 3.14 + " b=" + true);'))).toBe('n=42 f=3.14 b=true\n');
  });
});

// ── Cast expressions ────────────────────────────────────────────────────────

describe('Evaluator — casts', () => {
  it('(int) truncates double', () => {
    expect(out(wrap('System.out.println((int) 3.99);'))).toBe('3\n');
  });

  it('(double) promotes int', () => {
    expect(out(wrap('System.out.println((double) 7 / 2);'))).toBe('3.5\n');
  });

  it('(char) from int gives character', () => {
    expect(out(wrap('System.out.println((char) 65);'))).toBe('A\n');
  });
});

// ── Timeout guard ───────────────────────────────────────────────────────────

describe('Evaluator — timeout guard', () => {
  it('times out on an infinite loop instead of hanging', () => {
    const src = wrap('while (true) {}');
    const e = err(src, { timeout: 1000 });
    expect(e).toMatch(/timed out/i);
  });
});

// ── Error surfaces ──────────────────────────────────────────────────────────

describe('Evaluator — runtime errors', () => {
  it('division by zero throws RuntimeError', () => {
    const e = err(wrap('int x = 1 / 0;'));
    expect(e).toMatch(/RuntimeError/i);
  });

  it('array out-of-bounds throws RuntimeError', () => {
    const e = err(wrap('int[] a = new int[3]; System.out.println(a[5]);'));
    expect(e).toMatch(/RuntimeError/i);
  });

  it('undefined variable throws RuntimeError', () => {
    const e = err(wrap('System.out.println(notDefined);'));
    expect(e).toBeTruthy();
  });
});
