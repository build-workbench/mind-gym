# Copilot Instructions for Mind Gym

## Project Context

This is a zero-dependency browser-based memory training game built with Vanilla JavaScript and Tailwind CSS. The project follows OpenSpec-driven development.

### Tech Stack

- **Frontend**: Vanilla JS (ES2022), no build system
- **Styling**: Tailwind CSS 3.4 (CLI compiled)
- **Testing**: Jest 30 with jsdom
- **Deployment**: GitHub Pages (static hosting)
- **Storage**: localStorage (offline-first)
- **PWA**: Service Worker with cache-first strategy

### Key Constraints

- No runtime dependencies
- Total size < 100KB
- Lighthouse score 95+
- Works offline after first load

---

## Architecture Overview

### Three-Layer State Architecture

```
Settings (Persistent) → GameState (Runtime) → ModeState (On-Demand)
```

| Layer        | Module                | Responsibility                          |
| ------------ | --------------------- | --------------------------------------- |
| Settings     | `settings-manager.js` | User preferences, auto-persist          |
| GameState    | `game-state.js`       | Runtime state coordinator               |
| GameManager  | `game-manager.js`     | Card flip/match/win logic (deep module) |
| ModalManager | `modal-manager.js`    | Modal + focus trap (deep module)        |
| NBackState   | `nback-state.js`      | N-back mode state                       |
| RecallState  | `recall-state.js`     | Delayed recall mode state               |

---

## Coding Conventions

### JavaScript

- Use UMD pattern for modules (expose via `window.RememberXxx`)
- localStorage keys use `memory_match_` prefix
- Follow Prettier config: single quotes, trailing commas, 100 char line width
- Use ES2022 features (optional chaining, nullish coalescing)

### Module Loading Order

```
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/game-manager.js → src/modal-manager.js
→ src/i18n.js → src/effects.js → src/pools.js → src/timer.js → src/confetti.js
→ src/ui-events.js → src/ui.js → app.js
```

### CSS

- Edit `styles/app.css` only
- Run `npm run build:css` to compile
- Never edit `assets/app.css` directly

---

## Deep Module Design

### What is a Deep Module?

Deep modules have a small interface but hide large implementation complexity.

**Example: GameManager**

```javascript
// Small interface (3 methods)
window.RememberGameManager = {
  flip(cardIndex, cardValue),  // Returns { matched, won, state }
  reset(totalPairs),
  getState(),
};

// Hidden complexity:
// - Card flip validation
// - Match detection
// - Win condition checking
// - State transitions
// - Move counting
```

### Benefits

1. **Locality** — Bugs isolated to one module
2. **Leverage** — High capability per interface unit
3. **Testability** — Independent testing

---

## OpenSpec Workflow

### Before Writing Code

1. Check `openspec/specs/` for relevant specifications
2. Use OpenSpec workflow for changes (`/opsx:propose`, `/opsx:apply`, `/opsx:archive`)
3. No gold-plating — implement only what's specified

### For New Features

```
/opsx:propose "feature description" → Creates proposal in openspec/changes/
/opsx:apply → Implements tasks
/opsx:archive → Merges to openspec/specs/
```

### For Bug Fixes

```
/opsx:explore → Investigate issue
/opsx:propose "fix description" → Create fix proposal
/opsx:apply → Implement fix
```

---

## Testing

### Commands

```bash
npm test              # Run all tests (291 tests)
npm run test:coverage # Run with coverage report
npx jest __tests__/specific.test.js  # Run single test file
```

### Target Coverage: 60%+

### Testing Guidelines

- Use Jest with jsdom environment
- Mock localStorage and DOM elements as needed
- Cover edge cases defined in specs
- Test deep module interfaces (not internal implementation)

---

## Project Structure

```
├── index.html        # SPA entry point
├── app.js            # Game orchestrator (main loop)
├── sw.js             # Service Worker
├── src/              # Core modules
│   ├── game-state.js     # State coordinator
│   ├── game-manager.js   # Card logic (deep module)
│   ├── modal-manager.js  # Modal management (deep module)
│   ├── settings-manager.js # Settings
│   ├── nback-state.js    # N-back state
│   ├── recall-state.js   # Recall state
│   ├── storage.js    # localStorage CRUD
│   ├── stats.js      # Statistics aggregation
│   ├── modes.js      # N-back and recall logic
│   ├── fsrs.js       # FSRS-4.5 spaced repetition
│   ├── i18n.js       # Internationalization
│   └── ...           # Other modules
├── openspec/         # Specifications (source of truth)
│   ├── specs/        # Capability specifications
│   ├── rfc/          # Architecture decisions
│   └── changes/      # Active change proposals
├── docs/             # User documentation
└── __tests__/        # Jest test files
```

---

## Commit Convention

Use Conventional Commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting)
- `refactor:` — Code refactoring
- `test:` — Test changes
- `chore:` — Maintenance tasks
- `ci:` — CI/CD changes
- `spec:` — Specification updates

Allowed scopes: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## Internationalization

- Primary language: English (code, comments, docs)
- UI supports Chinese via i18n system
- User docs available in both languages

---

## Common Patterns

### Adding a New Module

```javascript
// src/new-module.js
(function (global) {
  'use strict';

  const NewModule = {
    // Public API - keep interface small (deep module)
    init() {
      /* ... */
    },
  };

  // Expose globally
  global.RememberNewModule = NewModule;
})(typeof window !== 'undefined' ? window : global);
```

### localStorage Access

```javascript
// Always use prefix
const KEY = 'memory_match_settings';

// Use safe parsing
function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
```

### Deep Module Pattern

```javascript
// Deep module: small interface, hidden complexity
const DeepModule = {
  // Public interface (keep minimal)
  doSomething(input) {
    return this._internalLogic(input);
  },

  // Private implementation (hide complexity)
  _internalLogic(input) {
    // Complex logic here...
  },
};
```

---

## Quick Reference

| Task             | Command                  |
| ---------------- | ------------------------ |
| Run tests        | `npm test`               |
| Check formatting | `npm run lint`           |
| Format code      | `npm run format`         |
| Build CSS        | `npm run build:css`      |
| Prepare deploy   | `npm run prepare:deploy` |
| View specs       | `ls openspec/specs/`     |

---

## Related Documents

- [CLAUDE.md](../CLAUDE.md) — Full development guide
- [AGENTS.md](../AGENTS.md) — AI assistant guide
- [CONTEXT.md](../CONTEXT.md) — Domain terminology
- [openspec/specs/](../openspec/specs/) — Technical specifications
