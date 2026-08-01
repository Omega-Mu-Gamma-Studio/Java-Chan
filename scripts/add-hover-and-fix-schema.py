#!/usr/bin/env python3
"""
add-hover-and-fix-schema.py

Adds two new (additive, non-breaking) fields to every lesson JSON:
  - phase2.fixedCode: null   — the corrected version of phase2.brokenCode,
    revealed on demand via a "Show Me the Fix" toggle in Phase 2. Null
    until authored (content step); LessonCanvas hides the toggle when null.
  - hoverNotes: {}           — lesson-specific hover-tooltip overrides for
    CodeBlock, keyed by token text (e.g. a method name unique to this
    lesson's example). Merged with (and taking priority over) the shared
    keyword glossary in src/data/keywordGlossary.js.

Idempotent: only adds a key if it's missing, so safe to re-run.
"""
import json
import glob

LESSON_GLOB = "src/data/lessons/*/*.json"


def add_fields(data):
    changed = False

    phase2 = data.get("phase2", {})
    if "fixedCode" not in phase2:
        phase2["fixedCode"] = None
        data["phase2"] = phase2
        changed = True

    if "hoverNotes" not in data:
        data["hoverNotes"] = {}
        changed = True

    return data, changed


def main():
    files = sorted(glob.glob(LESSON_GLOB))
    added, skipped = 0, 0

    for path in files:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        data, changed = add_fields(data)

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            added += 1
        else:
            skipped += 1

    print(f"Updated: {added}  Already had both fields: {skipped}  Total: {len(files)}")


if __name__ == "__main__":
    main()
