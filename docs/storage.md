# Storage Model

Complete reference for localStorage data structures, persistence mechanisms, and import/export functionality.

---

## Key Conventions

### Prefix

All keys use `memory_match_` prefix to avoid conflicts.

### Key Reference

| Key | Type | Description |
|-----|------|-------------|
| `memory_match_settings` | Object | User preferences |
| `memory_match_best_<difficulty>` | Object | Best time/moves per difficulty |
| `memory_match_lb_<difficulty>` | Array | Leaderboard (top 3) per difficulty |
| `memory_match_achievements` | Object | Achievement unlock status |
| `memory_match_stats` | Object | Aggregate statistics |
| `memory_match_adaptive` | Object | Adaptive difficulty rating |
| `memory_match_spaced_<theme>` | Object | Spaced repetition weights |
| `memory_match_daily_<date>_<difficulty>` | Object | Daily challenge completion |
| `memory_match_onboarding_v1` | String | Onboarding completion flag |

### Parameter Values

- `<difficulty>`: `easy` | `medium` | `hard`
- `<theme>`: `emoji` | `numbers` | `letters` | `shapes` | `colors`
- `<date>`: Format `YYYY-MM-DD` (e.g., `2026-04-16`)

---

## Data Structures

### Settings

```typescript
interface Settings {
  sound: boolean;              // Sound effects enabled
  vibrate: boolean;            // Haptic feedback enabled
  previewSeconds: number;      // Preview time at start (0-5)
  accent: 'indigo' | 'emerald' | 'rose';  // Theme accent color
  theme: 'auto' | 'light' | 'dark';       // Color scheme
  motion: 'auto' | 'on' | 'off';          // Animation preference
  volume: number;              // Volume level (0-1)
  soundPack: 'clear' | 'electro' | 'soft'; // Sound pack
  cardFace: 'emoji' | 'numbers' | 'letters' | 'shapes' | 'colors';
  gameMode: 'classic' | 'countdown';
  countdown: {
    easy: number;              // Easy countdown seconds (10-999)
    medium: number;            // Medium countdown seconds
    hard: number;              // Hard countdown seconds
  };
  language: 'auto' | 'zh' | 'en';
  adaptive: boolean;           // Adaptive assist enabled
  spaced: boolean;             // Spaced repetition enabled
}
```

**Default Values** (`DEFAULT_SETTINGS`):

```javascript
{
  sound: true,
  vibrate: true,
  previewSeconds: 1,
  accent: 'indigo',
  theme: 'auto',
  motion: 'auto',
  volume: 0.5,
  soundPack: 'clear',
  cardFace: 'emoji',
  gameMode: 'classic',
  countdown: { easy: 90, medium: 150, hard: 240 },
  language: 'auto',
  adaptive: false,
  spaced: false
}
```

### Best Score

```typescript
interface BestScore {
  time: number;    // Time in seconds
  moves: number;   // Number of moves
}
```

**Example**:

```json
{
  "time": 45,
  "moves": 12
}
```

### Leaderboard

```typescript
type Leaderboard = LeaderboardEntry[];

interface LeaderboardEntry {
  time: number;    // Time in seconds
  moves: number;   // Number of moves
  at: number;      // Timestamp (Date.now())
}
```

- Maximum 3 entries retained
- Sorted by: time → moves → timestamp

**Example**:

```json
[
  { "time": 45, "moves": 12, "at": 1713264000000 },
  { "time": 52, "moves": 10, "at": 1713350400000 },
  { "time": 58, "moves": 15, "at": 1713436800000 }
]
```

### Achievements

```typescript
interface Achievements {
  [achievementId: string]: {
    unlocked: true;
    at: number;      // Unlock timestamp
  };
}
```

**Achievement IDs**:

| ID | Condition |
|----|-----------|
| `first_win` | Complete any game |
| `easy_under_60` | Easy difficulty under 60s |
| `medium_under_120` | Medium difficulty under 120s |
| `hard_under_180` | Hard difficulty under 180s |
| `no_hint_win` | Complete without hints |
| `perfect_moves` | Perfect game (moves = pairs) |

**Example**:

```json
{
  "first_win": { "unlocked": true, "at": 1713264000000 },
  "easy_under_60": { "unlocked": true, "at": 1713350400000 }
}
```

### Statistics

```typescript
interface Stats {
  games: number;           // Total games played
  wins: number;            // Total wins
  timeSum: number;         // Total time (seconds)
  movesSum: number;        // Total moves
  hintsSum: number;        // Total hints used
  comboSum: number;        // Sum of max combos
  bestCombo: number;       // Best combo ever
  recallAttempts: number;  // Recall test attempts
  precisionSum: number;    // Precision sum (for average)
  recallSum: number;       // Recall sum (for average)
  nbackAttempts: number;   // N-back attempts
  nbackAccSum: number;     // N-back accuracy sum
  nbackRtSum: number;      // N-back RT sum (ms)
  nbackRtCount: number;    // N-back RT sample count
}
```

**Derived Metrics**:

| Metric | Calculation |
|--------|-------------|
| Win Rate | `wins / games` |
| Avg Time | `timeSum / wins` |
| Avg Moves | `movesSum / wins` |
| Avg Hints | `hintsSum / wins` |
| Avg Combo | `comboSum / wins` |
| Avg Precision | `precisionSum / recallAttempts` |
| Avg Recall | `recallSum / recallAttempts` |
| Avg N-back Accuracy | `nbackAccSum / nbackAttempts` |
| Avg N-back RT | `nbackRtSum / nbackRtCount` |

### Adaptive Data

```typescript
interface AdaptiveData {
  rating: number;              // Rating (600-1600)
  lastDiff: 'easy' | 'medium' | 'hard';  // Last difficulty played
}
```

**Defaults**:

```json
{ "rating": 1000, "lastDiff": "easy" }
```

### Spaced Repetition Data

```typescript
interface SpacedData {
  [cardValue: string]: number;    // Card value → weight
}
```

**Example**:

```json
{
  "🍎": 2.4,
  "🍌": 1.6,
  "🍇": 0.8
}
```

**Weight Rules**:

- Accumulates based on exposure count (>1 exposure = difficult)
- Old weights decay by 0.8 each game
- Higher weight = higher selection probability

### Daily Challenge Data

```typescript
interface DailyData {
  done: true;
  at: number;      // Completion timestamp
}
```

**Example**:

```json
{ "done": true, "at": 1713264000000 }
```

---

## Import / Export

### Export Format

```typescript
interface ExportPayload {
  version: 1;
  settings: Settings;
  bests: {
    easy?: BestScore;
    medium?: BestScore;
    hard?: BestScore;
  };
  leaderboards: {
    easy?: Leaderboard;
    medium?: Leaderboard;
    hard?: Leaderboard;
  };
  achievements: Achievements;
  stats: Stats;
  adaptive: AdaptiveData;
  spaced: {
    emoji?: SpacedData;
    numbers?: SpacedData;
    letters?: SpacedData;
    shapes?: SpacedData;
    colors?: SpacedData;
  };
}
```

### Export Process

```javascript
// app.js
function buildExportPayload() {
  return {
    version: 1,
    settings: settings,
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

### Import Process

```javascript
// src/import-export.js
function normalizeImportData(raw, defaults) {
  return {
    version: clampInt(raw.version, 1, 999, 1),
    settings: normalizeSettings(raw.settings, defaults),
    bests: normalizeBests(raw.bests),
    leaderboards: normalizeLeaderboards(raw.leaderboards),
    achievements: normalizeAchievements(raw.achievements),
    stats: normalizeStats(raw.stats),
    adaptive: normalizeAdaptive(raw.adaptive),
    spaced: normalizeSpaced(raw.spaced),
  };
}
```

### Normalization Principles

1. **Type Checking** — Ensure field types are correct
2. **Range Clamping** — Numeric fields limited to valid ranges
3. **Enum Validation** — Enum values must be from allowed set
4. **Default Fill** — Missing fields populated with defaults

---

## Data Security

### Error Handling

All localStorage operations wrapped in try-catch:

```javascript
// src/storage.js
function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail (private mode or quota exceeded)
  }
}
```

### Private Mode Compatibility

- localStorage may be unavailable or cleared after session in private/incognito mode
- Graceful degradation to in-memory defaults

### Quota Management

- Typical data size: < 50KB
- No automatic cleanup of old data
- "Reset Data" feature available for quota issues

---

## Data Migration

### Current Version

Export format version: `1`

### Migration Strategy

For future data structure changes:

1. Increment `version` number
2. Add migration logic in `normalizeImportData`
3. Update `changelog/` with change record

```javascript
// Example: Future version migration
function normalizeImportData(raw, defaults) {
  const version = clampInt(raw.version, 1, 999, 1);

  let data = { ...raw };

  // Version migration
  if (version < 2) {
    data = migrateV1ToV2(data);
  }

  // Continue normalization...
}
```

---

## Debugging

### View All Data

```javascript
// List all memory_match_ keys
Object.keys(localStorage)
  .filter((k) => k.startsWith('memory_match_'))
  .forEach((k) => console.log(k, localStorage.getItem(k)));

// Clear all game data
Object.keys(localStorage)
  .filter((k) => k.startsWith('memory_match_'))
  .forEach((k) => localStorage.removeItem(k));
```

### Export Current State

```javascript
// Export as JSON
const data = JSON.parse(JSON.stringify(window.RememberStorage));
console.log(JSON.stringify(data, null, 2));
```

---

*For game modes and logic, see [Training Modes](./modes.md). For system architecture, see [Architecture Overview](./architecture.md).*
