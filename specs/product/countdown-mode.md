# Countdown Mode

> Race against configurable time limits

## Overview

Countdown Mode adds time pressure to the Classic Matching gameplay. Players must complete the board before the countdown timer expires, adding an element of stress management and processing speed training.

## Acceptance Criteria

- [x] Countdown timer displays remaining time
- [x] Game ends in loss when timer reaches zero
- [x] Time limits configurable per difficulty level
- [x] Timer counts down from configured time
- [x] Failure modal shows on time expiration
- [x] Retry option available after timeout

## Configuration

### Default Time Limits

| Difficulty | Default Time |
| ---------- | ------------ |
| Easy       | 90s          |
| Medium     | 150s         |
| Hard       | 240s         |

### User Configuration

- Range: 10-999 seconds per difficulty
- Stored in settings: `settings.countdown.<difficulty>`
- Accessible via Settings → Game Mode → "Countdown"

## Activation

1. Settings → Game Mode → Select "Countdown"
2. Configure time limits (optional)
3. Start game — countdown begins immediately

## Game Flow

```
Game Start
    │
    ├── Timer starts countdown from configured time
    │
    ├── Player makes moves
    │       │
    │       └── Timer continues counting down
    │
    ├── Timer reaches 0?
    │       │
    │       ├── YES → Game Over (Loss)
    │       │           │
    │       │           └── Show Failure Modal
    │       │
    │       └── NO → Continue playing
    │
    └── All pairs matched?
            │
            ├── YES → Win!
            │
            └── NO → Continue
```

## UI Requirements

### Timer Display

- Shows remaining time in `MM:SS` format
- Visual warning when time < 30 seconds (color change)
- Countdown animation or pulse effect when time < 10 seconds

### Failure Modal

- "Time's Up!" message
- Pairs matched count
- "Try Again" button
- "Change Mode" option

## Implementation

```javascript
// src/timer.js
function startTimer(params) {
  if (isCountdown && countdownLeft <= 0 && !finished) {
    finished = true;
    clearInterval(id);
    params.onStop();
    params.onTimeUp();
  }
}
```

## State Changes

| State Variable   | Classic Mode | Countdown Mode          |
| ---------------- | ------------ | ----------------------- |
| `isCountdown`    | `false`      | `true`                  |
| `countdownLeft`  | `0`          | Configured time limit   |
| Timer behavior   | Count up     | Count down              |
| End condition    | All matched  | All matched OR time = 0 |

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| Start countdown game        | Timer counts down from configured time |
| Match all pairs in time     | Win! Normal win flow                   |
| Timer reaches zero          | Loss, failure modal shown              |
| Pause during countdown      | Timer pauses                           |
| Resume after pause          | Timer continues from paused value      |
| Change time configuration   | New limit applies to next game         |
| Countdown reaches 30s       | Visual warning (color change)          |
| Countdown reaches 10s       | Pulse effect on timer                  |

## Related Specifications

- [Classic Matching Mode](./classic-matching.md)
- [Scoring System](./scoring-system.md)
- [Adaptive System](./adaptive-system.md)
