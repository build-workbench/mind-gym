# Adaptive Systems

> Dynamic difficulty adjustment and spaced reinforcement

## Purpose

Mind Gym provides two adaptive systems to personalize the training experience:

1. **Adaptive Difficulty** - Dynamically adjusts preview time and hints based on performance rating
2. **Spaced Reinforcement** - Prioritizes challenging cards using decay-weighted selection

---

## Interfaces

### AdaptiveData

```typescript
interface AdaptiveData {
  rating: number; // ELO-like rating (600-1600)
  lastDiff: Difficulty; // Last difficulty played
}
```

### SpacedData

```typescript
interface SpacedData {
  [cardValue: string]: number; // Card value → weight
}
```

---

## Requirements

### Requirement: Rating System

The system SHALL maintain an ELO-like rating for each player.

#### Scenario: New player

- **WHEN** player first starts
- **THEN** rating is initialized to 1000

#### Scenario: Rating update

- **WHEN** game ends
- **THEN** rating updated based on stars vs expected

#### Scenario: Rating bounds

- **WHEN** rating would exceed bounds
- **THEN** rating clamped to 600-1600 range

### Requirement: Adaptive Adjustment

The system SHALL adjust preview time and hints based on player rating.

#### Scenario: Low rating adjustment

- **WHEN** rating is below 940
- **THEN** preview time increased and extra hint provided

#### Scenario: High rating adjustment

- **WHEN** rating is above 1140
- **THEN** preview time reduced and hints decreased

### Requirement: Exposure Tracking

The system SHALL track how many times each card is exposed during a game.

#### Scenario: First exposure

- **WHEN** card is flipped for first time
- **THEN** exposure count = 1

#### Scenario: Subsequent exposure

- **WHEN** card is flipped again
- **THEN** exposure count increments

### Requirement: Weight Calculation

The system SHALL calculate weights based on excess exposures.

#### Scenario: Card is difficult

- **WHEN** card exposed more than once
- **THEN** weight increases

#### Scenario: Decay over time

- **WHEN** new game starts
- **THEN** old weights decay by 20%

---

## Adjustment Strategy

### Preview Time

| Rating Range | Preview Time |
| ------------ | ------------ |
| < 940        | ≥ 2 seconds  |
| 940 - 1040   | ≥ 1 second   |
| 1040 - 1140  | ≤ 1 second   |
| > 1140       | 0 seconds    |

### Hint Adjustment

| Rating Range | Hint Adjustment |
| ------------ | --------------- |
| < 940        | +1 hint         |
| 940 - 1140   | No change       |
| > 1140       | -1 hint         |

---

## Acceptance Criteria

| ID        | Criterion                          | Status | Verified   |
| --------- | ---------------------------------- | ------ | ---------- |
| AC-AD-001 | Rating initialized to 1000         | DONE   | 2026-04-17 |
| AC-AD-002 | Rating updates after each game     | DONE   | 2026-04-17 |
| AC-AD-003 | Preview adjusted by rating         | DONE   | 2026-04-17 |
| AC-AD-004 | Hints adjusted by rating           | DONE   | 2026-04-17 |
| AC-AD-005 | Toggle on/off in settings          | DONE   | 2026-04-17 |
| AC-SR-001 | Exposure count tracked per card    | DONE   | 2026-04-17 |
| AC-SR-002 | Weights decay each game            | DONE   | 2026-04-17 |
| AC-SR-003 | Weighted cards selected more often | DONE   | 2026-04-17 |
| AC-SR-004 | Per-theme weight tracking          | DONE   | 2026-04-17 |
| AC-SR-005 | Toggle on/off in settings          | DONE   | 2026-04-17 |

---

## Data Storage

### Adaptive Data

- Key: `memory_match_adaptive`
- Default: `{ rating: 1000, lastDiff: 'easy' }`

### Spaced Data

- Key: `memory_match_spaced_<theme>`
- Themes: `emoji`, `numbers`, `letters`, `shapes`, `colors`

---

## Weight Interpretation

| Weight | Meaning                     |
| ------ | --------------------------- |
| 0      | Never seen or fully decayed |
| 1-2    | Slightly difficult          |
| 3-5    | Moderately difficult        |
| 6+     | Very difficult              |

---

## Future Roadmap

| Priority | Feature           | Description                          |
| -------- | ----------------- | ------------------------------------ |
| P1       | SM-2 Algorithm    | SuperMemo-inspired intervals         |
| P2       | Mastery Scores    | Track individual card mastery level  |
| P3       | Review Sessions   | Dedicated review mode for weak cards |
| P4       | Cross-device Sync | Sync weights across devices          |
| P5       | Leitner System    | Box-based card scheduling            |

---

## References

- [Game Modes](../game-modes/spec.md)
- [Scoring](../scoring/spec.md)
- [Data Layer](../data-layer/spec.md)
