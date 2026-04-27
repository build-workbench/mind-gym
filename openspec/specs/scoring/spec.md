---
title: Scoring
version: 1.0.0
status: active
last_updated: 2026-04-27
---

# Scoring

> Star ratings, combos, and performance metrics

## Purpose

The Scoring System provides multiple feedback mechanisms:

- Star ratings (1-5) based on performance
- Combo system for consecutive matches
- Comprehensive statistics tracking
- Best scores and leaderboards

---

## Interfaces

### BestScore

```typescript
interface BestScore {
  time: number; // Time in seconds
  moves: number; // Number of moves
}
```

### LeaderboardEntry

```typescript
interface LeaderboardEntry {
  time: number; // Time in seconds
  moves: number; // Number of moves
  at: number; // Timestamp (Date.now())
}
```

### Stats

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

---

## Requirements

### Requirement: Star Rating

The system SHALL calculate 1-5 star rating based on performance.

#### Scenario: Perfect game

- **WHEN** moves equal pairs and time under par
- **THEN** 5 stars awarded

#### Scenario: Poor performance

- **WHEN** time significantly exceeds par or many hints used
- **THEN** 1-2 stars awarded

### Requirement: Combo System

The system SHALL track consecutive matches within a time window.

#### Scenario: Combo trigger

- **WHEN** matches occur within 5 seconds
- **THEN** combo counter increments

#### Scenario: Combo break

- **WHEN** match occurs after 5+ seconds
- **THEN** combo resets to 1

### Requirement: Best Scores

The system SHALL save best score per difficulty.

#### Scenario: New best time

- **WHEN** time is faster than current best
- **THEN** best score updated

#### Scenario: Same time, fewer moves

- **WHEN** time equals best but moves are fewer
- **THEN** best score updated

### Requirement: Leaderboard

The system SHALL maintain top 3 scores per difficulty.

#### Scenario: Top 3 score

- **WHEN** score qualifies for top 3
- **THEN** added to leaderboard

#### Scenario: Leaderboard full

- **WHEN** more than 3 entries exist
- **THEN** lowest score removed

---

## Star Rating Formula

```javascript
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

### Score to Stars

| Score Range | Stars          |
| ----------- | -------------- |
| 81-100      | ⭐⭐⭐⭐⭐ (5) |
| 61-80       | ⭐⭐⭐⭐ (4)   |
| 41-60       | ⭐⭐⭐ (3)     |
| 21-40       | ⭐⭐ (2)       |
| 0-20        | ⭐ (1)         |

---

## Acceptance Criteria

| ID        | Criterion                       | Status | Verified   |
| --------- | ------------------------------- | ------ | ---------- |
| AC-SC-001 | 1-5 star rating calculated      | DONE   | 2026-04-17 |
| AC-SC-002 | Time factor in rating           | DONE   | 2026-04-17 |
| AC-SC-003 | Moves factor in rating          | DONE   | 2026-04-17 |
| AC-SC-004 | Hints penalty applied           | DONE   | 2026-04-17 |
| AC-SC-005 | Combo bonus applied             | DONE   | 2026-04-17 |
| AC-SC-006 | Combo tracked within window     | DONE   | 2026-04-17 |
| AC-SC-007 | Best score saved per difficulty | DONE   | 2026-04-17 |
| AC-SC-008 | Leaderboard maintains top 3     | DONE   | 2026-04-17 |
| AC-SC-009 | Statistics tracked across games | DONE   | 2026-04-17 |

---

## Rating Factors

| Factor | Impact                                 |
| ------ | -------------------------------------- |
| Time   | Proportional penalty for exceeding par |
| Moves  | 3 point penalty per move above minimum |
| Hints  | 10 point penalty per hint used         |
| Combos | +2 points per combo (max +10)          |

---

## Derived Metrics

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

---

## Data Storage

| Key                              | Type               | Description               |
| -------------------------------- | ------------------ | ------------------------- |
| `memory_match_best_<difficulty>` | BestScore          | Best score per difficulty |
| `memory_match_lb_<difficulty>`   | LeaderboardEntry[] | Top 3 per difficulty      |
| `memory_match_stats`             | Stats              | Aggregate statistics      |

---

## References

- [Game Modes](../game-modes/spec.md)
- [Adaptive Systems](../adaptive-systems/spec.md)
- [Data Layer](../data-layer/spec.md)
