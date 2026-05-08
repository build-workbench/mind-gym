# State Management Architecture Design

**Status**: Proposed  
**Created**: 2026-05-08  
**Priority**: P0

---

## Summary

This document proposes a three-layer state management architecture to address the "God Object" anti-pattern in `app.js`. The design transforms 30+ global variables into deep modules with clear interfaces.

---

## Problem Statement

### Current Issues

1. **God Object**: `app.js` contains 30+ global variables and 147 functions
2. **State Duplication**: `moves` and `matchedPairs` exist in both global variables and `GameManager`
3. **State Scattered**: State update logic dispersed across 147 functions
4. **No Testability**: `app.js` has no tests; requires mocking entire DOM environment

### Deletion Test

If we delete the global variables, complexity reappears across N callers. This proves they were earning their keep—but they need encapsulation.

---

## Proposed Solution: Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│           Settings (Persistent)              │
│  sound, vibrate, theme, accent, volume...   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      GameState (Runtime Core State)          │
│  difficulty, started, paused, elapsed...     │
│  [Delegates to GameManager]                  │
│  moves, matchedPairs → gameManager.state     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    ModeState (Mode-Specific, On-Demand)      │
│                                             │
│  NBackState: running, timer, seq, idx...    │
│  RecallState: lastGameValues, correctSet    │
└─────────────────────────────────────────────┘
```

---

## Layer 1: Settings

### Interface

```javascript
// src/settings-manager.js
window.RememberSettings = {
  // Get single setting
  get(key) {
    /* ... */
  },

  // Get all settings (returns copy)
  getAll() {
    /* ... */
  },

  // Set single value (auto-validate + persist)
  set(key, value) {
    /* ... */
  },

  // Batch set
  setAll(partial) {
    /* ... */
  },

  // Listen to changes
  onChange(key, callback) {
    /* ... */
  },

  // Reset to defaults
  reset() {
    /* ... */
  },
};
```

### Depth

- **Interface**: 6 methods
- **Hidden Complexity**:
  - localStorage persistence
  - Value validation (e.g., volume ∈ [0,1], accent ∈ ['indigo', 'emerald', 'rose'])
  - Default value handling
  - Change notification mechanism

### Migration

```javascript
// Old
settings.sound = false;
saveSettings(settings);
applySettingsToUI();

// New
RememberSettings.set('sound', false); // Auto-persist + trigger listeners
// UI sync via onChange listener
```

---

## Layer 2: GameState

### Relationship with GameManager

**Key Decision**: GameState does NOT duplicate `moves` and `matchedPairs`, but delegates to GameManager.

```javascript
// Bad: Duplication
GameState = {
  moves: 0, // ❌ Duplicate
  matchedPairs: 0, // ❌ Duplicate
  gameManager: null, // GameManager also has these
};

// Good: Delegation
GameState = {
  gameManager: null,
  get moves() {
    return this.gameManager?.getState().moves || 0;
  },
  get matchedPairs() {
    return this.gameManager?.getState().matchedPairs || 0;
  },

  // Other state stored directly
  difficulty: 'easy',
  elapsed: 0,
  paused: false,
  // ...
};
```

### Interface

```javascript
// src/game-state.js
window.RememberGameState = {
  // Initialize new game
  initGame(config) { /* ... */ },

  // Get current state snapshot
  getState() {
    return {
      // From GameManager (delegated)
      moves, matchedPairs, totalPairs, isLocked,

      // Directly managed
      difficulty, elapsed, countdownLeft, started, paused,
      isPreviewing, timeUp, hintsLeft, hintsUsed,
      comboCount, maxComboThisGame, lastMatchAt,
      dailyActive, dailySeed
    };
  },

  // Flip card (delegates to GameManager)
  flip(cardIndex, cardValue) { /* ... */ },

  // Update state (fine-grained)
  update(partial) { /* ... */ },

  // Timer control
  startTimer(), stopTimer(), resetTimer(),

  // Pause/resume
  pause(), resume(),

  // Game end
  endGame(win) { /* ... */ },

  // Reset all state
  reset() { /* ... */ },

  // State change listener
  onChange(callback) { /* ... */ }
};
```

### Depth

- **Interface**: 10 methods
- **Hidden Complexity**:
  - GameManager lifecycle management
  - Timer lifecycle management
  - State consistency (no duplication of moves/matchedPairs)
  - State change notification
  - Pause/resume state transitions

### Migration

```javascript
// Old: Dispersed across app.js
let moves = 0;
let elapsed = 0;
let paused = false;
// ... 30+ variables

function pauseGame() {
  paused = true;
  stopTimer();
  lockBoard = true;
  updateControlsUI();
}

// New: Centralized
const gameState = RememberGameState;

gameState.pause(); // Auto-handles paused, timer, lockBoard

// UI update via listener
gameState.onChange((newState, oldState, changedKeys) => {
  if (changedKeys.includes('paused')) {
    updatePauseUI(newState.paused);
  }
});
```

---

## Layer 3: ModeState

### NBackState

```javascript
// src/nback-state.js
window.RememberNBack = class NBackState {
  constructor(config) {
    /* N, length, speed, onComplete, onProgress */
  }

  start() {
    /* Start task, manage timer internally */
  }
  stop() {
    /* Stop task, clean up timer */
  }
  respond() {
    /* User response (keypress) */
  }
  getState() {
    /* running, progress, stats */
  }
  reset() {
    /* Reset all state */
  }
};
```

**Depth**:

- **Interface**: 5 methods
- **Hidden Complexity**: 11 internal state variables, timer management, target detection, RT calculation

### RecallState

```javascript
// src/recall-state.js
window.RememberRecall = class RecallState {
  constructor(config) {
    /* theme, onComplete */
  }

  recordGame(cardValues) {
    /* Record cards for recall test */
  }
  generateTest(poolValues) {
    /* Generate test items */
  }
  submitAnswer(selectedValues) {
    /* Submit and score */
  }
  getState() {
    /* lastGameValues, correctSet */
  }
  reset() {
    /* Reset all state */
  }
};
```

**Depth**:

- **Interface**: 5 methods
- **Hidden Complexity**: Test generation algorithm, scoring logic

---

## Testing Interface

### Settings Tests

```javascript
test('set volume validates range', () => {
  expect(() => RememberSettings.set('volume', 1.5)).toThrow();
  RememberSettings.set('volume', 0.5);
  expect(RememberSettings.get('volume')).toBe(0.5);
});

test('onChange fires on set', () => {
  const callback = jest.fn();
  RememberSettings.onChange('sound', callback);
  RememberSettings.set('sound', false);
  expect(callback).toHaveBeenCalledWith(false, true);
});
```

### GameState Tests

```javascript
test('initGame resets all state', () => {
  RememberGameState.initGame({ difficulty: 'medium', totalPairs: 8 });
  const state = RememberGameState.getState();
  expect(state.difficulty).toBe('medium');
  expect(state.moves).toBe(0);
});

test('pause stops timer and locks board', () => {
  RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });
  RememberGameState.startTimer();
  RememberGameState.pause();
  const state = RememberGameState.getState();
  expect(state.paused).toBe(true);
  expect(state.isLocked).toBe(true);
});
```

---

## Migration Roadmap

### Phase 1: Create New Modules (Non-Breaking)

1. Create `src/settings-manager.js`
2. Create `src/game-state.js`
3. Create `src/nback-state.js`
4. Create `src/recall-state.js`
5. Write unit tests

### Phase 2: Parallel Running

1. Initialize new module instances in `app.js`
2. Keep old global variables
3. Add logging to compare old vs new

### Phase 3: Gradual Migration

1. Replace `settings.xxx` → `RememberSettings.get('xxx')`
2. Replace global state → `gameState.getState()`
3. Migrate N-back logic
4. Migrate Recall logic

### Phase 4: Cleanup

1. Delete old global variables
2. Delete duplicate state management code
3. Update documentation

---

## Benefits

### Locality

- **Settings**: Validation, persistence, change notification in one module
- **GameState**: State transitions centralized, bugs isolated
- **ModeState**: Mode-specific bugs confined to respective modules

### Leverage

- **Settings**: 6 methods vs 13 direct properties
- **GameState**: 10 methods vs 20+ global variables
- **ModeState**: 5 methods vs 11 variables (N-back)

### Testability

- **Current**: app.js untestable (30+ globals, requires DOM mock)
- **New Design**: Each layer independently testable
- **Coverage**: 0% (app.js) → 100% (each layer)

### AI-Navigability

- Clear state flow: Settings → GameState → ModeState
- Explicit interfaces: Responsibilities and boundaries clear
- Easy onboarding: New developers understand architecture quickly

---

## Related Documents

- [CONTEXT.md](../../CONTEXT.md) - Domain terminology
- [Core Architecture](../../openspec/rfc/0001-core-architecture.md) - Overall architecture
