---
title: System Overview
description: Architecture map for the app runtime, docs shell, and operational boundaries of Mind Gym.
---

# System Overview

Mind Gym is two related systems shipped from one repository:

1. **The game runtime:** a browser-native memory training application served as static files.
2. **The docs shell:** a VitePress whitepaper layer that explains the runtime to humans.

The important architectural point is that neither system depends on a custom backend. The game leans on browser primitives, while the docs site leans on static generation.

<div class="mind-rail">
  <div class="mind-rail__label">How to read this page</div>
  <div>
    <p>Treat the diagram and tables as an audit path. Start at the browser shell, move into the runtime coordinator, then follow the state and persistence boundaries down to concrete files.</p>
  </div>
</div>

## Runtime map

<figure class="mind-diagram" role="img" aria-label="System overview diagram">
  <img class="mind-diagram__image mind-diagram__image--light" src="/diagrams/system-overview-light.svg" alt="" />
  <img class="mind-diagram__image mind-diagram__image--dark" src="/diagrams/system-overview-dark.svg" alt="" />
</figure>

<p class="mind-caption">Read left to right: the browser loads either the playable shell or the docs shell, then hands the runtime to <code>app.js</code>, which coordinates UI, state, modes, storage, and offline behavior.</p>

## Deployment model

| Surface                | Technology                                       | Why it fits                                                            |
| ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| **Playable app**       | Static HTML + Vanilla JS + compiled Tailwind CSS | Minimal runtime complexity and direct source-to-runtime mapping        |
| **Documentation site** | VitePress with static SVG figures                | Lightweight publishing layer for architecture-heavy pages              |
| **Persistence**        | localStorage                                     | Sufficient for settings, scores, stats, mastery, and offline ownership |
| **Offline delivery**   | Service Worker + Web App Manifest                | Supports repeat visits, installability, and resilient short sessions   |

## Major runtime boundaries

### `index.html` as the composition root

The application is assembled through script tags in dependency order. This matters because the repository favors UMD-style modules exposed on `window`, which keeps module resolution explicit and debuggable without a JavaScript bundler.

### `app.js` as orchestrator

`app.js` remains the broad coordinator for the game loop, UI reactions, and mode dispatch. The architectural intent is not to make `app.js` tiny. It is to keep `app.js` from being the only place where complex logic can live.

### Deep modules for concentrated complexity

Several areas with non-trivial behavior are delegated to focused modules:

- `src/game-manager.js` for card flipping, matching, locking, and win detection.
- `src/modal-manager.js` for modal stacking, focus trap, and focus restoration.
- `src/ui/renderer.js` for DOM rendering concerns.
- `src/pipeline/win-pipeline.js` for post-win sequencing.

### State-bearing modules

Mind Gym now distinguishes between:

- **Persistent settings** via `src/settings-manager.js`
- **Runtime session control** via `src/game-state.js`
- **Mode-specific state** via `src/nback-state.js` and `src/recall-state.js`

That separation is the main reason multiple training modes can coexist without collapsing into one monolithic state object.

## Data flow in practice

### Session bootstrap

1. Browser loads `index.html` and compiled CSS.
2. Script tags load source modules in declared order.
3. `app.js` binds DOM references from `src/ui.js`.
4. Settings and persisted data are loaded from `src/storage.js` and localStorage.
5. The app applies theme, language, motion, and current gameplay defaults.
6. The Service Worker registers to support caching and updates.

### Session execution

1. A mode is selected or resumed.
2. `app.js` initializes GameState and any mode-specific state.
3. Renderer and effects modules translate state transitions into visible changes.
4. Storage is consulted at boundaries where persistence matters: best scores, leaderboards, stats, achievements, adaptive data, and mastery data.

### Session completion

Win handling does more than open a modal. The win pipeline can stop timers, update scores, record stats, adjust adaptive rating, update mastery, trigger achievements, and optionally open recall testing. This is a useful example of orchestration extracted into a dedicated deep module.

## File-system shape

| Zone                        | Representative files                                                                    | Responsibility                                   |
| --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Shell**                   | `index.html`, `assets/app.css`, `manifest.webmanifest`                                  | Entry point, styling artifact, install metadata  |
| **Runtime orchestration**   | `app.js`, `src/game-state.js`, `src/settings-manager.js`                                | Session coordination and high-level state policy |
| **Domain logic**            | `src/game-manager.js`, `src/modes.js`, `src/fsrs.js`, `src/adaptive.js`, `src/daily.js` | Gameplay rules and progression logic             |
| **Mode specialization**     | `src/nback-state.js`, `src/recall-state.js`, `src/modes/*.js`                           | Mode-specific workflows                          |
| **UI infrastructure**       | `src/ui.js`, `src/ui-events.js`, `src/ui/renderer.js`, `src/modal-manager.js`           | Bindings, events, rendering, accessibility       |
| **Persistence and offline** | `src/storage.js`, `src/keys.js`, `sw.js`                                                | Durable local state and cached delivery          |
| **Docs shell**              | `docs/.vitepress/*`, `docs/en/*`, `docs/zh/*`                                           | Whitepaper navigation and publishing             |

## Why senior reviewers care

Mind Gym is not architecturally interesting because it is huge. It is interesting because its claims can be verified quickly:

- The source files are named after their responsibilities.
- The runtime does not hide behind build-time indirection.
- The offline story can be inspected directly in `sw.js`.
- The state model can be traced from docs to concrete modules.

## Practical conclusion

The system overview should leave readers with one mental model: **Mind Gym is a static, browser-first product whose leverage comes from disciplined boundaries, not from infrastructure scale.**
