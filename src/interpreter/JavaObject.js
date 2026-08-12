/**
 * JavaObject.js
 *
 * Runtime representation of a Java object — fields, its class, and the
 * prototype-chain link for `extends`/`super`. See INTERPRETER.md
 * §"Milestone 2 — The Object System" for constructors, `this`, method
 * overriding (dynamic dispatch), and `instanceof`.
 *
 * STUB — not yet implemented. Phase 2 / Milestone 2. Not needed until the
 * scripting subset (Milestone 1) is stable.
 */

export class JavaObject {
  /**
   * @param {string} className
   * @param {JavaObject|null} [parent] - instance of the superclass, if any
   */
  constructor(className, parent = null) {
    this.className = className;
    this.parent = parent;
    this.fields = new Map();
  }
}
