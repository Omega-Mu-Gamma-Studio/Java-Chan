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
// Add new unit JSONs here as you build them
const UNIT_DATA = {
  1: () => import('../data/units/unit1.json'),
  // 2: () => import('../data/units/unit2.json'),  // Phase 1 Unit 2
  // 3: () => import('../data/units/unit3.json'),
  // 4: () => import('../data/units/unit4.json'),
  // 5: () => import('../data/units/unit5.json'),
};

const LESSON_DATA = {
  // Unit 1 — add entries as you write lesson files
  '1.1': () => import('../data/lessons/unit1/1.1.json'),
  // '1.2': () => import('../data/lessons/unit1/1.2.json'),
  // ... up to 1.15

  // Unit 2 (future)
  // '2.1': () => import('../data/lessons/unit2/2.1.json'),
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
