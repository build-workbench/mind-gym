---
title: Mind Gym Whitepaper
description: Editorial homepage for the Mind Gym whitepaper, architecture showcase, and contributor academy.
---

# Mind Gym Whitepaper

Mind Gym is a zero-dependency memory training PWA built for the open web: no backend, no runtime framework, no account wall, and no hidden infrastructure. This documentation site treats the project as both a **playable product** and a **technical argument**: that careful state boundaries, deep modules, and offline-first delivery can make a small browser game feel far more durable than its footprint suggests.

<div class="mind-panel">
  <p><strong>Why this site exists:</strong> senior engineers, reviewers, and contributors should be able to understand the product thesis, trace the runtime architecture, and map documentation claims back to real files such as <code>app.js</code>, <code>src/game-state.js</code>, <code>src/game-manager.js</code>, and <code>sw.js</code>.</p>
</div>

## The project in one page

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>Product thesis</h3>
    <p>Mind Gym turns short attention windows into deliberate practice through classic matching, countdown play, daily challenges, N-back, and delayed recall.</p>
  </div>
  <div class="mind-panel">
    <h3>Engineering thesis</h3>
    <p>A small JavaScript surface can still support rich behavior when persistence, runtime state, and mode-specific logic are isolated instead of blended together.</p>
  </div>
  <div class="mind-panel">
    <h3>Operational thesis</h3>
    <p>Offline-first delivery, local ownership of progress, and static hosting reduce infrastructure cost while improving resilience and privacy.</p>
  </div>
  <div class="mind-panel">
    <h3>Documentation thesis</h3>
    <p>The site is organized as a whitepaper, an academy, and a reference manual so different readers can enter at the level they need.</p>
  </div>
</div>

## What makes Mind Gym worth studying

| Signal | Why it matters |
| --- | --- |
| **Zero runtime dependencies** | The app ships as HTML, CSS, and browser-native JavaScript, which keeps the mapping between source files and runtime behavior unusually transparent. |
| **Three-layer state model** | Settings, GameState, and ModeState separate durable preferences from live session control and specialized mode workflows. |
| **Deep modules in key hotspots** | `src/game-manager.js`, `src/modal-manager.js`, `src/ui/renderer.js`, and `src/pipeline/win-pipeline.js` hide concentrated complexity behind compact interfaces. |
| **Offline-first by default** | `sw.js`, `manifest.webmanifest`, and `localStorage` work together so most user value survives weak or absent connectivity. |
| **Bilingual docs shell** | English and Chinese pages aim to provide parity for the project’s core architectural claims, not just a translated menu. |

## Reading routes

| If you are... | Start here | Then continue with |
| --- | --- | --- |
| **A strict reviewer** | [Project Thesis](./overview/project-thesis.md) | [System Overview](./architecture/system-overview.md) → [Module Catalog](./reference/module-catalog.md) |
| **A senior GitHub developer** | [State Architecture](./architecture/state-architecture.md) | [PWA and Offline Strategy](./architecture/pwa-offline-strategy.md) → [Getting Started](./guides/getting-started.md) |
| **A new contributor** | [Learning Path](./academy/learning-path.md) | [Getting Started](./guides/getting-started.md) → OpenSpec files in the repository |
| **A product-minded reader** | [Project Thesis](./overview/project-thesis.md) | [References and Related Work](./research/references-and-related-work.md) |

## Capability surface

Mind Gym deliberately packs several training patterns into one browser shell:

- **Classic matching** for recognition and pair association.
- **Countdown mode** for pressure, pacing, and time-budgeted play.
- **Daily challenge** for deterministic, repeatable sessions.
- **N-back** for working-memory load and response timing.
- **Delayed recall** for post-session recognition testing.
- **Achievements, stats, adaptive rating, and FSRS-backed mastery** for long-term progression without a server account.

## What this whitepaper covers

1. **Product intent** — why Mind Gym is framed as a serious small system rather than a toy demo.
2. **Architecture** — how runtime modules, persistence, and offline behavior cooperate.
3. **Contributor leverage** — where to start, what to read first, and how to verify changes safely.
4. **Research context** — which ideas come from cognitive training patterns and which come from web engineering practice.

## Editorial note

This site is intentionally opinionated. It favors grounded claims over hype, concrete file references over architecture theater, and implementation leverage over novelty for novelty’s sake.
