import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * journalStore.js
 *
 * Persistent store for the student's Journal — the collection of sticky notes
 * gathered from Phase 1 topic choices and Phase 2 click-to-pin interactions.
 *
 * Per java-chan-phase1-split-screen-update.md §2.2:
 *   - Notes are auto-collected as topics are picked in Phase 1 split-screen.
 *   - Phase 2 click-to-pin adds notes from code tokens.
 *   - Backfill: when a term is first referenced without having been chosen,
 *     its note is auto-added at that point (see backfillNote).
 *   - Java-Chan can nudge toward the Journal instead of re-explaining — this
 *     store exposes hasTerm() for that check.
 *
 * Note shape:
 *   {
 *     id: string,          — stable id from stickyNote.id or slugified term
 *     term: string,
 *     flavor: string,
 *     definition: string,
 *     visual?: string,
 *     source: 'phase1' | 'phase2' | 'backfill',
 *     lessonId: string,    — lesson where it was first added
 *   }
 */

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const useJournalStore = create(
  persist(
    (set, get) => ({
      // { [id]: NoteShape } — keyed by id so same term across lessons is one entry
      notes: {},

      /**
       * Pin a sticky note from Phase 1 topic choice.
       * No-op if a note with the same id already exists (first-write wins).
       */
      pinNote: ({ id, term, flavor, definition, visual = null }, lessonId, source = 'phase1') => {
        const stableId = id || slugify(term);
        const state = get();
        if (state.notes[stableId]) return; // already exists — don't overwrite
        set({
          notes: {
            ...state.notes,
            [stableId]: { id: stableId, term, flavor, definition, visual, source, lessonId },
          },
        });
      },

      /**
       * Backfill a note — called the first time a term is referenced
       * in later phases or lessons without having been chosen in Phase 1.
       * Same no-op guard as pinNote.
       */
      backfillNote: ({ id, term, flavor, definition, visual = null }, lessonId) => {
        const stableId = id || slugify(term);
        const state = get();
        if (state.notes[stableId]) return;
        set({
          notes: {
            ...state.notes,
            [stableId]: { id: stableId, term, flavor, definition, visual, source: 'backfill', lessonId },
          },
        });
      },

      /**
       * Pin from Phase 2 click-to-pin (code token click).
       * Uses the keyword glossary entry shape: { term, definition }.
       * Generates a flavor line automatically since Phase 2 pins don't
       * have hand-authored flavor.
       */
      pinFromCode: ({ term, definition }, lessonId) => {
        const stableId = slugify(term);
        const state = get();
        if (state.notes[stableId]) return;
        set({
          notes: {
            ...state.notes,
            [stableId]: {
              id: stableId,
              term,
              flavor: `📌 pinned from the code`,
              definition,
              visual: null,
              source: 'phase2',
              lessonId,
            },
          },
        });
      },

      /** True if a note with this id or term slug exists in the Journal. */
      hasTerm: (idOrTerm) => {
        const stableId = slugify(idOrTerm);
        return !!get().notes[stableId];
      },

      /** All notes as an array, newest first (by insertion — object key order in V8). */
      getAllNotes: () => {
        return Object.values(get().notes).reverse();
      },

      /** Notes from a specific lesson. */
      getNotesForLesson: (lessonId) => {
        return Object.values(get().notes).filter((n) => n.lessonId === lessonId);
      },

      /** Remove a single note (e.g. user deletes it from Journal UI). */
      removeNote: (id) => {
        const { [id]: _removed, ...rest } = get().notes;
        set({ notes: rest });
      },

      clearJournal: () => set({ notes: {} }),
    }),
    {
      name: 'javachan-journal', // localStorage key
    }
  )
);

export default useJournalStore;
