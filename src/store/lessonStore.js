import { create } from 'zustand';

/**
 * lessonStore.js
 * 
 * Tracks transient (in-session) lesson state.
 * NOT persisted — this resets when the user navigates away.
 * 
 * Separate from progressStore intentionally:
 *   - progressStore = what the student has done (persistent)
 *   - lessonStore   = what's happening right now (ephemeral)
 */

const useLessonStore = create((set, get) => ({
  // ---- State ----
  currentLesson: null,        // full lesson JSON object
  currentPhase: 1,            // 1 | 2 | 3
  userCode: '',               // student's current code input
  lastValidationResult: null, // { passed: bool, message: string }
  javaChanExpression: 'idle', // 'idle' | 'happy' | 'sad' | 'thinking' | 'surprised' | 'domain'
  currentDialogue: null,      // string currently shown in dialogue bubble
  dialogueQueue: [],          // queued dialogue lines

  // ---- Actions ----

  loadLesson: (lessonData) => set({
    currentLesson: lessonData,
    currentPhase: 1,
    userCode: '',
    lastValidationResult: null,
    javaChanExpression: 'idle',
    currentDialogue: lessonData?.phase1?.openingDialogue || null,
    dialogueQueue: [],
  }),

  setPhase: (phase) => set({
    currentPhase: phase,
    userCode: '',
    lastValidationResult: null,
  }),

  setUserCode: (code) => set({ userCode: code }),

  setValidationResult: (result) => set({ lastValidationResult: result }),

  setExpression: (expression) => set({ javaChanExpression: expression }),

  setDialogue: (text) => set({ currentDialogue: text }),

  /**
   * Queue multiple dialogue lines, show them one by one.
   * Call advanceDialogue() to move to next.
   */
  queueDialogue: (lines) => {
    if (!lines || lines.length === 0) return;
    set({
      currentDialogue: lines[0],
      dialogueQueue: lines.slice(1),
    });
  },

  advanceDialogue: () => {
    const { dialogueQueue } = get();
    if (dialogueQueue.length === 0) {
      set({ currentDialogue: null });
    } else {
      set({
        currentDialogue: dialogueQueue[0],
        dialogueQueue: dialogueQueue.slice(1),
      });
    }
  },

  clearLesson: () => set({
    currentLesson: null,
    currentPhase: 1,
    userCode: '',
    lastValidationResult: null,
    javaChanExpression: 'idle',
    currentDialogue: null,
    dialogueQueue: [],
  }),
}));

export default useLessonStore;
