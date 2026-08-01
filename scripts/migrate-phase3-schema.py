#!/usr/bin/env python3
"""
migrate-phase3-schema.py

One-time migration for java-chan-next-update.md §4.2/§4.3:
  - Old phase3 was either:
      (a) an MCQ (validationPattern.mcqAnswer) -> becomes the new phase4.mcq,
          since it's already the exact shape Phase 4's MCQ needs.
      (b) a free-coding challenge (validationPattern.required/forbidden/fullRegex)
          -> its prompt is repurposed as phase4.selfChallenge (§5 decision #3),
          dropping the validationPattern/dialogueHints/solution grading apparatus,
          since the self-challenge is ungraded honor-system per §5 decision #4.
  - New phase3 becomes a stub { scaffoldCode: null, blanks: [] } — the actual
    scaffold + blanks are content authoring, sequenced by unit per §4.3, not
    part of this schema migration.
  - New phase5 becomes a stub { trivia: null } for the same reason.

Idempotent: skips any lesson whose phase3 already has the new shape
(scaffoldCode/blanks keys present), so it's safe to re-run.
"""
import json
import glob
import sys

LESSON_GLOB = "src/data/lessons/*/*.json"


def migrate_lesson(data):
    phase3 = data.get("phase3", {})

    # Already migrated — leave alone (idempotent re-run safety).
    if "scaffoldCode" in phase3 or "blanks" in phase3:
        return data, False

    validation_pattern = phase3.get("validationPattern", {})
    is_mcq = "mcqAnswer" in validation_pattern

    phase4 = data.get("phase4", {})

    if is_mcq:
        phase4["mcq"] = {
            "question": phase3.get("prompt"),
            "validationPattern": {"mcqAnswer": validation_pattern["mcqAnswer"]},
        }
        phase4["selfChallenge"] = None
        phase4.setdefault("openingDialogue", None)
    else:
        phase4["mcq"] = None
        phase4["selfChallenge"] = phase3.get("prompt")
        phase4.setdefault("openingDialogue", None)

    data["phase3"] = {
        "scaffoldCode": None,
        "blanks": [],
        "openingDialogue": phase3.get("openingDialogue"),
    }
    data["phase4"] = phase4
    data.setdefault("phase5", {"trivia": None, "openingDialogue": None})

    return data, True


def main():
    files = sorted(glob.glob(LESSON_GLOB))
    if not files:
        print("No lesson files found — check you're running from the repo root.", file=sys.stderr)
        sys.exit(1)

    migrated, skipped = 0, 0
    for path in files:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        data, changed = migrate_lesson(data)

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            migrated += 1
        else:
            skipped += 1

    print(f"Migrated: {migrated}  Already-migrated/skipped: {skipped}  Total: {len(files)}")


if __name__ == "__main__":
    main()
