/**
 * storageService.js
 * 
 * Abstraction layer over localStorage (Phase 1) and API (Phase 2).
 * 
 * HOW THE TOGGLE WORKS:
 *   Set USE_DATABASE = true (Phase 2) and this module
 *   will route all calls to the API instead of localStorage.
 *   The rest of the codebase never needs to change.
 * 
 * NOTE: Progress state is handled by Zustand's persist middleware.
 * This service is for anything that needs manual read/write outside Zustand,
 * like settings, theme preferences, or cached lesson data.
 */

// Phase 2: flip this to true
const USE_DATABASE = false;

// ---- localStorage adapter ----
const localAdapter = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[storageService] localStorage write failed:', e);
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    // Only clear javachan-prefixed keys
    Object.keys(localStorage)
      .filter(k => k.startsWith('javachan-'))
      .forEach(k => localStorage.removeItem(k));
  },
};

// ---- API adapter (Phase 2 — stub for now) ----
const apiAdapter = {
  get: async (key) => {
    // Phase 2: GET /api/storage/:key
    console.warn('[storageService] API adapter not implemented yet');
    return null;
  },

  set: async (key, value) => {
    // Phase 2: POST /api/storage/:key
    console.warn('[storageService] API adapter not implemented yet');
  },

  remove: async (key) => {
    // Phase 2: DELETE /api/storage/:key
    console.warn('[storageService] API adapter not implemented yet');
  },

  clear: async () => {
    console.warn('[storageService] API adapter not implemented yet');
  },
};

const adapter = USE_DATABASE ? apiAdapter : localAdapter;

// ---- Public API ----
export const storageService = {
  // User settings (theme, sound on/off etc.)
  getSettings: () => adapter.get('javachan-settings') || {},
  saveSettings: (settings) => adapter.set('javachan-settings', settings),

  // Cached lesson data (optional optimization)
  getCachedLesson: (lessonId) => adapter.get(`javachan-lesson-${lessonId}`),
  cacheLesson: (lessonId, data) => adapter.set(`javachan-lesson-${lessonId}`, data),

  // Generic escape hatch
  get: (key) => adapter.get(key),
  set: (key, value) => adapter.set(key, value),
  remove: (key) => adapter.remove(key),

  // Nuclear option (dev/testing)
  clearAll: () => adapter.clear(),
};

export default storageService;
