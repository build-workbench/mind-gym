# CONTEXT.md

Domain model and terminology for Mind Gym.

---

## Core Concepts

### Game Modes

**Classic**

- Flip cards to match pairs
- Record time and moves

**Countdown**

- Time limit per difficulty level
- Fail if time runs out

**Daily Challenge**

- Global same deck (seed from date + difficulty + theme)
- Same cards for all players on the same day

**N-back**

- Working memory training
- Determine if current card matches N steps ago
- Press J to respond

**Delayed Recall**

- Post-game test
- Check which cards appeared in the game

### State Layers

**Settings Layer** (`src/settings-manager.js`)

- User preferences (sound, theme, volume, etc.)
- Persistent across sessions
- Validates and auto-persists to localStorage

**GameState Layer** (`src/game-state.js`)

- Runtime game state (one game lifecycle)
- Coordinates GameManager and Timer
- Delegates moves/matchedPairs to GameManager

**ModeState Layer**

- Mode-specific state and logic
- **NBackState** (`src/nback-state.js`): N-back mode state
- **RecallState** (`src/recall-state.js`): Delayed recall mode state

### Core Modules

**GameManager** (`src/game-manager.js`)

- Deep module: manages card flip/match/win logic
- Interface: flip(cardIndex, cardValue), reset(), getState()
- Hides: state machine, match algorithm, win detection

**ModalManager** (`src/modal-manager.js`)

- Deep module: manages modal open/close/focus trap
- Interface: open(modalEl), close(modalEl)
- Hides: focus trap, aria attributes, focus restoration

**Timer** (`src/timer.js`)

- Countdown and elapsed time management
- Interface: start(), stop(), reset(), formatTime()

**Storage** (`src/storage.js`)

- localStorage CRUD
- All keys use `memory_match_` prefix

### Statistics & Achievements

**Stats** (`src/stats.js`)

- Pure functions: normalizeStats, recordGameStarted, recordGameWon, etc.
- Aggregates: games, wins, avgTime, avgMoves, avgCombo, etc.

**Achievements** (`src/achievements.js`)

- Pure functions: checkAchievementsOnWin, normalizeAchievements
- Unlocks based on milestones (first win, combo streaks, etc.)

### Spaced Repetition

**FSRS** (`src/fsrs.js`)

- FSRS-4.5 algorithm
- Schedules card themes for review based on mastery

---

## Architecture Principles

### Depth Over Shallow

**Deep Module**: Small interface, large implementation

- Example: GameManager (3 methods, hides state machine)

**Shallow Module**: Interface nearly as complex as implementation

- Example: shared.js (3 utility functions, no abstraction)

**Goal**: Turn shallow modules into deep ones by hiding complexity.

### Locality & Leverage

**Locality**: Change, bugs, knowledge concentrated in one place

- Benefit: Fix once, fixed everywhere

**Leverage**: High capability per unit of interface

- Benefit: Callers learn less, get more

### Seams & Adapters

**Seam**: Place where behavior can be altered without editing in place

- Example: GameManager constructor accepts `onWin` callback

**Adapter**: Concrete implementation at a seam

- Example: Test adapter that records flip events

**Principle**: One adapter = hypothetical seam. Two adapters = real seam.

---

## Module Loading Order

```
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/game-manager.js → src/modal-manager.js
→ src/i18n.js → src/effects.js → src/pools.js → src/timer.js → src/confetti.js
→ src/ui-events.js → src/ui.js → app.js
```

Each module exposes a global object (UMD pattern).

---

## Game Mode System

**GameMode** (interface)

- 每个游戏模式实现统一接口
- 方法: `onInit()`, `onStart()`, `onEnd()`, `onFlip()`, `onKeyPress()`, `getState()`
- 允许添加新模式无需修改 `app.js`

**GameModeRegistry**

- 管理所有游戏模式
- 方法: `register()`, `get()`, `getCurrent()`, `switchTo()`
- 当前模式: Classic, Countdown, Daily, NBack, Recall

**WinPipeline**

- 胜利时的步骤管道
- 步骤: stopTimer → updateBestScore → updateStats → ... → openRecallTest
- 可添加/删除/重排序步骤

**UIRenderer**

- UI 渲染抽象
- 方法: `renderCard()`, `renderFlip()`, `renderMatch()`, `showModal()`, `playSound()`
- 隔离 DOM 操作与业务逻辑

---

## Related Documents

- [Core Architecture](openspec/rfc/0001-core-architecture.md)
- [i18n Strategy](openspec/rfc/0002-i18n-strategy.md)
- [PWA & Offline](openspec/rfc/0003-pwa-offline.md)
- [app.js Refactoring](openspec/rfc/0004-app-refactoring.md)
