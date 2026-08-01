# Java-Chan: The Voice & Structure Update
### A proposal for the next major content and architecture revision

**Prepared for:** Jack — Omega Mu Gamma Studio
**Status:** Draft for discussion. Decisions from review pass incorporated below (see §5).

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
| 2 | **See the Code** | Spot-the-bug, then reveal the corrected version on demand — same mechanic as before, plus a "Show Me the Fix" reveal (see §4.6) | Rename + voice rewrite of old Phase 2 |
| 3 | **Code It With Me** | Fill-in-the-blank scaffolded coding — most of the program is given, student fills specific blanks | **New** — replaces old Phase 3's blank-editor approach |
| 4 | **Challenge** | A short MCQ set, plus a self-directed prompt for the student to attempt on their own IDE (not graded in-browser) | **New** |
| 5 | **Fun Facts & Trivia** | Closing lore/trivia beat in her voice — no grading, pure flavor and retention hook | **New** |

### Why this order works
Phase 3 is the fix for the scaffolding gap identified earlier: it sits between "read code"
(Phase 1) and "produce code independently" (Phase 4's self-challenge), giving students a
rung where they're writing real code but with real structural support.

### Why Phase 4 avoids the in-browser-compiler trap
The self-challenge portion is explicitly **not validated in the browser.** It's a prompt —
"go write this in your own IDE" — with no pattern-matching against it. This sidesteps the
single biggest implementation risk of this whole update (see §4.1): we are not trying to
build or fake a Java interpreter. Per §5, this stays a pure honor-system prompt with no XP
attached, which also keeps Phase 4's *graded* surface limited to the MCQ.

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
- **Consistent, caring personality — confirmed, not a moving target.** Per §5, her tone stays
  constant across units rather than shifting with difficulty. She's warm and patient in unit 1
  and just as warm and patient in unit 12 — harder material gets more encouragement, not less,
  since that's where students need her most. This also simplifies authoring meaningfully: there's
  one voice to hold across 75 lessons, not a gradient contributors have to judge "how far along"
  a given lesson sits on. Difficulty can still shape *what* she says (a harder bug earns a more
  involved explanation), just not *how caring* she sounds saying it.

**Recommendation before touching all 75 lessons:** draft 2-3 lessons in full target voice
first (one early/conceptual, one mid-unit/coding, one from a later, harder unit) and get
those approved as the tone bar — with a consistent voice, the test here is simpler than a
gradient would've required: all three samples should sound recognizably like the *same*
teacher, just applied to different material.

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

### 4.2 JSON schema change — and regex is gone from Phase 3
Every lesson JSON needs `phase4` and `phase5` keys added, and `phase3`'s shape changes
entirely (from `{ prompt, validationPattern, dialogueHints, solution }` free-coding to a
fill-in-the-blank shape). This is a **breaking schema change**, not additive — old `phase3`
consumers (the current free-coding challenge) need their logic and content moved to Phase 4's
self-challenge slot (confirmed in §5 — see 4.3 below).

The key simplification: because each Phase 3 blank has a small, known set of correct fills
rather than open-ended free text, **regex/pattern validation is no longer needed for Phase 3.**
A blank can be checked with plain equality against a short accepted-answers list instead of a
pattern. Proposed shape:

```json
{
  "scaffoldCode": "...",
  "blanks": [
    {
      "id": "b1",
      "answer": ["i++", "i += 1"],
      "caseSensitive": true
    }
  ]
}
```

- `answer` is always an array, even for blanks with a single correct fill — this covers
  legitimate multi-answer cases (`i++` vs `i += 1`) without a schema change later, at
  effectively zero authoring cost for the common single-answer case.
- Comparison normalizes whitespace (trim + collapse internal whitespace) before checking
  against the list, so `i < arr.length` and `i<arr.length` are treated as the same answer.
- `caseSensitive` defaults to `true` since Java itself is case-sensitive; this flag exists so
  a lesson author isn't tempted to pad the `answer` array with case variants instead of
  normalizing properly.
- Per §5, **the number of blanks per lesson isn't fixed** — it varies by lesson and
  difficulty. Early/simple lessons might have one key blank; later lessons with more moving
  parts can have several smaller ones. This should be an authoring judgment call per lesson,
  not a rule enforced by the schema.

Phase 4's MCQ portion was already exact-match and never used regex, so no change there.

### 4.3 Content volume and Phase 3 → Phase 4 migration
75 lessons × full explanation rewrite + new Phase 3 scaffold + new Phase 4 MCQ set + new
Phase 5 trivia is a substantial content lift — this is closer to a rewrite of the course than
an edit of it. Worth sequencing by unit rather than attempting all 75 at once, so the voice
described in §3 can be validated and adjusted early — and because it's one consistent voice
rather than a gradient, early validation carries forward cleanly to later units instead of
needing separate calibration per tone-band.

Per §5: **existing free-coding Phase 3 content is repurposed as Phase 4's self-challenge
prompt**, not discarded. Since Phase 4's self-challenge is an ungraded, honor-system "go try
this in your own IDE" prompt, most of the existing Phase 3 prompt text should carry over with
light editing (mainly: dropping any `validationPattern`/grading language, and adjusting phrasing
since it's no longer the in-browser submission). This meaningfully cuts the content lift for
Phase 4, since its self-challenge half doesn't need to be written from scratch per lesson.

### 4.4 Progress/XP model
`progressStore.js`'s `lessonAttempts` currently tracks attempts on the old single free-coding
phase and **resets to 0 on completion** — it has no memory of *how* a student struggled, only
whether they eventually passed. With grading now split across two mechanisms (Phase 3 blanks,
Phase 4 MCQ), `xpCalculator`'s `calculateEarnedXP` (which currently takes `attempts`,
`usedHint`, `usedSolution`) needs to decide how XP is weighted across phases. Per the §5
assumption that Phase 4's self-challenge carries no XP and no tracking, this narrows the open
question considerably: XP only needs to account for Phase 3 (blanks) and Phase 4's MCQ, not a
third ungraded surface. Still open: does Phase 3 struggle count toward the same penalty curve
as Phase 4 MCQ struggle, or are they scored independently?

### 4.5 Suite-wide implication (brief)
Java-Chan shares its lesson engine (`LessonCanvas`, `useLesson`, `lessonStore`,
`progressStore`, the JSON lesson schema) near-identically with PlusPlus-Chan, Go-Chan,
Kotlin-Chan, Python-Chan, and Rust-Chan. If this update proves out on Java-Chan, the same
3-file engine change would need to propagate to every sibling — but each sibling's *content*
rewrite (their own mascot's voice, including whether a consistent-tone approach like this
one suits them too) is a separate, per-app effort of the same scale as this one. Recommend treating
Java-Chan as the pilot and deferring a decision on suite-wide rollout until the voice and
5-phase structure are validated here.

### 4.6 Addendum — Hover glossary & Phase 2 fix-reveal (post-signoff addition)
Two additions decided during implementation, not in the original proposal above:

- **Phase 2 gets a fix-reveal.** After the broken code + error message, a "Show Me
  the Fix" toggle reveals `phase2.fixedCode` — the corrected version — without
  forcing it on the student immediately (keeps some of the spot-the-bug challenge
  intact while still answering "what should it actually look like?"). New field:
  `phase2.fixedCode` (string or `null` until authored).
- **Hover tooltips on code, two-tier.** Any word-token in a `CodeBlock` (Phase 1's
  working code, Phase 2's broken/fixed code) can carry a hover explanation:
  - A **shared glossary** (`src/data/keywordGlossary.js`) covers common
    keywords/types/stock-API calls (`public`, `static`, `println`, etc.) — written
    once, reused across all 75 lessons.
  - A **lesson-specific override**, new top-level lesson field `hoverNotes: {}`,
    covers tokens unique to one lesson's example (a custom method name, a
    variable worth explaining) and takes priority over the shared glossary for
    the same token.
  - Implementation is pure CSS (`.hoverable-token` + `data-tooltip` attribute) —
    no JS tooltip state, consistent with the existing "pure CSS token" approach
    the tokenizer already used.

---

## 4.7 Addendum — Inline emphasis markup, the "Geronimo Stilton effect" (§4.7)
A second post-signoff addition, requested during the voice pilot: lesson explanation and
trivia text can now carry inline emphasis tags that render as distinct colored/weighted
spans, the way Geronimo Stilton novels shift font treatment for high-impact words mid-sentence.
The goal is the same: a skimming reader's eye should catch the important word without
rereading the whole paragraph — a highlighter built into the prose itself, not a separate
callout box.

**Tag vocabulary — four categories, not one:**
A single "highlight" color would just be bold text with extra steps. Four categories were
chosen so each carries a distinct meaning at a glance:

| Tag | Meaning | Treatment |
|---|---|---|
| `[[term:...]]` | New vocabulary — first time a concept name appears | Blue, semi-bold |
| `[[warn:...]]` | Gotchas / common mistakes / "this bites people" | Gold, bold |
| `[[key:...]]` | The one idea in this paragraph worth remembering | Pink (mascot's accent color), bold |
| `[[fun:...]]` | Trivia / lighter aside, distinct from teaching voice | Purple, italic |

**Implementation, in line with the "safe by construction" bar the rest of the engine holds
to:** this is deliberately NOT `dangerouslySetInnerHTML`. Lesson JSON is authored content, but
the parser (`src/utils/emphasisParser.js`) turns tagged text into plain React children (nested
spans), the same way `CodeBlock`'s `tokenize()` composes — just without the HTML-string step,
so there's no injection surface even in principle. `EmphasisText.jsx` is a drop-in replacement
for the old `<p className="phase-explanation">{text}</p>` pattern and is now used everywhere
that pattern rendered *authored* prose: Phase 1 and Phase 2 explanations, and Phase 5 trivia.

**Deliberately NOT applied to Phase 4** (MCQ question text, self-challenge prompt): those are
testing prose, not teaching prose, and an emphasis tag inside an MCQ's options risks visually
leaking the correct answer, or cluttering a bullet-point requirements list. The boundary is
intentional — emphasis lives in the lessons *teaching* something, not the parts *checking*
whether it landed.

New fields: none at the schema level — this is markup *inside* existing string fields
(`phase1.explanation`, `phase2.explanation`, `phase5.trivia`), so no lesson JSON needed a new
key, only re-authoring of the string content itself where emphasis is warranted.

---

## 5. Decisions from review pass

1. **Tone across units:** Confirmed — Java-chan's tone stays consistently caring and patient
   across all units rather than shifting with difficulty. Harder material can change what she
   explains and how much support she gives, but not how warm she sounds giving it. Chosen partly
   because it's more true to a good teacher (patience scales *up* with difficulty, not down) and
   partly because it's meaningfully easier to write consistently across 75 lessons than a gradient.
2. **Blanks per Phase 3 lesson:** Confirmed — varies by lesson and difficulty, authoring
   judgment call rather than a fixed count.
3. **Old Phase 3 content:** Confirmed — repurposed as Phase 4's self-challenge prompts with
   light editing, not discarded or rewritten from scratch.
4. **Phase 4 self-challenge incentive/tracking:** **Assumption, not yet explicitly confirmed**
   — treated as purely honor-system with no XP or completion tracking attached, since this is
   what the "not validated in the browser" design in §2/§4.1 implies and it keeps grading
   surface area limited to Phase 3 blanks + Phase 4 MCQ. Flag if this assumption is wrong —
   e.g. if even a lightweight "I did this" checkbox (no grading, just a completion flag) is
   wanted for streak/engagement purposes.

---

*This document is a discussion draft. Per studio convention, implementation should wait
until architecture and content approach are fully agreed — this covers the "what" and
"why"; a follow-up doc should cover the "how" (exact JSON schema, file-by-file diff plan)
once the direction here is signed off.*