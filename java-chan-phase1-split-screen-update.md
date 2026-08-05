# Java-Chan: Phase 1 Split-Screen & Journal Update
### A proposal for the next content and architecture revision, following the 5-phase update

**Prepared for:** Jack — Omega Mu Gamma Studio
**Status:** Draft for discussion. Open questions flagged inline; nothing here should be
implemented until signed off, per studio convention.

---

## 1. The problem this solves

The 5-phase update (see `java-chan-next-update.md`) fixed the textbook-plus-mascot-note
problem — Java-Chan now teaches in her own voice from the first sentence. But a second,
narrower problem survived that rewrite: **Phase 1 is still a single scroll of prose.**

Feedback from an early reader (a friend outside the studio, reading Java-Chan cold) was
blunt: he knew the content and metaphors were good, but he was "too lazy to read through
it." That's not a content problem — the words, the analogies, the voice are all fine. It's
a *posture* problem. Phase 1 asks the student to be a passive reader for 150-250 words
before anything responds to them. Passive reading is exactly the mode people check out of.

There's a second, related issue underneath it: **when code shows up, if Phase 1 didn't
build enough intuition first, the code feels jarring** — syntax the student hasn't been
walked up to yet. The current single-paragraph format has to choose between two jobs it
can't do at once: telling a warm, memorable story, and giving a precise, citable
definition the student can lean on later. Doing both in one paragraph means it does
neither well, and there's no way to go back and re-find "wait, what did she say `Scanner`
does again?" without rereading the whole thing.

---

## 2. The fix — two changes, one philosophy

Both changes below share the same idea: **stop making the student hold everything in
their head at once.** Split the "story" from the "reference," and let the student direct
the order instead of receiving it linearly.

### 2.1 Phase 1 becomes a split screen

- **Left half — Dialogue.** Java-Chan talks, in short beats (not one long paragraph),
  the way she already does in her opening/closing dialogue lines elsewhere in the app.
  This is where the metaphor, the story, the personality lives.
- **Right half — Sticky Notes.** As each topic comes up in the dialogue, a sticky note
  is placed on the right: the plain, textbook-style definition of the term just
  discussed. Short, citable, skimmable — the opposite job from the dialogue side.

**Order is student-directed, not fixed.** Java-Chan asks a predefined question — text
only, no special UI — offering the remaining topics in the lesson (e.g. "want to know
why Java calls everything an object first, or how it actually runs your code?"). The
student's answer picks the next story beat. This is the actual fix for the "too lazy to
read" problem: choosing what comes next is a different cognitive mode than scrolling
prose, even though the underlying content is unchanged.

This directly answers the "code feels jarring" concern too: since the student chooses
the order, and each sticky note is captured as a standing reference (see 2.2), Phase 1
stops being a one-shot read they either absorbed or didn't — it becomes something they
can act on again the moment code makes them second-guess a definition.

### 2.2 Sticky notes become a persistent Journal

Every sticky note generated in Phase 1 is auto-collected into a Journal, accessible from
any phase in any lesson, not just Phase 1. Two design decisions carry this:

- **Auto-generated, but flavored.** The Journal isn't a raw definition dump — each entry
  gets a short, funny, hand-authored flavor line (emoji + a light metaphor) above the
  plain technical line, so it reads like a real student's notes rather than a database
  export. Two-line cap per entry: flavor line, then the plain definition. This is
  hand-authored content, same authoring model as lesson prose — not template-generated
  at runtime.
- **Java-Chan redirects to it instead of re-explaining.** If a student is stuck in Phase
  3 or 4 on something covered earlier ("wait, how does `Scanner` work again?"), her
  response is a short, in-character nudge toward the Journal rather than a restatement
  of the answer. This is a character beat, not just a UX shortcut — it reframes her from
  "holds the answer back" to "trusts you already have this, go find it." Keeps her lines
  short and keeps the redirect a *pattern* students learn to expect, consistent with the
  "recurring motifs, not one-off jokes" principle from the original voice update.

**Backfill rule, carried over from the original design discussion:** because topic order
is student-chosen, two students can end up with different Journals depending on what
they asked about. To avoid a Journal with holes where the safety net should be, the
first time a term is *referenced* elsewhere in the app (Phase 2 click-to-pin, a later
lesson, an MCQ) without having been chosen in that lesson's Phase 1, its sticky note is
auto-backfilled into the Journal at that point rather than left missing.

### 2.3 Same interaction grammar extends to Phase 2 — shipping in this update

Phase 2 ("See the Code") gets the same click-to-pin interaction: clicking a method or
class name in the code block pins its purpose as a sticky note on the right half of the
screen, using the same Journal system as Phase 1. No new interaction grammar for the
student to learn — the muscle memory from Phase 1 transfers directly.

This also supersedes part of §4.6 of the original 5-phase update: the two-tier hover
glossary (`keywordGlossary.js` + per-lesson `hoverNotes`) was built as a CSS-only hover
tooltip. Click-to-pin is the mobile-compatible successor — hover doesn't exist on touch
devices, and a pinned note persists in the Journal instead of disappearing the moment the
cursor moves. Recommend the existing glossary/hoverNotes *data* be reused as the source
for click-to-pin's sticky note content (it's already the right shape: token → short
explanation), with the interaction layer swapped from hover to click.

### 2.4 Font treatment for the new dialogue beats

The dialogue side should use the existing "Geronimo Stilton effect" (`EmphasisText.jsx`,
`[[term:]]` / `[[warn:]]` / `[[key:]]` / `[[fun:]]`, see §4.7-4.8 of the original update)
— this is not a new system, it already exists and already does exactly this job. The
work here is applying it consistently inside the new short dialogue beats rather than
one long paragraph, and making sure a beat that *introduces* a term via `[[term:]]` is
the same beat that spawns that term's sticky note on the right — the tag and the note
should trigger from the same authoring moment, not be authored twice.

### 2.5 Visuals — optional, and invisible when absent

Where a visual would help (a diagram of code → bytecode → JVM, for instance), one can be
added to a sticky note or dialogue beat. This is explicitly **not** a requirement for
launch: a lesson with no visual authored should render with no gap, no placeholder box,
and no sense that something is missing. This needs to be a rendering contract, not a
soft guideline — `visual: null` (or the field omitted) collapses the layout cleanly.
This lets visuals be added opportunistically, one lesson at a time, without ever
blocking or degrading a lesson that doesn't have one yet.

---

## 3. What changes in the schema (sketch, not final)

Old `phase1.explanation` was a single string. New shape needs to express: a set of
topics, each with a dialogue side and a sticky-note side, plus the question Java-Chan
asks to let the student pick.

```json
{
  "phase1": {
    "intro": "opening dialogue beat, same as today's openingDialogue",
    "topics": [
      {
        "id": "wora",
        "buttonText": "How does my code run on any computer?",
        "dialogue": [
          "short beat one — sets up the story/metaphor",
          "short beat two — pays it off"
        ],
        "stickyNote": {
          "term": "WORA",
          "flavor": "🌍 the promise that your code isn't picky about computers",
          "definition": "Write Once, Run Anywhere — Java compiles to bytecode, which any JVM can run.",
          "visual": null
        }
      }
    ],
    "code": "",
    "output": ""
  }
}
```

Open questions this sketch doesn't resolve, flagged rather than guessed at:

- Does `topics` have an implied prerequisite order (some concepts depend on others being
  understood first), or is it fully free-choice with Java-Chan gently nudging toward a
  suggested one, as discussed but not committed to?
- Journal entries need a stable ID scheme so the same term referenced across multiple
  lessons resolves to one Journal entry, not duplicates — likely `[[term:...]]` text
  itself isn't a safe key (same word can mean different things in different lessons), so
  this probably needs an explicit `id` per sticky note, as sketched above.
- Phase 2 click-to-pin reuses the Journal — does a Phase 2 pin create a *new* Journal
  entry, or must it resolve to an existing Phase 1 entry (i.e., can't click-to-pin
  introduce a term that has no Phase 1 counterpart anywhere)?

---

## 4. Scope note

**Retroactive application to Units 1-2 is not decided in this doc.** Units 1-2 are
already authored in the single-paragraph Phase 1 format from the original 5-phase update.
Whether they get retrofitted to the split-screen format or the new format only applies
forward from Unit 3 is left open — doesn't block designing or building the mechanism
itself, only affects how much rewrite work follows once this is approved.

**Suite-wide note carries over from the original update (§4.5):** this shares the same
lesson engine as the sibling *-Chan apps. Per that doc's recommendation, Java-Chan stays
the pilot; a decision on propagating this to siblings should wait until this is
validated here.

---

*This document is a discussion draft. As with the 5-phase update, implementation should
wait until the schema questions in §3 are resolved — particularly the topic-ordering and
Journal-entry-ID questions, since those affect the authoring workflow for all future
lessons, not just the engine.*
