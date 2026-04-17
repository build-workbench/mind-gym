# Daily Challenge

> Same card layout for all players worldwide

## Overview

Daily Challenge generates a deterministic card layout based on the current date, difficulty, and theme. All players worldwide receive the same board, enabling fair comparison and competition.

## Acceptance Criteria

- [x] Card layout determined by date + difficulty + theme seed
- [x] Same seed produces identical layout across sessions
- [x] Completion status tracked per date + difficulty
- [x] "Completed" badge shown for finished challenges
- [x] One challenge per difficulty per day
- [x] No scores recorded, only completion status

## Seed Algorithm

### Algorithm: FNV-1a Hash

```javascript
// src/utils.js
function seedFromDate(dateStr, diff, theme) {
  let h = 2166136261; // FNV offset basis
  const s = `${dateStr}|${diff}|${theme}`;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0; // FNV prime
  }
  return h >>> 0;
}
```

### Input Parameters

| Parameter  | Format                    | Example          |
| ---------- | ------------------------- | ---------------- |
| `dateStr`  | ISO date string           | `"2026-04-17"`   |
| `diff`     | Difficulty key            | `"easy"`         |
| `theme`    | Card face theme           | `"emoji"`        |

### Output

32-bit unsigned integer seed used for seeded shuffle.

## Seeded Random Number Generator

```javascript
// Seeded PRNG (xorshift)
function seededRandom(seed) {
  let x = seed;
  return function() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
```

## User Flow

```
Click "Daily" Button
    │
    ├── Show Difficulty Selector
    │
    ├── Select Difficulty
    │       │
    │       ├── Already completed today?
    │       │       │
    │       │       ├── YES → Show "Already Completed" badge
    │       │       │
    │       │       └── NO → Continue
    │       │
    │       └── Generate seed from date + diff + theme
    │
    ├── Start Challenge with seeded deck
    │
    └── On Win:
            │
            ├── Mark as completed
            │
            ├── Store timestamp
            │
            └── Show completion badge
```

## Data Storage

### Completion Status

```typescript
interface DailyData {
  done: true;
  at: number;  // Completion timestamp
}
```

Key format: `memory_match_daily_<date>_<difficulty>`

Example key: `memory_match_daily_2026-04-17_easy`

### Storage Example

```json
{
  "done": true,
  "at": 1713264000000
}
```

## UI Requirements

### Daily Challenge Button

- Prominent placement in toolbar
- Shows "Daily" label with calendar icon
- Badge indicator for completion status

### Difficulty Selector

- Modal with easy/medium/hard options
- Shows completion status per difficulty
- Disabled state for already completed difficulties

### Completion Badge

- "Completed ✓" badge for finished challenges
- Shows completion date
- Visual distinction from incomplete challenges

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| First daily challenge       | Generated with date seed               |
| Same day, same settings     | Identical layout across sessions       |
| Different difficulty        | Different layout (seed includes diff)  |
| Different theme             | Different layout (seed includes theme) |
| Complete challenge          | Status stored with timestamp           |
| Revisit completed challenge | Shows "Already Completed" badge        |
| Next day                    | New seed, new layout                   |
| Different devices           | Same layout for same date/diff/theme   |

## Determinism Guarantees

| Condition              | Guarantee                    |
| ---------------------- | ---------------------------- |
| Same date + diff + theme | Identical card order       |
| Different timezone     | Uses local date (no UTC)     |
| Cross-session          | Reproducible results         |
| Cross-device           | Same seed = same board       |

## Limitations

- No server validation (client-side only)
- No global leaderboard for daily challenges
- Timezone differences may affect "same day" perception
- First-time offline requires online connection for initial cache

## Related Specifications

- [Classic Matching Mode](./classic-matching.md)
- [PWA & Offline](../rfc/0003-pwa-offline.md)
- [Data Model](../db/schema.md)
