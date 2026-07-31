# Java-Chan: The Voice & Structure Update
### A proposal for the next major content and architecture revision

**Prepared for:** Jack — Omega Mu Gamma Studio
**Status:** Draft for discussion. No implementation yet.

---

## 1. The problem this solves

Right now, Java-Chan's lessons are **generic instructional content with a mascot's remark
stapled to the end.** Across the 75 lessons audited, 55 explanations follow the same pattern:
neutral textbook explanation (bullet lists, tables, definitions) followed by a clearly
separated "**Java-chan's note:**" paragraph.

That means the mascot isn't teaching the course. She's commenting on a course someone else
already taught. A real teacher's flavor — their running metaphors, their pacing, the specific
joke they'd make about a specific bug — shows up *in the explanation itself*, not appended
to it. That's the gap: **content and character are two separate layers right now, and they
need to become one.**

Separately, the current 3-phase structure has a scaffolding gap: Phase 1 is a worked example
(read-only), and the old Phase 3 is a fully independent coding challenge from a blank editor.
There's nothing between "watch me do it" and "now do the whole thing yourself" — which is
exactly where students fall off.

This update addresses both problems together, because they compound: a student who's
struggling *and* not emotionally engaged with the material has two reasons to disengage
instead of one.

---

## 2. The new 5-phase structure

| # | Name | Purpose | Status |
|---|------|---------|--------|
| 1 | **Learn It With Me** | Worked example + explanation, fully in Java-chan's voice from the first sentence | Rewrite of old Phase 1 |
| 2 | **See the Code** | Spot-the-bug — same mechanic as before | Rename + voice rewrite of old Phase 2 |
| 3 | **Code It With Me** | Fill-in-the-blank scaffolded coding — most of the program is given, student fills specific blanks | **New** — replaces old Phase 3's blank-editor approach |
| 4 | **Challenge** | A short MCQ set, plus a self-directed prompt for the student to attempt on their own IDE (not graded in-browser) | **New** |
| 5 | **Fun Facts & Trivia** | Closing lore/trivia beat in her voice — no grading, pure flavor and retention hook | **New** |

### Why this order works
Phase 3 is the fix for the scaffolding gap identified earlier: it sits between "read code"
(Phase 1) and "produce code independently" (Phase 4's self-challenge), giving students a
rung where they're writing real code but with real structural support. It also reuses
Phase 2's existing targeted-validation style (checking specific lines/tokens), so it's not
new grading infrastructure — it's the same mechanism aimed at blanks instead of a whole bug.

### Why Phase 4 avoids the in-browser-compiler trap
The self-challenge portion is explicitly **not validated in the browser.** It's a prompt —
"go write this in your own IDE" — with no pattern-matching against it. This sidesteps the
single biggest implementation risk of this whole update (see §4.1): we are not trying to
build or fake a Java interpreter. The MCQ portion stays exact-match gradable exactly like
today's regex/token system, so Phase 4 needs no new validation tech at all.

---

## 3. What "voice-first" content actually means

This is the part that can't be spec'd line-by-line — it needs a style guide, not a template —
but concretely, it means:

- **The explanation is written as her teaching, not textbook-plus-comment.** No bullet list
  of "Java is: Object-Oriented, Strongly Typed, Garbage Collected..." followed by a
  personality note. Instead, her own analogy carries the whole explanation — if she teaches
  through a running example (a game, a story, a running joke about C++), that example
  *is* the structure of the lesson, not a decoration on top of a table.
- **Recurring motifs, not one-off jokes.** A real teacher has bits they return to. If Phase 2's
  "watch me break this on purpose" bug always gets the same kind of reaction from her, that
  consistency is what makes her feel like a person who's taught this before, not a
  chatbot generating a fresh quip every lesson.
- **Difficulty-appropriate personality.** Early lessons and late lessons in a real class don't
  sound identical — a teacher's jokes evolve as the material gets harder and the relationship
  with the student matures. Worth deciding whether her tone shifts across units.

**Recommendation before touching all 75 lessons:** draft 2-3 lessons in full target voice
first (one early/conceptual, one mid-unit/coding, one from a later, harder unit) and get
those approved as the tone bar, rather than discovering the voice is off after 75 rewrites.

---

## 4. Implementation implications

### 4.1 Scope is contained — three files own the phase structure
Grepping the codebase for phase-related logic turns up exactly three files that assume a
3-phase structure:

- `src/store/lessonStore.js` — `currentPhase: 1, // 1 | 2 | 3`
- `src/components/lesson/LessonCanvas.jsx` — hardcodes phase 1/2/3 branch logic,
  `HINT_THRESHOLD`/`SOLUTION_THRESHOLD` constants, and destructures
  `{ phase1, phase2, phase3 }` directly off the lesson object
- `src/components/lesson/PhaseIndicator.jsx` — hardcoded `PHASES` array with 3 entries and
  a 2-connector-line assumption (`[0, 1].map(...)`)

This is good news: the phase count isn't scattered across the codebase. Extending to 5 means:
- `PHASES` array in `PhaseIndicator.jsx` grows to 5 entries; the connector-line generation
  (currently hardcoded to `[0, 1]`) needs to generalize to `phases.length - 1`
- `LessonCanvas.jsx`'s `handlePhaseChange` branch logic extends to phases 4 and 5, including
  new mascot expressions/dialogue defaults for each
- The submit/validation logic (`handleSubmit`) currently assumes Phase 3 is *the* graded
  submission. With Phase 3 now being fill-in-the-blank and Phase 4 holding the MCQ, this
  logic needs to branch by phase type, not assume "phase 3 = the challenge"

### 4.2 JSON schema change
Every lesson JSON needs `phase4` and `phase5` keys added, and `phase3`'s shape changes
entirely (from `{ prompt, validationPattern, dialogueHints, solution }` free-coding to a
fill-in-the-blank shape — something like `{ scaffoldCode, blanks: [{id, answer}], ... }`).
This is a **breaking schema change**, not additive — old `phase3` consumers (the current
free-coding challenge) need their logic and content moved to Phase 4's self-challenge slot.

### 4.3 Content volume
75 lessons × full explanation rewrite + new Phase 3 scaffold + new Phase 4 MCQ set + new
Phase 5 trivia is a substantial content lift — this is closer to a rewrite of the course than
an edit of it. Worth sequencing by unit rather than attempting all 75 at once, so the voice
can be validated and adjusted early (see §3's recommendation).

### 4.4 Progress/XP model
`progressStore.js`'s `lessonAttempts` currently tracks attempts on the old single free-coding
phase and **resets to 0 on completion** — it has no memory of *how* a student struggled, only
whether they eventually passed. With grading now split across two mechanisms (Phase 3 blanks,
Phase 4 MCQ + self-challenge), `xpCalculator`'s `calculateEarnedXP` (which currently takes
`attempts`, `usedHint`, `usedSolution`) needs to decide how XP is weighted across phases —
e.g., does Phase 3 struggle count toward the same penalty curve as Phase 4 struggle, or are
they scored independently?

### 4.5 Suite-wide implication (brief)
Java-Chan shares its lesson engine (`LessonCanvas`, `useLesson`, `lessonStore`,
`progressStore`, the JSON lesson schema) near-identically with PlusPlus-Chan, Go-Chan,
Kotlin-Chan, Python-Chan, and Rust-Chan. If this update proves out on Java-Chan, the same
3-file engine change would need to propagate to every sibling — but each sibling's *content*
rewrite (their own mascot's voice) is a separate, per-app effort of the same scale as this one.
Recommend treating Java-Chan as the pilot and deferring a decision on suite-wide rollout
until the voice and 5-phase structure are validated here.

---

## 5. Open questions before implementation starts

1. Does Java-chan's tone shift across units (beginner → advanced), or stay constant?
2. For Phase 3 (fill-in-the-blank), how many blanks per lesson feels right — one key line,
   or several smaller ones?
3. For Phase 4's self-challenge, is there any incentive/tracking for a student saying "I did
   this," or is it purely an honor-system prompt with no XP tied to it?
4. Should old-Phase-3 content (the existing free-coding challenges) be discarded, or
   repurposed as Phase 4's self-challenge prompts (likely reusable with light editing)?

---

*This document is a discussion draft. Per studio convention, implementation should wait
until architecture and content approach are fully agreed — this covers the "what" and
"why"; a follow-up doc should cover the "how" (exact JSON schema, file-by-file diff plan)
once the direction here is signed off.*