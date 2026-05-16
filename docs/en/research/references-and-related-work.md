---
title: References and Related Work
description: Conceptual references, adjacent projects, and evolution notes that help situate Mind Gym.
---

# References and Related Work

Mind Gym is not presented as original research. It is a small product that borrows from established ideas in cognitive training, learning science, and resilient web application design. This page records those influences so the project can stay grounded about what it is and is not claiming.

## Reading posture

Two kinds of references matter here:

1. **Training references** — concepts such as N-back, recall assessment, and spaced repetition.
2. **Engineering references** — practices such as Progressive Web Apps, offline-first delivery, and architecture that favors clear module boundaries.

## Conceptual reference map

| Reference area | Relevance to Mind Gym |
| --- | --- |
| **N-back tasks** | Inform the working-memory mode and the emphasis on targets, misses, false alarms, and reaction time. |
| **Recognition and delayed recall tests** | Inform the post-game recall experience, where users identify previously seen items from a mixed set. |
| **Spaced repetition / FSRS-4.5** | Inform mastery tracking for card exposure and review scheduling logic. |
| **Deliberate practice** | Supports the broader product shape: short, repeatable sessions with measurable outcomes. |
| **Gameful motivation systems** | Help explain achievements, leaderboards, daily challenges, and progress loops. |

## Engineering reference map

| Engineering idea | Where it shows up |
| --- | --- |
| **Progressive Web Apps** | `manifest.webmanifest`, install behavior, standalone launch |
| **Service Worker caching** | `sw.js` asset caching, update behavior, offline fallback |
| **Offline-first product design** | localStorage-backed progress and app-shell precaching |
| **Deep modules** | `game-manager`, `modal-manager`, `ui/renderer`, `win-pipeline` |
| **Static-site architecture** | GitHub Pages hosting for both the game and the whitepaper |

## Named references and adjacent tools

### FSRS ecosystem

Mind Gym’s mastery work references **FSRS-4.5**, a modern spaced-repetition scheduling approach widely discussed in open learning-tool communities. In Mind Gym, FSRS is not the entire product; it is a focused subsystem used to give repeated exposure more structure.

### PWA standards

The project relies on the browser standards behind **Web App Manifest** and **Service Workers**. These are not implementation details hidden from readers—they are central to the product’s promise that it works well after the first load.

### Memory-game lineage

Mind Gym inherits from the long tradition of concentration / matching games, but adds layers that matter for technical and product analysis: deterministic daily play, N-back sequencing, delayed recall, and persistent progression data.

### Adjacent projects

| Project or category | Relationship to Mind Gym |
| --- | --- |
| **Anki / spaced-repetition tools** | A stronger reference point for review scheduling than for gameplay; Mind Gym borrows ideas rather than trying to replace dedicated study systems. |
| **Classic browser memory games** | Provide the baseline mechanic, but usually lack richer progression and architecture discussion. |
| **Offline-capable PWAs** | Offer the operational precedent for installability and resilient caching. |
| **Architecture-focused docs sites** | Inspire the decision to present the project as a whitepaper rather than a minimal README alone. |

## Evidence boundaries

This page also marks what Mind Gym is careful not to claim:

- It does **not** claim medical or therapeutic outcomes.
- It does **not** claim that every game mode has equal empirical support.
- It does **not** claim that a static-browser architecture is universally best—only that it is coherent for this product.

## Evolution notes

Mind Gym’s research posture has become more mature over time:

1. The project moved from “browser memory game” framing toward “cognitive training system with explicit constraints.”
2. Architecture documents became more important as the codebase grew beyond a single gameplay mechanic.
3. The whitepaper format was introduced to make design choices reviewable by senior technical readers.
4. References remain intentionally selective so that the project stays explainable and honest.

## Suggested follow-up reading

After this page, return to the implementation with specific questions in mind:

- How is N-back state actually represented?
- Where does recall scoring happen?
- How does FSRS remain a subsystem rather than swallowing the entire product?
- How closely does the offline implementation match the promise made in docs?
