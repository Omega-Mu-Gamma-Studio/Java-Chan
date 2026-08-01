/**
 * keywordGlossary.js
 *
 * Reusable hover explanations for common Java keywords, types, and stock
 * library calls — shown as tooltips on any CodeBlock across every lesson.
 * Keep entries short (one sentence, plain language) — this is a hover
 * tooltip, not a documentation page.
 *
 * Lesson-specific tokens (a method unique to one lesson's example, a
 * variable name worth explaining) don't belong here — those go in that
 * lesson's own `hoverNotes` field in its JSON and override this glossary
 * for the same token (see CodeBlock.jsx).
 */
export const KEYWORD_GLOSSARY = {
  // ---- Declarations & modifiers ----
  public: 'Access modifier — this can be used from any other class.',
  private: "Access modifier — this can only be used inside its own class.",
  protected: 'Access modifier — usable in its own class and subclasses.',
  static: 'Belongs to the class itself, not to an individual object — you can call it without creating an instance.',
  final: "Can't be changed after it's set — a constant, or a class/method that can't be overridden or extended.",
  class: 'Declares a new class — a blueprint for creating objects.',
  interface: 'Declares a contract of methods a class promises to implement.',
  extends: 'Marks a class as inheriting from another class.',
  implements: 'Marks a class as fulfilling an interface\'s contract.',
  abstract: "Marks a class or method as incomplete — meant to be finished by a subclass.",
  void: "This method doesn't return a value.",
  new: 'Creates a new instance of a class — allocates the object.',
  return: 'Sends a value back to whatever called this method, and ends it.',
  this: 'Refers to the current object — the instance this code is running on.',
  super: "Refers to the parent class — used to call its constructor or methods.",

  // ---- Control flow ----
  if: 'Runs the block below only if the condition is true.',
  else: "Runs when the matching if's condition was false.",
  for: 'Repeats a block a set number of times, tracked by a counter.',
  while: 'Repeats a block as long as the condition stays true.',
  do: 'Like while, but always runs the block at least once before checking.',
  switch: 'Picks one of several branches to run, based on a value.',
  case: 'One branch inside a switch statement.',
  break: 'Exits the current loop or switch immediately.',
  continue: 'Skips the rest of this loop iteration and jumps to the next one.',
  try: 'Marks a block where an error (exception) might happen.',
  catch: 'Handles an error thrown inside the matching try block.',
  finally: 'Always runs after try/catch, whether or not an error happened.',
  throw: 'Manually raises an exception.',
  throws: 'Declares that a method might raise a given exception.',

  // ---- Primitive types ----
  int: 'A whole number (no decimal point).',
  long: 'A whole number with a much bigger range than int.',
  short: 'A whole number with a smaller range than int.',
  byte: 'A very small whole number — one byte of memory.',
  double: 'A decimal number with high precision.',
  float: 'A decimal number with less precision than double.',
  boolean: 'A value that\'s either true or false.',
  char: 'A single character, like \'a\' or \'7\'.',

  // ---- Common reference types ----
  String: 'A sequence of characters — text — in Java.',
  Integer: 'The object wrapper for int — used when a primitive can\'t be, like in a List.',
  Boolean: 'The object wrapper for boolean.',
  ArrayList: 'A resizable list — grows as you add elements, unlike a plain array.',
  HashMap: 'A key-value lookup table — fast retrieval by key.',
  Scanner: 'Reads input — often used to grab what the user types in the console.',

  // ---- Stock method calls students see constantly ----
  println: 'Prints text to the console, followed by a new line.',
  print: 'Prints text to the console without moving to a new line.',
  length: 'The number of elements (for arrays) or characters (for a String).',
  nextLine: "Reads one full line of console input as a String.",
  nextInt: 'Reads the next console input as an int.',
  equals: "Checks whether two objects' values are equal (not just the same object in memory).",
  toString: 'Converts an object into a readable String.',
};
