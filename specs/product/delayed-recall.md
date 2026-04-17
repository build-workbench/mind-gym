# Delayed Recall Test

> Post-game recognition memory assessment

## Overview

Delayed Recall is a post-game assessment that tests the player's ability to recognize which cards appeared in the recently completed game. This measures long-term memory consolidation rather than working memory.

## Acceptance Criteria

- [x] Triggered automatically after winning a game
- [x] Can be skipped by player
- [x] Presents mix of cards that appeared and new cards
- [x] Player selects cards they remember seeing
- [x] Precision and Recall metrics calculated
- [x] Statistics updated after completion

## Trigger Conditions

| Condition      | Trigger Behavior               |
| -------------- | ------------------------------ |
| Game won       | Recall test offered            |
| Game lost      | No recall test                 |
| N-back mode    | No recall test                 |
| Player skips   | No stats recorded              |

## Test Construction

### Item Generation

```javascript
// src/modes.js
function buildRecallItems(params) {
  const truth = params.truthValues;    // Cards from current game
  const pool = params.poolValues;      // All possible cards

  const trueCount = Math.min(6, truth.length);
  const falseCandidates = pool.filter(v => !truth.includes(v));

  const trues = shuffle(truth).slice(0, trueCount);
  const falses = shuffle(falseCandidates).slice(0, 9 - trueCount);

  const items = [
    ...trues.map(v => ({ v, correct: true })),
    ...falses.map(v => ({ v, correct: false })),
  ];
  return { items: shuffle(items), correctSet: new Set(trues) };
}
```

### Item Distribution

| Parameter         | Value                     |
| ----------------- | ------------------------- |
| Total items       | 9                         |
| True items (appeared) | 3-6 (max 6)           |
| False items (distractors) | 3-6 (complement)   |

### Example Test

Game contained: 🍎, 🍌, 🍇, 🍊, 🍋, 🍓, 🍑, 🍒

Test items:
```
Displayed: 🍎, 🍇, 🍋, 🥝, 🍈, 🍌, 🥭, 🍑, 🥥
Correct:   ✓,   ✓,   ✓,   ✗,   ✗,   ✓,   ✗,   ✓,   ✗
```

## Scoring Metrics

### Precision

$$Precision = \frac{TP}{TP + FP}$$

- Of selected cards, how many were correct
- Measures carefulness / false positive rate

### Recall

$$Recall = \frac{TP}{TP + FN}$$

- Of correct cards, how many were selected
- Measures completeness / false negative rate

### Terminology

| Term             | Definition                          |
| ---------------- | ----------------------------------- |
| TP (True Positive) | Correct cards selected            |
| FP (False Positive) | Incorrect cards selected          |
| FN (False Negative) | Correct cards missed              |
| TN (True Negative) | Incorrect cards correctly skipped  |

### Example Calculation

```
Player selected: 🍎, 🍇, 🍋, 🥝
Correct items:   🍎, 🍇, 🍋, 🍌, 🍑

TP = 3 (🍎, 🍇, 🍋)
FP = 1 (🥝)
FN = 2 (🍌, 🍑)

Precision = 3 / (3 + 1) = 0.75
Recall = 3 / (3 + 2) = 0.60
```

## User Flow

```
Game Won
    │
    ├── Recall Test Modal Appears
    │       │
    │       ├── "Test Your Memory" message
    │       │
    │       └── "Start" / "Skip" buttons
    │
    ├── Player Starts Test
    │       │
    │       ├── Display 9 cards
    │       │
    │       └── Player selects remembered cards
    │
    ├── Submit Selection
    │       │
    │       ├── Calculate Precision & Recall
    │       │
    │       └── Show Results Modal
    │
    └── Stats Updated
```

## UI Requirements

### Test Modal

- Grid of 9 cards
- Click/tap to toggle selection
- Visual indicator for selected state
- "Submit" button
- "Skip" option (text link)

### Results Modal

- Precision percentage
- Recall percentage
- Visual breakdown (selected vs. correct)
- Encouraging message based on performance

## Data Storage

### Statistics Updated

```typescript
interface Stats {
  // ... other stats
  recallAttempts: number;   // Total tests taken
  precisionSum: number;     // Precision sum (for average)
  recallSum: number;        // Recall sum (for average)
}
```

### Derived Metrics

| Metric         | Calculation                        |
| -------------- | ---------------------------------- |
| Avg Precision  | `precisionSum / recallAttempts`    |
| Avg Recall     | `recallSum / recallAttempts`       |

## Implementation

### Tracking Seen Cards

```javascript
// app.js - during game
let seenCountMap = new Map();  // Track exposure counts
let lastGameValues = [];       // Cards in current game

// On each card flip
seenCountMap.set(cardValue, (seenCountMap.get(cardValue) || 0) + 1);

// On game start
lastGameValues = deck.map(card => card.value);
```

### Building Test

```javascript
// On game win
function prepareRecallTest() {
  const pool = getPoolsForTheme(settings.cardFace);
  const result = buildRecallItems({
    truthValues: lastGameValues,
    poolValues: pool.map(p => p.v),
  });
  recallCorrectSet = result.correctSet;
  return result.items;
}
```

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| Win game                    | Recall test modal appears              |
| Skip test                   | No stats recorded, return to main      |
| Start test                  | 9 cards displayed                      |
| Select all correct cards    | Precision = 1.0, Recall = 1.0          |
| Select no cards             | Precision = 0, Recall = 0              |
| Select mix of cards         | Calculated Precision & Recall          |
| Submit selection            | Results shown, stats updated           |
| Multiple tests              | Averages tracked in stats              |

## Cognitive Science Background

Delayed recall tests measure:
- **Episodic memory**: Memory for specific events/experiences
- **Recognition memory**: Distinguishing familiar from novel items
- **Memory consolidation**: Transfer from short-term to long-term storage

### Training Recommendations

- Take recall tests consistently after games
- Review missed items to improve encoding
- Spaced repetition improves long-term retention

## Related Specifications

- [Classic Matching Mode](./classic-matching.md)
- [Spaced Reinforcement](./spaced-reinforcement.md)
- [Data Model](../db/schema.md)
