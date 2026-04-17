# RFC-0001: Core Architecture

| Status    | Accepted     |
| --------- | ------------ |
| Created   | 2025-12-19   |
| Updated   | 2026-04-17   |

## Summary

This RFC defines the core architecture of Mind Gym: a zero-runtime-dependency browser-based memory training game using Vanilla JavaScript and Tailwind CSS, with no build system beyond CSS compilation.

## Motivation

The goal is to create a lightweight, fast-loading PWA that:
1. Works offline after first load
2. Requires no build step for JavaScript
3. Can be hosted on static file servers
4. Is easy to understand and contribute to

## Architecture

### System Overview

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

### Module Loading Order

Modules are loaded via `<script>` tags in `index.html` in dependency order:

```
src/keys.js → src/utils.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/i18n.js → src/effects.js
→ src/pools.js → src/timer.js → src/confetti.js → src/ui-events.js → src/ui.js → app.js
```

Each module exposes a global object (UMD pattern):
- `window.RememberStorage`
- `window.RememberI18n`
- etc.

### Module Responsibilities

#### Core Modules

| Module           | File                  | Responsibility                                                |
| ---------------- | --------------------- | ------------------------------------------------------------- |
| **Orchestrator** | `app.js`              | Game main loop, state machine, mode dispatch, UI coordination |
| **Storage**      | `src/storage.js`      | localStorage CRUD, data normalization                         |
| **Stats**        | `src/stats.js`        | Statistics aggregation and calculation                        |
| **Modes**        | `src/modes.js`        | N-back and delayed recall logic                               |
| **Achievements** | `src/achievements.js` | Achievement definitions and unlock checking                   |

#### Support Modules

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

## Design Decisions

### Why No Build System?

1. **Simplicity**: No bundler configuration to maintain
2. **Speed**: Instant development iteration
3. **Transparency**: Source files map 1:1 to loaded scripts
4. **Hosting**: Works on any static file server

### Why UMD Modules?

1. **Browser-native**: Works without bundler
2. **Clear dependencies**: Loading order enforced by HTML
3. **Testability**: Individual modules can be mocked
4. **Debugging**: No source maps needed

### Why localStorage?

1. **Offline-first**: No server required
2. **Privacy**: Data stays on user's device
3. **Simplicity**: No backend infrastructure
4. **Portability**: Export/import as JSON

### Why Tailwind CLI?

1. **No runtime dependency**: CSS is pre-compiled
2. **Small bundle**: Only used classes included
3. **Design consistency**: Utility classes enforce patterns
4. **Customization**: Easy to modify theme colors

## Performance Considerations

### Rendering Performance

| Technique       | Implementation                       | Benefit                      |
| --------------- | ------------------------------------ | ---------------------------- |
| CSS Transforms  | `transform: rotateY()` for card flip | GPU acceleration             |
| CSS Transitions | `transition: transform 0.3s`         | Smooth 60fps animations      |
| Canvas 2D       | `confetti.js` particle system        | Efficient particle rendering |

### Memory Management

| Strategy         | Implementation                             |
| ---------------- | ------------------------------------------ |
| Event Delegation | Single listeners on containers vs per-card |
| Timer Cleanup    | `clearInterval()` on game end/modal close  |
| DOM Caching      | Elements cached in `ui.js`, not re-queried |
| State Reset      | All game state reset on `initGame()`       |

## Browser Support

| Feature        | Chrome | Firefox | Safari | Edge |
| -------------- | ------ | ------- | ------ | ---- |
| Core Game      | 90+    | 90+     | 14+    | 90+  |
| Web Audio      | 90+    | 90+     | 14+    | 90+  |
| Vibration API  | 90+    | 90+\*   | No     | 90+  |
| Service Worker | 90+    | 90+     | 14+    | 90+  |
| localStorage   | 90+    | 90+     | 14+    | 90+  |

\* Firefox mobile only

## Future Considerations

### Potential Refactoring

| Priority | Change                | Impact                       |
| -------- | --------------------- | ---------------------------- |
| P1       | ES Modules migration  | Tree-shaking, modern imports |
| P2       | Extract `nback.js`    | Isolated N-back module       |
| P3       | Extract `recall.js`   | Isolated recall test module  |
| P4       | Extract `daily.js`    | Isolated daily challenge     |
| P5       | Extract `adaptive.js` | Isolated adaptive system     |

### Migration to ES Modules (Future)

```javascript
// Current (UMD)
// src/storage.js
window.RememberStorage = { ... };

// Future (ES Modules)
// src/storage.js
export const loadSettings = () => { ... };
export const saveSettings = (s) => { ... };
```

## References

- [Data Model Specification](../db/schema.md)
- [PWA Strategy](./0003-pwa-offline.md)
- [Storage Specification](../db/storage-spec.md)
