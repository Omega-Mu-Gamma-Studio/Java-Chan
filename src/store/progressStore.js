import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateLevel, xpForNextLevel } from '../utils/xpCalculator';

/**
 * progressStore.js
 * 
 * Tracks everything about the student's progress.
 * Phase 1: persists to localStorage via zustand/persist middleware.
 * Phase 2: swap the persist middleware for an API-backed adapter.
 *          The store interface stays IDENTICAL — only the persistence layer changes.
 * 
 * Shape:
 *   completedLessons: Set-like object { "1.1": true, "1.2": true, ... }
 *   xp: total XP earned
 *   level: current level (derived from XP)
 *   unlockedUnits: array of unit IDs the student can access
 *   lastVisited: last lesson ID the student was on
 */

const useProgressStore = create(
  persist(
    (set, get) => ({
      // ---- State ----
      completedLessons: {},       // { "1.1": true, ... }
      lessonAttempts: {},         // { "1.1": 3, ... } — resets on completion
      xp: 0,
      level: 1,
      unlockedUnits: [1, 2, 3, 4, 5], // All units unlocked by default
      lastVisited: null,          // lesson ID string
      rewardsCollected: [],       // array of reward IDs
      equippedWallpaper: 'wallpaper-default', // shop item id
      equippedOutfit: 'outfit-default',       // shop item id

      // ---- Actions ----

      /**
       * Call this when a student successfully completes a lesson phase 3.
       * @param {string} lessonId - e.g. "1.1"
       * @param {number} xpEarned - calculated by xpCalculator
       */
      completeLesson: (lessonId, xpEarned) => {
        const state = get();
        if (state.completedLessons[lessonId]) {
          // Already completed — allow retry but no extra XP
          return;
        }
        const newXP = state.xp + xpEarned;
        const newLevel = calculateLevel(newXP);
        set({
          completedLessons: { ...state.completedLessons, [lessonId]: true },
          xp: newXP,
          level: newLevel,
          lessonAttempts: { ...state.lessonAttempts, [lessonId]: 0 },
        });
      },

      /**
       * Increment attempt count for a lesson (used for hint/solution triggers).
       */
      recordAttempt: (lessonId) => {
        const state = get();
        const current = state.lessonAttempts[lessonId] || 0;
        set({
          lessonAttempts: { ...state.lessonAttempts, [lessonId]: current + 1 },
        });
      },

      getAttempts: (lessonId) => {
        return get().lessonAttempts[lessonId] || 0;
      },

      isCompleted: (lessonId) => {
        return !!get().completedLessons[lessonId];
      },

      setLastVisited: (lessonId) => set({ lastVisited: lessonId }),

      /**
       * Phase 2: admin calls this to unlock a unit for all students.
       * For Phase 1, call this manually in dev to test.
       */
      unlockUnit: (unitId) => {
        const state = get();
        if (!state.unlockedUnits.includes(unitId)) {
          set({ unlockedUnits: [...state.unlockedUnits, unitId] });
        }
      },

      isUnitUnlocked: (unitId) => {
        return get().unlockedUnits.includes(unitId);
      },

      collectReward: (rewardId) => {
        const state = get();
        if (!state.rewardsCollected.includes(rewardId)) {
          set({ rewardsCollected: [...state.rewardsCollected, rewardId] });
        }
      },

      hasReward: (rewardId) => {
        return get().rewardsCollected.includes(rewardId);
      },

      /**
       * Shop: equip a cosmetic. The Shop UI is responsible for only
       * letting the player equip items they've reached the level for —
       * this store just records the choice (same trust model as
       * unlockUnit above).
       */
      setWallpaper: (itemId) => set({ equippedWallpaper: itemId }),
      setOutfit: (itemId) => set({ equippedOutfit: itemId }),

      getXPToNextLevel: () => {
        const state = get();
        return xpForNextLevel(state.level) - state.xp;
      },

      getLevelProgress: () => {
        const state = get();
        const currentFloor = xpForNextLevel(state.level - 1);
        const nextCeiling = xpForNextLevel(state.level);
        const range = nextCeiling - currentFloor;
        const progress = state.xp - currentFloor;
        return Math.min(100, Math.round((progress / range) * 100));
      },

      // ---- Dev helpers (triple-click cheat in Shop) ----
      devMaxLevel: () => set({ xp: 9999, level: 10 }),
      devResetLevel: () => set({ xp: 0, level: 1 }),

      // Phase 2: reset local state after syncing with server
      _resetForMigration: () => set({
        completedLessons: {},
        lessonAttempts: {},
        xp: 0,
        level: 1,
        unlockedUnits: [1, 2, 3, 4, 5],
        lastVisited: null,
        rewardsCollected: [],
        equippedWallpaper: 'wallpaper-default',
        equippedOutfit: 'outfit-default',
      }),
    }),
    {
      name: 'javachan-progress', // localStorage key
      // Phase 2: replace this with a custom storage adapter pointing to your API
    }
  )
);

export default useProgressStore;