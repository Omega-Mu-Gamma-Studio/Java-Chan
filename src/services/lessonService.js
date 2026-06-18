/**
 * lessonService.js
 * 
 * Responsible for loading lesson and unit data.
 * Phase 1: imports static JSON files.
 * Phase 2: swap fetch calls to hit the Express API instead.
 * 
 * The hook (useLesson.js) calls this service.
 * Components never import lesson data directly.
 */

// Phase 2: flip this to true
const USE_API = false;
const API_BASE = '/api'; // Phase 2 Express server base

// ---- Static JSON imports (Phase 1) ----

const UNIT_DATA = {
  1: () => import('../data/units/unit1.json'),
  2: () => import('../data/units/unit2.json'),
  3: () => import('../data/units/unit3.json'),
  4: () => import('../data/units/unit4.json'),
  5: () => import('../data/units/unit5.json'),
};

const LESSON_DATA = {
  // Unit 1 — OOP & Java Fundamentals
  '1.1':  () => import('../data/lessons/unit1/1.1.json'),
  '1.2':  () => import('../data/lessons/unit1/1.2.json'),
  '1.3':  () => import('../data/lessons/unit1/1.3.json'),
  '1.4':  () => import('../data/lessons/unit1/1.4.json'),
  '1.5':  () => import('../data/lessons/unit1/1.5.json'),
  '1.6':  () => import('../data/lessons/unit1/1.6.json'),
  '1.7':  () => import('../data/lessons/unit1/1.7.json'),
  '1.8':  () => import('../data/lessons/unit1/1.8.json'),
  '1.9':  () => import('../data/lessons/unit1/1.9.json'),
  '1.10': () => import('../data/lessons/unit1/1.10.json'),
  '1.11': () => import('../data/lessons/unit1/1.11.json'),
  '1.12': () => import('../data/lessons/unit1/1.12.json'),
  '1.13': () => import('../data/lessons/unit1/1.13.json'),
  '1.14': () => import('../data/lessons/unit1/1.14.json'),
  '1.15': () => import('../data/lessons/unit1/1.15.json'),

  // Unit 2 — OOP Deep Dive (Inheritance, Polymorphism, Interfaces)
  '2.1':  () => import('../data/lessons/unit2/2.1.json'),
  '2.2':  () => import('../data/lessons/unit2/2.2.json'),
  '2.3':  () => import('../data/lessons/unit2/2.3.json'),
  '2.4':  () => import('../data/lessons/unit2/2.4.json'),
  '2.5':  () => import('../data/lessons/unit2/2.5.json'),
  '2.6':  () => import('../data/lessons/unit2/2.6.json'),
  '2.7':  () => import('../data/lessons/unit2/2.7.json'),
  '2.8':  () => import('../data/lessons/unit2/2.8.json'),
  '2.9':  () => import('../data/lessons/unit2/2.9.json'),
  '2.10': () => import('../data/lessons/unit2/2.10.json'),
  '2.11': () => import('../data/lessons/unit2/2.11.json'),
  '2.12': () => import('../data/lessons/unit2/2.12.json'),
  '2.13': () => import('../data/lessons/unit2/2.13.json'),
  '2.14': () => import('../data/lessons/unit2/2.14.json'),
  '2.15': () => import('../data/lessons/unit2/2.15.json'),

  // Unit 3 — Exception Handling & I/O
  '3.1':  () => import('../data/lessons/unit3/3.1.json'),
  '3.2':  () => import('../data/lessons/unit3/3.2.json'),
  '3.3':  () => import('../data/lessons/unit3/3.3.json'),
  '3.4':  () => import('../data/lessons/unit3/3.4.json'),
  '3.5':  () => import('../data/lessons/unit3/3.5.json'),
  '3.6':  () => import('../data/lessons/unit3/3.6.json'),
  '3.7':  () => import('../data/lessons/unit3/3.7.json'),
  '3.8':  () => import('../data/lessons/unit3/3.8.json'),
  '3.9':  () => import('../data/lessons/unit3/3.9.json'),
  '3.10': () => import('../data/lessons/unit3/3.10.json'),
  '3.11': () => import('../data/lessons/unit3/3.11.json'),
  '3.12': () => import('../data/lessons/unit3/3.12.json'),
  '3.13': () => import('../data/lessons/unit3/3.13.json'),
  '3.14': () => import('../data/lessons/unit3/3.14.json'),
  '3.15': () => import('../data/lessons/unit3/3.15.json'),

  // Unit 4 — Collections & Threads
  '4.1':  () => import('../data/lessons/unit4/4.1.json'),
  '4.2':  () => import('../data/lessons/unit4/4.2.json'),
  '4.3':  () => import('../data/lessons/unit4/4.3.json'),
  '4.4':  () => import('../data/lessons/unit4/4.4.json'),
  '4.5':  () => import('../data/lessons/unit4/4.5.json'),
  '4.6':  () => import('../data/lessons/unit4/4.6.json'),
  '4.7':  () => import('../data/lessons/unit4/4.7.json'),
  '4.8':  () => import('../data/lessons/unit4/4.8.json'),
  '4.9':  () => import('../data/lessons/unit4/4.9.json'),
  '4.10': () => import('../data/lessons/unit4/4.10.json'),
  '4.11': () => import('../data/lessons/unit4/4.11.json'),
  '4.12': () => import('../data/lessons/unit4/4.12.json'),
  '4.13': () => import('../data/lessons/unit4/4.13.json'),
  '4.14': () => import('../data/lessons/unit4/4.14.json'),
  '4.15': () => import('../data/lessons/unit4/4.15.json'),

  // Unit 5 — JavaFX GUI
  '5.1':  () => import('../data/lessons/unit5/5.1.json'),
  '5.2':  () => import('../data/lessons/unit5/5.2.json'),
  '5.3':  () => import('../data/lessons/unit5/5.3.json'),
  '5.4':  () => import('../data/lessons/unit5/5.4.json'),
  '5.5':  () => import('../data/lessons/unit5/5.5.json'),
  '5.6':  () => import('../data/lessons/unit5/5.6.json'),
  '5.7':  () => import('../data/lessons/unit5/5.7.json'),
  '5.8':  () => import('../data/lessons/unit5/5.8.json'),
  '5.9':  () => import('../data/lessons/unit5/5.9.json'),
  '5.10': () => import('../data/lessons/unit5/5.10.json'),
  '5.11': () => import('../data/lessons/unit5/5.11.json'),
  '5.12': () => import('../data/lessons/unit5/5.12.json'),
  '5.13': () => import('../data/lessons/unit5/5.13.json'),
  '5.14': () => import('../data/lessons/unit5/5.14.json'),
  '5.15': () => import('../data/lessons/unit5/5.15.json'),
};

// ---- Loaders ----

export async function loadUnit(unitId) {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/units/${unitId}`);
    if (!res.ok) throw new Error(`Unit ${unitId} not found`);
    return res.json();
  }

  const loader = UNIT_DATA[unitId];
  if (!loader) throw new Error(`Unit ${unitId} not found`);
  const mod = await loader();
  return mod.default;
}

export async function loadLesson(lessonId) {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/lessons/${lessonId}`);
    if (!res.ok) throw new Error(`Lesson ${lessonId} not found`);
    return res.json();
  }

  const loader = LESSON_DATA[lessonId];
  if (!loader) throw new Error(`Lesson ${lessonId} not found`);
  const mod = await loader();
  return mod.default;
}

export async function loadAllUnits() {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/units`);
    if (!res.ok) throw new Error('Failed to load units');
    return res.json();
  }

  const unitIds = Object.keys(UNIT_DATA).map(Number);
  const units = await Promise.all(unitIds.map(id => loadUnit(id)));
  return units;
}