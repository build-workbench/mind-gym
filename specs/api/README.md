# API Specifications

This directory contains API interface definitions for Mind Gym.

---

## Overview

Mind Gym is a client-side only application that does not expose external APIs. All functionality is provided through:

- **JavaScript modules** — Internal function calls via global objects
- **localStorage API** — Data persistence
- **Service Worker API** — Offline caching

---

## Internal Module APIs

### Storage API

```javascript
window.RememberStorage = {
  // Settings
  loadSettings: () => Settings,
  saveSettings: (settings: Settings) => void,

  // Best scores
  loadBest: (difficulty: string) => BestScore | null,
  saveBest: (difficulty: string, score: BestScore) => void,

  // Leaderboard
  loadLeaderboard: (difficulty: string) => Leaderboard,
  saveLeaderboard: (difficulty: string, lb: Leaderboard) => void,

  // Statistics
  loadStats: () => Stats,
  saveStats: (stats: Stats) => void,

  // Achievements
  loadAchievements: () => Achievements,
  saveAchievements: (achievements: Achievements) => void,
  unlockAchievement: (id: string) => boolean,

  // Adaptive
  loadAdaptive: () => AdaptiveData,
  saveAdaptive: (data: AdaptiveData) => void,

  // Spaced
  loadSpaced: (theme: string) => SpacedData,
  saveSpaced: (theme: string, data: SpacedData) => void,
};
```

### I18n API

```javascript
window.RememberI18n = {
  getLang: () => string,
  setLang: (lang: string) => void,
  t: (key: string) => string,
  tf: (key: string, vars: object) => string,
  autoDetect: () => void,
  applyToDOM: () => void,
};
```

### Timer API

```javascript
window.RememberTimer = {
  start: (params: TimerParams) => void,
  stop: () => void,
  pause: () => void,
  resume: () => void,
  getElapsed: () => number,
  getCountdown: () => number,
};
```

---

## Data Export Format

The export format serves as the "API" for data portability:

```typescript
interface ExportPayload {
  version: 1;
  settings: Settings;
  bests: {
    easy?: BestScore;
    medium?: BestScore;
    hard?: BestScore;
  };
  leaderboards: {
    easy?: Leaderboard;
    medium?: Leaderboard;
    hard?: Leaderboard;
  };
  achievements: Achievements;
  stats: Stats;
  adaptive: AdaptiveData;
  spaced: {
    emoji?: SpacedData;
    numbers?: SpacedData;
    letters?: SpacedData;
    shapes?: SpacedData;
    colors?: SpacedData;
  };
}
```

---

## Future API Considerations

If server-side features are added in the future:

| Feature         | Method | Endpoint           | Description            |
| --------------- | ------ | ------------------ | ---------------------- |
| Sync progress   | POST   | `/api/sync`        | Cross-device sync      |
| Daily challenge | GET    | `/api/daily/:date` | Server-validated daily |
| Leaderboard     | GET    | `/api/leaderboard` | Global rankings        |

These are **not implemented** and would require new RFC documents.

---

## References

- [Data Schema](../db/schema.md)
- [Storage Operations](../db/storage-spec.md)
- [Core Architecture](../rfc/0001-core-architecture.md)
