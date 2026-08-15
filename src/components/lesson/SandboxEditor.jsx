import { useState } from 'react';
import { run } from '../../interpreter';
import useLessonStore from '../../store/lessonStore';
import { useSound } from '../../hooks/useSound';
import './SandboxEditor.css';

// Mirrors LessonCanvas's HINT_THRESHOLD/SOLUTION_THRESHOLD (kept local rather
// than imported so this component stays fully self-contained — see the
// design note below). Deliberately the same values so the pacing of "oops"
// -> "thinking" -> "let me help more" feels identical to the blanks flow.
const HINT_THRESHOLD = 2;
const SOLUTION_THRESHOLD = 5;

/**
 * SandboxEditor.jsx
 *
 * Phase 3 UI for `executionMode: true` lessons (INTERPRETER.md §"New
 * component: SandboxEditor.jsx" / Task 8). Replaces ScaffoldEditor for
 * interpreter-backed lessons.
 *
 * Design note — split of responsibility with LessonCanvas:
 * Unlike ScaffoldEditor (pure presentation, all grading/side-effects live in
 * LessonCanvas's handleSubmitBlanks), SandboxEditor owns its *own* fail-path
 * reactions (error/mismatch panels, Java-Chan's expression + dialogue on a
 * wrong run) directly via useLessonStore/useSound — the same pattern
 * Phase1SplitScreen already uses for its own store slice (journalStore).
 * It only calls back up to LessonCanvas (`onPass`) on the one branch that
 * needs cross-cutting bookkeeping it doesn't own: recording the attempt in
 * progressStore, calculating XP, completing the lesson, and advancing to
 * Phase 4 — exactly mirroring handleSubmitBlanks's success branch. This
 * keeps the prop surface to just the three fields already in the doc's
 * example JSX (scaffoldCode, expectedOutput, onPass) instead of threading
 * progressStore's attempt count and every phase-3 store setter down as
 * separate props.
 *
 * One consequence: the attempt counter used for the hint/solution pacing
 * below is a local run count for *this mount* of the editor (resets when the
 * student leaves Phase 3 and comes back, same as userBlanks resets on
 * setPhase), not progressStore's persisted per-lesson attempt count. The
 * persisted count is still what LessonCanvas uses for the final XP
 * calculation on pass, via recordAttempt/getAttempts, same as blanks.
 *
 * Error display: the Error panel shows the interpreter's raw
 * "Type (line N): message" string as returned by src/interpreter/index.js.
 * INTERPRETER.md's §"Error Message Design" sketches a full rewrite of each
 * message into Java-Chan's voice (e.g. "Looks like you forgot a
 * semicolon!"), keyed off the *actual* raw text the Lexer/Parser/Evaluator
 * throw. That mapping needs those raw strings verified against real
 * fixtures first (Task 9), so it's out of scope here — implementing it now
 * from guesses risks papering over real error text with wrong templates.
 * This component covers the same "errors are a teaching opportunity" goal
 * in the meantime with a two-tier approach: the raw technical message in the
 * panel (precise), plus a short Java-Chan voice reaction in the
 * validation-feedback strip underneath (encouraging). The template mapping
 * can be layered in later without changing this component's structure.
 */
const SandboxEditor = ({ scaffoldCode = '', expectedOutput = '', onPass }) => {
  const { setExpression, setDialogue } = useLessonStore();
  const { play } = useSound();

  const [sourceCode, setSourceCode] = useState(scaffoldCode);
  const [runCount, setRunCount] = useState(0);
  const [lastRun, setLastRun] = useState(null); // { output, error, hasError, matched, passed, message }

  const handleRun = () => {
    const currentRunCount = runCount + 1;
    setRunCount(currentRunCount);

    const execResult = run(sourceCode);
    const hasError = !!execResult.error;
    const matched = !hasError && execResult.output.trim() === (expectedOutput || '').trim();
    const passed = matched;

    if (passed) {
      setLastRun({ output: execResult.output, error: null, hasError: false, matched: true, passed: true, message: 'Perfect~! Your output matches exactly! ✨' });
      onPass?.();
      return;
    }

    play('error');
    let message;
    let expression;
    if (hasError) {
      if (currentRunCount >= SOLUTION_THRESHOLD) {
        expression = 'sad';        // frustrated.png
        message = "Okay okay... let's slow down and read that error message together. 📖";
      } else if (currentRunCount >= HINT_THRESHOLD) {
        expression = 'thinking';
        message = "There's a bug in there — check what line the error is pointing at. 🤔";
      } else {
        expression = 'happy';      // oops.png
        message = "Oops, that didn't run clean~ Check the error below!";
      }
    } else {
      if (currentRunCount >= HINT_THRESHOLD) {
        expression = 'thinking';
        message = "So close! Compare your output to what's expected, line by line. 🤔";
      } else {
        expression = 'happy';
        message = "Almost — the output doesn't quite match yet. Take another look! 🔍";
      }
    }

    setExpression(expression);
    setDialogue(message);
    setLastRun({ output: execResult.output, error: execResult.error, hasError, matched, passed: false, message });
  };

  return (
    <div className="sandbox-editor">
      <textarea
        className="sandbox-editor__textarea"
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        disabled={lastRun?.passed}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
      <button
        className="btn btn-primary sandbox-editor__run-btn"
        type="button"
        onClick={handleRun}
        disabled={lastRun?.passed}
      >
        Run ▶
      </button>

      <div className="sandbox-editor__output">
        {!lastRun && (
          <p className="sandbox-editor__placeholder">
            Write your code above, then hit Run to see what it prints.
          </p>
        )}

        {lastRun?.hasError && (
          <div className="error-block">
            <span className="error-label">⚠ Error</span>
            <pre>{lastRun.error}</pre>
          </div>
        )}

        {lastRun && !lastRun.hasError && (
          <div className="output-block">
            <span className="output-label">Output</span>
            <pre>{lastRun.output || '(no output)'}</pre>
          </div>
        )}

        {lastRun && !lastRun.hasError && !lastRun.matched && (
          <div className="sandbox-editor__diff">
            <div className="sandbox-editor__diff-block sandbox-editor__diff-block--expected">
              <span className="sandbox-editor__diff-label">Expected</span>
              <pre>{expectedOutput}</pre>
            </div>
            <div className="sandbox-editor__diff-block sandbox-editor__diff-block--got">
              <span className="sandbox-editor__diff-label">Got</span>
              <pre>{lastRun.output || '(no output)'}</pre>
            </div>
          </div>
        )}

        {lastRun && (
          <div className={`validation-feedback validation-feedback--${lastRun.passed ? 'pass' : 'fail'}`}>
            {lastRun.message}
          </div>
        )}

        {runCount > 0 && (
          <span className="attempt-counter">Attempt {runCount}</span>
        )}
      </div>
    </div>
  );
};

export default SandboxEditor;
