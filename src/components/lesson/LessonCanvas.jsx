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

  const { completeLesson, recordAttempt, getAttempts } = useProgressStore();
  const { play } = useSound();

  const [showSolution, setShowSolution] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSolution, setUsedSolution] = useState(false);

  if (!currentLesson) return null;

  const { phase1, phase2, phase3, id: lessonId, xpReward = 10 } = currentLesson;
  const attempts = getAttempts(lessonId);

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
    }
  };

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
          onComplete?.();
        }, 3000);
      } else {
        setExpression('happy');
        setDialogue(result.message);
        setTimeout(() => onComplete?.(), 2000);
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
            <h2 className="phase-heading phase-heading--work">▶ See It Work</h2>
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
              Next: See It Break →
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
            <h2 className="phase-heading phase-heading--break">✕ See It Break</h2>
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
              Next: You Try →
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
            <h2 className="phase-heading phase-heading--try">✎ You Try</h2>
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
                <button className="btn btn-ghost" onClick={() => onComplete?.()}>
                  I Did It (ran in IDE) ✓
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonCanvas;
