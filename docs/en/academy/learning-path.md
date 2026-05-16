---
title: Learning Path
description: Structured reading tracks for reviewers, contributors, and architecture-minded readers.
---

# Learning Path

Treat this documentation set as a compact technical course. It is not arranged as a linear manual; it is arranged as a set of entry paths for readers with different goals.

## Choose your track

| Track                      | Best for                                              | Primary outcome                                                            |
| -------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| **Executive scan**         | Reviewers who need signal quickly                     | Understand why the project exists and whether the architecture is coherent |
| **Architecture study**     | Senior developers and interviewers                    | Trace runtime boundaries, deep modules, and offline strategy               |
| **Contributor onboarding** | Engineers preparing to change code or docs            | Learn where behavior lives, how specs fit in, and how to verify work       |
| **Research context**       | Readers interested in training patterns and precedent | See how Mind Gym connects product choices to broader ideas                 |

## Recommended curriculum

### Stage 1: Orient yourself

Read in this order:

1. [Project Thesis](../overview/project-thesis.md)
2. [System Overview](../architecture/system-overview.md)
3. This page

Goal: understand the product, the constraints, and the shape of the system before touching file-level detail.

### Stage 2: Understand the runtime

Read in this order:

1. [State Architecture](../architecture/state-architecture.md)
2. [PWA and Offline Strategy](../architecture/pwa-offline-strategy.md)
3. [Module Catalog](../reference/module-catalog.md)

Goal: learn who owns persistence, who owns live session state, and where complexity is deliberately concentrated.

### Stage 3: Prepare to contribute

Read in this order:

1. [Getting Started](../guides/getting-started.md)
2. `README.md`
3. `openspec/specs/`
4. `openspec/rfc/`

Goal: understand not only the code, but also the repository’s decision history and verification workflow.

### Stage 4: Add context and nuance

Read in this order:

1. [References and Related Work](../research/references-and-related-work.md)
2. Selected source files based on the area you want to inspect

Goal: connect implementation choices to larger ideas without over-claiming what the product can prove.

## Time-boxed routes

| If you have... | Read this                                                                 |
| -------------- | ------------------------------------------------------------------------- |
| **10 minutes** | Thesis → System Overview → Module Catalog                                 |
| **30 minutes** | Thesis → State Architecture → Offline Strategy → Getting Started          |
| **60 minutes** | Thesis → all Architecture pages → Module Catalog → OpenSpec specs         |
| **Half a day** | Full docs pass, then inspect `app.js`, deep modules, and `sw.js` directly |

## What to notice while reading

### Product readers should ask

- Does each game mode strengthen the same product story, or does it feel bolted on?
- Is local-first progress a meaningful value proposition or just a technical convenience?
- Which parts of the experience are designed for repeated use rather than one-time novelty?

### Architecture readers should ask

- Is state ownership explicit, or does data leak across layers?
- Are the so-called deep modules actually small at the interface and rich in hidden behavior?
- Does the offline strategy align with the product’s claim about dependable short sessions?

### Contributors should ask

- Which file owns the behavior I want to change?
- What spec or RFC constrains that change?
- What is the minimal verification loop that proves I did not break the docs site or the app?

## Practical exercises

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>Exercise 1</h3>
    <p>Open <code>src/game-manager.js</code> and write down the public interface in one sentence. If you need more than one sentence, the interface may not be small enough.</p>
  </div>
  <div class="mind-panel">
    <h3>Exercise 2</h3>
    <p>Compare <code>src/storage.js</code> with <code>src/settings-manager.js</code>. Note where persistence ends and higher-level policy begins.</p>
  </div>
  <div class="mind-panel">
    <h3>Exercise 3</h3>
    <p>Read <code>sw.js</code> and classify which assets are precached, which are runtime cached, and which still depend on first-load network access.</p>
  </div>
</div>

## Reading discipline for contributors

When you are ready to modify behavior, follow this loop:

1. Read the relevant docs page.
2. Read the matching source file(s).
3. Cross-check the matching OpenSpec material.
4. Make the smallest coherent change.
5. Run the appropriate verification commands.
6. Update docs if the architectural story changed.

## Graduation criteria

A reader has completed the learning path when they can answer the following without guessing:

- Why does Mind Gym use a three-layer state model?
- Which modules qualify as deep modules, and why?
- What survives offline, and what does not?
- Where should a contributor start when changing gameplay, state, or docs?
