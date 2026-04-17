# Database Specifications

This directory contains all data model and storage specifications for Mind Gym.

---

## Documents

| Document                             | Description                          |
| ------------------------------------ | ------------------------------------ |
| [schema.md](./schema.md)             | Data structures and TypeScript types |
| [storage-spec.md](./storage-spec.md) | CRUD operations and normalization    |

---

## Overview

Mind Gym uses **localStorage** for all data persistence. This provides:

- Offline-first functionality
- Privacy (data stays on device)
- No backend required
- Simple import/export as JSON

---

## Data Categories

### User Preferences

| Key        | Description                |
| ---------- | -------------------------- |
| `settings` | User configuration options |

### Game Records

| Key           | Description                  |
| ------------- | ---------------------------- |
| `best`        | Personal best per difficulty |
| `leaderboard` | Top 3 scores per difficulty  |

### Progress Tracking

| Key            | Description           |
| -------------- | --------------------- |
| `stats`        | Aggregate statistics  |
| `achievements` | Unlocked achievements |

### Adaptive Systems

| Key        | Description                       |
| ---------- | --------------------------------- |
| `adaptive` | ELO-like rating for difficulty    |
| `spaced`   | Card weight for spaced repetition |
| `daily`    | Daily challenge completion        |

---

## Data Flow

```
User Action
    │
    ├── In-Memory State (app.js variables)
    │       │
    │       └── On game end / settings change
    │
    └── localStorage (src/storage.js)
            │
            ├── load: Read JSON → Parse → Return
            │
            └── save: Stringify → Write JSON
```

---

## Versioning

Current export version: **1**

Future schema changes must:

1. Increment version number
2. Add migration logic
3. Update changelog

---

## Related Specifications

- [Core Architecture](../rfc/0001-core-architecture.md)
- [Product Features](../product/README.md)
