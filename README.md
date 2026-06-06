# Java-chan

**An anime-guided Java tutor for CS22301 — Object Oriented Programming**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [SeeDS](https://see-ds.vercel.app), [KMapX](https://kmapx.vercel.app), [EG Suite](https://eg-suite.vercel.app), and [GateLab](https://gatelab.vercel.app)

---

## What is Java-chan?

Java-chan is a browser-based Java learning app where an anime character guides students through the CS22301 syllabus. Every lesson follows a fixed three-phase model — working code, broken code, then you try — with an expressive character who reacts to your progress, escalates her hints when you're stuck, and celebrates when you get it right.

No abstract theory. No cold error messages. Just affectionate guidance.

---

## The Teaching Model

Every lesson is structured in three phases:

| Phase | Name | What Happens |
|-------|------|--------------|
| 1 | **See It Work** | Java-chan shows working code, output, and explains what's happening |
| 2 | **See It Break** | Same code with a deliberate mistake — she explains the error and why it happens |
| 3 | **You Try** | Student writes code or fills in blanks and gets validated |

Validation is pattern-based (regex) — no code execution in the browser. For full programs, students run their code in their own IDE.

---

## What It Will Cover

Java-chan ships one unit at a time. Unit 1 is the MVP.

| Unit | Topic | Status |
|------|-------|--------|
| 1 | Introduction to OOP and Java Fundamentals | 🔧 In Development |
| 2 | OOP Concepts | 🔧 Planned |
| 3 | Core Java Features | 🔧 Planned |
| 4 | Advanced Topics | 🔧 Planned |
| 5 | Final Unit | 🔧 Planned |

---

## Key Features (Planned)

- **Three-phase lesson structure** — See It Work → See It Break → You Try, for every single lesson
- **Expressive character** — Java-chan reacts differently at idle, on success, on failure, and on repeated wrong attempts
- **Contextual hints** — hint appears at 2 wrong attempts, solution unlocks at 5
- **XP and leveling system** — rewards for completing lessons, bonus XP for first-attempt success and hint-free runs
- **Unlockable rewards** — wallpapers, character outfits, and rare dialogue lines tied to level milestones
- **Celebration effects** — confetti and domain expansion for milestone moments
- **localStorage progress** — no account needed in Phase 1, progress saved locally
- **Unit and lesson navigation** — collapsible sidebar with completion indicators and unit lock states

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite |
| Styling | CSS |
| State | Zustand |
| Data | JSON files + localStorage |
| Hosting | Vercel |

Phase 2 will add PostgreSQL, an Express API, and user accounts. No rewrite required — the architecture uses a data adapter with a toggle.

---

## Part of the Omega Mu Gamma Studio

Java-chan is the fifth tool from Omega Mu Gamma Studio, a student-built suite of open-source engineering and CS education tools.

| Tool | What it does |
|------|-------------|
| [SeeDS](https://see-ds.vercel.app) | 3D data structure visualizer |
| [KMapX](https://kmapx.vercel.app) | Karnaugh map simplifier with don't-care support |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator (ME22201) |
| [GateLab](https://gatelab.vercel.app) | 3D digital logic playground (CS22303) |
| Java-chan | Anime-guided Java tutor (CS22301) — *this repo* |

---

## License

The source code for this project is released under the **MIT License**.

**The character art, sprites, and visual assets for Java-chan are proprietary.** They are not covered by the MIT License and may not be reproduced, redistributed, or used outside this project without explicit permission from Omega Mu Gamma Studio.

© 2026 Omega Mu Gamma Studio