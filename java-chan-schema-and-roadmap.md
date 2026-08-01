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

### Step 2b — Hover glossary + Phase 2 fix-reveal (addendum, §4.6)
Not in the original proposal — decided during implementation, documented as
new §4.6 in `java-chan-next-update.md`.

- **`phase2.fixedCode`**: a "Show Me the Fix" toggle in Phase 2 reveals the
  corrected version of `brokenCode` on demand (doesn't force it — keeps
  some spot-the-bug challenge intact). `null` until authored; toggle
  hides itself when there's nothing to show.
- **Hover tooltips on code**, two-tier, pure CSS (no JS tooltip state —
  `.hoverable-token` + `data-tooltip`, consistent with the tokenizer's
  existing pure-CSS-token approach):
  - `src/data/keywordGlossary.js` — shared glossary of common
    keywords/types/stock-API calls (`public`, `static`, `println`, ...),
    written once, used on every `CodeBlock` across all 75 lessons.
  - New top-level lesson field `hoverNotes: {}` — lesson-specific
    overrides for tokens unique to that lesson's example, take priority
    over the shared glossary for the same token.
  - Wired into `CodeBlock.jsx` (merges glossary + lesson notes, passes to
    `tokenize()`) and `javaHighlighter.js` (emits `data-tooltip` only on
    tokens that have a note, to avoid span bloat on plain code).
  - Ran `scripts/add-hover-and-fix-schema.py` (idempotent) to add
    `phase2.fixedCode: null` and `hoverNotes: {}` to all 75 lesson JSONs.
  - Lesson 1.3 seeded with real content (`fixedCode` + one `hoverNotes`
    entry) as an end-to-end smoke test — everything else stays stubbed
    for the content step.

---

## Verification done on this step
- `npx eslint` clean on all new/changed files.
- `npm run build` clean.
- All 75 migrated lesson JSONs checked programmatically for the new
  `phase3`/`phase4`/`phase5` shape.
- `blankValidator.js` sanity-checked against the doc's own worked example
  (`i < arr.length` vs `i<arr.length`) plus multi-answer and
  case-insensitive cases.

### Step 2c — Inline emphasis markup (addendum, §4.7)
Not in the original proposal — requested during the voice pilot itself,
documented as new §4.7 in `java-chan-next-update.md`.

- **`src/utils/emphasisParser.js`** — parses `[[term:...]]` / `[[warn:...]]` /
  `[[key:...]]` / `[[fun:...]]` tags out of explanation/trivia strings into
  plain `{category, text}` parts. Split into its own file (not inside the
  component) so `EmphasisText.jsx` only exports the component —
  `react-refresh/only-export-components` flagged this on first pass, fixed
  by mirroring the existing `blankValidator.js` / `ScaffoldEditor.jsx` split.
- **`src/components/lesson/EmphasisText.jsx` + `.css`** — renders tagged
  text as nested spans, NOT `dangerouslySetInnerHTML` (no injection surface,
  unlike `CodeBlock`'s HTML-string tokenize path). Four distinct
  color/weight treatments, mapped onto the existing theme palette in
  `globals.css` rather than new colors.
- Wired into `LessonCanvas.jsx` for Phase 1 explanation, Phase 2
  explanation, and Phase 5 trivia — the three places that render authored
  *teaching* prose. Deliberately left OUT of Phase 4's MCQ question and
  self-challenge prompt (testing prose, not teaching prose — see §4.7 for
  the reasoning).
- No schema change — this is markup inside existing string fields, not a
  new lesson JSON key.

---

## Not done yet

### Step 3 — Voice pilot (§3) — IN PROGRESS
Three lessons drafted in full target voice, chosen per the doc's
early/mid/later spread:

- **1.1 — "What is Java?"** (early/conceptual) — Phase 1 rewritten around a
  running "I build things in a workshop" / blueprints-and-objects metaphor
  that's meant to carry forward into later OOP lessons, not just this one.
  Phase 4 MCQ and Phase 5 trivia (the Oak → Java naming story) authored.
  Emphasis tags applied throughout.
- **2.5 — "Abstract Classes"** (mid-unit/coding) — Phase 1/2 voice pass,
  `phase3.scaffoldCode`/`blanks` authored (4 blanks: `abstract`, `extends`,
  `super`, the area formula), `phase2.fixedCode` added, Phase 4 MCQ and
  Phase 5 trivia authored, lesson-specific `hoverNotes` added for `Circle`/
  `Rectangle`.
- **3.4 — "Custom Exceptions"** (later/harder) — same treatment; Phase 3
  scaffold covers `extends`/`super`/`throws`/`throw` on a fresh
  (non-repeated) example so the pilot doesn't just reuse Shape/BankAccount
  everywhere. `hoverNotes` for the checked/unchecked exception pair.

Each lesson's `scaffoldCode`/`blanks` were cross-checked programmatically
(blank IDs in the scaffold string match blank IDs declared in `blanks`)
before being considered done. All three build clean, lint clean, and all 75
lesson JSONs still parse.

**Still needed before Step 3 is fully closed:** your review of whether the
voice actually lands — per §3, the bar is "do all three sound like the
same teacher," not each judged in isolation.

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
