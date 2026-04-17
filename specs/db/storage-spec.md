# Storage Operations

> CRUD operations and data persistence specifications

## Module Overview

| File             | Global Object            | Purpose                        |
| ---------------- | ------------------------ | ------------------------------ |
| `src/keys.js`    | `window.RememberKeys`    | localStorage key constants     |
| `src/storage.js` | `window.RememberStorage` | CRUD operations, normalization |

---

## Key Constants

```javascript
// src/keys.js
const KEYS = {
  SETTINGS: 'memory_match_settings',
  BEST: diff => `memory_match_best_${diff}`,
  LB: diff => `memory_match_lb_${diff}`,
  ACHIEVEMENTS: 'memory_match_achievements',
  STATS: 'memory_match_stats',
  ADAPTIVE: 'memory_match_adaptive',
  SPACED: theme => `memory_match_spaced_${theme}`,
  DAILY: (date, diff) => `memory_match_daily_${date}_${diff}`,
  ONBOARDING: 'memory_match_onboarding_v1',
};
```

---

## CRUD Operations

### Generic Operations

```javascript
// src/storage.js

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {*} fallback - Default value if key missing or parse fails
 * @returns {*} Parsed value or fallback
 */
function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage
 * @param {string} key - localStorage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail (private mode or quota exceeded)
  }
}
```

---

### Settings Operations

```javascript
/**
 * Load user settings
 * @returns {Settings} Settings object with defaults filled
 */
function loadSettings() {
  const raw = safeParseJSON(KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...raw };
}

/**
 * Save user settings
 * @param {Settings} settings - Settings to save
 */
function saveSettings(settings) {
  safeWriteJSON(KEYS.SETTINGS, settings);
}
```

---

### Best Score Operations

```javascript
/**
 * Load best score for difficulty
 * @param {Difficulty} diff - Difficulty level
 * @returns {BestScore|null} Best score or null if none
 */
function loadBest(diff) {
  return safeParseJSON(KEYS.BEST(diff), null);
}

/**
 * Save best score for difficulty
 * @param {Difficulty} diff - Difficulty level
 * @param {BestScore} score - Score to save
 */
function saveBest(diff, score) {
  safeWriteJSON(KEYS.BEST(diff), score);
}

/**
 * Update best score if new score is better
 * @param {Difficulty} diff - Difficulty level
 * @param {number} time - Time in seconds
 * @param {number} moves - Number of moves
 * @returns {boolean} True if new best
 */
function updateBest(diff, time, moves) {
  const current = loadBest(diff);
  if (!current || time < current.time || (time === current.time && moves < current.moves)) {
    saveBest(diff, { time, moves });
    return true;
  }
  return false;
}
```

---

### Leaderboard Operations

```javascript
/**
 * Load leaderboard for difficulty
 * @param {Difficulty} diff - Difficulty level
 * @returns {Leaderboard} Leaderboard array (max 3 entries)
 */
function loadLeaderboard(diff) {
  return safeParseJSON(KEYS.LB(diff), []);
}

/**
 * Save leaderboard for difficulty
 * @param {Difficulty} diff - Difficulty level
 * @param {Leaderboard} lb - Leaderboard to save
 */
function saveLeaderboard(diff, lb) {
  safeWriteJSON(KEYS.LB(diff), lb);
}

/**
 * Add entry to leaderboard
 * @param {Difficulty} diff - Difficulty level
 * @param {number} time - Time in seconds
 * @param {number} moves - Number of moves
 * @returns {number} Position (1-3) or 0 if not in top 3
 */
function addToLeaderboard(diff, time, moves) {
  const lb = loadLeaderboard(diff);
  lb.push({ time, moves, at: Date.now() });

  // Sort by time, then moves, then timestamp
  lb.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.moves !== b.moves) return a.moves - b.moves;
    return a.at - b.at;
  });

  // Find position of new entry
  const pos = lb.findIndex(e => e.time === time && e.moves === moves);

  // Keep only top 3
  const trimmed = lb.slice(0, 3);
  saveLeaderboard(diff, trimmed);

  return pos < 3 ? pos + 1 : 0;
}
```

---

### Statistics Operations

```javascript
/**
 * Load statistics
 * @returns {Stats} Statistics object
 */
function loadStats() {
  return safeParseJSON(KEYS.STATS, {
    games: 0,
    wins: 0,
    timeSum: 0,
    movesSum: 0,
    hintsSum: 0,
    comboSum: 0,
    bestCombo: 0,
    recallAttempts: 0,
    precisionSum: 0,
    recallSum: 0,
    nbackAttempts: 0,
    nbackAccSum: 0,
    nbackRtSum: 0,
    nbackRtCount: 0,
  });
}

/**
 * Save statistics
 * @param {Stats} stats - Statistics to save
 */
function saveStats(stats) {
  safeWriteJSON(KEYS.STATS, stats);
}

/**
 * Update statistics after game
 * @param {Object} params - Update parameters
 * @param {boolean} params.win - Whether game was won
 * @param {number} params.time - Time in seconds
 * @param {number} params.moves - Number of moves
 * @param {number} params.hints - Hints used
 * @param {number} params.combo - Max combo
 */
function updateStats(params) {
  const stats = loadStats();
  stats.games++;

  if (params.win) {
    stats.wins++;
    stats.timeSum += params.time;
    stats.movesSum += params.moves;
    stats.hintsSum += params.hints;
    stats.comboSum += params.combo;
    stats.bestCombo = Math.max(stats.bestCombo, params.combo);
  }

  saveStats(stats);
}
```

---

### Achievement Operations

```javascript
/**
 * Load achievements
 * @returns {Achievements} Achievements object
 */
function loadAchievements() {
  return safeParseJSON(KEYS.ACHIEVEMENTS, {});
}

/**
 * Save achievements
 * @param {Achievements} achievements - Achievements to save
 */
function saveAchievements(achievements) {
  safeWriteJSON(KEYS.ACHIEVEMENTS, achievements);
}

/**
 * Unlock achievement
 * @param {string} id - Achievement ID
 * @returns {boolean} True if newly unlocked
 */
function unlockAchievement(id) {
  const achievements = loadAchievements();
  if (achievements[id]?.unlocked) return false;

  achievements[id] = { unlocked: true, at: Date.now() };
  saveAchievements(achievements);
  return true;
}
```

---

### Adaptive Operations

```javascript
/**
 * Load adaptive data
 * @returns {AdaptiveData} Adaptive data
 */
function loadAdaptive() {
  return safeParseJSON(KEYS.ADAPTIVE, { rating: 1000, lastDiff: 'easy' });
}

/**
 * Save adaptive data
 * @param {AdaptiveData} data - Adaptive data to save
 */
function saveAdaptive(data) {
  safeWriteJSON(KEYS.ADAPTIVE, data);
}
```

---

### Spaced Repetition Operations

```javascript
/**
 * Load spaced data for theme
 * @param {CardFace} theme - Card face theme
 * @returns {SpacedData} Spaced data
 */
function loadSpaced(theme) {
  return safeParseJSON(KEYS.SPACED(theme), {});
}

/**
 * Save spaced data for theme
 * @param {CardFace} theme - Card face theme
 * @param {SpacedData} data - Spaced data to save
 */
function saveSpaced(theme, data) {
  safeWriteJSON(KEYS.SPACED(theme), data);
}
```

---

### Daily Challenge Operations

```javascript
/**
 * Load daily challenge data
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Difficulty} diff - Difficulty level
 * @returns {DailyData|null} Daily data or null if not completed
 */
function loadDaily(date, diff) {
  return safeParseJSON(KEYS.DAILY(date, diff), null);
}

/**
 * Mark daily challenge as completed
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Difficulty} diff - Difficulty level
 */
function completeDaily(date, diff) {
  safeWriteJSON(KEYS.DAILY(date, diff), { done: true, at: Date.now() });
}
```

---

## Import/Export Operations

### Export All Data

```javascript
/**
 * Build export payload
 * @returns {ExportPayload} All user data
 */
function buildExportPayload() {
  return {
    version: 1,
    settings: loadSettings(),
    bests: {
      easy: loadBest('easy'),
      medium: loadBest('medium'),
      hard: loadBest('hard'),
    },
    leaderboards: {
      easy: loadLeaderboard('easy'),
      medium: loadLeaderboard('medium'),
      hard: loadLeaderboard('hard'),
    },
    achievements: loadAchievements(),
    stats: loadStats(),
    adaptive: loadAdaptive(),
    spaced: {
      emoji: loadSpaced('emoji'),
      numbers: loadSpaced('numbers'),
      letters: loadSpaced('letters'),
      shapes: loadSpaced('shapes'),
      colors: loadSpaced('colors'),
    },
  };
}
```

### Import Data

```javascript
/**
 * Import and normalize data
 * @param {ExportPayload} raw - Raw import data
 */
function importData(raw) {
  const normalized = normalizeImportData(raw, DEFAULT_SETTINGS);

  saveSettings(normalized.settings);

  if (normalized.bests.easy) saveBest('easy', normalized.bests.easy);
  if (normalized.bests.medium) saveBest('medium', normalized.bests.medium);
  if (normalized.bests.hard) saveBest('hard', normalized.bests.hard);

  saveLeaderboard('easy', normalized.leaderboards.easy);
  saveLeaderboard('medium', normalized.leaderboards.medium);
  saveLeaderboard('hard', normalized.leaderboards.hard);

  saveAchievements(normalized.achievements);
  saveStats(normalized.stats);
  saveAdaptive(normalized.adaptive);

  Object.entries(normalized.spaced).forEach(([theme, data]) => {
    saveSpaced(theme, data);
  });
}
```

---

## Normalization

### Principles

1. **Type Checking** — Ensure field types are correct
2. **Range Clamping** — Numeric fields limited to valid ranges
3. **Enum Validation** — Enum values must be from allowed set
4. **Default Fill** — Missing fields populated with defaults

### Helper Functions

```javascript
function clampInt(val, min, max, fallback) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clampFloat(val, min, max, fallback) {
  const n = parseFloat(val);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function validateEnum(val, allowed, fallback) {
  return allowed.includes(val) ? val : fallback;
}
```

---

## Error Handling

### Safe Operations

All localStorage operations are wrapped in try-catch:

```javascript
function safeOperation(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    console.warn('localStorage operation failed:', e);
    return fallback;
  }
}
```

### Private Mode Compatibility

- localStorage may be unavailable in private/incognito mode
- Operations gracefully degrade to in-memory defaults
- No blocking errors thrown

---

## Test Cases

| Operation           | Test Case              | Expected Result           |
| ------------------- | ---------------------- | ------------------------- |
| `loadSettings`      | No existing data       | Returns defaults          |
| `loadSettings`      | Corrupt JSON           | Returns defaults          |
| `updateBest`        | New best time          | Returns true, saves       |
| `updateBest`        | Same time, fewer moves | Returns true, saves       |
| `addToLeaderboard`  | Top 3 score            | Returns position 1-3      |
| `addToLeaderboard`  | Not top 3              | Returns 0, not saved      |
| `unlockAchievement` | Already unlocked       | Returns false             |
| `unlockAchievement` | New achievement        | Returns true, saves       |
| `importData`        | Partial data           | Missing fields filled     |
| `importData`        | Invalid values         | Values normalized/clamped |

---

## References

- [Data Schema](./schema.md)
- [Core Architecture](../rfc/0001-core-architecture.md)
