---
title: Project Thesis
description: Why Mind Gym exists, who it serves, and what engineering argument it makes.
---

# Project Thesis

Mind Gym exists at the intersection of two observations:

1. **Cognitive practice is most likely to happen in short, opportunistic windows.**
2. **Most software stacks treat those windows poorly by requiring accounts, network trust, or heavy application shells.**

The project therefore argues for a different shape of product: a memory-training system that is immediately usable, technically inspectable, and operationally light enough to stay dependable on static hosting.

<div class="mind-rail">
  <div class="mind-rail__label">Reading posture</div>
  <div>
    <p>This page defines the argument that the rest of the whitepaper must prove: product value, architectural discipline, and operational restraint should reinforce one another rather than compete for attention.</p>
  </div>
</div>

## Core thesis

<div class="mind-proof-list">
  <div class="mind-proof">
    <strong>Fit the web</strong>
    <span>Use browser primitives directly so startup stays fast and implementation remains inspectable.</span>
  </div>
  <div class="mind-proof">
    <strong>Architect the small system</strong>
    <span>Treat state, offline delivery, and complexity boundaries seriously even when the product footprint is compact.</span>
  </div>
  <div class="mind-proof">
    <strong>Let progress belong to the player</strong>
    <span>Keep routine progress on-device unless the player explicitly exports it elsewhere.</span>
  </div>
</div>

### 1. Training should fit the web, not fight it

Mind Gym is not trying to simulate a native app stack inside the browser. It embraces browser primitives instead: HTML, localStorage, Service Worker caching, and a JavaScript module layout that can be read without a bundler in the loop. That choice keeps startup fast and makes the system easier to audit.

### 2. Small systems can still deserve serious architecture

The application is compact, but it is not trivial. Multiple game modes, persistent preferences, daily determinism, mastery tracking, accessibility concerns, and bilingual UX all compete for the same code surface. The architecture matters because the project wants to stay maintainable without adding framework weight.

### 3. Progress should belong to the player

Mind Gym stores routine progress locally. Best scores, stats, achievements, adaptive rating, and mastery data remain on-device unless the user explicitly exports them. This is both a privacy stance and an operational simplification.

## Who the project is for

| Audience                              | What they get from Mind Gym                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Players with short sessions**       | A game that loads quickly, works offline after the first visit, and supports multiple training styles without setup friction.    |
| **Technically curious readers**       | A concrete example of how far browser-native JavaScript can go when module boundaries are treated seriously.                     |
| **Contributors**                      | A repository where major responsibilities are visible in file names and backed by OpenSpec documentation.                        |
| **Interviewers and senior reviewers** | A compact codebase that exposes architectural judgment: state ownership, offline strategy, and control of accidental complexity. |

## Product value proposition

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>Fast access</h3>
    <p>No onboarding funnel is required to begin a session. The app is designed for immediate play and repeat use.</p>
  </div>
  <div class="mind-panel">
    <h3>Mode diversity</h3>
    <p>Classic matching, countdown, daily challenge, N-back, and delayed recall serve different cognitive rhythms without fragmenting the product into separate apps.</p>
  </div>
  <div class="mind-panel">
    <h3>Longitudinal signal</h3>
    <p>Stats, achievements, adaptive rating, and FSRS-backed mastery make short sessions accumulate into a longer learning story.</p>
  </div>
</div>

## Engineering value proposition

| Engineering choice            | Leverage created                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Zero runtime dependencies** | Low operational drag and direct observability into the runtime.                                                      |
| **Three-layer state model**   | Cleaner ownership boundaries between persistent settings, live session state, and specialized modes.                 |
| **Deep modules**              | Complex areas such as matching logic, modal behavior, win handling, and DOM rendering remain locally understandable. |
| **Static deployment**         | GitHub Pages can host both the game and the whitepaper without introducing backend maintenance.                      |
| **Bilingual documentation**   | The project can explain itself to a broader contributor audience without forking its architecture story.             |

## What Mind Gym optimizes for

- **Predictable startup** over framework abstraction.
- **Local durability** over cross-device synchronization.
- **Readable file boundaries** over aggressive indirection.
- **Offline resilience** over real-time connectivity features.
- **Focused, maintainable capability growth** over feature sprawl.

## What Mind Gym does not optimize for

The project is intentionally conservative in several areas:

- It is **not** a research platform claiming clinical outcomes.
- It is **not** a multiplayer or cloud-synced service.
- It is **not** a framework showcase attempting to maximize novelty.
- It is **not** trying to replace specialist spaced-repetition tools. FSRS mastery here supports game-based review patterns, not full curriculum management.

## Evolution notes

The current architecture reveals an important maturation arc:

1. Initial browser-game mechanics expanded into multiple training modes.
2. State responsibilities were split more explicitly into Settings, GameState, and mode-specific state objects.
3. Deep modules were introduced in hotspots (`game-manager`, `modal-manager`, `ui/renderer`, `win-pipeline`) to keep complexity concentrated rather than smeared across `app.js`.
4. The docs shell was elevated into a whitepaper so the repository could explain its own trade-offs to demanding technical readers.

## Why this matters in review

Mind Gym is a useful artifact for review precisely because it is small enough to inspect fully and rich enough to expose judgment. The question is not whether the app uses fashionable infrastructure. The question is whether its constraints are coherent, its architecture is honest, and its implementation choices create more leverage than they cost.
