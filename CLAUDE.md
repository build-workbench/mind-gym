# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                  # Run Jest unit tests
npm run lint              # Check formatting with Prettier
npm run format            # Auto-format all files
npm run build:css         # Compile Tailwind CSS → assets/app.css (minified)
npm run prepare:deploy    # build:css + copy files to dist/
```

Run a single test file:

```bash
npx jest __tests__/helpers.test.js
```

## Architecture

**Mind Gym** is a zero-runtime-dependency browser memory-training game (Vanilla JS + Tailwind CSS). No bundler — static files served directly.

### Module loading order (index.html script tags)

```
src/keys.js → src/utils.js → src/storage.js → src/i18n.js → src/effects.js
→ src/pools.js → src/timer.js → src/confetti.js → src/ui-events.js → src/ui.js → app.js
```

Each `src/` module exposes a global (e.g. `window.Storage`, `window.I18n`). `app.js` is the game orchestrator that consumes all of them.

### Key files

| File               | Role                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `app.js`           | Game loop, state machine, all mode logic (~1356 lines)               |
| `src/storage.js`   | localStorage CRUD — settings, scores, stats, achievements            |
| `src/i18n.js`      | zh/en dictionary; auto-detects browser language                      |
| `src/ui.js`        | DOM element bindings (single source of truth for element refs)       |
| `src/ui-events.js` | Event listener registration                                          |
| `src/pools.js`     | Card face asset pools (emoji, numbers, letters, shapes, colors)      |
| `src/timer.js`     | Countdown and elapsed-time management                                |
| `src/effects.js`   | Web Audio API sound effects and Vibration API                        |
| `src/confetti.js`  | Canvas 2D victory animation                                          |
| `sw.js`            | Service Worker: cache-first for assets, network-first for navigation |

### Game modes

1. **Classic** — flip-to-match, records time and moves
2. **Countdown** — per-difficulty time limit
3. **Daily Challenge** — seeded by date + difficulty + theme (same board globally)
4. **N-back** — judge whether current card matches N steps ago (hotkey: J)
5. **Delayed Recall** — after win, check which cards appeared this round

### localStorage key conventions

All keys prefixed `memory_match_`:

- `_settings`, `_best_<difficulty>`, `_lb_<difficulty>`, `_achievements`, `_stats`
- `_adaptive` (rating 600–1600), `_spaced_<theme>` (weighted card pool)
- `_daily_<YYYY-MM-DD>_<difficulty>`

### CSS workflow

Source: `styles/app.css` → compiled to `assets/app.css` via Tailwind CLI.
Edit `styles/app.css` and run `npm run build:css` to update. Never edit `assets/app.css` directly.

### Deployment

GitHub Actions (`pages.yml`) runs lint → test → `prepare:deploy` → uploads `dist/` to GitHub Pages on push to master.

## Code style

- Prettier: single quotes, trailing commas, 120-char line width, 2-space indent, LF
- Commit format: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `test:`, `chore:`, `ci:`)
- Allowed PR scopes: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`

## Changelog

Record all modifications in the `changelog/` directory.
