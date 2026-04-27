# AGENTS.md

This file provides guidance for AI coding assistants (Claude Code, Cursor, GitHub Copilot, etc.) working with this codebase.

---

## Project Philosophy: Spec-Driven Development with OpenSpec

This project uses **OpenSpec** for structured change management. All specifications are maintained in the `openspec/` directory as the Single Source of Truth.

---

## Directory Context

| Directory                   | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `openspec/specs/`           | Capability specifications (source of truth)       |
| `openspec/rfc/`             | Architectural decision records                    |
| `openspec/changes/`         | Active change proposals                           |
| `openspec/changes/archive/` | Completed changes                                 |
| `openspec/explorations/`    | Research artifacts                                |
| `docs/`                     | User guides, tutorials, and architecture overview |
| `changelog/`                | Version history and release notes                 |

---

## OpenSpec Workflow

### For New Features

```
/opsx:propose "add leaderboard sharing"
  → Creates openspec/changes/add-leaderboard-sharing/
  → Generates proposal.md, specs/, design.md, tasks.md

/opsx:apply
  → Implements tasks from tasks.md
  → Marks completed items with [x]

/opsx:archive
  → Merges delta specs into openspec/specs/
  → Moves change to archive/ with date prefix
```

### For Bug Fixes

```
/opsx:explore
  → Investigate the issue
  → Create exploration notes in openspec/explorations/

/opsx:propose "fix timer pause bug"
  → Create structured fix proposal

/opsx:apply → /opsx:archive
```

---

## AI Agent Workflow Instructions

When asked to develop a new feature, modify existing functionality, or fix a bug, **follow this workflow strictly**:

### Step 1: Review Specs (审查与分析)

Before writing any code, first read the relevant specifications in `openspec/specs/`.

- If the user's instruction conflicts with an existing Spec, **STOP immediately** and point out the conflict. Ask the user if the Spec needs to be updated first.
- 如果用户指令与现有 Spec 冲突，**立即停止编码**，指出冲突点，询问用户是否需要先更新 Spec。

### Step 2: Spec-First Update (规范优先)

If this is a new feature or requires changes to existing interfaces:

1. **Use OpenSpec workflow to propose changes** (`/opsx:propose`)
2. Wait for user confirmation before proceeding to code implementation
3. 如果是新功能或需要修改现有接口，**必须首先通过 OpenSpec 流程提议变更**
4. 等待用户确认后，才能进入代码编写阶段

### Step 3: Implementation (代码实现)

When writing code:

- **100% compliance with the Spec definitions** (including variable naming, API paths, data types, status codes, etc.)
- Do not add features not defined in the Spec (No Gold-Plating)
- 编写代码时，必须 100% 遵守 Spec 中的定义
- 不要在代码中擅自添加 Spec 中未定义的功能

### Step 4: Test against Spec (测试验证)

- Write unit tests based on Acceptance Criteria in `openspec/specs/`
- Ensure test cases cover all boundary cases described in the Spec
- 根据 `openspec/specs/` 中的验收标准编写单元测试
- 确保测试用例覆盖了 Spec 中描述的所有边界情况

---

## Code Generation Rules

| Rule                        | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| API Changes                 | Any external API changes must go through OpenSpec workflow |
| New Features                | Must have corresponding `openspec/specs/` document         |
| Uncertain Technical Details | Check `openspec/rfc/` for architecture conventions         |

---

## Project Commands

```bash
npm test                  # Run Jest unit tests
npm run lint              # Check code formatting with Prettier
npm run format            # Auto-format all files
npm run build:css         # Compile Tailwind CSS → assets/app.css (minified)
npm run prepare:deploy    # build:css + copy files to dist/
```

Run a single test file:

```bash
npx jest __tests__/helpers.test.js
```

---

## Architecture Summary

**Mind Gym** is a browser-based memory training game with zero runtime dependencies (Vanilla JS + Tailwind CSS). No bundler — static files are served directly.

### Module Loading Order (index.html script tags)

```
src/keys.js → src/utils.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/i18n.js → src/effects.js
→ src/pools.js → src/timer.js → src/confetti.js → src/ui-events.js → src/ui.js → app.js
```

Each `src/` module exposes a global object (e.g., `window.RememberStorage`, `window.RememberI18n`). `app.js` is the game orchestrator consuming all modules.

### Key Files

| File                   | Responsibility                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| `app.js`               | Game main loop, state machine, all mode logic (~2150 lines)             |
| `src/storage.js`       | localStorage CRUD — settings, scores, stats, achievements               |
| `src/stats.js`         | Statistics normalization and aggregation logic                          |
| `src/achievements.js`  | Achievement definitions and check logic                                 |
| `src/modes.js`         | Pure logic for N-back and recall tests                                  |
| `src/import-export.js` | Backup/restore data normalization                                       |
| `src/i18n.js`          | zh/en dictionary; auto-detect browser language                          |
| `src/ui.js`            | DOM element bindings (single source of truth for elements)              |
| `src/ui-events.js`     | Event listener registration                                             |
| `src/pools.js`         | Card face asset pools (emoji, numbers, letters, shapes, colors)         |
| `src/timer.js`         | Countdown and timer management                                          |
| `src/effects.js`       | Web Audio API sound effects and Vibration API                           |
| `src/confetti.js`      | Canvas 2D victory animation                                             |
| `sw.js`                | Service Worker: cache-first for resources, network-first for navigation |

### Game Modes

1. **Classic** — Flip cards to match pairs, record time and moves
2. **Countdown** — Time limit per difficulty level
3. **Daily Challenge** — Generate seed from date + difficulty + theme (global same deck)
4. **N-back** — Determine if current card matches N steps ago (hotkey: J)
5. **Delayed Recall** — Post-game test to check which cards appeared

### localStorage Key Naming Convention

All keys use `memory_match_` prefix:

- `_settings` — User settings
- `_best_<difficulty>` — Best score per difficulty
- `_lb_<difficulty>` — Leaderboard per difficulty
- `_achievements` — Achievement data
- `_stats` — Statistics data
- `_adaptive` — Adaptive rating (600–1600)
- `_spaced_<theme>` — Spaced repetition weight table
- `_daily_<YYYY-MM-DD>_<difficulty>` — Daily challenge completion status

### CSS Workflow

Source file: `styles/app.css` → Compiled via Tailwind CLI to `assets/app.css`.
Run `npm run build:css` after editing `styles/app.css`. **Do not edit `assets/app.css` directly.**

### Deployment

GitHub Actions (`pages.yml`) runs lint → test → `prepare:deploy` → upload `dist/` to GitHub Pages (triggered on push to master).

---

## Code Style

- **Prettier**: Single quotes, trailing commas, 100 character line width, 2-space indent, LF
- **Commit Format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `test:`, `chore:`, `ci:`, `spec:`)
- **Allowed PR Scopes**: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## Changelog

All changes are recorded in the `changelog/` directory.

---

## Language

This project uses **English** as the primary language for:

- Code comments
- Technical documentation
- Commit messages
- Variable/function names

**Chinese** translations are provided for:

- User-facing documentation (README.zh-CN.md)
- UI elements (via i18n system)
