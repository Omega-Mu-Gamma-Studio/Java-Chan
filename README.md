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

## What It Covers

All 5 units — 75 lessons total — are complete and available.

| Unit | Topic | Lessons | Status |
|------|-------|---------|--------|
| 1 | OOP & Java Fundamentals | 15 | ✅ Complete |
| 2 | Inheritance & Interfaces | 15 | ✅ Complete |
| 3 | Exception Handling & I/O | 15 | ✅ Complete |
| 4 | Collections & Threads | 15 | ✅ Complete |
| 5 | JavaFX & UI | 15 | ✅ Complete |

<details>
<summary>View all lessons</summary>

**Unit 1 — OOP & Java Fundamentals**
1.1 What is Java? · 1.2 Setting Up & Your First Program · 1.3 Hello, World! · 1.4 Data Types & Variables · 1.5 Type Casting & Literals · 1.6 Operators · 1.7 Input & Output · 1.8 Control Flow — if/else · 1.9 Loops — for & while · 1.10 Arrays · 1.11 2D Arrays & Matrices · 1.12 Methods · 1.13 Strings · 1.14 Intro to OOP — Classes & Objects · 1.15 Access Modifiers & Encapsulation

**Unit 2 — Inheritance & Interfaces**
2.1 Inheritance Basics · 2.2 Method Overriding · 2.3 The super Keyword · 2.4 Polymorphism · 2.5 Abstract Classes · 2.6 Interfaces · 2.7 Multiple Interfaces · 2.8 Packages · 2.9 Static Members · 2.10 Final Keyword · 2.11 Inner Classes · 2.12 Enum Types · 2.13 Object Class Methods · 2.14 Wrapper Classes & Autoboxing · 2.15 Unit 2 Review — Design Patterns Intro

**Unit 3 — Exception Handling & I/O**
3.1 What Are Exceptions? · 3.2 try-catch-finally · 3.3 throw & throws · 3.4 Custom Exceptions · 3.5 try-with-resources · 3.6 Common Built-in Exceptions · 3.7 Byte Streams · 3.8 Character Streams · 3.9 Buffered Streams · 3.10 PrintWriter & Console I/O · 3.11 File Class & File Operations · 3.12 Serialization · 3.13 NIO Basics — Path & Files · 3.14 Working with CSV Files · 3.15 Unit 3 Review — Robust Programs

**Unit 4 — Collections & Threads**
4.1 Collections Framework Overview · 4.2 ArrayList · 4.3 LinkedList · 4.4 HashSet & TreeSet · 4.5 HashMap & TreeMap · 4.6 Generics · 4.7 Comparable & Comparator · 4.8 Iterator & For-Each · 4.9 Stack, Queue & Deque · 4.10 Intro to Multithreading · 4.11 Creating Threads · 4.12 Thread Synchronization · 4.13 Inter-thread Communication · 4.14 Executor Framework · 4.15 Unit 4 Review — Choosing the Right Tool

**Unit 5 — JavaFX & UI**
5.1 Intro to JavaFX · 5.2 Your First JavaFX Window · 5.3 Layouts — VBox & HBox · 5.4 Layouts — GridPane & BorderPane · 5.5 Basic Controls · 5.6 Event Handling · 5.7 Styling with CSS · 5.8 FXML & Scene Builder Intro · 5.9 FXML — Wiring Controllers · 5.10 Observable Properties & Binding · 5.11 ListView & TableView · 5.12 Dialogs & Alerts · 5.13 Animation Basics · 5.14 Building a Mini App · 5.15 Unit 5 Review & Course Wrap-Up

</details>

---

## Key Features

- **Three-phase lesson structure** — See It Work → See It Break → You Try, for every single lesson
- **Expressive character** — Java-chan reacts differently at idle, on success, on failure, and on repeated wrong attempts
- **Contextual hints** — hint appears at 2 wrong attempts, solution unlocks at 5
- **XP and leveling system** — rewards for completing lessons, bonus XP for first-attempt success and hint-free runs
- **Unlockable rewards** — wallpapers, character outfits, and rare dialogue lines tied to level milestones
- **Celebration effects** — confetti and domain expansion for milestone moments
- **localStorage progress** — no account needed, progress saved locally in the browser
- **Unit and lesson navigation** — collapsible sidebar with completion indicators and unit lock states

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite |
| Styling | CSS + Framer Motion |
| State | Zustand |
| Data | JSON files + localStorage |
| Hosting | Vercel |

Phase 2 will add PostgreSQL, an Express API, and user accounts. No rewrite required — the architecture uses a data adapter with a toggle.

---

## Credits & Asset Generation

**Character Art**: The sprites for Java-chan were generated using AI tools and 
carefully curated for consistency by [@albertofelix08](https://github.com/albertofelix08). All character 
designs are proprietary to Omega Mu Gamma Studio.

**Note**: As a free, open-source educational project, we prioritized shipping 
a complete learning experience over commissioning custom art. If you're an 
artist interested in contributing official character designs, we'd love to 
collaborate!

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
