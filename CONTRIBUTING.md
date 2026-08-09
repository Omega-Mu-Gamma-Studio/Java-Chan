# Contributing to Java-chan

Thanks for your interest! Java-chan is an open-source project from Omega Mu Gamma Studio. Here's how to contribute effectively.

By participating, you're expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). Found a security issue rather than a regular bug? See [SECURITY.md](./SECURITY.md) instead of opening a public issue.

---

## What We're Accepting

### ✅ Welcome
- Bug fixes in lesson validation, navigation, or the XP system
- Corrections or improvements to lesson content (typos, better explanations, clearer dialogue)
- New lesson JSON files that extend existing units or add supplementary topics
- Performance improvements and accessibility enhancements
- UI/UX improvements that don't alter the core teaching model

### 🤝 Discuss First
- Structural changes to the lesson format or phase model
- New unit proposals
- Changes to the Shop or progression system
- Anything that affects all 75 lessons at once

Open an issue before starting on anything in the "Discuss First" category. We'll respond quickly.

### ❌ Not Accepted
- Replacing the pattern-based validation engine with a code execution backend (that's Phase 2 scope)
- Changes to character art or sprite assets — these are proprietary
- Dependencies that add significant bundle size without clear benefit

---

## Getting Set Up

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/Java-Chan.git
cd Java-Chan
npm install
npm run dev
```

Before submitting a PR, run:

```bash
npm run lint    # ESLint check
npm run build   # Make sure the production build succeeds
```

---

## Lesson JSON Format

Lesson files live at `src/data/lessons/unit{N}/{N}.{M}.json`. Every lesson has five top-level
phase objects (`phase1`–`phase5`), not a `phases` array. The required structure:

```json
{
  "id": "1.1",
  "title": "Lesson Title",
  "type": "conceptual",
  "xpReward": 10,
  "phase1": {
    "intro": "A short lead-in in her voice, ending in a prompt for which topic to open first.",
    "topics": [
      {
        "id": "short-kebab-id",
        "buttonText": "The question this topic answers, as the student would ask it",
        "dialogue": ["First beat.", "Second beat."],
        "stickyNote": {
          "term": "The term this topic covers",
          "flavor": "🔑 a short emoji + tag line",
          "definition": "Plain-English definition — this is what gets pinned to the student's Journal."
        }
      }
    ],
    "code": "// Working Java code",
    "output": "Expected output",
    "openingDialogue": "Her line when this phase opens"
  },
  "phase2": {
    "brokenCode": "// Same code, deliberately broken",
    "errorMessage": "Error message text",
    "explanation": "Why it broke, in her voice.",
    "fixedCode": "// The corrected version, or null if not authored yet",
    "openingDialogue": "Her line when this phase opens"
  },
  "phase3": {
    "scaffoldCode": "public class Main { {{b1}} }",
    "blanks": [{ "id": "b1", "answer": ["i < arr.length"], "caseSensitive": true }],
    "openingDialogue": "Her line when this phase opens"
  },
  "phase4": {
    "mcq": { "question": "MCQ prompt with options A–D", "validationPattern": { "mcqAnswer": "C" } },
    "selfChallenge": "Go build this yourself in your own IDE — not graded, honor system",
    "openingDialogue": "Her line when this phase opens"
  },
  "phase5": {
    "trivia": "[[fun:Fun fact]]: closing lore/trivia beat, no grading attached.",
    "openingDialogue": "Her line when this phase opens"
  },
  "hoverNotes": {}
}
```

Phase 1 is a click-to-pin split screen, not a paragraph — `topics[]` is a list of 2–3 sub-ideas
(don't pad to a round number; some lessons genuinely only have 2), each with its own `dialogue[]`
beats and a `stickyNote` that gets saved into the student's cross-lesson Journal. Keep
`stickyNote.definition` accurate and self-contained — it's read out of the lesson's context once
pinned.

Phase 3 `blanks[].answer` is checked by `src/utils/blankValidator.js` — always an array (covers
multi-answer cases like `i++` vs `i += 1`), whitespace-normalized before comparing, and
`caseSensitive` defaults to `true`. Phase 4's `mcq.validationPattern` is checked by
`src/utils/patternMatcher.js` and is exact-match — no regex on either phase.

---

## Inline Emphasis Tags (`phase1.intro`, `phase1.topics[].dialogue`, `phase2.explanation`, `phase5.trivia`)

None of these fields are rendered as plain text — they go through `EmphasisText.jsx`, which
parses inline tags into distinctly styled spans (color, font, icon, and a little motion — the
"Geronimo Stilton effect," see `java-chan-next-update.md` §4.7–§4.8 for the full design
rationale). This includes every string inside `phase1.topics[].dialogue` individually, not just
`phase1.intro` — tag each beat on its own merits. **Every explanation/trivia/dialogue string
should use these tags where the vocabulary below calls for one.** Plain, untagged prose in these
fields is treated as unfinished content, not a valid style choice — a PR that adds or rewrites
lesson prose without tags where warranted will be asked to add them before merge.

`stickyNote.term`/`.flavor`/`.definition` are the one exception — they're rendered as a card, not
parsed prose, so don't use `[[...]]` tags inside them.

| Tag | Use it for | Don't use it for |
|---|---|---|
| `[[term:...]]` | The first time a concept's *name* appears (`class`, `inheritance`, a keyword) | Re-mentions of a term already tagged earlier in the same explanation |
| `[[warn:...]]` | A specific gotcha or common mistake ("forgetting the semicolon") | General difficulty ("this part is tricky") — tag the *specific* mistake, not the vibe |
| `[[key:...]]` | The single idea a skimming reader most needs to walk away with | More than one `key` per paragraph — if everything's key, nothing is |
| `[[fun:...]]` | A genuine aside — trivia, a joke, a tangent | Load-bearing teaching content — if removing the tagged text would lose information the lesson needs, it's not `fun`, it's the lesson |

Rule of thumb: tag words/phrases, not whole sentences. `[[key:the whole point of this
paragraph is that objects and classes are different things]]` defeats the point — a skimming
eye has nothing to skip to. Something closer to `objects and classes are different things —
[[key:a class is the blueprint, an object is what you build from it]]` keeps the tag doing its
job.

If a paragraph genuinely has no new vocabulary, no gotcha, no single stand-out idea, and no
aside — that's fine, leave it untagged. The bar is "use a tag where one's warranted," not "hit
some quota of tags per paragraph."

---

## Submitting a PR

1. Fork the repo and create a branch: `git checkout -b fix/lesson-2-3-typo`
2. Make your changes
3. Run lint and build (see above)
4. Open a PR with a clear title and description of what you changed and why
5. For lesson content PRs, include the lesson ID(s) you modified

---

## Questions?

Open an issue or reach out through the [Omega Mu Gamma Studio GitHub org](https://github.com/Omega-Mu-Gamma-Studio).
