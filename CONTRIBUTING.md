# Contributing to Java-chan

Thanks for your interest! Java-chan is an open-source project from Omega Mu Gamma Studio. Here's how to contribute effectively.

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

Lesson files live at `src/data/lessons/unit{N}/{N}.{M}.json`. The required structure:

```json
{
  "id": "1.1",
  "title": "Lesson Title",
  "xp": 10,
  "phases": [
    {
      "phase": 1,
      "title": "See It Work",
      "dialogue": "Explanation from Java-chan.",
      "code": "// Working Java code",
      "output": "Expected output"
    },
    {
      "phase": 2,
      "title": "See It Break",
      "dialogue": "Here is the error, and here's why.",
      "code": "// Same code, deliberately broken",
      "error": "CompilationError: ..."
    },
    {
      "phase": 3,
      "title": "You Try",
      "dialogue": "Your turn!",
      "prompt": "The question or fill-in-the-blank",
      "answer": "expected_answer",
      "hint": "A gentle nudge.",
      "solution": "The full correct answer"
    }
  ]
}
```

Phase 3 `answer` is matched by `src/utils/patternMatcher.js`. It supports exact match, case-insensitive match, and simple regex patterns. Check that file before writing answers.

---

## Inline Emphasis Tags (`phase1.explanation`, `phase2.explanation`, `phase5.trivia`)

These three fields aren't rendered as plain text — they go through `EmphasisText.jsx`, which
parses inline tags into distinctly styled spans (color, font, icon, and a little motion — the
"Geronimo Stilton effect," see `java-chan-next-update.md` §4.7–§4.8 for the full design
rationale). **Every explanation/trivia string should use these tags where the vocabulary below
calls for one.** Plain, untagged prose in these fields is treated as unfinished content, not a
valid style choice — a PR that adds or rewrites lesson explanation/trivia text without tags
where warranted will be asked to add them before merge.

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
