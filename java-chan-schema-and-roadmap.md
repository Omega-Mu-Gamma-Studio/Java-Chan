# Java-Chan: Voice & Structure Update — Status & Next Steps

Companion to `java-chan-next-update.md`. That doc covers the "what/why"; this one
tracks the "how far are we" and what's left, updated as each step lands.

---

## Done

### Step 1 — Engine: 3 phases → 5 phases
- `lessonStore.js`: `currentPhase` spans 1–5.
- `PhaseIndicator.jsx`: 5-entry `PHASES` array, connector-line generation
  generalized (`phases.length - 1` instead of hardcoded `[0, 1]`).
- `LessonCanvas.jsx`: phase branch logic extended to 4/5 with mascot
  expression/dialogue defaults for each. Phase 3 success now flows into
  Phase 4 instead of ending the lesson directly.
- Phase 4 got an always-on, persisted honor-system "I tried this in my own
  IDE" checkbox (`progressStore.selfChallengeCompleted`) — no XP attached,
  per the confirmed answer to doc §5 decision #4.

### Step 2 — Schema change (§4.2) + Phase 3→4 migration (§4.3) + XP (§4.4)
- **New Phase 3 shape** — fill-in-the-blank, no regex:
  ```json
  { "scaffoldCode": "for (int i = 0; {{b1}}; i++) { ... }",
    "blanks": [{ "id": "b1", "answer": ["i < arr.length"], "caseSensitive": true }] }
  ```
  `src/utils/blankValidator.js` does the checking: plain equality against
  `answer` (always an array), whitespace-stripped before compare, defaults
  `caseSensitive: true`. `src/components/lesson/ScaffoldEditor.jsx` renders
  `scaffoldCode` as monospace code with inline `<input>`s dropped at each
  `{{blankId}}` marker — kept separate from `CodeBlock.jsx` since that
  component renders static HTML strings and doesn't compose with live inputs.
- **Migration**: `scripts/migrate-phase3-schema.py` ran once over all 75
  lesson JSONs (idempotent — safe to re-run, skips anything already migrated).
  Per §5 decision #3:
  - Old **free-coding** phase3 (63 lessons) → prompt text carried over
    verbatim into `phase4.selfChallenge`, dropping `validationPattern` /
    `dialogueHints` / `solution` (the grading apparatus that no longer
    applies to an ungraded honor-system prompt).
  - Old **MCQ-style** phase3 (12 lessons — the ones that were already just a
    multiple-choice check) → became `phase4.mcq` directly, since it was
    already the exact shape Phase 4's MCQ needs. These lessons got
    `phase4.selfChallenge: null` since there's no natural self-challenge
    text to carry over from a conceptual MCQ.
  - New `phase3` is a stub — `{ scaffoldCode: null, blanks: [] }` — on all
    75 lessons. `phase5` is likewise stubbed (`{ trivia: null }`). Both are
    content authoring, sequenced by unit per §4.3, not part of the schema
    step.
  - `LessonCanvas.jsx` handles the stub gracefully: a lesson with no
    authored blanks shows a placeholder + "Skip to Challenge" button
    instead of crashing or blocking progress.
- **XP (§4.4 open question — now resolved)**: Phase 3 blanks and Phase 4
  MCQ are scored **independently** — each calls `calculateEarnedXP` off its
  own attempt count, not a shared penalty curve. `completeLesson`'s
  existing single-award guard prevents double-XP if a student passes both.
  Flagging this as a judgment call made during implementation, not a
  studio-confirmed decision — easy to revisit if a shared curve turns out
  to matter once real students hit it.

---

## Verification done on this step
- `npx eslint` clean on all new/changed files.
- `npm run build` clean.
- All 75 migrated lesson JSONs checked programmatically for the new
  `phase3`/`phase4`/`phase5` shape.
- `blankValidator.js` sanity-checked against the doc's own worked example
  (`i < arr.length` vs `i<arr.length`) plus multi-answer and
  case-insensitive cases.

---

## Not done yet

### Step 3 — Voice pilot (§3)
Draft 2–3 lessons in full target voice (one early/conceptual, one
mid-unit/coding, one later/harder-unit) and get those approved as the tone
bar before touching the rest. This also means **actually authoring**
`scaffoldCode`/`blanks` for those lessons' Phase 3, `phase4.mcq` where a new
one is warranted, and `phase5.trivia` — the pilot lessons are where the
stub gets filled in for real, everything else stays stubbed until its unit
comes up.

### Step 4 — Full 75-lesson rewrite
Sequenced by unit once the pilot voice is approved, per §4.3. Each lesson
needs: full voice-first explanation rewrite (Phase 1), Phase 2 voice pass,
authored `scaffoldCode`/`blanks` for Phase 3, an MCQ for Phase 4 where one
doesn't already exist from migration, and `phase5.trivia` content.

### Step 5 — Suite-wide propagation (§4.5, deferred)
PlusPlus-Chan, Go-Chan, Kotlin-Chan, Python-Chan, Rust-Chan share this
engine near-identically. Per the doc, this is explicitly **deferred** until
the 5-phase structure and voice approach are validated on Java-Chan — not
started, not scoped yet.
