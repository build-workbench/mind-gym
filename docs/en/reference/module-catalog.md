---
title: Module Catalog
description: File-by-file map of the major runtime modules and their architectural roles.
---

# Module Catalog

This catalog is not an API dump. It is a navigation layer for readers who want to move from architectural concepts to real files without losing the plot.

## Reading rule

When in doubt, prefer three questions over one giant search:

1. Which file owns this behavior?
2. Is it persistent state, runtime session state, mode-specific state, or UI / delivery infrastructure?
3. Does the logic belong in an orchestrator or a deep module?

## Primary runtime modules

| Area | File(s) | Role |
| --- | --- | --- |
| **App shell** | `index.html`, `app.js` | Entry point and top-level orchestration |
| **Keys and shared primitives** | `src/keys.js`, `src/utils.js`, `src/shared.js` | Key naming, utility functions, validation helpers |
| **Persistence** | `src/storage.js`, `src/settings-manager.js` | Data normalization, localStorage CRUD, settings policy |
| **Gameplay state** | `src/game-state.js`, `src/game-manager.js` | Session coordination and pair-matching state machine |
| **Modes** | `src/modes.js`, `src/modes/*.js`, `src/modes/registry.js` | Mode logic, registration, and specialization |
| **Mode-specific state** | `src/nback-state.js`, `src/recall-state.js`, `src/daily.js`, `src/adaptive.js` | Specialized workflows and progression helpers |
| **Progression and scoring** | `src/stats.js`, `src/achievements.js`, `src/fsrs.js` | Metrics, unlock logic, mastery scheduling |
| **UI infrastructure** | `src/ui.js`, `src/ui-events.js`, `src/ui/renderer.js`, `src/modal-manager.js` | DOM bindings, event wiring, rendering, accessibility |
| **Feedback and effects** | `src/effects.js`, `src/timer.js`, `src/confetti.js`, `src/pools.js` | Timers, audiovisual feedback, card-face pools |
| **Completion pipeline** | `src/pipeline/win-pipeline.js` | Ordered post-win side effects |
| **Offline delivery** | `sw.js`, `manifest.webmanifest` | Caching, installability, and resilient asset delivery |

## Deep modules worth special attention

| File | Why it is deep |
| --- | --- |
| `src/game-manager.js` | A tiny interface hides match validation, board lock behavior, move counting, and win detection. |
| `src/modal-manager.js` | Open/close looks simple, but the module also owns focus trapping, stack management, and focus restoration. |
| `src/ui/renderer.js` | It packages DOM rendering concerns so orchestration code can request effects without hand-writing DOM mutations everywhere. |
| `src/pipeline/win-pipeline.js` | It turns a many-step completion flow into an ordered, inspectable pipeline. |
| `src/game-state.js` | It presents a unified session surface while delegating specialized responsibilities to deeper modules. |

## Module boundary notes

### Persistence boundary

- `src/keys.js` defines naming conventions.
- `src/storage.js` performs low-level safe load/save/normalize work.
- `src/settings-manager.js` adds policy, validation, notifications, and a higher-level interface.

### Runtime state boundary

- `src/game-state.js` owns the live session contract.
- `src/game-manager.js` handles concentrated pair-matching logic.
- `src/timer.js` handles timing behavior instead of turning GameState into a clock implementation.

### Mode boundary

- `src/modes.js` provides shared mode logic helpers.
- `src/modes/registry.js` formalizes mode registration and switching.
- `src/modes/*.js` and dedicated mode state files keep mode-specific code isolated.

### UI boundary

- `src/ui.js` is the source of truth for bound elements.
- `src/ui-events.js` wires interactions.
- `src/ui/renderer.js` turns state changes into DOM updates.
- `src/modal-manager.js` centralizes accessibility-sensitive modal behavior.

## Script loading order

The runtime is composed in `index.html` through ordered script tags. A condensed view:

```text
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js
→ src/modes.js → src/import-export.js → src/storage.js → src/settings-manager.js
→ src/fsrs.js → src/nback-state.js → src/recall-state.js → src/adaptive.js → src/daily.js
→ src/game-manager.js → src/modal-manager.js → src/game-state.js
→ src/modes/registry.js → src/modes/classic.js → src/modes/countdown.js → src/modes/daily.js
→ src/modes/nback.js → src/modes/recall.js → src/i18n.js → src/effects.js → src/pools.js
→ src/timer.js → src/confetti.js → src/ui/renderer.js → src/pipeline/win-pipeline.js
→ src/ui-events.js → src/ui.js → app.js
```

This order is part of the architecture, not incidental trivia.

## Where to start for common edits

| If you want to change... | Start with | Cross-check |
| --- | --- | --- |
| Match / flip rules | `src/game-manager.js` | `src/game-state.js`, tests |
| Persistent settings | `src/settings-manager.js` | `src/storage.js`, `src/keys.js` |
| Leaderboards / stats / achievements | `src/storage.js`, `src/stats.js`, `src/achievements.js` | win pipeline and related UI |
| N-back behavior | `src/nback-state.js`, `src/modes/nback.js` | `src/modes.js` |
| Recall behavior | `src/recall-state.js`, `src/modes/recall.js` | `src/modes.js` |
| Offline delivery | `sw.js` | `manifest.webmanifest`, `index.html` |
| Docs structure | `docs/.vitepress/config.ts` and relevant docs page | bilingual counterpart page |

## Final orientation

The fastest way to get lost in Mind Gym is to treat it as a flat pile of files. The fastest way to understand it is to read it as a set of boundaries: shell, persistence, runtime state, mode state, UI infrastructure, and offline delivery.
