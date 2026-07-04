<div align="center">

# ☕ Java-chan

**An anime-guided Java tutor built for CS22301 — Object Oriented Programming**

*Because nobody learned polymorphism from a cold error message.*

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055ff)](https://www.framer.com/motion/)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm_Noncommercial-blue)](./LICENSE)

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) — Java-chan is the flagship of the **Chan series**, a family of anime-mascot programming tutors that also includes [Python-Chan](https://python-chan.vercel.app), [Rust-Chan](https://rust-chan.vercel.app), [Go-Chan](https://go-chan.vercel.app), [Sharp-Chan](https://sharp-chan.vercel.app) (C#), [Kotlin-Chan](https://kotlin-chan.vercel.app), and [PlusPlus-Chan](https://plusplus-chan.vercel.app) (C++). The studio also builds [SeeDS](https://see-ds.vercel.app), [KMapX](https://kmapx.vercel.app), [EG Suite](https://eg-suite.vercel.app), [GateLab](https://gatelab.vercel.app), [ArchVisor](https://arch-visor.vercel.app), [ThermOS](https://thermos-omg.vercel.app), and [BlockBeats](https://github.com/Omega-Mu-Gamma-Studio/BlockBeats).

</div>

---

## What is Java-chan?

Java-chan is a browser-based Java learning app where an anime mascot character guides students through the full CS22301 OOP syllabus. Every lesson follows a fixed three-phase model — working code, broken code, then you try — with an expressive character who **reacts to your progress**, escalates her hints when you're stuck, and celebrates when you get it right.

No abstract theory walls. No cold error messages. No account required. Just Java and a very opinionated tutor.

---

## The Teaching Model

Every single lesson — all 75 of them — follows this exact structure:

| Phase | Name | What Happens |
|-------|------|----|
| **1** | See It Work | Java-chan shows working code, the output, and explains what's happening line by line |
| **2** | See It Break | Same code, deliberately broken — she explains the error, what caused it, and why it matters |
| **3** | You Try | Student writes code or fills in blanks; pattern-based validation gives immediate feedback |

Validation is regex/pattern-based — no code execution in the browser. For full programs, students run their code in their own IDE. This keeps the app lightweight and deployable anywhere.

---

## Curriculum — 75 Lessons Across 5 Units

All five units are complete, published, and available from day one.

| Unit | Topic | Lessons |
|------|-------|---------|
| 1 | OOP & Java Fundamentals | 15 |
| 2 | Inheritance & Interfaces | 15 |
| 3 | Exception Handling & I/O | 15 |
| 4 | Collections & Threads | 15 |
| 5 | JavaFX & UI | 15 |

<details>
<summary>📖 View all 75 lessons</summary>

**Unit 1 — OOP & Java Fundamentals**
`1.1` What is Java? · `1.2` Setting Up & Your First Program · `1.3` Hello, World! · `1.4` Data Types & Variables · `1.5` Type Casting & Literals · `1.6` Operators · `1.7` Input & Output · `1.8` Control Flow — if/else · `1.9` Loops — for & while · `1.10` Arrays · `1.11` 2D Arrays & Matrices · `1.12` Methods · `1.13` Strings · `1.14` Intro to OOP — Classes & Objects · `1.15` Access Modifiers & Encapsulation

**Unit 2 — Inheritance & Interfaces**
`2.1` Inheritance Basics · `2.2` Method Overriding · `2.3` The super Keyword · `2.4` Polymorphism · `2.5` Abstract Classes · `2.6` Interfaces · `2.7` Multiple Interfaces · `2.8` Packages · `2.9` Static Members · `2.10` Final Keyword · `2.11` Inner Classes · `2.12` Enum Types · `2.13` Object Class Methods · `2.14` Wrapper Classes & Autoboxing · `2.15` Unit 2 Review — Design Patterns Intro

**Unit 3 — Exception Handling & I/O**
`3.1` What Are Exceptions? · `3.2` try-catch-finally · `3.3` throw & throws · `3.4` Custom Exceptions · `3.5` try-with-resources · `3.6` Common Built-in Exceptions · `3.7` Byte Streams · `3.8` Character Streams · `3.9` Buffered Streams · `3.10` PrintWriter & Console I/O · `3.11` File Class & File Operations · `3.12` Serialization · `3.13` NIO Basics — Path & Files · `3.14` Working with CSV Files · `3.15` Unit 3 Review — Robust Programs

**Unit 4 — Collections & Threads**
`4.1` Collections Framework Overview · `4.2` ArrayList · `4.3` LinkedList · `4.4` HashSet & TreeSet · `4.5` HashMap & TreeMap · `4.6` Generics · `4.7` Comparable & Comparator · `4.8` Iterator & For-Each · `4.9` Stack, Queue & Deque · `4.10` Intro to Multithreading · `4.11` Creating Threads · `4.12` Thread Synchronization · `4.13` Inter-thread Communication · `4.14` Executor Framework · `4.15` Unit 4 Review — Choosing the Right Tool

**Unit 5 — JavaFX & UI**
`5.1` Intro to JavaFX · `5.2` Your First JavaFX Window · `5.3` Layouts — VBox & HBox · `5.4` Layouts — GridPane & BorderPane · `5.5` Basic Controls · `5.6` Event Handling · `5.7` Styling with CSS · `5.8` FXML & Scene Builder Intro · `5.9` FXML — Wiring Controllers · `5.10` Observable Properties & Binding · `5.11` ListView & TableView · `5.12` Dialogs & Alerts · `5.13` Animation Basics · `5.14` Building a Mini App · `5.15` Unit 5 Review & Course Wrap-Up

</details>

---

## Features

### 🎓 Learning System
- **Three-phase lesson structure** — See It Work → See It Break → You Try, on every lesson, no exceptions
- **Contextual hint escalation** — hint appears at 2 wrong attempts, solution unlocks at 5
- **Pattern-based validation** — instant feedback without a server or code execution engine
- **Full lesson navigation** — collapsible sidebar with per-lesson completion tracking

### 🎮 Progression & Rewards
- **XP system** — earn XP on lesson completion; bonus XP for first-attempt success and hint-free runs
- **10 levels** — clear thresholds (100 XP per level) with a persistent progress bar
- **Level-gated cosmetics** — odd levels unlock a new app theme; even levels unlock outfit choices (two at once from level 2–8, three at level 10)
- **localStorage persistence** — no account needed, progress is saved in the browser

### 🎨 The Shop
The shop has three sections — app-wide themes, character outfits, and downloadable wallpapers for your device. Everything below is live and unlockable; nothing in the shop is a locked preview anymore.

**App Themes** (equippable backgrounds) — 5 total:

| Level | Item | Style |
|-------|------|-------|
| 1 | Terminal Black 🖤 | The classic void |
| 3 | Sakura Study 🌸 | Cherry blossom dark |
| 5 | Neon Night Compile 🌃 | Late-night blue |
| 7 | Platform at Dusk 🚉 | Train pulling in, golden light, day fading |
| 9 | Golden Hour Debug 🌇 | Amber sunset |

**Character Outfits** (equippable; all 12 now ship with full 6-expression sprite art — no filter-tint placeholders left):

| Level | Outfits | Vibe |
|-------|---------|------|
| 1 | Classic Hoodie 🧡 | Her signature look, always equipped |
| 2 | Casual Hoodie 🧥 · Barista ☕ | Off-the-clock hoodie, or apron + Java-logo latte art |
| 4 | School Uniform 🎀 · Sports Day 🏃 | Sailor-collar edition, or track jacket + ponytail |
| 6 | Magical Girl Debugger 🪄 · Off The Clock 🌞 | Gold robe with glowing `{ }` staff, or a relaxed sundress |
| 8 | Streetwear Hacker 🕶️ · Winter Coat 🧣 | All black with green cuffs, or scarf-and-earmuffs winter wear |
| 10 | Legendary Kimono 👘 · Cozy Homewear 👕 · Casual Streetwear 🧢 | For students who made it — three ways to celebrate |

**Downloadable Wallpapers** (phone/desktop art, save to your device) — 10 total:

| Level | Wallpaper | Vibe |
|-------|-----------|------|
| 1 | Sakura Study 🌸 | Java-chan under a cherry blossom tree, textbook in hand |
| 3 | Neon Night Compile 🌃 | Late-night session vibes — city glow, code scrolling |
| 5 | Platform at Dusk 🚉 | Train pulling in, golden light, the day fading |
| 6 | Morning Brew ☕ | Café window, early morning, warm steam rising |
| 7 | Golden Hour Debug 🌇 · Convenience Store Night 🏪 | The build passed at sunset — or a warm konbini glow on a quiet street |
| 8 | Rainy Afternoon Library 📚 | Velvet armchair, rain on tall windows, warm lamp light |
| 9 | Track Champion 🏆 · Beach Day 🏖️ | Victory-lap confetti, or sun and sand |
| 10 | Winter Hot Chocolate ❄️ | Blue-white cold outside, warm amber inside, fairy lights |

> The design rule for every wallpaper: **Java-chan belongs in warm worlds.** Golden light, lived-in spaces, and ordinary moments that feel like home. When the world is cool, she's the warmth inside it.

### ✨ Character & Expressions
Java-chan has 7 distinct expression states that fire contextually throughout lessons:

| State | Trigger |
|-------|---------|
| `idle` | Default state — also shown while explaining code in Phase 1 |
| `idle-sleep` | 45 seconds of no interaction — she dozes off, and wakes on the next click or keypress |
| `thinking` | Hint mode; waiting for input |
| `happy` | Wrong answer, early attempts — a gentle "good try" reaction |
| `sad` | Repeated wrong attempts |
| `surprised` | Correct answer |
| `domain` | A flawless, hint-free answer — triggers the fullscreen Domain Expansion overlay |

Each equipped outfit has its own full set of matching sprites — swapping outfits changes Java-chan's entire look, not just a filter.

**Domain Expansion** — a fullscreen celebration overlay fires on a perfect answer: a radial glow burst, her sprite front and center, the dialogue line, and a "tap anywhere to continue" prompt.

### 👯 Meet My Sisters
A family-photo rail on the home page linking out to every sibling Chan app in the studio — Python-chan, C++-chan, Rust-chan, Go-chan, Kotlin-chan, and C#-chan — each with its own accent color, glyph badge, and one-line tagline. No external image assets, so every card renders crisp no matter what the target site looks like today.

### 🎵 Background Music
A looping background track plays across the whole app, composed by Aaron Felix J. A small pill in the top bar lets students mute it or adjust the volume; if the browser blocks autoplay, it starts on the first click or keypress anywhere on the page. The setting is remembered between visits.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 19 + Vite 8 | Fast HMR, ES modules, modern JSX transform |
| Styling | Plain CSS + Framer Motion 12 | No CSS framework overhead; animations via Motion |
| State | Zustand 5 | Minimal boilerplate, works with `persist` middleware out of the box |
| Data | JSON files + localStorage | Zero backend for Phase 1; data adapter ready for Phase 2 |
| Routing | React Router v7 | File-level page components |
| Hosting | Vercel | Zero-config deployment |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Running Locally

```bash
# Clone the repo
git clone https://github.com/Omega-Mu-Gamma-Studio/Java-Chan.git
cd Java-Chan

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

### Deploying to Vercel

This repo is Vercel-ready with no configuration needed. Connect the repo in the Vercel dashboard and it'll detect the Vite setup automatically. No environment variables required for Phase 1.

---

## Project Structure

```
Java-Chan/
├── public/
│   ├── audio/
│   │   └── bgm-main.mpeg           # Looping background track (composed by Aaron Felix J)
│   ├── sprites/                    # Character expressions (base outfit)
│   │   ├── teaching.png
│   │   ├── excited.png
│   │   ├── frustrated.png
│   │   ├── thinking.png
│   │   ├── oops.png
│   │   ├── idle-sleeping.png
│   │   └── uniforms/               # Outfit-specific sprite sets (6 expressions each)
│   │       ├── casual/             # Casual Hoodie
│   │       ├── sailor/             # School Uniform
│   │       ├── mage/               # Magical Girl Debugger
│   │       ├── hacker/             # Streetwear Hacker
│   │       ├── kimono/             # Legendary Kimono
│   │       ├── barista/            # Barista
│   │       ├── sports/             # Sports Day
│   │       ├── sundress/           # Off The Clock
│   │       ├── winter/             # Winter Coat
│   │       ├── t-shirt/            # Cozy Homewear
│   │       └── crop/               # Casual Streetwear
│   └── wallpapers/                 # Downloadable device wallpapers (10 files)
│
├── src/
│   ├── components/
│   │   ├── character/JavaChan.jsx  # Sprite renderer + Domain Expansion overlay; reads spriteOverrides
│   │   ├── layout/AppLayout.jsx    # Root shell; applies wallpaper/theme, mounts topbar + JavaChan
│   │   ├── home/MeetMySisters.jsx  # Cross-studio sibling rail on the Home page
│   │   ├── lesson/                 # LessonCanvas, CodeBlock, PhaseIndicator
│   │   └── ui/                     # Sidebar, BottomBar, XPDisplay, ProgressBar, MusicPlayer
│   │
│   ├── data/
│   │   ├── lessons/                # 75 JSON lesson files (unit1–5, lessons 1–15)
│   │   ├── units/                  # 5 unit JSON files (id, title, lesson list)
│   │   └── shopItems.js            # All cosmetic definitions (themes, outfits, downloadables)
│   │
│   ├── hooks/
│   │   ├── useLesson.js            # Lesson phase state machine
│   │   ├── useProgress.js          # Progress store bindings
│   │   ├── useSound.js             # SFX hooks
│   │   └── useBgMusic.js           # Background music playback, volume, and persistence
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Dashboard / unit selection + Meet My Sisters rail
│   │   ├── UnitPage.jsx            # Lesson list for a unit
│   │   ├── LessonPage.jsx          # The actual lesson experience
│   │   └── Shop.jsx                # Cosmetics shop
│   │
│   ├── services/
│   │   ├── lessonService.js        # JSON loader + lesson data access
│   │   └── storageService.js       # localStorage adapter (Phase 2: swap for API)
│   │
│   ├── store/
│   │   ├── progressStore.js        # Zustand store: XP, level, outfits, progress
│   │   └── lessonStore.js          # Zustand store: active lesson state, expression state
│   │
│   └── utils/
│       ├── xpCalculator.js         # XP thresholds, level math, earned XP calculation
│       ├── patternMatcher.js       # Regex-based answer validation engine
│       └── javaHighlighter.js      # Syntax highlighting for code blocks
```

---

## Adding Content

### Adding a New Lesson

Lesson JSON files live at `src/data/lessons/unit{N}/{N}.{M}.json`. Each file follows this structure:

```json
{
  "id": "1.1",
  "title": "What is Java?",
  "xp": 10,
  "phases": [
    {
      "phase": 1,
      "title": "See It Work",
      "dialogue": "Java-chan's explanation text here",
      "code": "public class Main { ... }",
      "output": "Hello, World!"
    },
    {
      "phase": 2,
      "title": "See It Break",
      "dialogue": "Here's what happens when...",
      "code": "public class Main { ... broken code ... }",
      "error": "Error message"
    },
    {
      "phase": 3,
      "title": "You Try",
      "dialogue": "Your turn!",
      "prompt": "What keyword starts a Java class definition?",
      "answer": "class",
      "hint": "It's a reserved word in Java.",
      "solution": "class"
    }
  ]
}
```

### Adding a New Outfit

1. Create a folder under `public/sprites/uniforms/<outfit-name>/`
2. Drop in 6 PNGs named: `teaching.png`, `idle.png`, `oops.png`, `thinking.png`, `frustrated.png`, `excited.png`
3. Add an entry to `src/data/shopItems.js` with `spriteOverrides` mapping each expression state to the correct file path
4. That's it — `JavaChan.jsx` and `Shop.jsx` both read `spriteOverrides` automatically

### Developer Cheat Mode

In the Shop page, **triple-click the Shop title** to toggle the dev cheat:
- First triple-click → instantly sets XP to 9999 and level to 10 (unlocks everything)
- Second triple-click → resets XP and level back to 0 / 1

---

## Roadmap

### Phase 1 (Current) ✅
- All 75 lessons authored and published
- Full cosmetics system — 5 app themes, 12 outfits (all with real sprite art), 10 downloadable wallpapers
- XP/leveling, shop, expressions, domain expansion
- Meet My Sisters cross-studio rail, background music with volume control
- localStorage persistence, no account required

### Phase 2 (Planned)
- PostgreSQL + Express API backend
- User accounts and cross-device sync
- Progress stored server-side (the store already has a `_resetForMigration` hook and storage adapter pattern ready for this)
- Instructor view: class-wide completion dashboards
- No frontend rewrite required — only the storage layer changes

---

## Credits & Assets

**Character Art**: Java-chan's sprites were generated using AI tools and hand-curated for expression consistency by [@albertofelix08](https://github.com/albertofelix08). All character designs are proprietary to Omega Mu Gamma Studio.

**Music**: Java-chan's background music was composed by Aaron Felix J, Omega Mu Gamma Studio's Music Director.

**Note**: As a free, open-source educational tool, we prioritized shipping a complete learning experience over commissioning custom art. If you're an artist interested in contributing official character designs, reach out — we'd love to collaborate.

---

## Part of Omega Mu Gamma Studio

Java-chan is one of the flagship tools from Omega Mu Gamma Studio — a student-built suite of open-source engineering and CS education tools.

**The Chan series** (anime-guided programming tutors, same three-phase teaching model):

| Tool | Language |
|------|----------|
| **Java-chan** | Java (CS22301) — *this repo* |
| [PlusPlus-Chan](https://plusplus-chan.vercel.app) | C++ |
| [Python-Chan](https://python-chan.vercel.app) | Python |
| [Rust-Chan](https://rust-chan.vercel.app) | Rust |
| [Go-Chan](https://go-chan.vercel.app) | Go |
| [Sharp-Chan](https://sharp-chan.vercel.app) | C# |
| [Kotlin-Chan](https://kotlin-chan.vercel.app) | Kotlin |

**Other studio tools:**

| Tool | What it does |
|------|-------------|
| [SeeDS](https://see-ds.vercel.app) | 3D data structure visualizer and bug detector |
| [KMapX](https://kmapx.vercel.app) | Boolean expression simplifier (Quine–McCluskey) |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator for ME22201 |
| [GateLab](https://gatelab.vercel.app) | 2D digital logic schematic playground (CS22303) |
| [ArchVisor](https://arch-visor.vercel.app) | Computer Organization & Architecture platform (CS22304) |
| [ThermOS](https://thermos-omg.vercel.app) | Interactive modules for Engineering Thermodynamics (ME22301) |
| [BlockBeats](https://github.com/Omega-Mu-Gamma-Studio/BlockBeats) | Block-based music production and DAW tutor |

---

## License

This project is licensed under the **[PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)**.

You may use, modify, and share this software for **noncommercial purposes** only. This includes:
- Personal study and hobby projects
- Educational and research use
- Use by noncommercial organizations (charities, educational institutions, government bodies)

**Commercial use is prohibited** without a separate commercial license from Omega Mu Gamma Studio.

**The character art, sprites, and visual assets for Java-chan are also proprietary.** They may not be reproduced, redistributed, or used outside this project without explicit permission.

For commercial licensing inquiries, contact Omega Mu Gamma Studio.

© 2026 Omega Mu Gamma Studio
