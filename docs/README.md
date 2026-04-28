# Mind Gym Documentation

> 🧠 Browser-based memory training PWA with N-back, adaptive difficulty, and daily challenges.

[English](#english) | [简体中文](#简体中文)

---

## English

### What is Mind Gym?

Mind Gym is a Progressive Web App (PWA) designed to train your memory through multiple game modes. It works completely offline and requires no installation.

### Game Modes

| Mode                 | Description                                |
| -------------------- | ------------------------------------------ |
| **Classic Matching** | Flip cards to find matching pairs          |
| **Countdown**        | Race against configurable time limits      |
| **Daily Challenge**  | Same card layout for all players worldwide |
| **N-back Training**  | Working memory exercise                    |
| **Delayed Recall**   | Post-game recognition test                 |

### Quick Start

1. Visit [Mind Gym](https://lessup.github.io/mind-gym/)
2. Choose a difficulty level
3. Start training!

### Features

- 🎮 5 training modes
- 📊 Progress tracking & statistics
- 🏆 Achievement system
- 🧠 FSRS-based mastery tracking
- 🌐 Bilingual support (EN/ZH)
- 📱 Works offline (PWA)
- 🎨 Adaptive difficulty

---

## 简体中文

### 什么是 Mind Gym？

Mind Gym 是一个渐进式 Web 应用 (PWA)，通过多种游戏模式训练您的记忆力。完全离线可用，无需安装。

### 游戏模式

| 模式            | 描述                   |
| --------------- | ---------------------- |
| **经典配对**    | 翻开卡片找到匹配的对子 |
| **倒计时**      | 在限定时间内完成挑战   |
| **每日挑战**    | 全球玩家使用相同牌组   |
| **N-back 训练** | 工作记忆练习           |
| **延迟回忆**    | 游戏后识别测试         |

### 快速开始

1. 访问 [Mind Gym](https://lessup.github.io/mind-gym/)
2. 选择难度等级
3. 开始训练！

### 特性

- 🎮 5 种训练模式
- 📊 进度追踪和统计
- 🏆 成就系统
- 🧠 基于 FSRS 的掌握度追踪
- 🌐 中英双语支持
- 📱 离线可用 (PWA)
- 🎨 自适应难度

---

## For Developers

### Technical Specifications

All technical specifications are maintained in the [`openspec/specs/`](../openspec/specs/) directory:

| Spec                                                           | Description                        |
| -------------------------------------------------------------- | ---------------------------------- |
| [Game Modes](../openspec/specs/game-modes/spec.md)             | Game mode definitions and logic    |
| [Data Layer](../openspec/specs/data-layer/spec.md)             | Storage and data persistence       |
| [Scoring](../openspec/specs/scoring/spec.md)                   | Score calculation and leaderboards |
| [PWA](../openspec/specs/pwa/spec.md)                           | Service Worker and offline support |
| [i18n](../openspec/specs/i18n/spec.md)                         | Internationalization               |
| [Adaptive Systems](../openspec/specs/adaptive-systems/spec.md) | Adaptive difficulty algorithm      |

### Architecture Decisions

See [`openspec/rfc/`](../openspec/rfc/) for Architecture Decision Records (ADRs).

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

---

## Resources

- [Changelog](../changelog/CHANGELOG.md)
- [GitHub Repository](https://github.com/LessUp/mind-gym)
- [Live Demo](https://lessup.github.io/mind-gym/)

---

_Last updated: 2026-04-27_
