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

## Submitting a PR

1. Fork the repo and create a branch: `git checkout -b fix/lesson-2-3-typo`
2. Make your changes
3. Run lint and build (see above)
4. Open a PR with a clear title and description of what you changed and why
5. For lesson content PRs, include the lesson ID(s) you modified

---

## Questions?

Open an issue or reach out through the [Omega Mu Gamma Studio GitHub org](https://github.com/Omega-Mu-Gamma-Studio).
