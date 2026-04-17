# Product Overview

> Mind Gym - Browser-based memory training for cognitive enhancement

## Product Vision

Mind Gym is a zero-dependency Progressive Web App designed to improve cognitive abilities through scientifically-backed memory training exercises. The application provides multiple training modes targeting different aspects of memory: visual memory, working memory, and long-term memory consolidation.

## Target Users

| User Type          | Description                                    |
| ------------------ | ---------------------------------------------- |
| Casual Users       | Looking for quick brain exercises              |
| Students           | Seeking to improve study-related memory skills |
| Professionals      | Maintaining cognitive sharpness                |
| Memory Enthusiasts | Tracking progress across multiple metrics      |

## Core Features

### Training Modes

| Mode             | Cognitive Target                  | Document                                     |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Classic Matching | Visual memory, attention          | [classic-matching.md](./classic-matching.md) |
| Countdown Mode   | Processing speed, stress handling | [countdown-mode.md](./countdown-mode.md)     |
| Daily Challenge  | Consistency, competition          | [daily-challenge.md](./daily-challenge.md)   |
| N-back Training  | Working memory, focus             | [nback-training.md](./nback-training.md)     |
| Delayed Recall   | Long-term memory consolidation    | [delayed-recall.md](./delayed-recall.md)     |

### Adaptive Systems

| System               | Description                                                  | Document                                             |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Adaptive Difficulty  | Adjusts preview time and hints based on ELO-like rating      | [adaptive-system.md](./adaptive-system.md)           |
| Spaced Reinforcement | Prioritizes challenging cards using decay-weighted selection | [spaced-reinforcement.md](./spaced-reinforcement.md) |
| Combo System         | 5-second window for consecutive match bonuses                | [scoring-system.md](./scoring-system.md)             |
| Star Ratings         | Performance scoring based on time, moves, hints, combos      | [scoring-system.md](./scoring-system.md)             |

### User Experience

| Feature              | Description                           |
| -------------------- | ------------------------------------- |
| Full i18n            | Chinese & English with auto-detection |
| PWA Support          | Installable, works offline            |
| Keyboard Shortcuts   | Complete keyboard navigation          |
| Statistics Dashboard | Track progress across all metrics     |
| Achievement System   | Unlock milestones                     |
| Data Backup          | Export/import all progress as JSON    |

---

## Technical Constraints

| Constraint        | Description                                   |
| ----------------- | --------------------------------------------- |
| Zero Runtime Deps | No frontend framework dependencies            |
| Browser-only      | No backend required, all data in localStorage |
| Offline-first     | PWA with Service Worker caching               |
| ES2022 JavaScript | Modern JavaScript features allowed            |
| Tailwind CSS      | Utility-first CSS via CLI compilation         |

---

## Quality Attributes

| Attribute     | Requirement                                         |
| ------------- | --------------------------------------------------- |
| Performance   | First Contentful Paint < 1.5s                       |
| Accessibility | WCAG 2.1 AA compliance                              |
| Offline       | Full functionality without network after first load |
| i18n          | Complete Chinese and English support                |
| PWA           | Installable on desktop and mobile                   |

---

## Release Versions

See [Changelog](../../changelog/CHANGELOG.md) for complete version history.

| Version | Release Date | Key Features               |
| ------- | ------------ | -------------------------- |
| v1.6.x  | 2026-04-16   | Workflow & PWA Enhancement |
| v1.5.x  | 2026-04-16   | Changelog System           |
| v1.4.x  | 2026-04-16   | Documentation Refactor     |
| v1.0.0  | 2025-12-19   | Core Modularization        |

---

## References

- [Architecture RFC](../rfc/0001-core-architecture.md)
- [Data Model Specification](../db/schema.md)
- [Storage Specification](../db/storage-spec.md)
