# Documentation

Welcome to the Mind Gym documentation. This directory contains user guides, tutorials, and technical references.

[English](./README.md) | [简体中文](./README.zh-CN.md)

---

## Quick Links

| Document                          | Description                          | Audience           |
| --------------------------------- | ------------------------------------ | ------------------ |
| [Architecture](./architecture.md) | System design and data flow          | Developers         |
| [Training Modes](./modes.md)      | Game modes and mechanics             | Users, Developers  |
| [Storage Model](./storage.md)     | Data structures and persistence      | Developers         |
| [PWA & Offline](./pwa.md)         | Service Worker and offline support   | Developers         |

---

## For Developers

### Getting Started

- New to the codebase? → [Architecture Overview](./architecture.md#system-architecture)
- Want to understand data flow? → [Data Flow](./architecture.md#data-flow)
- Need storage details? → [Storage Model](./storage.md)

### Contributing

- Adding a new game mode? → [Extending Game Modes](./modes.md#extending-game-modes)
- Modifying storage? → [Data Migration](./storage.md#data-migration)
- PWA changes? → [PWA Strategy](./pwa.md)

### Specifications

For detailed product specifications and technical RFCs, see the [/specs](../specs/) directory:

- [Product Specifications](../specs/product/) — Feature definitions and acceptance criteria
- [Technical RFCs](../specs/rfc/) — Architecture decisions and design documents
- [Database Schema](../specs/db/) — Data model definitions

---

## For Users

### Game Modes

| Mode                 | Description                                       |
| -------------------- | ------------------------------------------------- |
| **Classic Matching** | Flip cards to find matching pairs                 |
| **Countdown**        | Race against configurable time limits             |
| **Daily Challenge**  | Same card layout for all players worldwide        |
| **N-back Training**  | Working memory exercise                           |
| **Delayed Recall**   | Post-game recognition test                        |

See [Training Modes](./modes.md) for detailed descriptions.

### Installation

See the main [README](../README.md) for installation instructions.

---

## Directory Structure

```
docs/
├── README.md           # This file
├── README.zh-CN.md     # Chinese version
├── architecture.md     # Architecture documentation
├── architecture.zh-CN.md
├── modes.md            # Training modes documentation
├── modes.zh-CN.md
├── storage.md          # Storage documentation
├── storage.zh-CN.md
├── pwa.md              # PWA documentation
└── pwa.zh-CN.md
```

---

## External Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Changelog](../changelog/CHANGELOG.md)
- [GitHub Repository](https://github.com/LessUp/mind-gym)
- [Live Demo](https://lessup.github.io/mind-gym/)

---

_Last updated: 2026-04-17_
