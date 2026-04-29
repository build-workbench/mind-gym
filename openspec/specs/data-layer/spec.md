---
title: Data Layer
version: 1.0.0
status: active
last_updated: 2026-04-27
---

# Data Layer

> localStorage schema and CRUD operations

## Purpose

The Data Layer provides persistent storage using localStorage with a consistent key naming convention and safe CRUD operations.

---

## Interfaces

### Settings

```typescript
interface Settings {
  sound: boolean;
  vibrate: boolean;
  previewSeconds: number;
  accent: 'indigo' | 'emerald' | 'rose';
  theme: 'auto' | 'light' | 'dark';
  motion: 'auto' | 'on' | 'off';
  volume: number;
  soundPack: 'clear' | 'electro' | 'soft';
  cardFace: 'emoji' | 'numbers' | 'letters' | 'shapes' | 'colors';
  gameMode: 'classic' | 'countdown';
  countdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  language: 'auto' | 'zh' | 'en';
  adaptive: boolean;
  spaced: boolean;
}
```

### Default Settings

```javascript
const DEFAULT_SETTINGS = {
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
  spaced: false,
};
```

### BestScore

```typescript
interface BestScore {
  time: number; // Time in seconds
  moves: number; // Number of moves
}
```

### Leaderboard

```typescript
type Leaderboard = LeaderboardEntry[];

interface LeaderboardEntry {
  time: number;
  moves: number;
  at: number; // Timestamp
}
```

### Achievements

```typescript
interface Achievements {
  [achievementId: string]: {
    unlocked: true;
    at: number; // Unlock timestamp
  };
}
```

### Stats

```typescript
interface Stats {
  games: number;
  wins: number;
  timeSum: number;
  movesSum: number;
  hintsSum: number;
  comboSum: number;
  bestCombo: number;
  recallAttempts: number;
  precisionSum: number;
  recallSum: number;
  nbackAttempts: number;
  nbackAccSum: number;
  nbackRtSum: number;
  nbackRtCount: number;
}
```

### AdaptiveData

```typescript
interface AdaptiveData {
  rating: number; // 600-1600
  lastDiff: Difficulty;
}
```

### SpacedData (Legacy)

```typescript
interface SpacedData {
  [cardValue: string]: number;
}
```

### MasteryData (FSRS-4.5)

```typescript
interface MasteryCard {
  difficulty: number; // 1-10, higher = harder
  stability: number; // Days until 90% retention
  retrievability: number; // 0-1, probability of recall
  lastReview: number; // Timestamp
  nextReview: number; // Timestamp
  reps: number; // Review count
  lapses: number; // Forget count
}

interface MasteryData {
  [cardValue: string]: MasteryCard;
}
```

### DailyData

```typescript
interface DailyData {
  done: true;
  at: number; // Completion timestamp
}
```

### ExportPayload

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
  mastery: {
    emoji?: MasteryData;
    numbers?: MasteryData;
    letters?: MasteryData;
    shapes?: MasteryData;
    colors?: MasteryData;
  };
}
```

---

## Key Reference

| Key                                      | Type         | Description               |
| ---------------------------------------- | ------------ | ------------------------- |
| `memory_match_settings`                  | Settings     | User preferences          |
| `memory_match_best_<difficulty>`         | BestScore    | Best score per difficulty |
| `memory_match_lb_<difficulty>`           | Leaderboard  | Top 3 per difficulty      |
| `memory_match_achievements`              | Achievements | Unlock status             |
| `memory_match_stats`                     | Stats        | Aggregate statistics      |
| `memory_match_adaptive`                  | AdaptiveData | Rating data               |
| `memory_match_spaced_<theme>`            | SpacedData   | Legacy per-theme weights  |
| `memory_match_mastery_<theme>`           | MasteryData  | FSRS-4.5 mastery tracking |
| `memory_match_daily_<date>_<difficulty>` | DailyData    | Daily completion          |
| `memory_match_onboarding_v1`             | string       | Onboarding flag           |

---

## Requirements

### REQ-DL-001: Key Naming

The system SHALL use consistent key naming with `memory_match_` prefix.

#### Scenario: Settings key

- **WHEN** accessing settings
- **THEN** key is `memory_match_settings`

#### Scenario: Difficulty-specific key

- **WHEN** accessing best score for easy
- **THEN** key is `memory_match_best_easy`

### REQ-DL-002: Safe Operations

The system SHALL handle localStorage errors gracefully.

#### Scenario: Private mode

- **WHEN** localStorage is unavailable
- **THEN** operations return defaults without error

#### Scenario: Corrupt data

- **WHEN** JSON parse fails
- **THEN** fallback value returned

### REQ-DL-003: Normalization

The system SHALL normalize imported data.

#### Scenario: Missing fields

- **WHEN** import has missing fields
- **THEN** defaults filled in

#### Scenario: Invalid values

- **WHEN** import has invalid enum value
- **THEN** fallback to default

### REQ-DL-004: Leaderboard Constraints

The system SHALL maintain leaderboard constraints.

#### Scenario: Maximum entries

- **WHEN** adding to leaderboard
- **THEN** only top 3 retained

#### Scenario: Sorting

- **WHEN** leaderboard has multiple entries
- **THEN** sorted by time → moves → timestamp

---

## CRUD Operations

### Generic Operations

```javascript
function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail for private mode
  }
}
```

### Normalization Helpers

```javascript
function clampInt(val, min, max, fallback) {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
}

function validateEnum(val, allowed, fallback) {
  return allowed.includes(val) ? val : fallback;
}
```

---

## Acceptance Criteria

| ID        | Criterion                            | Status | Verified   |
| --------- | ------------------------------------ | ------ | ---------- |
| AC-DL-001 | All keys use memory*match* prefix    | DONE   | 2026-04-17 |
| AC-DL-002 | Safe parse returns fallback on error | DONE   | 2026-04-17 |
| AC-DL-003 | Import normalizes invalid values     | DONE   | 2026-04-17 |
| AC-DL-004 | Leaderboard max 3 entries            | DONE   | 2026-04-17 |
| AC-DL-005 | Best score updates correctly         | DONE   | 2026-04-17 |
| AC-DL-006 | Statistics aggregate correctly       | DONE   | 2026-04-17 |
| AC-DL-007 | Export includes all data             | DONE   | 2026-04-17 |
| AC-DL-008 | Import preserves valid data          | DONE   | 2026-04-17 |

---

## Achievement IDs

| ID                 | Condition                    |
| ------------------ | ---------------------------- |
| `first_win`        | Complete any game            |
| `easy_under_60`    | Easy under 60s               |
| `medium_under_120` | Medium under 120s            |
| `hard_under_180`   | Hard under 180s              |
| `no_hint_win`      | Complete without hints       |
| `perfect_moves`    | Perfect game (moves = pairs) |

---

## Enum Values

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
type CardFace = 'emoji' | 'numbers' | 'letters' | 'shapes' | 'colors';
type Accent = 'indigo' | 'emerald' | 'rose';
type Theme = 'auto' | 'light' | 'dark';
type Motion = 'auto' | 'on' | 'off';
type SoundPack = 'clear' | 'electro' | 'soft';
type GameMode = 'classic' | 'countdown';
type Language = 'auto' | 'zh' | 'en';
```

---

## References

- [Core Architecture](../../rfc/0001-core-architecture.md)
- [Game Modes](../game-modes/spec.md)
- [Scoring](../scoring/spec.md)
