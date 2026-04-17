# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) for working with this codebase.

---

## Project Philosophy: Spec-Driven Development (SDD)

This project strictly follows the **Spec-Driven Development** paradigm. All code implementations must use the `/specs` directory as the Single Source of Truth.

### Directory Context

| Directory         | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `/specs/product/` | Product feature definitions & Acceptance Criteria |
| `/specs/rfc/`     | Technical design documents (Request for Comments) |
| `/specs/api/`     | API interface definitions (if applicable)         |
| `/specs/db/`      | Data model definitions & Schema specifications    |
| `/specs/testing/` | BDD test case specifications                      |
| `/docs/`          | User guides, tutorials, and architecture overview |
| `/changelog/`     | Version history and release notes                 |

### AI Agent Workflow Instructions

When asked to develop a new feature, modify existing functionality, or fix a bug, **follow this workflow strictly. Do not skip any steps.**

#### Step 1: Review Specs (审查与分析)

Before writing any code, first read the relevant product documents, RFCs, and API definitions in `/specs`.

- If the user's instruction conflicts with an existing Spec, **STOP immediately** and point out the conflict. Ask the user if the Spec needs to be updated first.
- 如果用户指令与现有 Spec 冲突，**立即停止编码**，指出冲突点，询问用户是否需要先更新 Spec。

#### Step 2: Spec-First Update (规范优先)

If this is a new feature or requires changes to existing interfaces/database structures:

1. **First propose modifications or create the corresponding Spec document** (e.g., in `/specs/product/` or `/specs/rfc/`).
2. Wait for user confirmation of the Spec changes before proceeding to the code writing phase.
3. 如果是新功能或需要修改现有接口/数据库结构，**必须首先提议修改或创建相应的 Spec 文档**。
4. 等待用户确认 Spec 的修改后，才能进入代码编写阶段。

#### Step 3: Implementation (代码实现)

When writing code:

- **100% compliance with the Spec definitions** (including variable naming, API paths, data types, status codes, etc.).
- Do not add features not defined in the Spec (No Gold-Plating).
- 编写代码时，必须 100% 遵守 Spec 中的定义。
- 不要在代码中擅自添加 Spec 中未定义的功能。

#### Step 4: Test against Spec (测试验证)

- Write unit tests and integration tests based on Acceptance Criteria in `/specs`.
- Ensure test cases cover all boundary cases described in the Spec.
- 根据 `/specs` 中的验收标准编写单元测试和集成测试。
- 确保测试用例覆盖了 Spec 中描述的所有边界情况。

---

## Code Generation Rules

| Rule                        | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| New Features                | Must have corresponding `/specs/product/` document    |
| Database Changes            | Schema changes must sync with `/specs/db/`            |
| API Changes                 | Any external API changes must sync with `/specs/api/` |
| Uncertain Technical Details | Check `/specs/rfc/` for architecture conventions      |

---

## Commands

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

## Architecture

**Mind Gym** is a zero-dependency browser-based memory training game (Vanilla JS + Tailwind CSS). No bundler — static files are served directly.

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
| `app.js`               | Game main loop, state machine, all mode logic (~2500 lines)             |
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

- **Prettier**: Single quotes, trailing commas, 120 character line width, 2-space indent, LF
- **Commit Format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `test:`, `chore:`, `ci:`, `spec:`)
- **Allowed PR Scopes**: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## Changelog

All changes are recorded in the `changelog/` directory.

---

## currentDate

Today's date: 2026/04/17.
