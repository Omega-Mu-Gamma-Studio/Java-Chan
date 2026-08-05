import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmphasisText from './EmphasisText';
import './Phase1SplitScreen.css';

/**
 * Phase1SplitScreen.jsx
 *
 * Implements the split-screen Phase 1 layout described in
 * java-chan-phase1-split-screen-update.md:
 *
 *   Left  — Dialogue beats. Java-Chan teaches in short, interactive beats.
 *            She asks the student what to cover next (student-directed order).
 *   Right — Sticky Notes. Each [[term:]] moment spawns a citable note on the
 *            right panel that persists for the session (Journal groundwork).
 *
 * Expects phase1 to have the new `topics` shape:
 *   phase1.intro          — opening beat text (string)
 *   phase1.topics[]       — array of topic objects:
 *     .id                 — stable string id
 *     .buttonText         — what the student clicks to choose this topic
 *     .dialogue[]         — array of short beat strings (EmphasisText markup ok)
 *     .stickyNote         — { term, flavor, definition, visual? }
 *
 * Falls back gracefully: if phase1.topics is absent or empty, renders null
 * so LessonCanvas can fall back to the old single-paragraph explanation.
 */

const StickyNote = ({ note, index }) => (
  <motion.div
    className="sticky-note"
    initial={{ opacity: 0, y: 16, rotate: (index % 2 === 0 ? -1.5 : 1.5) }}
    animate={{ opacity: 1, y: 0, rotate: (index % 2 === 0 ? -1.5 : 1.5) }}
    transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
    layout
  >
    <p className="sticky-note__flavor">{note.flavor}</p>
    <p className="sticky-note__term">{note.term}</p>
    <p className="sticky-note__definition">{note.definition}</p>
    {note.visual && (
      <div className="sticky-note__visual">{note.visual}</div>
    )}
  </motion.div>
);

const DialogueBeat = ({ text }) => (
  <motion.div
    className="dialogue-beat"
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    <EmphasisText text={text} />
  </motion.div>
);

const Phase1SplitScreen = ({ phase1, onDone }) => {
  const topics = phase1?.topics;
  if (!topics?.length) return null;

  const [activeBeats, setActiveBeats] = useState([
    { type: 'intro', text: phase1.intro },
  ]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [remainingTopics, setRemainingTopics] = useState(topics);
  const [done, setDone] = useState(false);

  const pickTopic = (topic) => {
    // Add dialogue beats for this topic
    const newBeats = topic.dialogue.map((text) => ({ type: 'beat', text }));

    // Add the "what next?" prompt if there are more topics left after this one
    const remaining = remainingTopics.filter((t) => t.id !== topic.id);

    setActiveBeats((prev) => [...prev, ...newBeats]);
    setPinnedNotes((prev) => [...prev, topic.stickyNote]);
    setRemainingTopics(remaining);

    if (remaining.length === 0) {
      setDone(true);
    }
  };

  return (
    <div className="phase1-split">
      {/* ---- Left: Dialogue panel ---- */}
      <div className="phase1-split__dialogue">
        <div className="dialogue-stream">
          <AnimatePresence initial={false}>
            {activeBeats.map((beat, i) => (
              <DialogueBeat key={i} text={beat.text} />
            ))}
          </AnimatePresence>
        </div>

        {/* Topic picker — student chooses what to learn next */}
        {!done && remainingTopics.length > 0 && (
          <motion.div
            className="topic-picker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="topic-picker__prompt">
              {remainingTopics.length === topics.length
                ? "Where do you want to start?"
                : remainingTopics.length === 1
                ? "One topic left — want to cover it?"
                : "What should we cover next?"}
            </p>
            <div className="topic-picker__options">
              {remainingTopics.map((topic) => (
                <motion.button
                  key={topic.id}
                  className="topic-btn"
                  onClick={() => pickTopic(topic)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  {topic.buttonText}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div
            className="phase1-done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="phase1-done__message">
              You've got all the pieces — and they're all pinned on the right when you need them. Ready to see some real code?
            </p>
            <button className="btn btn-primary" onClick={onDone}>
              Next: See the Code →
            </button>
          </motion.div>
        )}
      </div>

      {/* ---- Right: Sticky notes panel ---- */}
      <div className="phase1-split__notes">
        <div className="notes-panel">
          <p className="notes-panel__heading">
            {pinnedNotes.length === 0
              ? "Notes will appear here as we talk~"
              : "Your notes"}
          </p>

          <AnimatePresence>
            {pinnedNotes.length === 0 && (
              <motion.div
                className="notes-panel__empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="notes-panel__empty-icon">📌</span>
                <p>Pick a topic and your first sticky note will land here.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="notes-stack">
            <AnimatePresence>
              {pinnedNotes.map((note, i) => (
                <StickyNote key={note.term} note={note} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase1SplitScreen;