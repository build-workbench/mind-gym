---
title: Mind Gym Whitepaper
description: Editorial homepage for the Mind Gym whitepaper, architecture showcase, and contributor academy.
---

# Mind Gym Whitepaper

<div class="mind-hero">
  <div>
    <p class="mind-eyebrow">Browser-native memory training, presented as a systems-design case study</p>
    <p class="mind-hero__lede">Mind Gym is a zero-dependency memory training PWA for the open web: no backend, no runtime framework, no account wall, and no hidden infrastructure. This site treats the project as both a playable product and a technical argument. The documentation leads, then the demo backs the claims.</p>
    <div class="mind-link-list">
      <a class="mind-link-card" href="./overview/project-thesis">
        <strong>Read the thesis</strong>
        <span>Start with product intent, operating constraints, and the architectural claim.</span>
      </a>
      <a class="mind-link-card" href="./architecture/system-overview">
        <strong>Inspect the system</strong>
        <span>Move from the high-level map into state, offline delivery, and module boundaries.</span>
      </a>
      <a class="mind-link-card" href="../play/index.html">
        <strong>Open the playable build</strong>
        <span>Use the game as evidence after the docs have established what matters.</span>
      </a>
    </div>
  </div>
  <aside class="mind-hero__aside">
    <h3>Review packet</h3>
    <ul class="mind-checklist">
      <li><strong>Product claim:</strong> short-session training can stay useful without backend dependence.</li>
      <li><strong>Engineering claim:</strong> disciplined state ownership and deep modules create leverage in a small JavaScript codebase.</li>
      <li><strong>Operational claim:</strong> static hosting, local ownership of progress, and offline delivery can be enough for a serious product.</li>
    </ul>
  </aside>
</div>

<div class="mind-rail">
  <div class="mind-rail__label">Why this site exists</div>
  <div>
    <p>Senior engineers, strict reviewers, and contributors should be able to trace every major claim back to concrete files such as <code>app.js</code>, <code>src/game-state.js</code>, <code>src/game-manager.js</code>, <code>src/storage.js</code>, and <code>sw.js</code>.</p>
  </div>
</div>

## System leverage at a glance

| Signal                        | Why it matters                                                                                                    | Primary evidence                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Zero runtime dependencies** | The app ships as HTML, CSS, and browser-native JavaScript, so source-to-runtime mapping stays unusually direct.   | `index.html`, `app.js`, `src/*.js`                                                                  |
| **Three-layer state model**   | Settings, GameState, and ModeState separate durable preferences from live control and specialized mode workflows. | `src/settings-manager.js`, `src/game-state.js`, `src/nback-state.js`, `src/recall-state.js`         |
| **Deep modules in hotspots**  | Complex areas stay locally understandable instead of dissolving into one giant coordinator.                       | `src/game-manager.js`, `src/modal-manager.js`, `src/ui/renderer.js`, `src/pipeline/win-pipeline.js` |
| **Offline-first delivery**    | Short sessions remain resilient even when connectivity is weak or absent after first load.                        | `sw.js`, `manifest.webmanifest`, `src/storage.js`                                                   |
| **Bilingual docs shell**      | Core architectural claims remain readable in English and Chinese without splitting the story.                     | `docs/en/*`, `docs/zh/*`                                                                            |

## Reading routes

<div class="mind-route-list">
  <div class="mind-route">
    <p class="mind-route__for">For strict reviewers</p>
    <p class="mind-route__start"><strong>Start with</strong> <a href="./overview/project-thesis">Project Thesis</a></p>
    <p class="mind-route__next"><strong>Continue with</strong> <a href="./architecture/system-overview">System Overview</a>, then <a href="./reference/module-catalog">Module Catalog</a>.</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">For senior GitHub developers</p>
    <p class="mind-route__start"><strong>Start with</strong> <a href="./architecture/state-architecture">State Architecture</a></p>
    <p class="mind-route__next"><strong>Continue with</strong> <a href="./architecture/pwa-offline-strategy">PWA and Offline Strategy</a>, then <a href="./guides/getting-started">Getting Started</a>.</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">For new contributors</p>
    <p class="mind-route__start"><strong>Start with</strong> <a href="./academy/learning-path">Learning Path</a></p>
    <p class="mind-route__next"><strong>Continue with</strong> <a href="./guides/getting-started">Getting Started</a>, then the OpenSpec files in the repository.</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">For product-minded readers</p>
    <p class="mind-route__start"><strong>Start with</strong> <a href="./overview/project-thesis">Project Thesis</a></p>
    <p class="mind-route__next"><strong>Continue with</strong> <a href="./research/references-and-related-work">References and Related Work</a> to place the product choices in context.</p>
  </div>
</div>

## Capability surface

| Training surface          | What it trains                          | Supporting system                                  |
| ------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Classic matching**      | Recognition, pair association, pacing   | Core board loop, scoring, stats                    |
| **Countdown mode**        | Time-budgeted play under pressure       | Timer orchestration, score persistence             |
| **Daily challenge**       | Deterministic repeatable sessions       | Date seeding, storage, comparison logic            |
| **N-back**                | Working-memory load and response timing | Mode-specific state and training logic             |
| **Delayed recall**        | Post-session recognition testing        | Recall state, win pipeline, scoring                |
| **Long-term progression** | Repeat use over novelty                 | Achievements, adaptive rating, FSRS-backed mastery |

## What this whitepaper covers

1. **Product intent:** why Mind Gym is framed as a serious small system rather than a toy demo.
2. **Architecture:** how runtime modules, persistence, and offline behavior cooperate.
3. **Contributor leverage:** where to start, what to read first, and how to verify changes safely.
4. **Research context:** which ideas come from cognitive training patterns and which come from web engineering practice.

## Editorial note

This site is intentionally opinionated. It favors grounded claims over hype, concrete file references over architecture theater, and implementation leverage over novelty for novelty's sake.
