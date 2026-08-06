import { motion, AnimatePresence } from 'framer-motion';
import useJournalStore from '../../store/journalStore';
import './Journal.css';

/**
 * Journal.jsx
 *
 * Slide-in panel listing all sticky notes the student has accumulated,
 * from Phase 1 topic picks, Phase 2 click-to-pin, and backfills.
 *
 * Per java-chan-phase1-split-screen-update.md §2.2:
 *   - Accessible from any phase in any lesson
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
      {note.lessonId && (
        <p className="journal-note__meta">from lesson {note.lessonId}</p>
      )}
    </motion.div>
  );
};

const Journal = ({ isOpen, onClose }) => {
  const { notes, removeNote, clearJournal } = useJournalStore();
  const allNotes = Object.values(notes).reverse();

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
          <span className="journal-title">📓 Journal</span>
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
                Pick a topic in Phase 1 or click a highlighted word in the code — your notes will collect here.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {allNotes.map((note) => (
                <JournalNote key={note.id} note={note} onRemove={removeNote} />
              ))}
            </AnimatePresence>
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
