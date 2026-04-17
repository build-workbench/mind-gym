# N-back Training Mode

> Working memory exercise — match stimulus N-steps back

## Overview

N-back Training is a continuous performance task designed to improve working memory. Players view a sequence of stimuli and must indicate when the current stimulus matches the one from N steps ago.

## Acceptance Criteria

- [x] Stimuli presented sequentially at configurable pace
- [x] Player presses J key to indicate "matches N-back"
- [x] N parameter configurable (1, 2, or 3)
- [x] Pace configurable (1200, 900, or 700 ms)
- [x] Sequence length configurable (20, 30, or 40 stimuli)
- [x] Accuracy tracked (hits / total targets)
- [x] Reaction time tracked for correct responses
- [x] Statistics updated after session

## Configuration

### Parameters

| Parameter | Options           | Description                    |
| --------- | ----------------- | ------------------------------ |
| N         | 1, 2, 3           | Steps to look back             |
| Pace      | 1200, 900, 700 ms | Stimulus presentation interval |
| Length    | 20, 30, 40        | Number of stimuli in sequence  |

### Difficulty Presets

| Preset   | N   | Pace  | Length |
| -------- | --- | ----- | ------ |
| Easy     | 1   | 1200  | 20     |
| Medium   | 2   | 900   | 30     |
| Hard     | 3   | 700   | 40     |

## Gameplay

### Controls

| Input        | Action                    |
| ------------ | ------------------------- |
| `J` key      | "Current matches N-back"  |
| No keypress  | "Does not match"          |

### Stimulus Sequence

```
Index:  0   1   2   3   4   5   6   7   ...
Card:   🍎  🍌  🍇  🍎  🍊  🍇  🍌  🍇  ...
N=2:        ❌  ❌  ❌  ✅  ❌  ✅  ❌  ✅  ...
                      ↑       ↑       ↑
                  Match   Match   Match
```

### Target Definition

A "target" is a stimulus that matches the stimulus from N steps ago:

```javascript
const isTarget = (index, sequence, N) => {
  return index >= N && sequence[index] === sequence[index - N];
};
```

## Scoring Metrics

### Accuracy

| Metric        | Formula                           |
| ------------- | --------------------------------- |
| Accuracy      | `hits / total_targets`            |
| Hit Rate      | `hits / (hits + misses)`          |
| False Alarm Rate | `false_alarms / (non_targets)` |

### Reaction Time (RT)

- Measured from stimulus display to keypress
- Only recorded for correct responses (hits)
- Average RT = `rtSum / rtCount`

## Implementation

### State Variables

```javascript
// Tracked in app.js
let nbackRunning = false;     // Session active flag
let nbackTimer = null;        // Interval timer
let nbackSeq = [];            // Stimulus sequence
let nbackIdx = 0;             // Current index
let nbackTargets = 0;         // Targets count
let nbackHits = 0;            // Correct responses
let nbackMisses = 0;          // Missed targets
let nbackFalseAlarms = 0;     // Incorrect J presses
let nbackRtSum = 0;           // RT sum (ms)
let nbackRtCount = 0;         // RT sample count
let nbackResponded = false;   // Response flag for current stimulus
let nbackStepStart = 0;       // Stimulus display timestamp
```

### Main Loop

```javascript
// app.js
function tickNBack(N, speed) {
  nbackTimer = setInterval(() => {
    // Check for miss on previous stimulus
    if (nbackIdx >= N) {
      const targetPrev = nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N];
      if (targetPrev && !nbackResponded) nbackMisses++;
    }

    // Advance to next stimulus
    nbackIdx++;
    if (nbackIdx >= nbackSeq.length) {
      finishNBack();
      return;
    }

    // Display stimulus
    nbackStimEl.textContent = nbackSeq[nbackIdx];
    nbackResponded = false;
    nbackStepStart = performance.now();

    // Count target
    if (nbackIdx >= N && nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N]) {
      nbackTargets++;
    }
  }, speed);
}
```

### Key Response Handler

```javascript
function onNBackKeyPress() {
  if (!nbackRunning) return;

  const idx = nbackIdx;
  const N = currentN;

  // Check if current stimulus is a target
  const isTarget = idx >= N && nbackSeq[idx] === nbackSeq[idx - N];

  if (!nbackResponded) {
    nbackResponded = true;

    if (isTarget) {
      // Hit!
      nbackHits++;
      const rt = performance.now() - nbackStepStart;
      nbackRtSum += rt;
      nbackRtCount++;
    } else {
      // False alarm
      nbackFalseAlarms++;
    }
  }
}
```

## UI Requirements

### Stimulus Display

- Large centered emoji display
- Clean background to minimize distraction
- Optional: progress indicator (current/total)

### Session Info

- Current N value
- Remaining stimuli count
- Optional: real-time hit rate

### Results Modal

- Accuracy percentage
- Average reaction time
- Hits / Misses / False Alarms breakdown
- "Play Again" option

## Data Storage

### Statistics Updated

```typescript
interface Stats {
  // ... other stats
  nbackAttempts: number;    // Total sessions
  nbackAccSum: number;      // Accuracy sum (for average)
  nbackRtSum: number;       // RT sum (ms)
  nbackRtCount: number;     // RT sample count
}
```

### Derived Metrics

| Metric               | Calculation                    |
| -------------------- | ------------------------------ |
| Avg N-back Accuracy  | `nbackAccSum / nbackAttempts`  |
| Avg N-back RT        | `nbackRtSum / nbackRtCount`    |

## Test Cases

| Scenario                    | Expected Behavior                      |
| --------------------------- | -------------------------------------- |
| Start N-back session        | Sequence generated, timer starts       |
| Correct J press on target   | Hit recorded, RT captured              |
| J press on non-target       | False alarm recorded                   |
| No press on target          | Miss recorded                          |
| Complete session            | Stats updated, results shown           |
| Early exit                  | Session ends, partial stats recorded   |
| Adjust N parameter          | Difficulty changes for next session    |
| Adjust pace                 | Presentation speed changes             |

## Cognitive Science Background

N-back training targets working memory, which is responsible for:
- Temporary storage and manipulation of information
- Cognitive control and attention
- Fluid intelligence (correlated but debated)

### Training Recommendations

| N Level | Target User             | Recommended Sessions/Week |
| ------- | ----------------------- | ------------------------- |
| 1-back  | Beginners               | 3-4                       |
| 2-back  | Intermediate            | 3-4                       |
| 3-back  | Advanced                | 2-3                       |

## Related Specifications

- [Training Modes Overview](./README.md)
- [Data Model](../db/schema.md)
- [Statistics System](../db/storage-spec.md)
