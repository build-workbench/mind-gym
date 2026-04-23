# Game Modes

> Core gameplay capabilities for memory training

## Purpose

Mind Gym provides multiple game modes for cognitive training:

| Mode            | Description               | File Reference       |
| --------------- | ------------------------- | -------------------- |
| Classic         | Flip cards to match pairs | app.js               |
| Countdown       | Time-limited classic mode | app.js               |
| Daily Challenge | Seeded daily deck         | app.js               |
| N-back          | Working memory training   | app.js, src/modes.js |
| Delayed Recall  | Post-game memory test     | app.js, src/modes.js |

---

## Interfaces

### Difficulty

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
```

### GameState

```typescript
interface GameState {
  mode: 'classic' | 'countdown' | 'nback' | 'recall';
  difficulty: Difficulty;
  status: 'idle' | 'preview' | 'playing' | 'paused' | 'locked' | 'won' | 'lost';
  timer: number; // Elapsed or remaining seconds
  moves: number; // Move count
  hints: number; // Remaining hints
  combo: number; // Current combo
  maxCombo: number; // Max combo this game
}
```

### Difficulty Configuration

| Level  | Grid | Pairs | Default Hints | Target Time |
| ------ | ---- | ----- | ------------- | ----------- |
| Easy   | 4×4  | 8     | 3             | 60s         |
| Medium | 4×5  | 10    | 2             | 120s        |
| Hard   | 6×6  | 18    | 1             | 180s        |

---

## Requirements

### REQ-GM-001: Classic Mode

The system SHALL allow players to flip cards to find matching pairs.

#### Scenario: Match found

- **WHEN** player flips two matching cards
- **THEN** both cards remain face-up
- **AND** combo counter increments

#### Scenario: No match

- **WHEN** player flips two non-matching cards
- **THEN** both cards flip back after 800ms delay
- **AND** combo counter resets

#### Scenario: Game complete

- **WHEN** all pairs are matched
- **THEN** win modal displays
- **AND** statistics are updated

### REQ-GM-002: Countdown Mode

The system SHALL provide time-limited gameplay with configurable limits.

#### Scenario: Start countdown

- **WHEN** countdown mode is selected
- **THEN** timer counts down from configured time

#### Scenario: Time expires

- **WHEN** timer reaches zero
- **THEN** game ends in loss
- **AND** failure modal displays

#### Scenario: Complete in time

- **WHEN** all pairs matched before timer expires
- **THEN** win modal displays with remaining time

### REQ-GM-003: Daily Challenge

The system SHALL generate deterministic card layouts based on date.

#### Scenario: Generate daily seed

- **WHEN** player starts daily challenge
- **THEN** seed is generated from date + difficulty + theme

#### Scenario: Same day, same layout

- **WHEN** same date, difficulty, and theme
- **THEN** identical card layout across all players

#### Scenario: Completion tracking

- **WHEN** daily challenge is completed
- **THEN** status stored with timestamp
- **AND** "Completed" badge shown

### REQ-GM-004: N-back Training

The system SHALL provide working memory training with configurable N parameter.

#### Scenario: Stimulus presentation

- **WHEN** N-back session starts
- **THEN** stimuli presented sequentially at configured pace

#### Scenario: Correct response

- **WHEN** player presses J on matching stimulus
- **THEN** hit recorded
- **AND** reaction time captured

#### Scenario: Missed target

- **WHEN** player does not respond to matching stimulus
- **THEN** miss recorded

#### Scenario: False alarm

- **WHEN** player presses J on non-matching stimulus
- **THEN** false alarm recorded

### REQ-GM-005: Delayed Recall

The system SHALL provide post-game memory assessment.

#### Scenario: Test offered

- **WHEN** game is won
- **THEN** recall test modal appears

#### Scenario: Test construction

- **WHEN** player starts recall test
- **THEN** 9 cards displayed (mix of seen and new)

#### Scenario: Scoring

- **WHEN** player submits selections
- **THEN** precision and recall calculated
- **AND** statistics updated

---

## Acceptance Criteria

| ID        | Criterion                                    | Status | Verified   |
| --------- | -------------------------------------------- | ------ | ---------- |
| AC-GM-001 | Player can flip any unflipped card           | DONE   | 2026-04-17 |
| AC-GM-002 | Matching pairs remain locked face-up         | DONE   | 2026-04-17 |
| AC-GM-003 | Non-matching cards flip back after delay     | DONE   | 2026-04-17 |
| AC-GM-004 | Timer starts on first flip                   | DONE   | 2026-04-17 |
| AC-GM-005 | Move count increments on second card flip    | DONE   | 2026-04-17 |
| AC-GM-006 | Star rating calculated on completion         | DONE   | 2026-04-17 |
| AC-GM-007 | Best score saved per difficulty              | DONE   | 2026-04-17 |
| AC-GM-008 | Leaderboard maintains top 3 per difficulty   | DONE   | 2026-04-17 |
| AC-GM-009 | Countdown timer displays remaining time      | DONE   | 2026-04-17 |
| AC-GM-010 | Game ends on timeout                         | DONE   | 2026-04-17 |
| AC-GM-011 | Daily seed is deterministic                  | DONE   | 2026-04-17 |
| AC-GM-012 | Daily completion tracked per date/difficulty | DONE   | 2026-04-17 |
| AC-GM-013 | N-back pace configurable                     | DONE   | 2026-04-17 |
| AC-GM-014 | N-back accuracy tracked                      | DONE   | 2026-04-17 |
| AC-GM-015 | Recall test precision/recall calculated      | DONE   | 2026-04-17 |

---

## Keyboard Shortcuts

| Key               | Action                           |
| ----------------- | -------------------------------- |
| `N`               | New game                         |
| `P`               | Pause/Resume                     |
| `H`               | Use hint                         |
| `↑↓←→`            | Navigate cards                   |
| `Enter` / `Space` | Flip selected card               |
| `J`               | N-back: "Current matches N-back" |
| `Escape`          | Close modal                      |

---

## State Machine

```
IDLE → PREVIEW → PLAYING → PAUSED → WON/LOST
                    ↓
                  LOCKED (during flip animation)
```

### State Transitions

| Current State | Event                    | Next State |
| ------------- | ------------------------ | ---------- |
| IDLE          | First flip               | PLAYING    |
| IDLE          | Preview enabled          | PREVIEW    |
| PREVIEW       | Preview ends             | IDLE       |
| PLAYING       | Pause key pressed        | PAUSED     |
| PAUSED        | Resume key pressed       | PLAYING    |
| PLAYING       | All pairs matched        | WON        |
| PLAYING       | Time expires (countdown) | LOST       |
| PLAYING       | Second card flip         | LOCKED     |
| LOCKED        | Cards flip back          | PLAYING    |

---

## References

- [Scoring](../scoring/spec.md)
- [Adaptive Systems](../adaptive-systems/spec.md)
- [Data Layer](../data-layer/spec.md)
