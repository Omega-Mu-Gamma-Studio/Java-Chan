import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLessonStore from '../../store/lessonStore';
import useProgressStore from '../../store/progressStore';
import { validateCode } from '../../utils/patternMatcher';
import { checkAllBlanks } from '../../utils/blankValidator';
import { calculateEarnedXP } from '../../utils/xpCalculator';
import { useSound } from '../../hooks/useSound';
import CodeBlock from './CodeBlock';
import EmphasisText from './EmphasisText';
import Phase1SplitScreen from './Phase1SplitScreen';
import ScaffoldEditor from './ScaffoldEditor';
import PhaseIndicator from './PhaseIndicator';
import useJournalStore from '../../store/journalStore';
import './LessonCanvas.css';

const HINT_THRESHOLD     = 2;  // show hint after N wrong attempts
const SOLUTION_THRESHOLD = 5;  // show solution after N wrong attempts

const LessonCanvas = ({ onComplete }) => {
  const {
    currentLesson,
    currentPhase, setPhase,
    userCode, setUserCode,
    userBlanks, setBlankAnswer,
    setExpression, setDialogue, queueDialogue,
  } = useLessonStore();

  const {
    completeLesson, recordAttempt, getAttempts,
    toggleSelfChallenge, isSelfChallengeCompleted,
  } = useProgressStore();
  const { play } = useSound();
  const { backfillNote } = useJournalStore();

  const [showSolution, setShowSolution] = useState(false);
  const [showFix, setShowFix] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSolution, setUsedSolution] = useState(false);
  const [wrongBlankIds, setWrongBlankIds] = useState([]);
  const [blanksMessage, setBlanksMessage] = useState(null); // Phase 3 feedback
  const [mcqResult, setMcqResult] = useState(null);          // Phase 4 MCQ feedback

  if (!currentLesson) return null;

  const { phase1, phase2, phase3, phase4, phase5, id: lessonId, xpReward = 10, hoverNotes = {} } = currentLesson;
  const attempts = getAttempts(lessonId);
  const selfChallengeDone = isSelfChallengeCompleted(lessonId);
  const hasBlanks = !!(phase3?.scaffoldCode && phase3?.blanks?.length > 0);

  const handlePhaseChange = (phase) => {
    setPhase(phase);
    setWrongBlankIds([]);
    setBlanksMessage(null);
    setShowSolution(false);
    setShowFix(false);
    setUsedHint(false);
    setUsedSolution(false);

    // Backfill any Phase 1 topics the student skipped (§2.2 backfill rule).
    // Runs every time we advance past Phase 1 so the Journal is never left
    // with holes — the no-op guard in backfillNote prevents duplicates.
    if (phase > 1 && phase1?.topics?.length) {
      phase1.topics.forEach((topic) => {
        backfillNote({ id: topic.id, ...topic.stickyNote }, lessonId, 'backfill');
      });
    }

    if (phase === 1) {
      setExpression('idle');          // teaching.png — hands out, explaining
      setDialogue(phase1?.openingDialogue || null);
    } else if (phase === 2) {
      setExpression('happy');         // oops.png — "watch me break this on purpose~"
      setDialogue(phase2?.openingDialogue || "Now watch what happens when something goes wrong~");
    } else if (phase === 3) {
      setExpression('surprised');     // excited.png — "your turn, let's GO"
      setDialogue(phase3?.openingDialogue || "Your turn! Give it a shot ✎");
    } else if (phase === 4) {
      setExpression('thinking');      // thinking.png — "let's see what you remember"
      setMcqResult(null);
      setDialogue(phase4?.openingDialogue || "Quick challenge before we move on~ ❓");
    } else if (phase === 5) {
      setExpression('domain');        // sparkle expression — pure fun, no pressure
      setDialogue(phase5?.openingDialogue || "One more thing before you go... ✨");
    }
  };

  // Phase 3's grading logic — fill-in-the-blank, plain equality per §4.2.
  // No regex here anymore; that's fully retired from Phase 3.
  const handleSubmitBlanks = () => {
    if (!hasBlanks) return;

    recordAttempt(lessonId);
    const currentAttempts = attempts + 1;
    const { allCorrect, results } = checkAllBlanks(userBlanks, phase3.blanks);
    const wrongIds = phase3.blanks.filter((b) => !results[b.id]).map((b) => b.id);
    setWrongBlankIds(wrongIds);

    if (allCorrect) {
      play('success');
      setBlanksMessage({ passed: true, message: "Perfect~! ✨" });
      const xpEarned = calculateEarnedXP({
        baseXP: xpReward,
        attempts: currentAttempts,
        usedHint,
        usedSolution,
      });
      completeLesson(lessonId, xpEarned);
      setExpression('domain');
      queueDialogue([
        "You got it~! ✨",
        `+${xpEarned} XP earned!`,
      ]);
      setTimeout(() => {
        setExpression('happy');
        handlePhaseChange(4); // Phase 3 feeds into Phase 4, not straight to lesson-complete
      }, 3000);
    } else {
      play('error');
      setBlanksMessage({
        passed: false,
        message: wrongIds.length === 1
          ? "One of these isn't quite right — take another look! 🔍"
          : "A few of these aren't quite right yet — take another look! 🔍",
      });

      if (currentAttempts >= SOLUTION_THRESHOLD && !showSolution) {
        // Attempt 5+: full frustration, reveal correct answers
        setExpression('sad');          // frustrated.png — hair-grabbing rage
        setShowSolution(true);
        setUsedSolution(true);
        setDialogue("Okay okay... let me show you. Study it carefully! 📖");
      } else if (currentAttempts >= HINT_THRESHOLD) {
        // Attempt 2-4: thinking mode
        setExpression('thinking');    // thinking.png — chin-on-hand, measured
        setUsedHint(true);
        setDialogue("Look closely at the highlighted blank(s) — what's different? 🤔");
      } else {
        // First wrong attempt: oops/embarrassed energy
        setExpression('happy');       // oops.png — "oops, not quite~"
        setDialogue("Oops, not quite~ Check the highlighted blank(s)!");
      }
    }
  };

  // Phase 4's MCQ half — separate grading surface from Phase 3, per §4.1/§4.4.
  // Forward-compatible: does nothing if a lesson has no phase4.mcq yet.
  const handleSubmitMcq = () => {
    if (!phase4?.mcq?.validationPattern) return;

    const result = validateCode(userCode, phase4.mcq.validationPattern);
    setMcqResult(result);

    if (result.passed) {
      play('success');
      setExpression('happy');
      // Reuses completeLesson's own guard against double-awarding XP, so this is a
      // no-op if Phase 3 already completed the lesson. Per §4.4, Phase 3 blanks and
      // Phase 4 MCQ are scored independently rather than sharing one penalty curve —
      // each surface's own attempt history feeds its own calculateEarnedXP call.
      const xpEarned = calculateEarnedXP({ baseXP: xpReward, attempts: 1, usedHint: false, usedSolution: false });
      completeLesson(lessonId, xpEarned);
    } else {
      play('error');
      setExpression('thinking');
    }
  };

  return (
    <div className="lesson-canvas">
      <PhaseIndicator
        currentPhase={currentPhase}
        onPhaseClick={handlePhaseChange}
      />

      <AnimatePresence mode="wait">
        {/* ---- Phase 1: Learn It With Me ---- */}
        {currentPhase === 1 && (
          <motion.div
            key="phase1"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--work">▶ Learn It With Me</h2>

            {/* Split-screen path: new topics[] schema (§2.1 of split-screen update) */}
            {phase1?.topics?.length > 0 ? (
              <Phase1SplitScreen
                phase1={phase1}
                lessonId={lessonId}
                onDone={() => handlePhaseChange(2)}
              />
            ) : (
              /* Legacy path: single-paragraph explanation — lessons not yet migrated */
              <>
                <EmphasisText text={phase1?.explanation} />
                {phase1?.code && (
                  <CodeBlock code={phase1.code} label="Working Code" hoverNotes={hoverNotes} />
                )}
                {phase1?.output && (
                  <div className="output-block">
                    <span className="output-label">Output</span>
                    <pre>{phase1.output}</pre>
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => handlePhaseChange(2)}
                >
                  Next: See the Code →
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ---- Phase 2: See the Code ---- */}
        {currentPhase === 2 && (
          <motion.div
            key="phase2"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--break">✕ See the Code</h2>
            <EmphasisText text={phase2?.explanation} />
            {phase2?.brokenCode && (
              <CodeBlock
                code={phase2.brokenCode}
                label="Broken Code"
                hoverNotes={hoverNotes}
                lessonId={lessonId}
                enableClickToPin
              />
            )}
            {phase2?.errorMessage && (
              <div className="error-block">
                <span className="error-label">⚠ Error</span>
                <pre>{phase2.errorMessage}</pre>
              </div>
            )}
            {phase2?.fixedCode && (
              <>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowFix((v) => !v)}
                >
                  {showFix ? 'Hide the Fix' : 'Show Me the Fix ✓'}
                </button>
                {showFix && (
                  <CodeBlock
                    code={phase2.fixedCode}
                    label="Fixed Code"
                    hoverNotes={hoverNotes}
                    lessonId={lessonId}
                    enableClickToPin
                  />
                )}
              </>
            )}
            <button
              className="btn btn-primary"
              onClick={() => handlePhaseChange(3)}
            >
              Next: Code It With Me →
            </button>
          </motion.div>
        )}

        {/* ---- Phase 3: Code It With Me ---- */}
        {currentPhase === 3 && (
          <motion.div
            key="phase3"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--try">✎ Code It With Me</h2>

            {hasBlanks ? (
              <>
                <ScaffoldEditor
                  scaffoldCode={phase3.scaffoldCode}
                  blanks={phase3.blanks}
                  userBlanks={userBlanks}
                  onBlankChange={setBlankAnswer}
                  wrongBlankIds={wrongBlankIds}
                  revealSolution={showSolution}
                />

                {blanksMessage && (
                  <motion.div
                    className={`validation-feedback validation-feedback--${blanksMessage.passed ? 'pass' : 'fail'}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {blanksMessage.message}
                  </motion.div>
                )}

                {attempts > 0 && (
                  <span className="attempt-counter">
                    Attempt {attempts}
                    {attempts >= HINT_THRESHOLD && !showSolution && ' · Look closely at the highlighted blank(s)'}
                  </span>
                )}

                <div className="phase3-actions">
                  <button className="btn btn-primary" onClick={handleSubmitBlanks}>
                    Check Answer ✓
                  </button>
                </div>
              </>
            ) : (
              <div className="scaffold-stub-notice">
                <p className="phase-explanation">
                  This lesson's scaffold hasn't been authored yet — coming in the content pass.
                </p>
                <button className="btn btn-ghost" onClick={() => handlePhaseChange(4)}>
                  Skip to Challenge →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ---- Phase 4: Challenge ---- */}
        {currentPhase === 4 && (
          <motion.div
            key="phase4"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--challenge">❓ Challenge</h2>

            {/* MCQ half — graded */}
            {phase4?.mcq && (
              <>
                <p className="phase-prompt">{phase4.mcq.question}</p>
                <input
                  className="mcq-input"
                  placeholder="Type A, B, C, or D..."
                  value={userCode}
                  onChange={e => setUserCode(e.target.value)}
                  maxLength={1}
                />
                {mcqResult && (
                  <motion.div
                    className={`validation-feedback validation-feedback--${mcqResult.passed ? 'pass' : 'fail'}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {mcqResult.message}
                  </motion.div>
                )}
                <button className="btn btn-primary" onClick={handleSubmitMcq}>
                  Check Answer ✓
                </button>
              </>
            )}

            {/* Self-challenge half — ungraded, honor-system, no XP (§5.4) */}
            <div className="self-challenge-block">
              <p className="phase-prompt">
                {phase4?.selfChallenge || "Self-challenge prompt for this lesson is coming in the content pass."}
              </p>
              <label className="self-challenge-checkbox">
                <input
                  type="checkbox"
                  checked={selfChallengeDone}
                  onChange={() => toggleSelfChallenge(lessonId)}
                />
                I tried this in my own IDE
              </label>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handlePhaseChange(5)}
            >
              Next: Fun Facts & Trivia →
            </button>
          </motion.div>
        )}

        {/* ---- Phase 5: Fun Facts & Trivia ---- */}
        {currentPhase === 5 && (
          <motion.div
            key="phase5"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--trivia">✨ Fun Facts &amp; Trivia</h2>
            <EmphasisText text={phase5?.trivia || "More lore on this one coming soon~"} />
            <button className="btn btn-primary" onClick={() => onComplete?.()}>
              Finish Lesson ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonCanvas;