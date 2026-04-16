# Training Modes

Complete specifications for all Mind Gym training modes and game mechanics.

---

## Mode Overview

| Mode | Trigger | Primary Goal | Key Metrics |
|------|---------|--------------|-------------|
| **Classic Matching** | Default | Find matching pairs | Time, Moves |
| **Countdown** | Settings toggle | Match within time limit | Completion before timeout |
| **Daily Challenge** | "Daily" button | Fixed seed competition | Compare globally |
| **Delayed Recall** | Post-win auto-trigger | Recognition memory | Precision, Recall |
| **N-back** | "N-back" button | Working memory | Accuracy, RT |

---

## Classic Matching

### Gameplay

Flip two cards per turn. Matching pairs remain locked; non-matching cards flip back. Goal: complete all pairs in minimum time and moves.

### Difficulty Levels

| Level | Grid | Pairs | Default Hints | Target Time |
|-------|------|-------|---------------|-------------|
| Easy | 4×4 | 8 | 3 | 60s |
| Medium | 4×5 | 10 | 2 | 120s |
| Hard | 6×6 | 18 | 1 | 180s |

### Scoring Results

| Metric | Description |
|--------|-------------|
| **Time** | From first flip to completion |
| **Moves** | Each second-card flip counts as one move |
| **Star Rating** | 1-5 stars based on time, moves, hints, combos |
| **Leaderboard** | Top 3 times per difficulty |
| **Best Score** | Personal record per difficulty |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | New game |
| `P` | Pause/Resume |
| `H` | Use hint |
| `↑↓←→` | Navigate cards |
| `Enter` / `Space` | Flip selected card |

### State Machine

```javascript
function onFlip(cardEl) {
  if (paused || isPreviewing || lockBoard) return;
  if (cardEl.classList.contains('flipped')) return;

  // Start timer on first flip
  if (!started) {
    started = true;
    startTimer();
  }

  // Flip animation
  cardEl.classList.add('flipped');

  if (!firstCard) {
    firstCard = cardEl;
    return;
  }

  // Second card logic
  secondCard = cardEl;
  moves++;
  
  // Check for match...
}
```

---

## Countdown Mode

### Activation

Settings → Game Mode → "Countdown"

### Configuration

Customize countdown seconds per difficulty (10-999s):

| Difficulty | Default Time |
|------------|--------------|
| Easy | 90s |
| Medium | 150s |
| Hard | 240s |

### Mechanics

- Countdown displays in time area
- Automatic loss when time expires
- Failure modal with retry option

### Implementation

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

---

## Daily Challenge

### Gameplay

Same card layout for all players worldwide, generated from a deterministic seed based on date + difficulty + theme.

### Seed Algorithm

```javascript
// src/utils.js
function seedFromDate(dateStr, diff, theme) {
  let h = 2166136261; // FNV offset basis
  const s = `${dateStr}|${diff}|${theme}`;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0; // FNV prime
  }
  return h >>> 0;
}
```

### Completion Status

- key: `memory_match_daily_<date>_<difficulty>`
- Stores: `{ done: true, at: timestamp }`
- Shows: "Completed" / "Not Completed" badge
- No scores recorded, only completion

### Flow

1. Click "Daily" button
2. Select difficulty
3. Click "Start Challenge"
4. Mark as completed on win

---

## Delayed Recall Test

### Trigger

Automatically appears after winning a game (can be skipped).

### Test Content

| Component | Description |
|-----------|-------------|
| **Targets** | Cards that appeared in the game ("true items") |
| **Distractors** | Cards that did NOT appear ("false items") |
| **Task** | Select all cards that appeared in the current game |

### Item Generation

```javascript
// src/modes.js
function buildRecallItems(params) {
  const truth = params.truthValues;    // Cards from current game
  const pool = params.poolValues;       // All possible cards

  const trueCount = Math.min(6, truth.length);
  const falseCandidates = pool.filter((v) => !truth.includes(v));

  const trues = shuffle(truth).slice(0, trueCount);
  const falses = shuffle(falseCandidates).slice(0, 9 - trueCount);

  const items = [
    ...trues.map((v) => ({ v, correct: true })),
    ...falses.map((v) => ({ v, correct: false }))
  ];
  return { items: shuffle(items), correctSet: new Set(trues) };
}
```

### Scoring Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Precision** | TP / (TP + FP) | Of selected cards, how many were correct |
| **Recall** | TP / (TP + FN) | Of correct cards, how many were selected |

Where:
- TP = True Positives (correct cards selected)
- FP = False Positives (incorrect cards selected)
- FN = False Negatives (correct cards missed)

### Data Recording

Stats updated: `recallAttempts`, `precisionSum`, `recallSum`

---

## N-back Training

### Gameplay

Stimuli (emoji) presented sequentially. Player determines if current stimulus matches the one from N steps ago.

### Configuration

| Parameter | Options | Description |
|-----------|---------|-------------|
| N | 1, 2, 3 | Steps to look back |
| Pace | 1200, 900, 700 ms | Stimulus presentation interval |
| Length | 20, 30, 40 | Number of stimuli in sequence |

### Controls

- Press `J` key: "Matches N-back"
- No keypress: "Does not match"

### Scoring

| Metric | Description |
|--------|-------------|
| **Accuracy** | Correct responses / Total targets |
| **Reaction Time** | Time from stimulus to keypress (hits only) |

### Stats Tracking

```javascript
// Tracked in app.js
let nbackTargets = 0;       // Targets (stimuli matching N-back)
let nbackHits = 0;          // Hits (correct J presses)
let nbackMisses = 0;        // Misses (target not pressed)
let nbackFalseAlarms = 0;   // False Alarms (non-target pressed)
let nbackRtSum = 0;         // RT sum (ms)
let nbackRtCount = 0;       // RT sample count
```

### Implementation

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

---

## Adaptive Assist

### Purpose

Dynamically adjusts preview time and hint count based on player performance rating.

### Rating Range

| Statistic | Value |
|-----------|-------|
| Initial Rating | 1000 |
| Minimum | 600 |
| Maximum | 1600 |

### Adjustment Strategy

| Rating Range | Preview Time | Hint Adjustment |
|--------------|--------------|-----------------|
| < 940 | ≥ 2s | +1 hint |
| 940 - 1040 | ≥ 1s | No change |
| 1040 - 1140 | ≤ 1s | No change |
| > 1140 | 0s | -1 hint |

### Rating Update

```javascript
// app.js
function updateAdaptiveOnEnd(win, stars, diff) {
  if (!settings.adaptive) return;

  const a = loadAdaptive();
  const exp = expectedStarsFor(diff); // easy:4, medium:3.5, hard:3
  const perf = win ? stars : 1.5;     // Loss = poor performance
  const k = 12;                       // ELO-like K-factor

  a.rating = Math.max(600, Math.min(1600, 
    Math.round(a.rating + k * (perf - exp))
  ));
  a.lastDiff = diff;

  saveAdaptive(a);
}
```

---

## Spaced Reinforcement

### Purpose

Weights "difficult cards" (those requiring multiple exposures) to appear more frequently in future games.

### Weight Mechanism

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
  const rest = pool.filter((x) => !picksTop.some((y) => y.v === x.v));

  shuffle(rest);
  return [...picksTop, ...rest.slice(0, pairs - picksTop.length)];
}
```

### Future Roadmap

- Upgrade to SM-2 / Leitner algorithm
- Add review intervals and mastery scores
- Cross-device synchronization

---

## Combo System

### Trigger

Consecutive matches within 5 seconds.

### Effects

- Combo counter increments
- Combo toast displayed (≥2)
- Maximum combo recorded for session
- Impacts star rating calculation

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

---

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

| Factor | Impact |
|--------|--------|
| Time | Proportional penalty for exceeding par |
| Moves | 3 point penalty per move above minimum |
| Hints | 10 point penalty per hint used |
| Combos | +2 points per combo achieved |

---

## Extending Game Modes

### Adding a New Mode

1. **Logic**: Add pure functions to `src/modes.js`
2. **State**: Add state variables to `app.js`
3. **UI**: Add modal to `index.html`, bindings to `src/ui.js`
4. **i18n**: Add translations to `src/i18n.js`
5. **Docs**: Update this file with specifications
6. **Tests**: Create `__tests__/newmode.test.js`

### Mode Checklist

- [ ] Core logic in `modes.js`
- [ ] State management in `app.js`
- [ ] UI integration in `index.html` & `ui.js`
- [ ] Localization in `i18n.js` (zh + en)
- [ ] Stats integration in `stats.js`
- [ ] Achievement hooks in `achievements.js`
- [ ] Documentation updated
- [ ] Unit tests written

---

*For system architecture, see [Architecture Overview](./architecture.md). For data structures, see [Storage Model](./storage.md).*
