import './SandboxEditor.css';

/**
 * SandboxEditor.jsx
 *
 * Replaces ScaffoldEditor for `executionMode: true` lessons. See
 * INTERPRETER.md §"New component: SandboxEditor.jsx" for the full spec:
 * editable textarea seeded with scaffoldCode, a Run button that calls
 * run(sourceCode) from src/interpreter/index.js, an output panel, an error
 * panel, and the shared `.validation-feedback` strip on pass/fail.
 *
 * STUB — not yet wired to the interpreter. Renders the static shell only,
 * so LessonCanvas.jsx can be updated to mount this once the interpreter
 * (src/interpreter/index.js) is ready. onPass is not yet called.
 */
// eslint-disable-next-line no-unused-vars -- expectedOutput/onPass wired up once run() is implemented
const SandboxEditor = ({ scaffoldCode = '', expectedOutput = '', onPass }) => {
  // TODO: implement — see INTERPRETER.md §"New component: SandboxEditor.jsx".
  // Wire the Run button to run(sourceCode) from '../../interpreter', diff
  // stdout against expectedOutput, and call onPass() on a match.
  return (
    <div className="sandbox-editor">
      <textarea
        className="sandbox-editor__textarea"
        defaultValue={scaffoldCode}
        readOnly
      />
      <button className="sandbox-editor__run-btn" type="button" disabled>
        Run
      </button>
      <div className="sandbox-editor__output">
        <p className="sandbox-editor__placeholder">
          Interpreter not yet implemented — see INTERPRETER.md.
        </p>
      </div>
    </div>
  );
};

export default SandboxEditor;
