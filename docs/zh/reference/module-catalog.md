---
title: 模块总览
description: 以文件为单位梳理 Mind Gym 主要运行时模块及其架构角色。
---

# 模块总览

这份总览不是 API 转储，而是面向读者的导航层：帮助你从架构概念走回真实文件，又不至于在文件海里丢失主线。

## 阅读规则

当你不确定时，优先问三个问题，而不是进行一次毫无边界的大搜索：

1. 哪个文件真正拥有这段行为？
2. 它属于持久化状态、运行时会话状态、模式专属状态，还是 UI / 交付基础设施？
3. 这段逻辑应该留在编排器里，还是更适合深模块？

## 主要运行时模块

| 区域 | 文件 | 角色 |
| --- | --- | --- |
| **应用壳** | `index.html`、`app.js` | 入口与顶层编排 |
| **键与共享原语** | `src/keys.js`、`src/utils.js`、`src/shared.js` | 键名规则、工具函数、校验辅助 |
| **持久化** | `src/storage.js`、`src/settings-manager.js` | 数据规范化、localStorage CRUD、设置策略 |
| **玩法状态** | `src/game-state.js`、`src/game-manager.js` | 会话协调与配对状态机 |
| **模式** | `src/modes.js`、`src/modes/*.js`、`src/modes/registry.js` | 模式逻辑、注册与切换 |
| **模式专属状态** | `src/nback-state.js`、`src/recall-state.js`、`src/daily.js`、`src/adaptive.js` | 专项流程与进展辅助 |
| **进展与评分** | `src/stats.js`、`src/achievements.js`、`src/fsrs.js` | 指标、解锁逻辑与掌握度调度 |
| **UI 基础设施** | `src/ui.js`、`src/ui-events.js`、`src/ui/renderer.js`、`src/modal-manager.js` | DOM 绑定、事件接线、渲染与无障碍 |
| **反馈与效果** | `src/effects.js`、`src/timer.js`、`src/confetti.js`、`src/pools.js` | 计时、音效、动画与卡面池 |
| **结算管道** | `src/pipeline/win-pipeline.js` | 胜利后的有序副作用 |
| **离线交付** | `sw.js`、`manifest.webmanifest` | 缓存、安装能力与韧性交付 |

## 值得特别关注的深模块

| 文件 | 为什么算深模块 |
| --- | --- |
| `src/game-manager.js` | 小接口背后隐藏了匹配校验、锁盘、步数统计与胜利判定。 |
| `src/modal-manager.js` | 看似只是开关模态框，实际上还负责焦点陷阱、堆栈管理与焦点恢复。 |
| `src/ui/renderer.js` | 将 DOM 渲染细节封装起来，让编排层不必处处手写界面变更。 |
| `src/pipeline/win-pipeline.js` | 把多步骤结算流程变成有顺序、可检查的管道。 |
| `src/game-state.js` | 对外提供统一会话表面，同时把专项复杂度委托给更深的模块。 |

## 模块边界说明

### 持久化边界

- `src/keys.js` 定义命名规范。
- `src/storage.js` 负责底层安全读写与规范化。
- `src/settings-manager.js` 叠加策略、校验、通知与更高层接口。

### 运行时状态边界

- `src/game-state.js` 拥有当前会话合同。
- `src/game-manager.js` 负责被集中起来的配对逻辑。
- `src/timer.js` 负责计时行为，避免 GameState 自己变成一个计时器实现。

### 模式边界

- `src/modes.js` 提供通用模式逻辑辅助。
- `src/modes/registry.js` 形式化模式注册与切换。
- `src/modes/*.js` 以及专属状态文件使专项代码得以隔离。

### UI 边界

- `src/ui.js` 是 DOM 引用的单一绑定源。
- `src/ui-events.js` 负责事件接线。
- `src/ui/renderer.js` 负责把状态变化转成 DOM 更新。
- `src/modal-manager.js` 集中处理对可访问性敏感的模态框行为。

## 脚本加载顺序

运行时在 `index.html` 中通过有序脚本标签装配，简化后的顺序如下：

```text
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js
→ src/modes.js → src/import-export.js → src/storage.js → src/settings-manager.js
→ src/fsrs.js → src/nback-state.js → src/recall-state.js → src/adaptive.js → src/daily.js
→ src/game-manager.js → src/modal-manager.js → src/game-state.js
→ src/modes/registry.js → src/modes/classic.js → src/modes/countdown.js → src/modes/daily.js
→ src/modes/nback.js → src/modes/recall.js → src/i18n.js → src/effects.js → src/pools.js
→ src/timer.js → src/confetti.js → src/ui/renderer.js → src/pipeline/win-pipeline.js
→ src/ui-events.js → src/ui.js → app.js
```

这条顺序本身就是架构的一部分，而不是无关紧要的细节。

## 常见修改从哪里开始

| 如果你要改... | 先看 | 再交叉核对 |
| --- | --- | --- |
| 配对 / 翻牌规则 | `src/game-manager.js` | `src/game-state.js`、测试 |
| 持久化设置 | `src/settings-manager.js` | `src/storage.js`、`src/keys.js` |
| 排行榜 / 统计 / 成就 | `src/storage.js`、`src/stats.js`、`src/achievements.js` | 胜利管道与相关 UI |
| N-back 行为 | `src/nback-state.js`、`src/modes/nback.js` | `src/modes.js` |
| 回忆测试行为 | `src/recall-state.js`、`src/modes/recall.js` | `src/modes.js` |
| 离线交付 | `sw.js` | `manifest.webmanifest`、`index.html` |
| 文档结构 | `docs/.vitepress/config.ts` 与对应页面 | 中文 / 英文对照页 |

## 最后的定位建议

理解 Mind Gym 最快的方式，不是把它当成一堆平铺文件，而是把它当成一组边界来读：应用壳、持久化、运行时状态、模式状态、UI 基础设施，以及离线交付。
