# Spaced Reinforcement

> Prioritizes challenging cards using decay-weighted selection

## Overview

Spaced Reinforcement weights "difficult cards" (those requiring multiple exposures to match) to appear more frequently in future games. This implements a simple spaced repetition algorithm targeting weak memory items.

## Acceptance Criteria

- [x] Track exposure count per card during games
- [x] Calculate weight based on excess exposures
- [x] Decay old weights over time
- [x] Weighted card selection for deck building
- [x] Per-theme weight tracking
- [x] Toggle on/off in settings

## Algorithm

### Weight Accumulation

```javascript
// app.js
function applySpacedAfterWin(theme) {
  if (!settings.spaced) return;

  const weights = loadSpaced(theme);

  // Decay old weights
  for (const k of Object.keys(weights)) {
    weights[k] = Math.max(0, weights[k] * 0.8);
  }

  // Add exposure counts (>1 exposure = difficult)
  seenCountMap.forEach((cnt, v) => {
    const extra = Math.max(0, cnt - 1);
    if (extra > 0) weights[v] = (weights[v] || 0) + extra;
  });

  saveSpaced(theme, weights);
}
```

### Decay Factor

| Parameter | Value | Description                      |
| --------- | ----- | -------------------------------- |
| Decay     | 0.8   | Each game, weights reduce by 20% |

### Weight Calculation

$$weight_{new} = weight_{old} \times 0.8 + max(0, exposures - 1)$$

### Card Selection

```javascript
// app.js
function pickWithSpaced(theme, pool, pairs) {
  const weights = loadSpaced(theme);
  const copy = pool.slice();

  // Sort by weight descending
  copy.sort((a, b) => (weights[b.v] || 0) - (weights[a.v] || 0));

  // Take top 40% weighted cards
  const topN = Math.min(Math.floor(pairs * 0.4), copy.length);
  const picksTop = copy.slice(0, topN);
  const rest = pool.filter(x => !picksTop.some(y => y.v === x.v));

  shuffle(rest);
  return [...picksTop, ...rest.slice(0, pairs - picksTop.length)];
}
```

### Selection Strategy

| Pool Portion  | Selection Method           |
| ------------- | -------------------------- |
| Top 40%       | Weighted (difficult cards) |
| Remaining 60% | Random from pool           |

## Data Storage

### Spaced Data Structure

```typescript
interface SpacedData {
  [cardValue: string]: number; // Card value → weight
}
```

Key format: `memory_match_spaced_<theme>`

Themes: `emoji`, `numbers`, `letters`, `shapes`, `colors`

### Example Data

```json
{
  "🍎": 2.4,
  "🍌": 1.6,
  "🍇": 0.8,
  "🍊": 0.64
}
```

### Weight Interpretation

| Weight | Meaning                     |
| ------ | --------------------------- |
| 0      | Never seen or fully decayed |
| 1-2    | Slightly difficult          |
| 3-5    | Moderately difficult        |
| 6+     | Very difficult              |

## Implementation

### During Game

```javascript
// Track exposures
let seenCountMap = new Map();

// On each card flip
if (!seenCountMap.has(cardValue)) {
  seenCountMap.set(cardValue, 1);
} else {
  seenCountMap.set(cardValue, seenCountMap.get(cardValue) + 1);
}
```

### After Game

```javascript
// Apply spaced reinforcement
if (gameWon) {
  applySpacedAfterWin(settings.cardFace);
}
```

### At Deck Building

```javascript
// Build deck with spaced reinforcement
function createDeck(difficulty) {
  const pairs = PAIRS_BY_DIFFICULTY[difficulty];
  const pool = POOLS[settings.cardFace];

  if (settings.spaced) {
    return pickWithSpaced(settings.cardFace, pool, pairs);
  } else {
    return shuffle(pool.slice(0, pairs));
  }
}
```

## UI Requirements

### Settings Toggle

- Switch in Settings → "Spaced Reinforcement"
- Description: "Cards you struggle with appear more often"

### Stats Display (Optional)

- Show "difficult cards" count
- Weight distribution visualization

## Example Progression

### Game 1

```
Player struggles with: 🍎 (4 exposures), 🍌 (3 exposures)
Weights after decay: {} (empty)
New weights: {🍎: 3, 🍌: 2}
```

### Game 2

```
Before: {🍎: 3, 🍌: 2}
After decay: {🍎: 2.4, 🍌: 1.6}
Player improves: 🍎 (2 exposures - better!), 🍇 (3 exposures)
New weights: {🍎: 2.4, 🍌: 1.6, 🍇: 2}
```

### Game 3

```
Before: {🍎: 2.4, 🍌: 1.6, 🍇: 2}
After decay: {🍎: 1.92, 🍌: 1.28, 🍇: 1.6}
Weights reduce over time if cards improve
```

## Test Cases

| Scenario                        | Expected Behavior                   |
| ------------------------------- | ----------------------------------- |
| First game ever                 | No weighted cards, random selection |
| Struggle with card A            | Card A weighted higher              |
| Win game with spaced on         | Weights updated and decayed         |
| Toggle spaced off               | Random selection (no weights used)  |
| Switch theme                    | Separate weights per theme          |
| Multiple games                  | Weights decay and accumulate        |
| Card improves (fewer exposures) | Weight stops growing                |

## Future Roadmap

| Priority | Feature           | Description                          |
| -------- | ----------------- | ------------------------------------ |
| P1       | SM-2 Algorithm    | SuperMemo-inspired intervals         |
| P2       | Mastery Scores    | Track individual card mastery level  |
| P3       | Review Sessions   | Dedicated review mode for weak cards |
| P4       | Cross-device Sync | Sync weights across devices          |
| P5       | Leitner System    | Box-based card scheduling            |

### SM-2 Algorithm Preview

```javascript
// Future implementation
function sm2(card, quality) {
  // quality: 0-5 (response quality)
  if (quality >= 3) {
    card.interval = card.interval * card.easinessFactor;
  } else {
    card.interval = 1; // Reset to 1 day
  }
  card.easinessFactor = Math.max(
    1.3,
    card.easinessFactor + 0.1 - quality * (0.08 + quality * 0.02)
  );
  return card;
}
```

## Related Specifications

- [Delayed Recall](./delayed-recall.md)
- [Classic Matching Mode](./classic-matching.md)
- [Data Model](../db/schema.md)
