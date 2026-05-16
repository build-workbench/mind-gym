# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) for working with this codebase.

---

## Project Philosophy: Spec-Driven Development with OpenSpec

This project uses **OpenSpec** for structured change management. All specifications are maintained in the `openspec/` directory as the Single Source of Truth.

### Directory Context

| Directory                | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `openspec/specs/`        | Capability specifications (source of truth)       |
| `openspec/rfc/`          | Architectural decision records                    |
| `openspec/changes/`      | Active change proposals                           |
| `openspec/explorations/` | Research artifacts                                |
| `docs/`                  | User guides, tutorials, and architecture overview |
| `changelog/`             | Version history and release notes                 |

### OpenSpec Workflow

#### For New Features

```
/opsx:propose "add leaderboard sharing"
  → Creates openspec/changes/add-leaderboard-sharing/
  → Generates proposal.md, specs/, design.md, tasks.md

/opsx:apply
  → Implements tasks from tasks.md
  → Marks completed items with [x]

/opsx:archive
  → Merges delta specs into openspec/specs/
  → Moves change to archive/ with date prefix
```

#### For Bug Fixes

```
/opsx:explore
  → Investigate the issue
  → Create exploration notes in openspec/explorations/

/opsx:propose "fix timer pause bug"
  → Create structured fix proposal

/opsx:apply → /opsx:archive
```

### AI Agent Rules

1. **Always check openspec/specs/ first** - This is the source of truth
2. **Use /opsx:propose for changes** - Never edit specs directly
3. **Follow delta spec format** - ADDED/MODIFIED/REMOVED sections
4. **Archive completed changes** - Keep changes/ clean

---

## Code Generation Rules

| Rule            | Description                                         |
| --------------- | --------------------------------------------------- |
| New Features    | Use `/opsx:propose` to create change proposal first |
| Spec Changes    | All changes to specs go through OpenSpec workflow   |
| Implementation  | 100% compliance with the spec in `openspec/specs/`  |
| No Gold-Plating | Do not add features not defined in specs            |

---

## Commands

```bash
npm test                  # Run Jest unit tests (291 tests)
npm run lint              # Check code formatting with Prettier
npm run format            # Auto-format all files
npm run build:css         # Compile Tailwind CSS → assets/app.css (minified)
npm run prepare:deploy    # build:css + copy files to dist/
```

Run a single test file:

```bash
npx jest __tests__/helpers.test.js
```

---

## Architecture

**Mind Gym** is a zero-dependency browser-based memory training game (Vanilla JS + Tailwind CSS). No bundler — static files are served directly.

### Three-Layer State Architecture

```
┌─────────────────────────────────────────────┐
│           Settings (Persistent)              │
│  sound, vibrate, theme, accent, volume...   │
│  → src/settings-manager.js                  │
│  → Auto-persist to localStorage             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      GameState (Runtime Core State)          │
│  difficulty, started, paused, elapsed...     │
│  [Delegates to GameManager for card state]   │
│  → src/game-state.js                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    ModeState (Mode-Specific, On-Demand)      │
│                                             │
│  NBackState: running, timer, seq, idx...    │
│  RecallState: lastGameValues, correctSet    │
│  → src/nback-state.js, src/recall-state.js  │
└─────────────────────────────────────────────┘
```

### Module Loading Order (index.html script tags)

```
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/game-manager.js → src/modal-manager.js
→ src/i18n.js → src/effects.js → src/pools.js → src/timer.js → src/confetti.js
→ src/ui-events.js → src/ui.js → app.js
```

Each `src/` module exposes a global object (e.g., `window.RememberStorage`, `window.RememberI18n`). `app.js` is the game orchestrator consuming all modules.

### Key Files

| File                      | Responsibility                                                          |
| ------------------------- | ----------------------------------------------------------------------- |
| `app.js`                  | Game main loop, state machine, all mode logic (~2275 lines)             |
| `src/game-state.js`       | Runtime state coordinator, delegates to GameManager                     |
| `src/game-manager.js`     | Deep module: card flip/match/win logic (flip, reset, getState)          |
| `src/modal-manager.js`    | Deep module: modal open/close/focus trap (open, close)                  |
| `src/settings-manager.js` | User preferences with auto-persist (get, set, getAll, setAll)           |
| `src/nback-state.js`      | N-back mode state: running, timer, sequence, stats                      |
| `src/recall-state.js`     | Delayed recall mode: generateTest, submitAnswer                         |
| `src/shared.js`           | Shared utilities: isPlainObject, clampInt, clampNumber                  |
| `src/storage.js`          | localStorage CRUD — settings, scores, stats, achievements               |
| `src/stats.js`            | Statistics normalization and aggregation logic                          |
| `src/achievements.js`     | Achievement definitions and check logic                                 |
| `src/modes.js`            | Pure logic for N-back and recall tests                                  |
| `src/import-export.js`    | Backup/restore data normalization                                       |
| `src/fsrs.js`             | FSRS-4.5 spaced repetition algorithm                                    |
| `src/i18n.js`             | zh/en dictionary; auto-detect browser language                          |
| `src/ui.js`               | DOM element bindings (single source of truth for elements)              |
| `src/ui-events.js`        | Event listener registration                                             |
| `src/pools.js`            | Card face asset pools (emoji, numbers, letters, shapes, colors)         |
| `src/timer.js`            | Countdown and timer management                                          |
| `src/effects.js`          | Web Audio API sound effects and Vibration API                           |
| `src/confetti.js`         | Canvas 2D victory animation                                             |
| `sw.js`                   | Service Worker: cache-first for resources, network-first for navigation |

### Deep Module Design Principles

#### What is a Deep Module?

**Deep Module** = Small interface + Large implementation

Example: `GameManager` has only 3 public methods but hides a complete state machine:

```javascript
// src/game-manager.js - Deep Module Interface
window.RememberGameManager = {
  flip(cardIndex, cardValue),  // Returns { matched, won, state }
  reset(totalPairs),           // Reset game state
  getState(),                  // Get current state snapshot
};
```

Hidden complexity includes:

- Card flip validation
- Match detection algorithm
- Win condition checking
- State transitions
- Move counting

#### Benefits of Deep Modules

1. **Locality** — Changes, bugs, and knowledge concentrated in one place
2. **Leverage** — High capability per unit of interface
3. **Testability** — Each module independently testable

### Game Modes

1. **Classic** — Flip cards to match pairs, record time and moves
2. **Countdown** — Time limit per difficulty level
3. **Daily Challenge** — Generate seed from date + difficulty + theme (global same deck)
4. **N-back** — Determine if current card matches N steps ago (hotkey: J)
5. **Delayed Recall** — Post-game test to check which cards appeared

### localStorage Key Naming Convention

All keys use `memory_match_` prefix:

| Key Pattern                        | Purpose                           |
| ---------------------------------- | --------------------------------- |
| `_settings`                        | User settings                     |
| `_best_<difficulty>`               | Best score per difficulty         |
| `_lb_<difficulty>`                 | Leaderboard per difficulty        |
| `_achievements`                    | Achievement data                  |
| `_stats`                           | Statistics data                   |
| `_adaptive`                        | Adaptive rating (600–1600)        |
| `_mastery_<theme>`                 | FSRS mastery data per theme       |
| `_daily_<YYYY-MM-DD>_<difficulty>` | Daily challenge completion status |

### CSS Workflow

Source file: `styles/app.css` → Compiled via Tailwind CLI to `assets/app.css`.
Run `npm run build:css` after editing `styles/app.css`. **Do not edit `assets/app.css` directly.**

### Deployment

GitHub Actions (`pages.yml`) runs lint → test → `prepare:deploy` → upload `dist/` to GitHub Pages (triggered on push to master).

---

## Code Style

- **Prettier**: Single quotes, trailing commas, 100 character line width, 2-space indent, LF
- **Commit Format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `test:`, `chore:`, `ci:`, `spec:`)
- **Allowed PR Scopes**: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## Testing Strategy

### Test Coverage

- Total tests: 291 (19 test suites)
- Key modules tested: storage, stats, fsrs, game-state, game-manager, modal-manager

### Test Patterns

```javascript
// Pattern: Test deep module interface
describe('GameManager', () => {
  test('flip returns match result', () => {
    const gm = new GameManager(6);
    const result = gm.flip(0, 'card1');
    expect(result).toHaveProperty('matched');
    expect(result).toHaveProperty('won');
    expect(result).toHaveProperty('state');
  });
});
```

---

## Changelog

All changes are recorded in the `changelog/` directory.

---

## currentDate

Today's date: 2026/05/08.

---

## Project Status: Final Release (v1.11.0)

**Last major refactoring**: 2026-05-08

### For Successor Models

- All specs are in `openspec/specs/`
- User docs are in `docs/`
- Architecture decisions in `openspec/rfc/`
- Follow OpenSpec workflow for any changes
- This project is in maintenance-only mode

### Key Architecture Decisions

1. **ADR-0001**: Three-layer state architecture (Settings → GameState → ModeState)
2. **ADR-0002**: i18n strategy (browser auto-detect, zh/en dictionary)
3. **ADR-0003**: PWA offline-first with Service Worker cache-first strategy
