# Scoring System

> Star ratings, combos, and performance metrics

## Overview

The Scoring System provides multiple feedback mechanisms to measure player performance: star ratings, combo bonuses, and comprehensive statistics. This creates motivation and tracks progress over time.

## Acceptance Criteria

- [x] 1-5 star rating based on performance
- [x] Combo system for consecutive matches
- [x] Statistics tracked across all games
- [x] Best scores saved per difficulty
- [x] Leaderboard for top 3 scores per difficulty

## Star Rating System

### Formula

```javascript
// src/stats.js
function getRating(elapsedSec, movesCount, diffKey, usedHints, comboMax) {
  const parTime = { easy: 60, medium: 120, hard: 180 }[diffKey];
  const parMoves = { easy: 8, medium: 10, hard: 18 }[diffKey];

  let score = 100;

  // Time penalty (max 40 points)
  score -= Math.min(60, (elapsedSec / parTime) * 40);

  // Moves penalty
  score -= Math.max(0, movesCount - parMoves) * 3;

  // Hints penalty
  score -= usedHints * 10;

  // Combo bonus (max 10 points)
  score += Math.min(10, comboMax * 2);

  // Normalize to 1-5 stars
  score = Math.max(0, Math.min(100, score));
  return Math.max(1, Math.min(5, Math.ceil(score / 20)));
}
```

### Rating Factors

| Factor | Impact                                 |
| ------ | -------------------------------------- |
| Time   | Proportional penalty for exceeding par |
| Moves  | 3 point penalty per move above minimum |
| Hints  | 10 point penalty per hint used         |
| Combos | +2 points per combo achieved (max 10)  |

### Par Values by Difficulty

| Difficulty | Par Time | Par Moves |
| ---------- | -------- | --------- |
| Easy       | 60s      | 8         |
| Medium     | 120s     | 10        |
| Hard       | 180s     | 18        |

### Score to Stars

| Score Range | Stars          |
| ----------- | -------------- |
| 81-100      | ⭐⭐⭐⭐⭐ (5) |
| 61-80       | ⭐⭐⭐⭐ (4)   |
| 41-60       | ⭐⭐⭐ (3)     |
| 21-40       | ⭐⭐ (2)       |
| 0-20        | ⭐ (1)         |

## Combo System

### Trigger Condition

Consecutive matches within 5 seconds.

### Implementation

```javascript
// app.js
const now = performance.now();
if (now - lastMatchAt <= 5000) {
  comboCount++;
} else {
  comboCount = 1;
}
lastMatchAt = now;

if (comboCount >= 2) {
  maxComboThisGame = Math.max(maxComboThisGame, comboCount);
  showCombo(comboCount);
}
```

### Combo Window

| Parameter       | Value     |
| --------------- | --------- |
| Window          | 5 seconds |
| Minimum display | 2x combo  |

### Effects

| Effect             | Description                   |
| ------------------ | ----------------------------- |
| Combo counter      | Increments                    |
| Toast notification | Shows "2x Combo!" etc.        |
| Max combo recorded | For session stats             |
| Star rating impact | +2 points per combo (max +10) |

## Statistics Tracking

### Core Statistics

```typescript
interface Stats {
  games: number; // Total games played
  wins: number; // Total wins
  timeSum: number; // Total time (seconds)
  movesSum: number; // Total moves
  hintsSum: number; // Total hints used
  comboSum: number; // Sum of max combos
  bestCombo: number; // Best combo ever
  recallAttempts: number; // Recall test attempts
  precisionSum: number; // Precision sum
  recallSum: number; // Recall sum
  nbackAttempts: number; // N-back attempts
  nbackAccSum: number; // N-back accuracy sum
  nbackRtSum: number; // N-back RT sum (ms)
  nbackRtCount: number; // N-back RT sample count
}
```

### Derived Metrics

| Metric              | Calculation                     |
| ------------------- | ------------------------------- |
| Win Rate            | `wins / games`                  |
| Avg Time            | `timeSum / wins`                |
| Avg Moves           | `movesSum / wins`               |
| Avg Hints           | `hintsSum / wins`               |
| Avg Combo           | `comboSum / wins`               |
| Avg Precision       | `precisionSum / recallAttempts` |
| Avg Recall          | `recallSum / recallAttempts`    |
| Avg N-back Accuracy | `nbackAccSum / nbackAttempts`   |
| Avg N-back RT       | `nbackRtSum / nbackRtCount`     |

### Update Logic

```javascript
// app.js - after game win
function updateStats(win, time, moves, hints, combo) {
  const stats = loadStats();

  stats.games++;
  if (win) {
    stats.wins++;
    stats.timeSum += time;
    stats.movesSum += moves;
    stats.hintsSum += hints;
    stats.comboSum += combo;
    stats.bestCombo = Math.max(stats.bestCombo, combo);
  }

  saveStats(stats);
}
```

## Best Score

### Data Structure

```typescript
interface BestScore {
  time: number; // Time in seconds
  moves: number; // Number of moves
}
```

### Update Condition

New best score replaces old when:

1. Time is faster, OR
2. Time is equal AND moves are fewer

```javascript
function updateBest(diff, time, moves) {
  const current = loadBest(diff);

  if (!current || time < current.time || (time === current.time && moves < current.moves)) {
    saveBest(diff, { time, moves });
  }
}
```

## Leaderboard

### Data Structure

```typescript
type Leaderboard = LeaderboardEntry[];

interface LeaderboardEntry {
  time: number; // Time in seconds
  moves: number; // Number of moves
  at: number; // Timestamp (Date.now())
}
```

### Constraints

- Maximum 3 entries retained
- Sorted by: time → moves → timestamp

### Update Logic

```javascript
function updateLeaderboard(diff, time, moves) {
  const lb = loadLeaderboard(diff);

  lb.push({ time, moves, at: Date.now() });

  // Sort by time, then moves, then timestamp
  lb.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.moves !== b.moves) return a.moves - b.moves;
    return a.at - b.at;
  });

  // Keep only top 3
  const trimmed = lb.slice(0, 3);

  saveLeaderboard(diff, trimmed);
}
```

## UI Requirements

### Game Info Bar

- Timer display (count up or down)
- Move counter
- Remaining hints
- Current difficulty

### Win Modal

- Completion time
- Move count
- Star rating (1-5 stars with visual)
- Max combo achieved
- "Play Again" button
- "Recall Test" option

### Statistics Panel

- Total games / wins
- Win rate percentage
- Average time / moves
- Best combo
- Per-mode statistics

## Test Cases

| Scenario                   | Expected Behavior               |
| -------------------------- | ------------------------------- |
| Perfect game (moves=pairs) | 5 stars possible (if time good) |
| Very slow game             | 1-2 stars                       |
| Use all hints              | Star rating reduced             |
| Get 5x combo               | +10 points to score             |
| Break personal best        | New best score saved            |
| Make top 3                 | Added to leaderboard            |
| Multiple games             | Statistics aggregate correctly  |

## Related Specifications

- [Classic Matching Mode](./classic-matching.md)
- [Adaptive System](./adaptive-system.md)
- [Data Model](../db/schema.md)
