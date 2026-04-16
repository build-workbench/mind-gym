# Mind Gym Documentation

[![Documentation Status](https://img.shields.io/badge/docs-up_to_date-brightgreen.svg)](./)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

> Comprehensive technical documentation for the Mind Gym memory training application.

[English](./README.md) | [简体中文](./README.zh-CN.md)

---

## 📚 Documentation Index

| Document                          | Description                                           | Audience                 |
| --------------------------------- | ----------------------------------------------------- | ------------------------ |
| [Architecture](./architecture.md) | System design, data flow, and module responsibilities | Developers, Contributors |
| [Training Modes](./modes.md)      | Detailed mode specifications and game mechanics       | Developers, Users        |
| [Storage Model](./storage.md)     | Data structures, persistence, and import/export       | Developers               |
| [PWA & Offline](./pwa.md)         | Service Worker strategy and offline capabilities      | Developers               |

---

## 🚀 Quick Navigation

### For Developers

**Getting Started**

- New to the codebase? → [Architecture Overview](./architecture.md#system-architecture)
- Want to understand data flow? → [Data Flow](./architecture.md#data-flow)
- Need storage details? → [Storage Keys](./storage.md#key-conventions)

**Contributing**

- Adding a new game mode? → [Mode Development](./modes.md#extending-game-modes)
- Modifying storage? → [Data Migration](./storage.md#data-migration)
- Updating UI? → [Module Reference](./architecture.md#module-responsibilities)

### For Users

**Understanding Features**

- How does scoring work? → [Star Rating](./modes.md#star-rating-system)
- What are the different modes? → [Mode Overview](./modes.md#mode-overview)
- How is my data stored? → [Local Storage](./storage.md#localstorage-schema)

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│    (index.html + Tailwind CSS + Vanilla JS)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Core Application                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Game Logic │  │ State Manager│  │   Mode Handlers  │   │
│  │   (app.js)  │  │              │  │  (modes.js)      │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Data Layer                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Storage   │  │    Stats     │  │   Achievements   │   │
│  │ (storage.js)│  │  (stats.js)  │  │(achievements.js) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Persistence Layer                           │
│              (localStorage + Service Worker)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Documentation Standards

### Language Conventions

- **English**: Primary language for technical documentation
- **Chinese**: Available in `.zh-CN.md` variants for accessibility
- **Code**: All code examples use JavaScript (ES2022)

### Notation Standards

| Notation      | Meaning            | Example                                       |
| ------------- | ------------------ | --------------------------------------------- |
| `<variable>`  | Placeholder        | `<difficulty>` → `easy` \| `medium` \| `hard` |
| `[optional]`  | Optional parameter | `[theme]`                                     |
| `Type[]`      | Array of type      | `string[]`                                    |
| `{key: Type}` | Object structure   | `{time: number, moves: number}`               |

### Version Compatibility

This documentation corresponds to **Mind Gym v1.6.x**. For older versions, refer to the [Changelog](../changelog/CHANGELOG.md).

---

## 🔗 External Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Changelog](../changelog/CHANGELOG.md)
- [Project README](../README.md)
- [GitHub Repository](https://github.com/LessUp/mind-gym)
- [Live Demo](https://lessup.github.io/mind-gym/)

---

## 💡 Need Help?

If you can't find what you're looking for:

1. Check the [FAQ](../README.md#faq) in the main README
2. Browse [open issues](https://github.com/LessUp/mind-gym/issues) on GitHub
3. Review [closed issues](https://github.com/LessUp/mind-gym/issues?q=is%3Aissue+is%3Aclosed) for similar questions

---

_Last updated: 2026-04-16_
