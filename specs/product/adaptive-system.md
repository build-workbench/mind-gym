# Adaptive System

> Dynamic difficulty adjustment based on player performance

## Overview

The Adaptive System dynamically adjusts preview time and hint count based on the player's performance rating. This creates a personalized difficulty curve that keeps the game challenging but not frustrating.

## Acceptance Criteria

- [x] ELO-like rating system (600-1600 range)
- [x] Rating updates after each game
- [x] Preview time adjusted based on rating
- [x] Hint count adjusted based on rating
- [x] Toggle on/off in settings
- [x] Initial rating of 1000 for new players

## Rating System

### Rating Range

| Statistic      | Value |
| -------------- | ----- |
| Initial Rating | 1000  |
| Minimum        | 600   |
| Maximum        | 1600  |

### Rating Update Formula

Based on ELO rating system:

```javascript
// app.js
function updateAdaptiveOnEnd(win, stars, diff) {
  if (!settings.adaptive) return;

  const a = loadAdaptive();
  const exp = expectedStarsFor(diff);  // easy:4, medium:3.5, hard:3
  const perf = win ? stars : 1.5;      // Loss = poor performance
  const k = 12;                        // ELO-like K-factor

  a.rating = Math.max(600, Math.min(1600, Math.round(a.rating + k * (perf - exp))));
  a.lastDiff = diff;

  saveAdaptive(a);
}
```

### Expected Stars by Difficulty

| Difficulty | Expected Stars |
| ---------- | -------------- |
| Easy       | 4.0            |
| Medium     | 3.5            |
| Hard       | 3.0            |

### Performance Interpretation

| Performance     | Rating Change    |
| --------------- | ---------------- |
| Stars > Expected | Rating increases |
| Stars = Expected | Rating stays     |
| Stars < Expected | Rating decreases |
| Loss            | Rating decreases significantly |

## Adjustment Strategy

### Preview Time

| Rating Range | Preview Time |
| ------------ | ------------ |
| < 940        | ≥ 2 seconds  |
| 940 - 1040   | ≥ 1 second   |
| 1040 - 1140  | ≤ 1 second   |
| > 1140       | 0 seconds    |

### Hint Adjustment

| Rating Range | Hint Adjustment                     |
| ------------ | ----------------------------------- |
| < 940        | +1 hint (more assistance)           |
| 940 - 1140   | No change                           |
| > 1140       | -1 hint (more challenge)            |

### Minimum Hints

Regardless of rating adjustment:
- Easy: minimum 1 hint
- Medium: minimum 1 hint
- Hard: minimum 0 hints

## Data Storage

### Adaptive Data Structure

```typescript
interface AdaptiveData {
  rating: number;     // Current rating (600-1600)
  lastDiff: 'easy' | 'medium' | 'hard';  // Last difficulty played
}
```

Key: `memory_match_adaptive`

### Default Values

```json
{
  "rating": 1000,
  "lastDiff": "easy"
}
```

## Implementation

### Applying Adaptive Settings

```javascript
// app.js - before game starts
function applyAdaptiveSettings() {
  if (!settings.adaptive) {
    // Use manual settings
    previewSeconds = settings.previewSeconds;
    hintsLeft = getDefaultHints(currentDifficulty);
    return;
  }

  const adaptive = loadAdaptive();
  const rating = adaptive.rating;

  // Determine preview time
  if (rating < 940) {
    previewSeconds = Math.max(2, settings.previewSeconds);
  } else if (rating < 1040) {
    previewSeconds = Math.max(1, settings.previewSeconds);
  } else if (rating < 1140) {
    previewSeconds = Math.min(1, settings.previewSeconds);
  } else {
    previewSeconds = 0;
  }

  // Determine hints
  const baseHints = getDefaultHints(currentDifficulty);
  if (rating < 940) {
    hintsLeft = baseHints + 1;
  } else if (rating > 1140) {
    hintsLeft = Math.max(0, baseHints - 1);
  } else {
    hintsLeft = baseHints;
  }
}
```

## UI Requirements

### Settings Toggle

- Switch in Settings → "Adaptive Assist"
- Description: "Automatically adjusts difficulty based on your performance"

### Rating Display (Optional)

- Show current rating in stats panel
- Visual indicator (e.g., gauge or level)
- Tooltip explaining the rating

## User Experience Flow

```
New Player (Rating: 1000)
    │
    ├── Plays Easy difficulty
    │       │
    │       └── Gets 1s preview, 3 hints
    │
    ├── Performs well (5 stars)
    │       │
    │       └── Rating increases to ~1048
    │
    ├── Next game
    │       │
    │       └── Preview reduced to 0s, hints reduced
    │
    └── Continues adapting...
```

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| New player starts           | Rating = 1000                          |
| Win with 5 stars on easy    | Rating increases                       |
| Win with 1 star             | Rating decreases                       |
| Lose game                   | Rating decreases significantly         |
| Rating < 940                | More preview time, more hints          |
| Rating > 1140               | No preview, fewer hints                |
| Toggle adaptive off         | Uses manual settings                   |
| Toggle adaptive on          | Uses rating-based settings             |

## Design Rationale

### Why ELO-like?

- Familiar rating system (used in chess, games)
- Self-correcting (rating finds true skill level)
- Clear progression path for players

### Why 600-1600 Range?

- Matches common ELO ranges
- 1000 as midpoint (neutral starting point)
- Wide enough range for meaningful differentiation

### Why K-factor 12?

- Moderate sensitivity
- Prevents wild swings from single games
- Allows meaningful changes over 5-10 games

## Related Specifications

- [Classic Matching Mode](./classic-matching.md)
- [Scoring System](./scoring-system.md)
- [Data Model](../db/schema.md)
