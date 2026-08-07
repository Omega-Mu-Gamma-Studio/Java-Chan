import { motion } from 'framer-motion';
import useJournalStore from '../../store/journalStore';
import './JournalBook.css';

/**
 * JournalBook.jsx
 *
 * The Journal's primary entry point — an oversized closed book that lives
 * in the empty space directly above Java-chan, instead of a small topbar
 * icon. Clicking it opens Journal.jsx (the table-of-contents panel).
 *
 * Replaces the old .journal-btn in AppLayout's topbar per the "make the
 * journal more obvious" request — the topbar no longer has a journal
 * control at all, this is the only entry point.
 */
const JournalBook = ({ onOpen }) => {
  const noteCount = Object.keys(useJournalStore((s) => s.notes)).length;

  return (
    <motion.button
      type="button"
      className="journal-book"
      onClick={onOpen}
      aria-label={`Open journal — ${noteCount} ${noteCount === 1 ? 'note' : 'notes'} saved`}
      initial={{ opacity: 0, y: 14, rotateZ: -4 }}
      animate={{ opacity: 1, y: 0, rotateZ: -4 }}
      whileHover={{ rotateZ: -1, y: -4, scale: 1.03 }}
      whileTap={{ rotateZ: -4, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Page edges peeking out from behind the cover */}
      <span className="journal-book__pages" aria-hidden="true" />

      {/* Front cover */}
      <span className="journal-book__cover" aria-hidden="true">
        <span className="journal-book__band" />
        <span className="journal-book__emblem">📓</span>
        <span className="journal-book__title">JOURNAL</span>
        <span className="journal-book__sub">tap to open</span>
        <span className="journal-book__corner journal-book__corner--tl" />
        <span className="journal-book__corner journal-book__corner--br" />
      </span>

      {/* Bookmark ribbon showing note count */}
      {noteCount > 0 && (
        <span className="journal-book__ribbon">
          {noteCount}
        </span>
      )}
    </motion.button>
  );
};

export default JournalBook;
