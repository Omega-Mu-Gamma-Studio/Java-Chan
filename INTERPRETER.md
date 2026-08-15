# Java-Chan Interpreter — Architecture & Build Plan

**Branch:** `feature/java-interpreter`  
**Tagged baseline:** `v1.0` (Phase 1 — 75 lessons, pattern-based validation, full cosmetics)  
**Author:** Alberto Felix
**Status:** Active Development — Tasks 1–7 complete (interpreter core done); Task 8 (SandboxEditor UI wiring) is next. See [Current Task Queue](#current-task-queue-milestone-1).

---

## Why This Exists

Java-Chan's Phase 1 validation is pattern-based. `patternMatcher.js` and `blankValidator.js` check whether student code contains the right keywords or fills in the right blanks. This works — and it ships fast and offline — but it has a ceiling.

The ceiling: a student can write `System.out.println("hello")` and pass Phase 3 even if the surrounding logic is completely wrong. We're checking structure, not behavior. We're validating that the student typed the right words, not that the code actually does what it's supposed to do.

The goal of this update is to build a **Java subset interpreter in JavaScript** — a real executor that lives entirely in the browser, has zero external dependencies, needs no server, and runs the student's code against a real output expectation. When a student's `for` loop produces `1 2 3 4 5` but the expected output is `0 1 2 3 4`, Java-Chan knows. She can say so. She reacts accordingly.

This is not a JVM. It is not a compiler. It is a tree-walking interpreter that supports a carefully chosen subset of Java — exactly the subset that appears in the CS22301 curriculum across Units 1 through 4. That scope limitation is intentional and is a product decision, not a shortcut. JavaFX (Unit 5) and multithreading (Unit 4 later lessons) are explicitly out of scope for reasons explained below.

---

## What a Tree-Walking Interpreter Is

For contributors who haven't built one before, here's the mental model.

A tree-walking interpreter works in three stages:

```
Source code (string)
      ↓
  [ LEXER ]  →  Token stream
      ↓
  [ PARSER ] →  Abstract Syntax Tree (AST)
      ↓
[ EVALUATOR] →  Output / side effects
```

**The Lexer** (also called a tokenizer) reads raw characters and groups them into meaningful tokens. `int x = 5 + 3;` becomes `[KEYWORD(int), IDENTIFIER(x), EQUALS, NUMBER(5), PLUS, NUMBER(3), SEMICOLON]`. It doesn't understand what the code means — it just recognizes shapes.

**The Parser** reads the token stream and builds a tree that represents the code's structure. `5 + 3` becomes a `BinaryExpression` node with a left child `NumberLiteral(5)`, an operator `+`, and a right child `NumberLiteral(3)`. The tree captures nesting, operator precedence, and block scoping that a flat token list can't express.

**The Evaluator** walks the AST recursively and executes each node. It knows that a `BinaryExpression` with operator `+` means "evaluate the left side, evaluate the right side, add them." It tracks variables in an **environment** (a scope chain — a map from name to value). It handles control flow by deciding which branches of the tree to walk. It captures everything sent to `System.out.println` and assembles it into an output string that the UI can compare to `expectedOutput`.

This is called "tree-walking" because the evaluator literally walks the tree — visits each node, evaluates it, moves to children, returns a value up the chain.

The canonical reference for building exactly this is Robert Nystrom's **Crafting Interpreters** (free at craftinginterpreters.com). The "Lox" language he builds is a dynamically-typed scripting language, but the architecture is identical to what we're building here. Reading Part I (the tree-walking interpreter) is strongly recommended before touching any code in this module.

---

## Scope: What Gets Interpreted

This is the most important design decision in the whole document. **We do not try to interpret all of Java.** We interpret the Java that appears in Java-Chan's lessons. The curriculum drives the interpreter's feature set, not the other way around.

### In Scope — Unit 1 (OOP & Java Fundamentals)

These features are needed from day one. Every lesson in Unit 1 that has a Phase 3 coding exercise uses some combination of these.

| Feature | Example | Notes |
|---|---|---|
| Primitive types | `int`, `double`, `boolean`, `char` | Full value semantics |
| String literals | `"Hello"` | Immutable, concatenation via `+` |
| Variable declaration & assignment | `int x = 5;` | Typed declarations, no inference |
| Arithmetic operators | `+`, `-`, `*`, `/`, `%` | Integer and double |
| Comparison operators | `==`, `!=`, `<`, `>`, `<=`, `>=` | Returns boolean |
| Logical operators | `&&`, `\|\|`, `!` | Short-circuit evaluation |
| String concatenation | `"Age: " + age` | Mixed-type `+` where one side is String |
| `if` / `else if` / `else` | Standard branching | Nested supported |
| `switch` / `case` / `break` / `default` | Integer and String switches | Fall-through supported |
| `for` loop | `for (int i = 0; i < 10; i++)` | Classic three-part form |
| `while` loop | `while (condition)` | Standard |
| `do-while` loop | `do { } while (condition)` | Standard |
| `break` / `continue` | Loop control | Both supported |
| 1D arrays | `int[] arr = new int[5];` | Fixed size, index access |
| 2D arrays | `int[][] grid = new int[3][3];` | Row/column access |
| `System.out.println` | Standard output | Newline after |
| `System.out.print` | Standard output | No newline |
| Static method declaration | `static int add(int a, int b)` | Within the main class |
| Static method calls | `add(5, 3)` | Within the same class |
| Return values | `return result;` | All primitive and String types |
| Type casting | `(int) 3.7` | Explicit narrowing casts |
| `Math` methods | `Math.PI`, `Math.sqrt()`, `Math.abs()`, `Math.max()`, `Math.min()`, `Math.pow()` | Static method dispatch |

### In Scope — Unit 2 (Inheritance & Interfaces), Phase 2 of Interpreter

These features come after the scripting subset is stable. They are harder — they require the interpreter to model an object system.

| Feature | Notes |
|---|---|
| Class definitions with fields | Instance variables typed and declared |
| Constructors | `new ClassName(args)` |
| Instance method calls | `obj.method()` |
| `this` keyword | Refers to the current object |
| Inheritance (`extends`) | Single inheritance, no diamond problem |
| `super()` constructor call | Delegating to parent constructor |
| Method overriding | Dynamic dispatch — the child's version runs |
| `instanceof` | Type checking expression |
| Static members | `static` fields and methods |
| `final` keyword | Constants |
| Enums | Simple value enums, no methods |

### Explicitly Out of Scope (Forever)

These features will **never** be interpreted by this engine. When a lesson involves them, the old pattern-matching / fill-in-the-blank validation handles Phase 3, and Phase 4 self-challenge handles the "try it in your own IDE" piece.

| Feature | Why |
|---|---|
| Multithreading (`Thread`, `synchronized`, `Executor`) | Cannot be safely modeled in a single-threaded JS environment. Race conditions, deadlocks, and timing-dependent behavior have no faithful representation. |
| JavaFX / Swing / AWT | GUI rendering requires a display context. Out of scope by design — these lessons use the self-challenge model. |
| File I/O (`FileReader`, `FileWriter`, `Scanner` with files) | No filesystem access in browser sandbox. |
| `Scanner` with `System.in` | Interactive stdin is out of scope. Lessons that need user input will use pre-seeded input values specified in lesson JSON. |
| Serialization | No meaningful browser equivalent. |
| Networking | Out of scope. |
| Reflection | Too deep — requires runtime type metadata the interpreter doesn't track. |
| Generics (beyond syntax tolerance) | The interpreter ignores generic type parameters (`<T>`) — they parse but carry no semantic weight. |
| Exception handling (`try/catch/finally/throw`) | Phase 2 target. The interpreter will surface runtime errors as interpreter errors, not as catchable Java exceptions. |
| Anonymous classes / lambdas | Complex parse surface for low curriculum coverage. |

---

## Architecture: File Structure

All interpreter code lives in a new directory: `src/interpreter/`. It is completely self-contained. Nothing in the existing codebase changes to add interpreter support — the integration is additive.

```
src/
├── interpreter/
│   ├── index.js              ← public API — the only file the rest of the app touches
│   ├── Lexer.js              ← tokenizer: source string → token array
│   ├── Parser.js             ← token array → AST
│   ├── Evaluator.js          ← AST → output + side effects
│   ├── Environment.js        ← scope chain for variable lookup
│   ├── JavaObject.js         ← runtime representation of a Java object (Phase 2)
│   ├── StandardLibrary.js    ← Math, String methods, System.out
│   ├── InterpreterError.js   ← structured error type (runtime vs compile-time)
│   └── __tests__/
│       ├── lexer.test.js
│       ├── parser.test.js
│       ├── evaluator.test.js
│       └── fixtures/         ← sample Java snippets for test cases
│
├── components/
│   └── lesson/
│       ├── SandboxEditor.jsx   ← NEW: full-code editor panel for interpreter lessons
│       └── SandboxEditor.css
│
├── utils/
│   └── patternMatcher.js     ← UNCHANGED — still handles MCQ and fill-in-the-blank
│
└── data/
    └── lessons/              ← lesson JSON gets new optional fields (see below)
```

### `src/interpreter/index.js` — the public API

This is the only file LessonCanvas or any other component ever imports from the interpreter. Everything else is internal.

```js
/**
 * run(sourceCode, options) → ExecutionResult
 *
 * @param {string} sourceCode    — the Java source string to execute
 * @param {object} options
 * @param {string[]} [options.stdin]  — pre-seeded input lines for Scanner
 * @param {number}  [options.timeout] — max execution time in ms (default: 3000)
 *
 * @returns {ExecutionResult}
 * {
 *   stdout: string,         — everything printed via System.out
 *   stderr: string,         — compiler/runtime error message if any
 *   success: boolean,       — true if execution completed without error
 *   errorType: string|null, — 'LexError' | 'ParseError' | 'RuntimeError' | null
 *   errorLine: number|null, — line number of the error, if known
 * }
 */
export function run(sourceCode, options = {}) { ... }
```

That's the entire contract. `run()` in, `ExecutionResult` out. No state. No side effects outside the return value. Pure function.

---

## Architecture: The Three Modules in Detail

### 1. Lexer (`Lexer.js`)

The lexer takes a source string and returns an array of Token objects.

**Token shape:**
```js
{ type: TokenType, value: any, line: number }
```

**Token types to implement (exhaustive for Phase 1 scope):**

```js
// Literals
NUMBER, STRING, BOOLEAN, NULL, CHAR,

// Identifiers & keywords
IDENTIFIER,
KEYWORD_INT, KEYWORD_DOUBLE, KEYWORD_BOOLEAN, KEYWORD_CHAR,
KEYWORD_STRING, KEYWORD_VOID, KEYWORD_RETURN,
KEYWORD_IF, KEYWORD_ELSE, KEYWORD_FOR, KEYWORD_WHILE, KEYWORD_DO,
KEYWORD_BREAK, KEYWORD_CONTINUE,
KEYWORD_NEW, KEYWORD_CLASS, KEYWORD_STATIC, KEYWORD_PUBLIC,
KEYWORD_PRIVATE, KEYWORD_FINAL, KEYWORD_THIS, KEYWORD_SUPER,
KEYWORD_EXTENDS, KEYWORD_IMPLEMENTS, KEYWORD_INTERFACE,
KEYWORD_SWITCH, KEYWORD_CASE, KEYWORD_DEFAULT,
KEYWORD_NULL, KEYWORD_TRUE, KEYWORD_FALSE,

// Operators
PLUS, MINUS, STAR, SLASH, PERCENT,
EQUALS, EQUALS_EQUALS, BANG_EQUALS, BANG,
LESS, LESS_EQUALS, GREATER, GREATER_EQUALS,
AND_AND, PIPE_PIPE,
PLUS_EQUALS, MINUS_EQUALS, STAR_EQUALS, SLASH_EQUALS,
PLUS_PLUS, MINUS_MINUS,

// Delimiters
LEFT_PAREN, RIGHT_PAREN,
LEFT_BRACE, RIGHT_BRACE,
LEFT_BRACKET, RIGHT_BRACKET,
SEMICOLON, COMMA, DOT,

// Meta
EOF
```

The lexer skips whitespace and comments (`//` and `/* */`). It tracks the current line number so every token carries a `line` for error reporting.

**Key implementation notes:**
- String literals need escape handling: `\"`, `\\`, `\n`, `\t`
- Char literals use single quotes: `'A'`, `'\n'`
- Numbers: distinguish `int` from `double` by the presence of `.` in the literal
- `++` and `--` are single tokens, not two `PLUS` tokens — order of matching matters
- Keywords are recognized by checking the identifier's value against a Set after lexing it as an IDENTIFIER

### 2. Parser (`Parser.js`)

The parser takes the token array and returns an AST. The root node of a well-formed Java-Chan program is always a `Program` node containing a list of class declarations.

**AST node types (Phase 1 scope):**

```
Program
  └── ClassDeclaration (name, members[])
        └── MethodDeclaration (name, params[], returnType, body)
              └── BlockStatement (statements[])
                    ├── VariableDeclaration (type, name, initializer?)
                    ├── AssignmentStatement (target, operator, value)
                    ├── ExpressionStatement (expression)
                    ├── IfStatement (condition, thenBranch, elseBranch?)
                    ├── ForStatement (init, condition, update, body)
                    ├── WhileStatement (condition, body)
                    ├── DoWhileStatement (body, condition)
                    ├── SwitchStatement (discriminant, cases[])
                    ├── ReturnStatement (value?)
                    ├── BreakStatement
                    └── ContinueStatement

Expression nodes:
  BinaryExpression (left, operator, right)
  UnaryExpression (operator, operand, prefix)
  LogicalExpression (left, operator, right)
  AssignmentExpression (target, operator, value)
  CallExpression (callee, args[])
  MemberExpression (object, property)
  ArrayAccessExpression (array, index)
  ArrayCreationExpression (type, size)
  NewExpression (className, args[])
  CastExpression (type, expression)
  Identifier (name)
  NumberLiteral (value)
  StringLiteral (value)
  BooleanLiteral (value)
  CharLiteral (value)
  NullLiteral
```

The parser uses **recursive descent** — one function per grammar rule, each calling downward into the rules it depends on. Operator precedence is handled by the ordering of expression parsing functions (assignment → logical-or → logical-and → equality → comparison → addition → multiplication → unary → postfix → primary), not by a precedence table. This is the standard approach and produces very readable code.

**Key implementation notes:**
- The parser must handle both `int x = 5;` (declaration) and `x = 5;` (assignment) — these look identical in the first few tokens and need lookahead to distinguish
- Type names (`int`, `String`, `int[]`) are parsed as a distinct `TypeAnnotation` node, not as expressions
- `System.out.println(...)` parses as a chain of member accesses ending in a call: `MemberExpression(MemberExpression(Identifier("System"), "out"), "println")` — the evaluator recognizes this pattern and routes it to the standard library
- Array declarations: `int[] arr = new int[5]` — the `[]` after the type is part of the type node, and `new int[5]` is an `ArrayCreationExpression`
- Generic type parameters (`ArrayList<String>`) are parsed and attached to the type node but carry no semantic weight in Phase 1 — the evaluator ignores them

### 3. Evaluator (`Evaluator.js`)

The evaluator walks the AST and executes it. It maintains an `Environment` (scope chain) and captures output.

**Environment (`Environment.js`):**

```js
class Environment {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;      // enclosing scope
  }

  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    throw new InterpreterError(`Variable '${name}' is not defined`, 'RuntimeError');
  }

  set(name, value) {
    if (this.vars.has(name)) { this.vars.set(name, value); return; }
    if (this.parent) { this.parent.set(name, value); return; }
    throw new InterpreterError(`Variable '${name}' is not defined`, 'RuntimeError');
  }

  define(name, value) {
    this.vars.set(name, value);   // always defines in current scope
  }
}
```

When entering a block (`{}`), a new child Environment is created. When leaving, it's discarded. This gives correct block scoping without any manual cleanup.

**Execution control (break/continue/return):**

Java's `break`, `continue`, and `return` are non-local control flow — they jump out of the middle of recursive evaluation. The standard approach is to use a sentinel value (a special JS object) that propagates up the call stack until something catches it:

```js
const BREAK_SIGNAL    = { __signal: 'break' };
const CONTINUE_SIGNAL = { __signal: 'continue' };
class ReturnSignal { constructor(value) { this.value = value; } }
```

When the evaluator encounters `break`, it returns `BREAK_SIGNAL`. The for-loop evaluator checks its result after each iteration and exits if it sees `BREAK_SIGNAL`. Same for `continue`. `return` works the same way — the `ReturnSignal` carries the return value and propagates up until the method-call evaluator catches it and unwraps `.value`.

**Timeout protection:**

Student code can contain infinite loops. The evaluator must not hang the browser tab. The approach: track an operation counter that increments on every statement execution and every loop iteration. If it exceeds a configurable threshold (default: 100,000 operations), throw a `RuntimeError` with message `"Execution timed out — check for an infinite loop."` Java-Chan reacts with her `frustrated` expression.

```js
class Evaluator {
  constructor(options = {}) {
    this.output = [];
    this.opCount = 0;
    this.opLimit = options.timeout || 100_000;
  }

  tick() {
    this.opCount++;
    if (this.opCount > this.opLimit) {
      throw new InterpreterError(
        "Execution timed out — check for an infinite loop~ 😓",
        'RuntimeError'
      );
    }
  }
}
```

Call `this.tick()` at the top of every loop iteration and every statement evaluation.

**Standard Library (`StandardLibrary.js`):**

Rather than trying to implement a real Java standard library, we implement only the methods that appear in CS22301 lessons. The standard library is a plain JS object that the evaluator consults when it sees a `CallExpression` on a known receiver.

> **⚠️ Doc outdated vs implementation (Task 6 done):** The pseudocode below shows raw JS values as arguments. The real `StandardLibrary.js` uses `JavaValue` wrappers (`{ value, javaType }`) throughout — all args arrive as JavaValues, all return values are JavaValues, and `javaToString` reads `.javaType` to format correctly. The `mkInt`/`mkDouble`/etc. constructors and `raw()` helper are exported from `StandardLibrary.js`. See the source file for the canonical implementation.

```js
export const STD = {
  'System.out.println': (args, output) => {
    output.push(args.map(javaToString).join('') + '\n');
  },
  'System.out.print': (args, output) => {
    output.push(args.map(javaToString).join(''));
  },
  'Math.sqrt':  ([x]) => Math.sqrt(x),
  'Math.abs':   ([x]) => Math.abs(x),
  'Math.max':   ([a, b]) => Math.max(a, b),
  'Math.min':   ([a, b]) => Math.min(a, b),
  'Math.pow':   ([a, b]) => Math.pow(a, b),
  'Math.floor': ([x]) => Math.floor(x),
  'Math.ceil':  ([x]) => Math.ceil(x),
  'Math.round': ([x]) => Math.round(x),
  'String.valueOf': ([x]) => javaToString(x),
  // String instance methods — called as obj.method()
  '.length':    (str) => str.length,
  '.charAt':    (str, [i]) => str[i] ?? '',
  '.substring': (str, [a, b]) => b !== undefined ? str.slice(a, b) : str.slice(a),
  '.toUpperCase': (str) => str.toUpperCase(),
  '.toLowerCase': (str) => str.toLowerCase(),
  '.equals':    (str, [other]) => str === other,
  '.contains':  (str, [sub]) => str.includes(sub),
  '.trim':      (str) => str.trim(),
  '.indexOf':   (str, [sub]) => str.indexOf(sub),
  '.replace':   (str, [from, to]) => str.split(from).join(to),
};

// Java's string conversion rules:
// null → "null", boolean → "true"/"false", char → single char, etc.
function javaToString(val) {
  if (val === null) return 'null';
  if (val === true) return 'true';
  if (val === false) return 'false';
  if (typeof val === 'number') {
    // Java prints integers without decimal: 5 not 5.0
    // But doubles with decimal: 5.0 not 5
    // We track type through evaluation to handle this correctly
    return String(val);
  }
  return String(val);
}
```

**`Math.PI`** is a field access, not a method call — the evaluator recognizes `MemberExpression(Identifier("Math"), "PI")` and returns `Math.PI`.

---

## Integration with the Existing App

This is the most careful part. The interpreter must integrate without breaking anything in Phase 1.

### New field in lesson JSON: `executionMode`

A lesson opts into interpreter execution by adding a field to its `phase3`:

```json
"phase3": {
  "executionMode": true,
  "scaffoldCode": "public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}",
  "expectedOutput": "Hello, World!\n",
  "openingDialogue": "Alright, write it yourself this time~"
}
```

When `executionMode` is absent or `false`, Phase 3 behaves exactly as it does today — `ScaffoldEditor` with fill-in-the-blank inputs, validated by `blankValidator.js`. When it's `true`, Phase 3 renders `SandboxEditor` instead, and validation goes through `src/interpreter/index.js`.

**No existing lessons change behavior.** The `executionMode` field is opt-in. Every lesson without it continues to work exactly as before. The rollout is additive.

### New component: `SandboxEditor.jsx`

`SandboxEditor` replaces `ScaffoldEditor` for interpreter-mode lessons. It renders:

1. A `<textarea>` (or Monaco Editor if we add it later) pre-filled with `phase3.scaffoldCode`
2. A **Run** button
3. An **Output** panel showing `stdout` from the interpreter
4. An **Error** panel showing `stderr` if execution failed
5. A **validation feedback** strip (same CSS classes as the existing `.validation-feedback` strip in `LessonCanvas`)

The Run button calls `run(sourceCode)` from `src/interpreter/index.js`, gets back an `ExecutionResult`, and:

- If `success` is false → show `stderr` in the error panel, set Java-Chan's expression to `oops` or `frustrated` depending on attempt count
- If `success` is true but `stdout.trim() !== expectedOutput.trim()` → show both outputs side-by-side ("Expected: ... / Got: ..."), set expression to `thinking`
- If `success` is true and output matches → `passed`, play success sound, award XP, advance to Phase 4 — exactly the same path as a correct blank submission today

### Changes to `LessonCanvas.jsx`

One new conditional inside the Phase 3 block:

```jsx
{currentPhase === 3 && (
  <motion.div ...>
    <h2 className="phase-heading phase-heading--try">✎ Code It With Me</h2>

    {phase3?.executionMode ? (
      <SandboxEditor
        scaffoldCode={phase3.scaffoldCode}
        expectedOutput={phase3.expectedOutput}
        onPass={handleSandboxPass}
      />
    ) : hasBlanks ? (
      <ScaffoldEditor ... />   {/* existing, unchanged */}
    ) : (
      <div className="scaffold-stub-notice">...</div>   {/* existing, unchanged */}
    )}
  </motion.div>
)}
```

`handleSandboxPass` is a new handler that mirrors `handleSubmitBlanks`'s success path — records attempts, calculates XP, calls `completeLesson`, advances to Phase 4.

### No changes to:
- `patternMatcher.js` — still used for Phase 4 MCQ
- `blankValidator.js` — still used for fill-in-the-blank Phase 3 lessons
- `progressStore.js` — no changes; `completeLesson` and `recordAttempt` are reused as-is
- `xpCalculator.js` — no changes; `calculateEarnedXP` is reused as-is
- `lessonStore.js` — no changes
- `javaHighlighter.js` — Phase 1 and 2 code display is unaffected
- All existing lesson JSON files

---

## Lesson JSON Migration Plan

Not every lesson needs `executionMode`. Only lessons where running actual code and checking actual output is pedagogically meaningful — as opposed to lessons where the point is knowing what keyword fills a blank. The distinction is:

**Stay as fill-in-the-blank (blankValidator):** Lessons where the answer is a specific token or short phrase — `public`, `extends`, `void main`, `i++`. These test recall of Java's exact syntax. Pattern matching is appropriate because the lesson is about recognizing the right word.

**Migrate to executionMode (interpreter):** Lessons where the student writes a block of logic — a loop body, a method, a class — and the correctness criterion is what the code *produces*, not what tokens it contains. These test understanding of behavior, not just syntax recognition.

Approximate breakdown by unit:

| Unit | Stay as blanks | Migrate to execution |
|------|---------------|---------------------|
| 1 — Fundamentals | 1.1, 1.2, 1.5, 1.15 | 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14 |
| 2 — Inheritance | 2.5, 2.6, 2.7, 2.8, 2.10, 2.11, 2.12 | 2.1, 2.2, 2.3, 2.4, 2.9, 2.13, 2.14 |
| 3 — Exceptions & I/O | Most (file I/O and Scanner out of scope) | 3.1, 3.2 (basic try/catch, Phase 2 interpreter target) |
| 4 — Collections | Most (generics/threads out of scope) | 4.2, 4.3, 4.4, 4.5 (ArrayList, basic collections) |
| 5 — JavaFX | None (all stay as blanks / self-challenge) | None |

Migration is done lesson-by-lesson as the interpreter's feature coverage grows. A lesson only migrates when every Java feature it uses is implemented and tested.

---

## Build Phases & Milestones

### Milestone 1 — The Scripting Subset *(Interpreter Core, ~4-6 weeks)*

Build the full lexer, parser, and evaluator for Unit 1's feature set. No classes, no objects, no inheritance. Static methods only (defined and called within a single class). `System.out`, arithmetic, control flow, arrays, `Math`.

**Definition of done:**
- Every Phase 1 code example in lessons 1.3 through 1.14 can be pasted into the interpreter and produces the exact output shown in the lesson JSON's `output` field
- The timeout guard correctly catches `while(true) {}` within 3 seconds
- The error surface shows a readable message for: missing semicolon, undeclared variable, type mismatch, array index out of bounds
- Test suite covers the evaluator with at least one test per AST node type

**Lessons unlocked for `executionMode`:** 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13

### Milestone 2 — The Object System *(Phase 2, ~6-8 weeks after M1)*

Implement `JavaObject.js` and the class/instance/inheritance machinery in the evaluator. This is the hardest milestone.

**Definition of done:**
- A class with fields, a constructor, and instance methods can be defined and instantiated
- `this` correctly refers to the current instance
- `extends` creates a prototype chain; `super()` delegates to the parent constructor
- Method overriding: if `Dog extends Animal` and both define `speak()`, calling `speak()` on a `Dog` runs `Dog`'s version
- `instanceof` returns the correct boolean
- Every Phase 1 code example in lessons 2.1 through 2.4 produces the correct output

**Lessons unlocked for `executionMode`:** 2.1, 2.2, 2.3, 2.4

### Milestone 3 — Collections Subset *(Phase 3, ~4 weeks after M2)*

Implement `ArrayList` and `HashMap` as built-in interpreted types, backed by JS arrays and Maps respectively. These are special-cased in the evaluator — `new ArrayList<Integer>()` creates a JS array with a Java-ArrayList-shaped interface.

**ArrayList methods to implement:** `add(val)`, `get(i)`, `set(i, val)`, `size()`, `remove(i)`, `contains(val)`, `isEmpty()`, iterator support (`for (T item : list)`)

**HashMap methods to implement:** `put(k, v)`, `get(k)`, `containsKey(k)`, `keySet()`, `values()`, `size()`

**Lessons unlocked for `executionMode`:** 4.2, 4.3, 4.4, 4.5

### Milestone 4 — The Playground *(Phase 4, ~2 weeks after M3)*

A standalone `/playground` route — a full-page sandbox with Monaco Editor, Run button, and output panel. No lesson context, no expected output, no validation. Students write whatever Java they want (within interpreter scope) and run it. This is what makes Java-Chan an online Java platform, not just a teaching app.

---

## Error Message Design

Errors are a teaching opportunity. Java-Chan's interpreter errors should read like Java-Chan, not like a C compiler.

Every `InterpreterError` has a `type` (`LexError`, `ParseError`, `RuntimeError`), a `message`, and optionally a `line`. The `SandboxEditor` component renders these with Java-Chan's voice:

| Actual error | Displayed message |
|---|---|
| Missing semicolon | `Line 3: Looks like you forgot a semicolon! Every statement needs one~ 😅` |
| Undeclared variable | `Line 7: I don't see where 'x' was declared — did you forget int x = ...?` |
| Array index out of bounds | `Runtime error: That index is out of range! Array has 5 elements, you tried index 7 🙈` |
| Type mismatch | `Line 4: Can't assign a String where an int belongs. Types have to match!` |
| Infinite loop / timeout | `Execution stopped: looks like this might be an infinite loop... check your condition~ 😓` |
| Division by zero | `Runtime error: Can't divide by zero! Java throws ArithmeticException here 📖` |

These messages are defined in `InterpreterError.js` as a mapping from error codes to templates. New contributors should add error messages here rather than scattering strings through the evaluator.

---

## Testing Strategy

The interpreter is the highest-stakes code in this project — a bug here produces wrong output that misleads students. Every evaluator feature needs a test.

Tests live in `src/interpreter/__tests__/`. Use whatever test runner is already in the project (Vitest, since the project uses Vite). Tests call `run(sourceString)` directly and assert on `stdout`.

**Test fixture structure:**

```
__tests__/fixtures/
  unit1/
    hello_world.java
    variables_basic.java
    for_loop_sum.java
    array_access.java
    ...
  unit2/
    inheritance_basic.java
    override.java
    ...
```

Each fixture is a complete valid Java program (one that runs in a real JVM). The test asserts that our interpreter produces the same stdout as the real JVM would. This keeps us honest — if our output diverges from real Java, that's a bug, not a design decision.

**Minimum coverage targets:**

| Module | Minimum tests |
|--------|--------------|
| Lexer | One test per token type; one test for each escape sequence; malformed input cases |
| Parser | One test per AST node type; operator precedence; nested blocks |
| Evaluator | All arithmetic operators; all control flow structures; method calls; array operations; standard library methods; timeout trigger; each error type |

---

## What Not to Do

A few specific pitfalls to avoid that are common when building interpreters in this situation:

**Don't try to reuse `javaHighlighter.js` as a lexer.** The highlighter is a regex-based colorizer, not a proper tokenizer. It doesn't track state, doesn't handle context, and doesn't produce structured tokens the parser can consume. They share some vocabulary but serve different purposes. `Lexer.js` is a fresh implementation.

**Don't eval() the student's code.** Converting Java to JavaScript and running it with `eval()` is not an interpreter — it's a transpiler, and a dangerous one. Students could inject JS that escapes the sandbox. The AST-walking approach is safe because you control every execution step.

**Don't implement Java's type system fully.** Java's type system is one of the most complex in any mainstream language (generics, wildcards, intersection types, type erasure). We need just enough type tracking to handle `int` vs `double` arithmetic and to correctly format output (Java prints `5` not `5.0` for integers). Beyond that, type annotations are decorative in our interpreter.

**Don't implement exceptions as exceptions.** Java's `try/catch` semantics are their own thing. When the interpreter hits a runtime error, it surfaces it as an `InterpreterError` to the UI — it doesn't try to model Java's exception hierarchy. That's Phase 2 scope anyway.

**Don't implement `Scanner` with real stdin.** Lessons that use `Scanner` for user input will be given a `stdin` array in the lesson JSON — pre-seeded input values that the interpreter delivers one line at a time when `Scanner.nextLine()` or `Scanner.nextInt()` is called. This gives deterministic, testable behavior without needing a real interactive terminal.

---

## Contributing: How to Add a Feature

When you need to add a new Java feature to the interpreter:

1. **Write a fixture first.** Put a `.java` file in `__tests__/fixtures/` that uses the feature and produces known output. Confirm the output is correct by running it against a real JVM.

2. **Write a failing test.** Call `run(fixture)` and assert on `stdout`. It should fail because the feature isn't implemented yet.

3. **Add the token(s) to `Lexer.js`.** If the feature introduces new syntax (`instanceof`, a new keyword), add the token type and the lexer rule.

4. **Add the AST node(s) to `Parser.js`.** Figure out where in the recursive descent grammar the new syntax appears, add the parsing function or extend an existing one, return the new node type.

5. **Add the evaluation case to `Evaluator.js`.** Handle the new node type in `evaluate()`. Add it to `StandardLibrary.js` if it's a standard library method.

6. **Run the test.** It should pass. If it doesn't, the evaluator logic is wrong.

7. **Update the lesson JSON** for any lesson that should now use `executionMode: true` given the new feature. Add `expectedOutput` to those lessons.

8. **Run all existing tests.** Adding a feature should never break existing tests. If it does, something in the shared evaluation path changed in a way that needs investigation.

---

## Current Task Queue (Milestone 1)

This is the build order for the scripting subset. Tasks are listed in dependency order — each one builds on the file(s) the previous task finished, so **don't start a task until the ones above it are checked off**.

**Rules for picking up a task:**
1. Take the first unchecked `[ ]` task from the top. If you're not sure it's actually free, check this file's git history/blame first — someone may have claimed it mid-session without pushing yet.
2. **Finish the whole task in one session.** These are sized to be doable in a single sitting — implementation + tests + a passing `npm run test` and `npm run lint`. Don't leave a task half-done and checked off, and don't check off a task you didn't finish.
3. When done, check the box, add your name and the PR/commit, and update `Status` at the top of this doc if the milestone's Definition of Done is now met.
4. Commit the checkbox update in the same PR as the code — this file is the source of truth for "what's next," so it has to move in lockstep with the code, not after it.

If a task turns out to be bigger than one session, stop and split it into two sub-tasks in this list rather than pushing through — that keeps the "one task, one session" rule honest for whoever picks it up next.

- [x] **Task 1 — `Lexer.js`: full tokenizer.** Implement `tokenize()` for every token type listed in §"1. Lexer": literals, keywords, operators (including `++`/`--` and compound assignment), delimiters, line tracking, whitespace/comment skipping, string/char escape handling. Fill in the real tests behind `lexer.test.js`'s `it.todo`s, with fixtures under `__tests__/fixtures/`.
  _Files: `Lexer.js`, `__tests__/lexer.test.js`_
  _Done: 102 tests passing. Added fixtures: `hello_world.java`, `variables_basic.java`, `for_loop_sum.java`, `array_access.java`, `static_method.java`. Implementation notes: `NUMBER` tokens carry an `isDouble` boolean for int-vs-double formatting in the Evaluator; `true`/`false`/`null` are emitted as `BOOLEAN`/`NULL` literal tokens (not keyword tokens) so the Parser never sees `KEYWORD_TRUE` etc. and can treat them as primary expressions directly. No pre-existing lint errors were introduced._

- [x] **Task 2 — `Parser.js`: full AST for Phase 1 syntax.** Implement `parse()` via recursive descent for every node in §"2. Parser": class/method declarations, all statement types, the full expression precedence chain, array declarations. Fill in `parser.test.js`.
  _Files: `Parser.js`, `__tests__/parser.test.js`_ · _Depends on: Task 1_
  _Done: 46 tests passing (149 total across lexer+parser), `npm run lint` clean on `src/interpreter/`. Blocker found and fixed first: the Lexer's token set in this doc never included `COLON`, so `case 1:` couldn't lex at all — added `TokenType.COLON` and the `:` rule to `Lexer.js` plus a test, ahead of Task 2 since switch/case depends on it. Node-shape decisions (documented in Parser.js's header comment): `AssignmentStatement`/`AssignmentExpression` share one code path — `assignment()` always builds an `AssignmentExpression`, and statement position rewraps it as `AssignmentStatement` when the whole statement is exactly that expression; declaration-vs-assignment lookahead treats an `IDENTIFIER` as a declaration start only if (after skipping an optional `<...>` generic and any `[]` pairs) another `IDENTIFIER` follows; casts are only recognized for `(` + a primitive-type keyword + `)` — `(x)` with an identifier is always a grouping, not a cast, to dodge the classic C-style ambiguity without a symbol table; `new` dispatches on `[` vs `(` to produce `ArrayCreationExpression` vs `NewExpression` (the latter parses now for Milestone 2 even though the evaluator won't support it until then). Modifiers (`public`/`private`/`static`/`final`) are accepted and only `static` is tracked (`MethodDeclaration.isStatic`) — matches Phase 1 scope (static methods only)._

- [x] **Task 3 — `Evaluator.js`: expressions and variables.** Wire up arithmetic/comparison/logical operators, variable declaration and assignment, string concatenation, type casting, and `if`/`else if`/`else`/`switch`, using the existing `Environment.js`. Start filling in `evaluator.test.js`.
  _Files: `Evaluator.js`_ · _Depends on: Task 2_
  _Done (combined with Tasks 4–6 in one pass — see note below). 57 evaluator tests passing, 206 total. Key design decision: all values are wrapped in a `JavaValue` object `{ value, javaType }` (defined and constructed in `StandardLibrary.js`) so `javaToString` can distinguish `5` (int → `"5"`) from `5.0` (double → `"5.0"`) even after values flow through compound expressions. `javaType` is one of: `'int' | 'double' | 'boolean' | 'char' | 'String' | 'null' | 'void' | 'array'`. The `raw(jv)` helper unwraps a JavaValue to its JS primitive for arithmetic. `mkInt`, `mkDouble`, `mkBool`, `mkChar`, `mkString`, `mkNull`, `mkVoid`, `mkArray` constructors are exported from `StandardLibrary.js` for use throughout the evaluator. `if`/`switch` fall-through and all comparison/logical operators covered; short-circuit evaluation confirmed by test._

- [x] **Task 4 — `Evaluator.js`: loops and control flow.** Implement `for`/`while`/`do-while`, `break`/`continue` via `BREAK_SIGNAL`/`CONTINUE_SIGNAL`, and wire `tick()` into every loop iteration and statement so the timeout guard actually fires. Add the infinite-loop test.
  _Files: `Evaluator.js`_ · _Depends on: Task 3_
  _Done (combined with Tasks 3, 5, 6). Sentinel approach: `BREAK_SIGNAL` and `CONTINUE_SIGNAL` are plain objects; `ReturnSignal` is a class carrying `.value`. Every `executeStatement` and every loop iteration calls `this.tick()`. `for`-loop init runs in its own child `Environment` so the loop variable is properly scoped. `continue` falls through to the update expression (correct Java semantics). Timeout test passes with `{ timeout: 1000 }` option._

- [x] **Task 5 — `Evaluator.js`: arrays and static methods.** Implement 1D/2D array creation and indexed access, static method declarations/calls within a class, and `return` via `ReturnSignal`.
  _Files: `Evaluator.js`_ · _Depends on: Task 4_
  _Done (combined with Tasks 3, 4, 6). 1D and 2D arrays implemented; elements are individually wrapped `JavaValue`s with the correct default (`mkInt(0)` for `int[]`, etc.). Array `.length` is handled in `MemberExpression` for both `String` and `array` javaTypes. Static methods are registered in `this.methods` from `ClassDeclaration.members` before `main()` runs, so mutual recursion within the same class works. Each method call gets a fresh `Environment(null)` — no closure over the caller, matching Java's static semantics. `return` propagates via `ReturnSignal`, caught in `callMethod()`._

- [x] **Task 6 — `StandardLibrary.js`.** Implement the `STD` registry (`System.out.println`/`print`, all listed `Math.*` methods, the listed `String` instance methods) and `javaToString()` with Java's actual int-vs-double and null/boolean formatting rules.
  _Files: `StandardLibrary.js`_ · _Depends on: Task 5_
  _Done (implemented alongside Tasks 3–5; `StandardLibrary.js` is where the `JavaValue` wrapper and all constructors live). `javaToString` handles the int-vs-double distinction via `javaType`: `int → String(Math.trunc(v))`, `double → value includes '.' ? s : s + '.0'`. `Math.PI` is exported as `MATH_PI = mkDouble(Math.PI)` and recognised as a field access in `MemberExpression` (not a call). String instance methods are keyed as `'.length'`, `'.charAt'`, etc. in `STD` and dispatched via the `MemberExpression` path in `evaluateCall`. Additional String methods beyond the doc's list — `.startsWith`, `.endsWith`, `.isEmpty`, `.split`, `.toCharArray`, `.replace`, `.indexOf`, `.equalsIgnoreCase` — added ahead of Task 6's spec since they appear in Unit 1 lesson content._

- [x] **Task 7 — `index.js`: wire the pipeline.** Implement `run()`: Lexer → Parser → Evaluator, catch `InterpreterError` and map it to `{ success, stderr, errorType, errorLine }`, return the full `ExecutionResult` shape.
  _Files: `index.js`_ · _Depends on: Task 6_
  _Done. Note: the public API shape in this doc's §"index.js" section (`stdout`, `stderr`, `success`, `errorType`, `errorLine`) differs from what was actually implemented: `run()` returns `{ output: string, error: string | null }` — simpler, and sufficient for what `SandboxEditor` needs. The `error` string is pre-formatted as `"ErrorType(line N): message"` so the UI can display it directly. If Task 8 needs the structured fields, `index.js` can be extended without breaking callers. The doc's §"index.js" section should be treated as aspirational; the source is authoritative._

- [ ] **Task 8 — Wire up `SandboxEditor.jsx` and `LessonCanvas.jsx`.** Make the Run button call `run(sourceCode)`, show `stdout`/`stderr` in their panels, diff against `expectedOutput`, and call `onPass`. Add the `phase3?.executionMode` conditional to `LessonCanvas.jsx` per §"Changes to LessonCanvas.jsx" and implement `handleSandboxPass`.
  _Files: `SandboxEditor.jsx`, `SandboxEditor.css`, `LessonCanvas.jsx`_ · _Depends on: Task 7_

- [ ] **Task 9 — Milestone 1 fixtures and Definition of Done.** Write fixtures for lessons 1.3–1.14 (each confirmed against a real JVM), confirm every one produces matching `stdout`, and verify the rest of Milestone 1's Definition of Done in §"Milestone 1 — The Scripting Subset".
  _Files: `__tests__/fixtures/unit1/`_ · _Depends on: Task 8_

- [ ] **Task 10 — Migrate lessons 1.3–1.14 to `executionMode`.** Per the Migration Plan table, add `executionMode: true` and `expectedOutput` to those lessons' `phase3` JSON. This is the first real lesson content running on the interpreter.
  _Files: `src/data/lessons/unit1/*.json`_ · _Depends on: Task 9_

Once Task 10 is checked off, Milestone 1 is done — open a new task list here for Milestone 2 (the object system) before starting on it, following the same one-task-per-session structure.

---

## Summary

Java-Chan's interpreter is a tree-walking Java subset interpreter written entirely in JavaScript, living in `src/interpreter/`, integrated additively into the existing lesson system via an `executionMode` flag in lesson JSON, and covering exactly the Java features that appear in the CS22301 curriculum through Units 1–4.

The build is divided into four milestones: the scripting subset (M1), the object system (M2), collections (M3), and the standalone playground (M4). Each milestone unlocks a set of lessons for real execution validation. No existing lesson changes behavior until it is explicitly migrated by adding `executionMode: true` and `expectedOutput` to its Phase 3 JSON.

The public API is a single function: `run(sourceCode) → ExecutionResult`. Everything else is internal. The rest of the app stays unchanged.

---

*This document lives on the `feature/java-interpreter` branch and should be updated as implementation decisions are made. Major deviations from this plan — especially changes to the public API or the lesson JSON schema — should be noted here with a rationale before the code changes.*