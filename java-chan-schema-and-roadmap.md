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

### Step 2d — Emphasis tags get a real storybook treatment (addendum, §4.8)
Step 2c shipped with a flat placeholder treatment (four colors, one weight
bump each) rather than the fuller "Geronimo Stilton effect" the tag naming
promised. Follow-up pass, documented as new §4.8 in
`java-chan-next-update.md`:

- **`src/components/lesson/EmphasisText.jsx`** — spans are now
  `motion.span` (`framer-motion`, already a dependency — no new package
  added), each category with its own pop-in-on-mount and hover-bounce
  motion values instead of static spans.
- **`src/components/lesson/EmphasisText.css`** — each of the four
  categories is a distinct typographic treatment, not just a recolor:
  `term` gets the display font + a wavy underline, `warn` gets a size bump
  and a ⚠ mark, `key` gets a highlighter-marker shape behind the text,
  `fun` gets a tilt and a ✨. `prefers-reduced-motion` drops the
  rotation/scale.
- **`CONTRIBUTING.md`** — added an "Inline Emphasis Tags" section making
  tag usage a reviewed authoring requirement for `phase1.explanation`,
  `phase2.explanation`, and `phase5.trivia`, not an optional flourish —
  closes the gap where §4.7 documented the *system* but nothing told
  content authors it wasn't optional.
- `emphasisParser.js` and all call sites unchanged — visual-only upgrade
  to an already-wired system.

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

Pilot voice approved — confirmed against the 1.2 draft, which extended the
same workshop/blueprint metaphor and was signed off before proceeding to
the rest of Unit 1. Step 3 is closed.

### Step 4 — Full 75-lesson rewrite
Sequenced by unit once the pilot voice is approved, per §4.3. Each lesson
needs: full voice-first explanation rewrite (Phase 1), Phase 2 voice pass,
authored `scaffoldCode`/`blanks` for Phase 3, an MCQ for Phase 4 where one
doesn't already exist from migration, and `phase5.trivia` content.

**Unit 1 (OOP & Java Fundamentals, 15 lessons) — DONE.** 1.1 was the
original pilot lesson. 1.2–1.15 authored in this pass:
- Every lesson's Phase 1 explanation rewritten in full voice, carrying the
  blueprint/workshop metaphor established in 1.1 forward (explicit
  callbacks where it fit naturally — e.g. 1.2 ties `javac`/`java` back to
  "finishing the blueprint" vs. "building from it").
- Phase 2 explanations rewritten in voice; existing `brokenCode`/
  `errorMessage`/`fixedCode` values were technically correct already and
  left as-is.
- Phase 3 `scaffoldCode`/`blanks` authored for every coding lesson (1.3
  onward) — 3 blanks each, pulled from that lesson's own code example.
  1.1 and 1.2 stay stubbed on purpose (matching the original pilot's
  precedent): both are genuinely code-free conceptual lessons, so forcing
  scaffold content there would be padding, not practice.
- Phase 4 MCQs authored for every lesson that didn't already have one from
  the Step 2 migration (1.1 and 1.2 already had MCQs; 1.3–1.15 didn't).
  Existing `selfChallenge` prompts were left untouched — they were already
  solid.
- Phase 5 `trivia` authored for all 15 lessons, each fact checked against
  general/verifiable knowledge rather than invented.
- Verification: all 15 lesson JSONs still valid JSON; scaffold `{{blankId}}`
  markers programmatically cross-checked against each lesson's declared
  `blanks` array (all match); `npm run build` and full lesson-directory
  parse both clean. Pre-existing `npx eslint .` issues (9 errors / 3
  warnings in `Shop.jsx`, `storageService.js`, `patternMatcher.js`, and a
  couple of hook-dependency warnings) are unrelated to this pass — none of
  those files were touched.

**Unit 2 (Inheritance & Polymorphism, 15 lessons) — DONE.** 2.5 was the
original pilot lesson. 2.1–2.4, 2.6–2.15 authored in this pass, same
process as Unit 1:
- Phase 1 explanations rewritten in full voice — 2.1's inheritance intro
  ties back to "the blueprint idea," 2.3 (`super`) references the
  constructor pattern established in 2.1, and 2.6 (interfaces) leans on
  the "contract" framing already set up by the 2.5 pilot's abstract-class
  material, so the unit reads as one continuous thread rather than 15
  disconnected explanations.
- Phase 2 explanations rewritten in voice; existing `brokenCode`/
  `errorMessage`/`fixedCode` left as-is (technically correct already).
- Phase 3 `scaffoldCode`/`blanks` authored for every lesson except 2.15,
  which is the unit's conceptual review/recap lesson and stays stubbed —
  same precedent as 1.1/1.2, no real code to scaffold for a summary
  lesson.
- Phase 4 MCQs authored for 2.1–2.4 and 2.6–2.14 (2.5 and 2.15 already had
  one from earlier work).
- Phase 5 trivia authored for all 15 lessons.
- Note on 2.7's blank `b3` (`instanceof`): the scaffold accepts either `A`
  or `B` as a correct answer, since the example class implements both
  interfaces and either is a truthful `instanceof` check.
- Verification: all 15 lesson JSONs valid; scaffold blank markers
  cross-checked against declared `blanks` arrays (all match); `npm run
  build` clean.

**Unit 3 (Exception Handling & File I/O, 15 lessons) — DONE.** 3.4 was the
original pilot lesson. 3.1–3.3, 3.5–3.15 authored in this pass, same
process as Units 1 and 2:
- Phase 1 explanations rewritten in full voice. The unit's own framing —
  "everything up to now assumed things go right; this unit is about
  surviving when that trust turns out to be misplaced" — was established
  in 3.1 and referenced back to explicitly in 3.15's review, giving the
  unit the same one-continuous-thread feel as Units 1 and 2. Streams are
  introduced (3.7) with an explicit callback to "everything up to now has
  been about handling things going WRONG — this is about getting data in
  and out," marking the unit's internal exceptions→I/O pivot for the
  reader.
- Phase 2 explanations rewritten in voice; existing `brokenCode`/
  `errorMessage` left as-is (technically correct already).
  `phase2.fixedCode` authored for all 14 (all were `null` pre-pass).
- Phase 3 `scaffoldCode`/`blanks` authored for every coding lesson.
  3.1, 3.6, and 3.15 (conceptual lessons — intro, built-in exception
  catalog, unit review) stay stubbed on purpose, same precedent as
  1.1/1.2/2.15.
- Phase 4 MCQs authored for 3.2, 3.3, 3.5, 3.7–3.14 (3.1, 3.4, 3.6, 3.15
  already had one from earlier work). Existing `selfChallenge` prompts
  left untouched.
- Phase 5 trivia authored for all 15 lessons.
- Verification: all 15 lesson JSONs valid; scaffold blank markers
  cross-checked against declared `blanks` arrays (all match); `npm run
  build` clean; `npx eslint .` shows the same pre-existing baseline (9
  errors / 3 warnings in `JavaChan.jsx`, `useLesson.js`, `XPDisplay.jsx`,
  `Shop.jsx`, `storageService.js`, `patternMatcher.js`) with nothing new
  introduced by this pass.

**Units 4–5 (30 lessons) — not started.** Next up per §4.3's per-unit
sequencing.

### Step 5 — Suite-wide propagation (§4.5, deferred)
PlusPlus-Chan, Go-Chan, Kotlin-Chan, Python-Chan, Rust-Chan share this
engine near-identically. Per the doc, this is explicitly **deferred** until
the 5-phase structure and voice approach are validated on Java-Chan — not
started, not scoped yet.
