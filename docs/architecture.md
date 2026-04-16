# Architecture Overview

This document describes the system design, module responsibilities, and data flow of Mind Gym.

---

## Project Characteristics

| Characteristic       | Implementation                              |
| -------------------- | ------------------------------------------- |
| **Deployment**       | Static frontend, no backend required        |
| **Build Tool**       | None; only Tailwind CLI for CSS compilation |
| **Framework**        | Vanilla JavaScript (ES2022)                 |
| **State Management** | In-memory variables + localStorage          |
| **PWA**              | Service Worker + Web App Manifest           |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      UI Layer                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │ Toolbar  │ │  Grid    │ │ Modals   │ │ Toasts   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    app.js (Orchestrator)                 │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │    │
│  │  │ State       │ │ Game Loop   │ │ Mode Logic  │       │    │
│  │  │ Management  │ │ (flip/match)│ │ (nback/etc) │       │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     src/ Modules                         │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│    │
│  │  │storage │ │ stats  │ │ modes  │ │  i18n  │ │effects ││    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│    │
│  │  │ timer  │ │ pools  │ │confetti│ │  ui    │ │ keys   ││    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    localStorage                          │    │
│  │  settings | stats | achievements | best | leaderboard   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Responsibilities

### Core Modules

| Module           | File                  | Responsibility                                                |
| ---------------- | --------------------- | ------------------------------------------------------------- |
| **Orchestrator** | `app.js`              | Game main loop, state machine, mode dispatch, UI coordination |
| **Storage**      | `src/storage.js`      | localStorage CRUD, data normalization                         |
| **Stats**        | `src/stats.js`        | Statistics aggregation and calculation                        |
| **Modes**        | `src/modes.js`        | N-back and delayed recall logic                               |
| **Achievements** | `src/achievements.js` | Achievement definitions and unlock checking                   |

### Support Modules

| Module            | File                   | Responsibility                                  |
| ----------------- | ---------------------- | ----------------------------------------------- |
| **Keys**          | `src/keys.js`          | localStorage key constants                      |
| **Utils**         | `src/utils.js`         | Shuffle, seeded RNG, HTML escape                |
| **I18n**          | `src/i18n.js`          | Internationalization dictionaries and detection |
| **Effects**       | `src/effects.js`       | Sound effects (Web Audio) and vibration         |
| **Pools**         | `src/pools.js`         | Card face asset pools                           |
| **Timer**         | `src/timer.js`         | Elapsed time / countdown management             |
| **Confetti**      | `src/confetti.js`      | Victory particle animation                      |
| **UI**            | `src/ui.js`            | DOM element bindings                            |
| **UI Events**     | `src/ui-events.js`     | Event listener registration                     |
| **Import/Export** | `src/import-export.js` | Backup data normalization                       |

---

## Data Flow

### Initialization Flow

```
DOMContentLoaded
    │
    ├── bind DOM elements (ui.js)
    │
    ├── load settings (storage.js)
    │
    ├── apply theme/accent/motion
    │
    ├── apply language (i18n.js)
    │
    ├── register Service Worker
    │
    └── initGame(difficulty)
            │
            ├── createDeck()
            │
            ├── render cards to grid
            │
            └── reset state (moves, timer, hints)
```

### Game Loop Flow

```
onFlip(card)
    │
    ├── check lock/pause conditions
    │
    ├── flip card (animation)
    │
    ├── if firstCard:
    │       └── store and return
    │
    ├── if secondCard:
    │       │
    │       ├── match?
    │       │       ├── lock cards
    │       │       ├── update combo
    │       │       ├── check win
    │       │       └── update progress
    │       │
    │       └── no match?
    │               ├── flip back after delay
    │               └── reset combo
    │
    └── reset board state
```

### Win/End Flow

```
onWin()
    │
    ├── stop timer
    │
    ├── update best score
    │
    ├── update leaderboard
    │
    ├── update stats
    │
    ├── update adaptive rating
    │
    ├── apply spaced reinforcement
    │
    ├── check achievements
    │
    ├── show win modal
    │
    ├── run confetti animation
    │
    └── open recall test

onTimeUp()
    │
    ├── lock board
    │
    ├── show lose modal
    │
    └── update adaptive rating
```

---

## State Management

### Game State Variables (app.js)

```javascript
// Game progress
let firstCard = null; // First flipped card
let secondCard = null; // Second flipped card
let lockBoard = false; // Board locked state
let moves = 0; // Move count
let matchedPairs = 0; // Matched pairs count
let started = false; // Game started flag

// Timing
let elapsed = 0; // Elapsed time (seconds)
let countdownLeft = 0; // Countdown remaining
let timerId = null; // Timer ID

// Difficulty & Settings
let currentDifficulty = 'easy';
let settings = { ...DEFAULT_SETTINGS };

// Special states
let paused = false;
let isPreviewing = false;
let timeUp = false;
let hintsLeft = 0;
let hintsUsed = 0;

// Combo system
let comboCount = 0;
let maxComboThisGame = 0;
let lastMatchAt = 0;

// Recall test
let seenCountMap = new Map();
let lastGameValues = [];
let recallCorrectSet = new Set();

// N-back mode
let nbackRunning = false;
let nbackTimer = null;
let nbackSeq = [];
let nbackIdx = 0;
// ... more N-back state

// Daily challenge
let dailyActive = false;
let dailySeed = 0;
```

---

## Performance Considerations

### Rendering Performance

| Technique       | Implementation                       | Benefit                      |
| --------------- | ------------------------------------ | ---------------------------- |
| CSS Transforms  | `transform: rotateY()` for card flip | GPU acceleration             |
| CSS Transitions | `transition: transform 0.3s`         | Smooth 60fps animations      |
| Canvas 2D       | `confetti.js` particle system        | Efficient particle rendering |
| Virtual List    | N/A (fixed grid sizes)               | Not needed for this scale    |

### Memory Management

| Strategy         | Implementation                             |
| ---------------- | ------------------------------------------ |
| Event Delegation | Single listeners on containers vs per-card |
| Timer Cleanup    | `clearInterval()` on game end/modal close  |
| DOM Caching      | Elements cached in `ui.js`, not re-queried |
| State Reset      | All game state reset on `initGame()`       |

---

## Extension Architecture

### Adding a New Training Mode

1. **Logic Module** - Add to `src/modes.js`
   - Implement pure logic functions
   - Accept parameters object, return results
   - No DOM manipulation

2. **State Management** - Add to `app.js`
   - Initialize mode state variables
   - Add mode control functions

3. **UI Integration** - Modify `index.html` + `src/ui.js`
   - Add modal if needed
   - Bind UI elements in `ui.js`

4. **Localization** - Update `src/i18n.js`
   - Add mode name and description keys
   - Both Chinese and English

5. **Documentation** - Update `docs/modes.md`
   - Add mode specifications
   - Include implementation examples

6. **Testing** - Create `__tests__/newmode.test.js`
   - Test core logic functions
   - Mock dependencies

### Adding a New Card Theme

1. **Asset Definition** - `src/pools.js`
   - Add emoji/string array for new theme
   - Follow naming convention

2. **Localization** - `src/i18n.js`
   - Add theme display name translations

3. **Validator Update** - `src/import-export.js`
   - Update `VALID_THEMES` array

4. **Documentation** - Update relevant docs
   - List in storage.md theme enum

---

## Architecture Roadmap

### Current State

- `app.js` remains large (~2500 lines)
- UMD modules work well but could use ES Modules
- No bundler keeps deployment simple

### Future Improvements

| Priority | Change                | Impact                       |
| -------- | --------------------- | ---------------------------- |
| P1       | ES Modules migration  | Tree-shaking, modern imports |
| P2       | Extract `nback.js`    | Isolated N-back module       |
| P3       | Extract `recall.js`   | Isolated recall test module  |
| P4       | Extract `daily.js`    | Isolated daily challenge     |
| P5       | Extract `adaptive.js` | Isolated adaptive system     |

---

## Browser Compatibility

| Feature        | Chrome | Firefox | Safari | Edge |
| -------------- | ------ | ------- | ------ | ---- |
| Core Game      | 90+    | 90+     | 14+    | 90+  |
| Web Audio      | 90+    | 90+     | 14+    | 90+  |
| Vibration API  | 90+    | 90+\*   | No     | 90+  |
| Service Worker | 90+    | 90+     | 14+    | 90+  |
| localStorage   | 90+    | 90+     | 14+    | 90+  |

\* Firefox mobile only

---

_For implementation details of specific modes, see [Training Modes](./modes.md). For data structures, see [Storage Model](./storage.md)._
