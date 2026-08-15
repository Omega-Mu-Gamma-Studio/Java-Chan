/**
 * StandardLibrary.js
 *
 * System.out, Math, and String instance methods that appear in CS22301
 * lessons. See INTERPRETER.md §"Standard Library" for the full method list
 * and javaToString conversion rules.
 *
 * Task 3 — javaToString + System.out + Math stubs needed by the Evaluator.
 * Remaining String instance methods are also included here so Task 6 is
 * already handled when the evaluator dispatches to them.
 *
 * JavaValue shape (decided in Task 3):
 *   { value: <JS primitive>, javaType: 'int'|'double'|'boolean'|'char'|'String'|'null'|'array' }
 *
 * The evaluator wraps every value in this shape so that javaToString can
 * distinguish  5 (int → "5") from 5.0 (double → "5.0") without losing the
 * information as values pass through compound expressions.
 */

/**
 * Java's string-conversion rules for System.out and + concatenation.
 * Accepts a JavaValue wrapper OR a raw JS value (for internal calls).
 * @param {any} jv
 * @returns {string}
 */
export function javaToString(jv) {
  // Accept both wrapped JavaValues and raw JS values for flexibility.
  if (jv !== null && typeof jv === 'object' && 'javaType' in jv) {
    const { value, javaType } = jv;
    if (javaType === 'null' || value === null) return 'null';
    if (javaType === 'boolean') return value ? 'true' : 'false';
    if (javaType === 'char') return String(value);
    if (javaType === 'int') return String(Math.trunc(value));
    if (javaType === 'double') {
      // Java prints "5.0" not "5" for doubles — must include decimal point.
      if (!isFinite(value)) return String(value); // Infinity / NaN
      const s = String(value);
      return s.includes('.') ? s : s + '.0';
    }
    if (javaType === 'String') return value === null ? 'null' : String(value);
    if (javaType === 'array') return String(value); // arrays print as reference in real Java
    return String(value);
  }
  // Fallback for raw JS values (shouldn't normally arrive here).
  if (jv === null || jv === undefined) return 'null';
  if (typeof jv === 'boolean') return jv ? 'true' : 'false';
  return String(jv);
}

/**
 * Registry of standard-library callables.
 *
 * Keys:
 *   'System.out.println' / 'System.out.print'  — receiver is the output array
 *   'Math.sqrt' etc.                            — pure functions, return JavaValue
 *   'Math.PI'                                   — field, not a method (handled in Evaluator)
 *   '.length' / '.charAt' etc.                  — String instance methods; called as
 *                                                  STD[key](receiverJV, argsArray)
 *
 * All entries receive and return JavaValue wrappers. The evaluator is
 * responsible for unwrapping args before passing to pure JS Math calls and
 * re-wrapping the return value.
 */
export const STD = {
  // ── System.out ────────────────────────────────────────────────────────────
  'System.out.println': (args, output) => {
    const str = args.length === 0 ? '' : args.map(javaToString).join('');
    output.push(str + '\n');
    return mkVoid();
  },
  'System.out.print': (args, output) => {
    const str = args.map(javaToString).join('');
    output.push(str);
    return mkVoid();
  },

  // ── Math methods ──────────────────────────────────────────────────────────
  // These receive JavaValue args; return a JavaValue (double unless noted).
  'Math.sqrt':  ([x]) => mkDouble(Math.sqrt(raw(x))),
  'Math.abs':   ([x]) => {
    const v = raw(x);
    return x?.javaType === 'int' ? mkInt(Math.abs(v)) : mkDouble(Math.abs(v));
  },
  'Math.max':   ([a, b]) => {
    const av = raw(a), bv = raw(b);
    const useInt = a?.javaType === 'int' && b?.javaType === 'int';
    return useInt ? mkInt(Math.max(av, bv)) : mkDouble(Math.max(av, bv));
  },
  'Math.min':   ([a, b]) => {
    const av = raw(a), bv = raw(b);
    const useInt = a?.javaType === 'int' && b?.javaType === 'int';
    return useInt ? mkInt(Math.min(av, bv)) : mkDouble(Math.min(av, bv));
  },
  'Math.pow':   ([a, b]) => mkDouble(Math.pow(raw(a), raw(b))),
  'Math.floor': ([x]) => mkDouble(Math.floor(raw(x))),
  'Math.ceil':  ([x]) => mkDouble(Math.ceil(raw(x))),
  'Math.round': ([x]) => mkInt(Math.round(raw(x))),

  // ── String.valueOf ────────────────────────────────────────────────────────
  'String.valueOf': ([x]) => mkString(javaToString(x)),

  // ── String instance methods (receiver = JavaValue{javaType:'String'}) ─────
  // Called as STD['.method'](receiverJV, argsArray) from the Evaluator.
  '.length':      (recv) => mkInt(raw(recv).length),
  '.charAt':      (recv, [i]) => mkChar(raw(recv)[raw(i)] ?? ''),
  '.substring':   (recv, args) => {
    const s = raw(recv);
    const a = raw(args[0]);
    const b = args[1] !== undefined ? raw(args[1]) : undefined;
    return mkString(b !== undefined ? s.slice(a, b) : s.slice(a));
  },
  '.toUpperCase': (recv) => mkString(raw(recv).toUpperCase()),
  '.toLowerCase': (recv) => mkString(raw(recv).toLowerCase()),
  '.equals':      (recv, [other]) => mkBool(raw(recv) === raw(other)),
  '.equalsIgnoreCase': (recv, [other]) => mkBool(raw(recv).toLowerCase() === raw(other).toLowerCase()),
  '.contains':    (recv, [sub]) => mkBool(raw(recv).includes(raw(sub))),
  '.trim':        (recv) => mkString(raw(recv).trim()),
  '.indexOf':     (recv, [sub]) => mkInt(raw(recv).indexOf(raw(sub))),
  '.replace':     (recv, [from, to]) => mkString(raw(recv).split(raw(from)).join(raw(to))),
  '.startsWith':  (recv, [prefix]) => mkBool(raw(recv).startsWith(raw(prefix))),
  '.endsWith':    (recv, [suffix]) => mkBool(raw(recv).endsWith(raw(suffix))),
  '.isEmpty':     (recv) => mkBool(raw(recv).length === 0),
  '.split':       (recv, [sep]) => {
    const parts = raw(recv).split(raw(sep));
    // Return a JavaValue array of JavaValue strings.
    return mkArray(parts.map(mkString));
  },
  '.toCharArray': (recv) => mkArray([...raw(recv)].map(mkChar)),
};

// ── JavaValue constructors (exported for Evaluator use) ───────────────────

export function mkInt(v)    { return { value: Math.trunc(v), javaType: 'int' }; }
export function mkDouble(v) { return { value: v,             javaType: 'double' }; }
export function mkBool(v)   { return { value: !!v,           javaType: 'boolean' }; }
export function mkChar(v)   { return { value: String(v),     javaType: 'char' }; }
export function mkString(v) { return { value: v,             javaType: 'String' }; }
export function mkNull()    { return { value: null,          javaType: 'null' }; }
export function mkVoid()    { return { value: undefined,     javaType: 'void' }; }
export function mkArray(elements) { return { value: elements, javaType: 'array' }; }

/** Unwrap a JavaValue to its raw JS primitive. Passes through non-wrapped values. */
export function raw(jv) {
  if (jv !== null && typeof jv === 'object' && 'javaType' in jv) return jv.value;
  return jv;
}

/** Math.PI — a constant field, not a method. */
export const MATH_PI = mkDouble(Math.PI);
