import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLessonStore from '../../store/lessonStore';
import useProgressStore from '../../store/progressStore';
import { validateCode } from '../../utils/patternMatcher';
import { calculateEarnedXP } from '../../utils/xpCalculator';
import { useSound } from '../../hooks/useSound';
import CodeBlock from './CodeBlock';
import PhaseIndicator from './PhaseIndicator';
import './LessonCanvas.css';

const HINT_THRESHOLD     = 2;  // show hint after N wrong attempts
const SOLUTION_THRESHOLD = 5;  // show solution after N wrong attempts

const LessonCanvas = ({ onComplete }) => {
  const {
    currentLesson,
    currentPhase, setPhase,
    userCode, setUserCode,
    lastValidationResult, setValidationResult,
    setExpression, setDialogue, queueDialogue,
  } = useLessonStore();

  const {
    completeLesson, recordAttempt, getAttempts,
    toggleSelfChallenge, isSelfChallengeCompleted,
  } = useProgressStore();
  const { play } = useSound();

  const [showSolution, setShowSolution] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSolution, setUsedSolution] = useState(false);
  const [mcqResult, setMcqResult] = useState(null); // Phase 4 MCQ feedback, separate from phase3's

  if (!currentLesson) return null;

  const { phase1, phase2, phase3, phase4, phase5, id: lessonId, xpReward = 10 } = currentLesson;
  const attempts = getAttempts(lessonId);
  const selfChallengeDone = isSelfChallengeCompleted(lessonId);

  const handlePhaseChange = (phase) => {
    setPhase(phase);
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

  // Phase 3's grading logic (unchanged for now — old free-coding validationPattern
  // shape stays intact here until the fill-in-the-blank schema change lands; see
  // java-chan-next-update.md §4.2). "handleSubmit" name kept stable for the JSX below.
  const handleSubmit = () => {
    if (!phase3?.validationPattern) return;

    recordAttempt(lessonId);
    const result = validateCode(userCode, phase3.validationPattern);
    setValidationResult(result);

    const currentAttempts = attempts + 1;

    if (result.passed) {
      play('success');
      const xpEarned = calculateEarnedXP({
        baseXP: xpReward,
        attempts: currentAttempts,
        usedHint,
        usedSolution,
      });
      completeLesson(lessonId, xpEarned);

      if (result.score === 'perfect') {
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
        setExpression('happy');
        setDialogue(result.message);
        setTimeout(() => handlePhaseChange(4), 2000);
      }
    } else {
      play('error');

      // Escalating dialogue AND expressions based on attempt count
      const hintLines = phase3?.dialogueHints || [];
      if (currentAttempts >= SOLUTION_THRESHOLD && !showSolution) {
        // Attempt 5+: full frustration, show solution
        setExpression('sad');          // frustrated.png — hair-grabbing rage
        setShowSolution(true);
        setUsedSolution(true);
        setDialogue("Okay okay... let me show you. Study it carefully! 📖");
      } else if (currentAttempts >= HINT_THRESHOLD && hintLines.length > 0) {
        // Attempt 2-4: thinking mode, giving hints
        setExpression('thinking');    // thinking.png — chin-on-hand, measured
        setUsedHint(true);
        const hintIdx = Math.min(currentAttempts - HINT_THRESHOLD, hintLines.length - 1);
        setDialogue(hintLines[hintIdx]);
      } else {
        // First wrong attempt: oops/embarrassed energy
        setExpression('happy');       // oops.png — "oops, not quite~"
        setDialogue(result.message);
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
      // no-op if Phase 3 already completed the lesson. Weighting Phase 3 vs Phase 4
      // XP independently is still an open question (§4.4) — deferred to the schema step.
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
        {/* ---- Phase 1: See It Work ---- */}
        {currentPhase === 1 && (
          <motion.div
            key="phase1"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--work">▶ Learn It With Me</h2>
            <p className="phase-explanation">{phase1?.explanation}</p>
            {phase1?.code && (
              <CodeBlock code={phase1.code} label="Working Code" />
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
          </motion.div>
        )}

        {/* ---- Phase 2: See It Break ---- */}
        {currentPhase === 2 && (
          <motion.div
            key="phase2"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--break">✕ See the Code</h2>
            <p className="phase-explanation">{phase2?.explanation}</p>
            {phase2?.brokenCode && (
              <CodeBlock code={phase2.brokenCode} label="Broken Code" />
            )}
            {phase2?.errorMessage && (
              <div className="error-block">
                <span className="error-label">⚠ Error</span>
                <pre>{phase2.errorMessage}</pre>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => handlePhaseChange(3)}
            >
              Next: Code It With Me →
            </button>
          </motion.div>
        )}

        {/* ---- Phase 3: You Try ---- */}
        {currentPhase === 3 && (
          <motion.div
            key="phase3"
            className="lesson-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h2 className="phase-heading phase-heading--try">✎ Code It With Me</h2>
            <p className="phase-prompt">{phase3?.prompt}</p>

            {/* Hint / Solution display */}
            {showSolution && phase3?.solution && (
              <div className="solution-block">
                <span className="solution-label">💡 Solution</span>
                <CodeBlock code={phase3.solution} showLineNumbers={false} />
              </div>
            )}

            {/* Code editor OR MCQ */}
            {phase3?.validationPattern?.mcqAnswer !== undefined ? (
              /* Multiple choice */
              <input
                className="mcq-input"
                placeholder="Type A, B, C, or D..."
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                maxLength={1}
              />
            ) : (
              /* Code input */
              <textarea
                className="code-editor"
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                placeholder="// Write your Java code here..."
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            )}

            {/* Validation feedback */}
            {lastValidationResult && (
              <motion.div
                className={`validation-feedback validation-feedback--${lastValidationResult.passed ? 'pass' : 'fail'}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {lastValidationResult.message}
              </motion.div>
            )}

            {/* Attempt counter */}
            {attempts > 0 && (
              <span className="attempt-counter">
                Attempt {attempts}
                {attempts >= HINT_THRESHOLD && !showSolution && ' · Hint unlocked!'}
              </span>
            )}

            <div className="phase3-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Check Answer ✓
              </button>
              {phase3?.ideRequired && (
                <button className="btn btn-ghost" onClick={() => handlePhaseChange(4)}>
                  I Did It (ran in IDE) ✓
                </button>
              )}
            </div>
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

            {/* MCQ half — graded, forward-compatible with schema not yet in the JSON */}
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
                {phase4?.selfChallenge || phase3?.prompt}
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
            <p className="phase-explanation">
              {phase5?.trivia || "More lore on this one coming soon~"}
            </p>
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
