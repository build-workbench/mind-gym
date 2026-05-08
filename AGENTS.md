# AGENTS.md

AI 编码助手指南 (Claude Code, Cursor, GitHub Copilot 等)

---

## 项目状态

> **版本**: 1.11.0 | **状态**: 维护模式

本项目处于维护模式，无新增功能计划。仅接受 Bug 修复和文档改进。

---

## 核心规则

### 开发流程

1. **先读规范** — 修改代码前，先阅读 `openspec/specs/` 中的相关规范
2. **规范优先** — 新功能或接口变更必须通过 OpenSpec 流程 (`/opsx:propose`)
3. **严格遵守** — 代码 100% 遵守 Spec 定义，不添加未定义功能
4. **测试验证** — 根据 Spec 验收标准编写测试

### 常用命令

```bash
npm test          # 运行测试 (291 个测试用例)
npm run lint      # 检查代码格式 (Prettier)
npm run format    # 自动格式化
npm run build:css # 编译 Tailwind CSS
```

---

## 架构概览

**Mind Gym** 是一个零依赖的浏览器端记忆训练 PWA (Vanilla JS + Tailwind CSS)。

### 三层状态架构

```
┌─────────────────────────────────────────────┐
│           Settings (Persistent)              │
│  sound, vibrate, theme, accent, volume...   │
│  → src/settings-manager.js                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      GameState (Runtime Core State)          │
│  difficulty, started, paused, elapsed...     │
│  [Delegates to GameManager]                  │
│  → src/game-state.js                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    ModeState (Mode-Specific, On-Demand)      │
│                                             │
│  NBackState: running, timer, seq, idx...    │
│  RecallState: lastGameValues, correctSet    │
│  → src/nback-state.js, src/recall-state.js  │
└─────────────────────────────────────────────┘
```

### 模块加载顺序

```
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/game-manager.js → src/modal-manager.js
→ src/i18n.js → src/effects.js → src/pools.js → src/timer.js → src/confetti.js
→ src/ui-events.js → src/ui.js → app.js
```

### 核心模块职责

| 模块                      | 职责                              | 导出对象               |
| ------------------------- | --------------------------------- | ---------------------- |
| `app.js`                  | 游戏主循环、状态机、模式逻辑      | 全局函数               |
| `src/game-state.js`       | 游戏状态协调器                    | `RememberGameState`    |
| `src/game-manager.js`     | 卡牌翻转/匹配/胜利逻辑 (深度模块) | `RememberGameManager`  |
| `src/modal-manager.js     | 模态框管理 + 焦点陷阱 (深度模块)  | `RememberModalManager` |
| `src/settings-manager.js` | 用户设置管理                      | `RememberSettings`     |
| `src/nback-state.js`      | N-back 模式状态                   | `NBackState`           |
| `src/recall-state.js`     | 延迟回忆模式状态                  | `RecallState`          |
| `src/storage.js`          | localStorage CRUD                 | `RememberStorage`      |
| `src/fsrs.js`             | FSRS-4.5 间隔重复算法             | `RememberFSRS`         |
| `src/shared.js`           | 共享工具函数                      | `RememberShared`       |

### 游戏模式

1. **经典配对** — 翻牌匹配
2. **倒计时** — 限时挑战
3. **每日挑战** — 全球相同牌组
4. **N-back** — 工作记忆训练
5. **延迟回忆** — 游戏后识别测试

---

## localStorage 键名规范

所有键使用 `memory_match_` 前缀：

| 键名模式                           | 用途                  |
| ---------------------------------- | --------------------- |
| `_settings`                        | 用户设置              |
| `_best_<difficulty>`               | 各难度最佳成绩        |
| `_lb_<difficulty>`                 | 各难度排行榜          |
| `_achievements`                    | 成就数据              |
| `_stats`                           | 统计数据              |
| `_adaptive`                        | 自适应评分 (600-1600) |
| `_mastery_<theme>`                 | FSRS 掌握度数据       |
| `_daily_<YYYY-MM-DD>_<difficulty>` | 每日挑战完成状态      |

---

## 目录结构

| 目录              | 用途                    |
| ----------------- | ----------------------- |
| `openspec/specs/` | 能力规范 (单一真相来源) |
| `openspec/rfc/`   | 架构决策记录            |
| `docs/`           | 用户文档                |
| `changelog/`      | 版本历史                |
| `__tests__/`      | Jest 测试文件           |

---

## 代码风格

- **Prettier**: 单引号, 100 字符行宽, 2 空格缩进, LF
- **提交格式**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **允许的 Scope**: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## 深度模块设计原则

### 什么是深度模块？

**深度模块** = 小接口 + 大实现

- 接口简单，隐藏复杂实现
- 调用者只需了解接口，无需理解内部逻辑
- 例如：`GameManager` 只有 3 个方法，但隐藏了完整的状态机

### 为什么要深度模块？

1. **Locality** — 变更、Bug、知识集中在一处
2. **Leverage** — 每单位接口提供高能力
3. **Testability** — 可独立测试每个模块

---

## 详细文档

完整开发指南请参考 [`CLAUDE.md`](./CLAUDE.md)
