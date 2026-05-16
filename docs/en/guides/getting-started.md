---
title: Getting Started
description: Practical orientation for readers, contributors, and docs authors working on Mind Gym.
---

# Getting Started

This page is for two audiences:

- **Readers** who want to move from architecture pages into the repository.
- **Contributors** who want a disciplined first loop for code or docs changes.

## Start here based on your goal

| Goal | First step | Second step |
| --- | --- | --- |
| Understand the product quickly | Read the thesis and architecture pages | Open the live demo and inspect the UI with the docs in mind |
| Review implementation quality | Read the module catalog | Inspect `app.js`, deep modules, and `sw.js` |
| Contribute to docs | Read this page and the relevant docs section | Build the docs site locally |
| Contribute to runtime behavior | Read this page and the relevant architecture page | Cross-check `openspec/specs/` before editing |

## Repository basics

```bash
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym
npm install
```

Core validation commands already used by the repository:

| Command | Purpose |
| --- | --- |
| `npm test` | Run the Jest suite for runtime modules and gameplay behavior |
| `npm run lint` | Check formatting / repository style expectations |
| `npm run build:css` | Compile `styles/app.css` into the shipped CSS artifact |
| `npm --prefix docs run build` | Build the VitePress whitepaper site |

## Minimum mental model before editing

1. The runtime is **browser-native JavaScript**, not a bundled SPA.
2. Script loading order in `index.html` matters.
3. Settings, runtime GameState, and mode-specific state are intentionally separated.
4. Some files are broad coordinators (`app.js`), while others are deep modules designed to localize complexity.
5. OpenSpec materials remain the authoritative specification layer for behavior.

## Contributor workflow

### For runtime changes

1. Read the relevant architecture page in this docs site.
2. Read the owning source file(s).
3. Inspect the matching OpenSpec spec or RFC.
4. Make the smallest coherent implementation change.
5. Run the relevant verification commands.
6. Update docs if the user-facing or architectural story changed.

### For docs changes

1. Confirm claims against the repository, not memory.
2. Prefer concrete file names over abstract descriptions.
3. Keep English pages editorial and precise; keep Chinese pages aligned on core meaning.
4. Run `npm --prefix docs run build` before considering the change done.

## Suggested file-reading order for new contributors

| Area of interest | Start with | Then inspect |
| --- | --- | --- |
| Gameplay loop | `app.js` | `src/game-state.js` → `src/game-manager.js` |
| Persistence | `src/storage.js` | `src/keys.js` → `src/settings-manager.js` |
| Specialized modes | `src/modes.js` | `src/nback-state.js` / `src/recall-state.js` / `src/modes/*.js` |
| Offline behavior | `sw.js` | `manifest.webmanifest` → `index.html` |
| UI and accessibility | `src/ui.js` | `src/ui-events.js` → `src/ui/renderer.js` → `src/modal-manager.js` |
| Win/completion flow | `src/pipeline/win-pipeline.js` | `app.js` callbacks and stats / achievements modules |

## Practical verification loop

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>Authoring docs</h3>
    <p>Build the docs site, click through affected pages, and confirm that Mermaid diagrams and local links render correctly.</p>
  </div>
  <div class="mind-panel">
    <h3>Editing gameplay</h3>
    <p>Run the relevant tests first, then again after the change. Rebuild CSS only if you touched <code>styles/app.css</code>.</p>
  </div>
  <div class="mind-panel">
    <h3>Changing architecture text</h3>
    <p>Verify every claim against the repository so the whitepaper remains a trustworthy map rather than marketing copy.</p>
  </div>
</div>

## Common contributor mistakes to avoid

- Describing systems that do not exist in the repo.
- Treating `app.js` as the only place worth reading.
- Forgetting that offline behavior involves both cached assets and local persisted data.
- Editing generated CSS instead of the source CSS workflow.
- Updating English docs without checking whether Chinese parity is still acceptable.

## Definition of “ready to submit”

A contribution is ready when:

- the owning files are clearly identified,
- the change matches existing architectural boundaries,
- relevant verification has passed,
- and the docs still tell the truth about the system.
