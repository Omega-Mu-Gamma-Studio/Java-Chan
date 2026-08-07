import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useJournalStore from '../../store/journalStore';
import { getLessonTitle, getUnitTitle, unitOf } from '../../data/lessonTitles';
import './Journal.css';

/**
 * Journal.jsx
 *
 * Opens as a book: a Table of Contents grouped by unit/lesson, so notes
 * are found by *where they came from* instead of one long undifferentiated
 * list. Picking a lesson turns to that lesson's page of notes; a back
 * button returns to the Contents.
 *
 * Per java-chan-phase1-split-screen-update.md §2.2:
 *   - Accessible from any phase in any lesson (now via the JournalBook
 *     widget above Java-chan, rather than a topbar icon)
 *   - Two-line cap per entry: flavor line + plain definition
 *   - Source badge distinguishes phase1 / phase2 / backfill origins
 */

const SOURCE_LABELS = {
  phase1: { label: 'Learn', color: 'var(--color-pink)' },
  phase2: { label: 'Code',  color: 'var(--color-blue)' },
  backfill: { label: 'Auto', color: 'var(--color-text-muted)' },
};

const JournalNote = ({ note, onRemove }) => {
  const src = SOURCE_LABELS[note.source] || SOURCE_LABELS.backfill;

  return (
    <motion.div
      className="journal-note"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      <div className="journal-note__header">
        <span className="journal-note__term">{note.term}</span>
        <span
          className="journal-note__source"
          style={{ color: src.color }}
        >
          {src.label}
        </span>
        <button
          className="journal-note__remove"
          onClick={() => onRemove(note.id)}
          aria-label={`Remove note for ${note.term}`}
          title="Remove"
        >
          ✕
        </button>
      </div>
      <p className="journal-note__flavor">{note.flavor}</p>
      <p className="journal-note__definition">{note.definition}</p>
    </motion.div>
  );
};

// Sort '1.1', '1.10', '1.2' the way a human reading a table of contents
// would expect (numerically on both sides of the dot, not lexically).
const byLessonId = (a, b) => {
  const [ua, na] = a.split('.').map(Number);
  const [ub, nb] = b.split('.').map(Number);
  return ua - ub || na - nb;
};

const Journal = ({ isOpen, onClose }) => {
  const { notes, removeNote, clearJournal } = useJournalStore();
  const [openLesson, setOpenLesson] = useState(null); // null = show Contents

  // Always land on the Contents page when the journal is (re)opened.
  // Adjusting state during render (rather than in an effect) per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setOpenLesson(null);
  }

  const allNotes = Object.values(notes);

  // Group notes by lesson, then bucket lesson ids by unit for the Contents.
  const { notesByLesson, unitGroups, unsorted } = useMemo(() => {
    const byLesson = {};
    const stray = [];
    for (const note of allNotes) {
      if (!note.lessonId) {
        stray.push(note);
        continue;
      }
      (byLesson[note.lessonId] ||= []).push(note);
    }
    const lessonIds = Object.keys(byLesson).sort(byLessonId);
    const groups = {};
    for (const lid of lessonIds) {
      const u = unitOf(lid);
      (groups[u] ||= []).push(lid);
    }
    return { notesByLesson: byLesson, unitGroups: groups, unsorted: stray };
  }, [allNotes]);

  const activeNotes = openLesson === 'unsorted'
    ? unsorted
    : (notesByLesson[openLesson] || []);

  const activeHeading = openLesson === 'unsorted'
    ? 'Other Notes'
    : openLesson
      ? `${openLesson} · ${getLessonTitle(openLesson)}`
      : null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="journal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside
        className={`journal-panel ${isOpen ? 'journal-panel--open' : ''}`}
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <div className="journal-header">
          {openLesson ? (
            <button
              className="journal-back"
              onClick={() => setOpenLesson(null)}
              aria-label="Back to table of contents"
            >
              ← Contents
            </button>
          ) : (
            <span className="journal-title">📓 Journal</span>
          )}
          <span className="journal-count">
            {allNotes.length} {allNotes.length === 1 ? 'note' : 'notes'}
          </span>
          <button
            className="journal-close"
            onClick={onClose}
            aria-label="Close journal"
          >
            ✕
          </button>
        </div>

        <div className="journal-body">
          {allNotes.length === 0 ? (
            <div className="journal-empty">
              <span className="journal-empty__icon">📌</span>
              <p>No notes yet.</p>
              <p className="journal-empty__sub">
                Pick a topic in Phase 1 or click a highlighted word in the code — your notes will collect here, organized by lesson.
              </p>
            </div>
          ) : openLesson === null ? (
            /* ---- Table of Contents ---- */
            <div className="journal-toc">
              <h2 className="journal-toc__heading">Table of Contents</h2>
              {[1, 2, 3, 4, 5].map((u) => {
                const lids = unitGroups[u];
                if (!lids || lids.length === 0) return null;
                return (
                  <div className="journal-toc__unit" key={u}>
                    <h3 className="journal-toc__unit-title">
                      Unit {u} <span>· {getUnitTitle(u)}</span>
                    </h3>
                    {lids.map((lid) => (
                      <button
                        key={lid}
                        className="journal-toc__row"
                        onClick={() => setOpenLesson(lid)}
                      >
                        <span className="journal-toc__id">{lid}</span>
                        <span className="journal-toc__lesson-title">
                          {getLessonTitle(lid)}
                        </span>
                        <span className="journal-toc__dots" />
                        <span className="journal-toc__count">
                          {notesByLesson[lid].length}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}

              {unsorted.length > 0 && (
                <div className="journal-toc__unit">
                  <h3 className="journal-toc__unit-title">Other</h3>
                  <button
                    className="journal-toc__row"
                    onClick={() => setOpenLesson('unsorted')}
                  >
                    <span className="journal-toc__lesson-title">
                      Notes without a lesson
                    </span>
                    <span className="journal-toc__dots" />
                    <span className="journal-toc__count">{unsorted.length}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ---- Single lesson's page of notes ---- */
            <div className="journal-page">
              <h2 className="journal-page__heading">{activeHeading}</h2>
              <AnimatePresence mode="popLayout">
                {activeNotes.map((note) => (
                  <JournalNote key={note.id} note={note} onRemove={removeNote} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {allNotes.length > 0 && (
          <div className="journal-footer">
            <button
              className="journal-clear-btn"
              onClick={() => {
                if (window.confirm('Clear all journal notes?')) clearJournal();
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Journal;
