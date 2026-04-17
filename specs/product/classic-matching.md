# Classic Matching Mode

> Flip cards to find matching pairs in minimum time and moves

## Overview

Classic Matching is the default training mode where players flip two cards per turn to find matching pairs. The goal is to complete all pairs in the minimum time and moves possible.

## Acceptance Criteria

- [x] Player can flip any unflipped card on the board
- [x] When two cards are flipped, they are compared for a match
- [x] Matching pairs remain locked face-up
- [x] Non-matching cards flip back after a short delay
- [x] Game tracks time from first flip to completion
- [x] Game counts each second-card flip as one move
- [x] Star rating calculated based on performance metrics
- [x] Best score saved per difficulty level
- [x] Leaderboard maintains top 3 scores per difficulty

## Difficulty Levels

| Level  | Grid | Pairs | Default Hints | Target Time |
| ------ | ---- | ----- | ------------- | ----------- |
| Easy   | 4×4  | 8     | 3             | 60s         |
| Medium | 4×5  | 10    | 2             | 120s        |
| Hard   | 6×6  | 18    | 1             | 180s        |

## Scoring

### Time Tracking

- Timer starts on first card flip
- Timer stops when last pair is matched
- Displayed in `MM:SS` format

### Move Counting

- Each flip of the second card counts as one move
- Minimum moves = number of pairs (perfect game)

### Star Rating Formula

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

### Rating Factors

| Factor | Impact                                  |
| ------ | --------------------------------------- |
| Time   | Proportional penalty for exceeding par  |
| Moves  | 3 point penalty per move above minimum  |
| Hints  | 10 point penalty per hint used          |
| Combos | +2 points per combo achieved (max 10)   |

## Game State Machine

### States

```
IDLE → PREVIEW → PLAYING → PAUSED → WON/LOST
                    ↓
                  LOCKED (during flip animation)
```

### State Transitions

| Current State | Event              | Next State   |
| ------------- | ------------------ | ------------ |
| IDLE          | First flip         | PLAYING      |
| IDLE          | Preview enabled    | PREVIEW      |
| PREVIEW       | Preview ends       | IDLE         |
| PLAYING       | Pause key pressed  | PAUSED       |
| PAUSED        | Resume key pressed | PLAYING      |
| PLAYING       | All pairs matched  | WON          |
| PLAYING       | Time expires       | LOST         |
| PLAYING       | Second card flip   | LOCKED       |
| LOCKED        | Cards flip back    | PLAYING      |

## Keyboard Shortcuts

| Key               | Action             |
| ----------------- | ------------------ |
| `N`               | New game           |
| `P`               | Pause/Resume       |
| `H`               | Use hint           |
| `↑↓←→`            | Navigate cards     |
| `Enter` / `Space` | Flip selected card |
| `Escape`          | Close modal        |

## UI Requirements

### Game Grid

- Responsive grid layout matching difficulty level
- Cards display selected theme (emoji/numbers/letters/shapes/colors)
- Flip animation using CSS 3D transforms

### Game Info Bar

- Timer display
- Move counter
- Remaining hints
- Current difficulty indicator

### Win Modal

- Completion time
- Move count
- Star rating (1-5 stars)
- Combo count
- "Play Again" button
- "Recall Test" option

## Data Storage

### Best Score

```typescript
interface BestScore {
  time: number;   // Time in seconds
  moves: number;  // Number of moves
}
```

Key: `memory_match_best_<difficulty>`

### Leaderboard Entry

```typescript
interface LeaderboardEntry {
  time: number;   // Time in seconds
  moves: number;  // Number of moves
  at: number;     // Timestamp (Date.now())
}
```

Key: `memory_match_lb_<difficulty>`
Maximum: 3 entries, sorted by time → moves → timestamp

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| Flip first card             | Card flips, timer doesn't start        |
| Flip second matching card   | Both cards locked, combo updated       |
| Flip non-matching card      | Both cards flip back after delay       |
| Complete game               | Win modal shows, stats updated         |
| Use hint                    | Matching card highlighted              |
| Pause during game           | Timer stops, board hidden              |
| Keyboard navigation         | Selected card highlighted              |
| Exceed target time          | Lower star rating                      |
| Perfect game (moves=pairs)  | Achievement unlocked                   |

## Related Specifications

- [Scoring System](./scoring-system.md)
- [Adaptive System](./adaptive-system.md)
- [Data Model](../db/schema.md)
