---
title: Mind Gym 技术白皮书
description: Mind Gym 白皮书、架构展示与贡献者学院的中文首页。
---

# Mind Gym 技术白皮书

Mind Gym 是一个面向开放 Web 的零依赖记忆训练 PWA：没有后端、没有运行时框架、没有账号墙，也没有隐藏的基础设施。本白皮书站点把项目同时当作 **可玩的产品** 与 **可被审视的技术论证** 来介绍：它试图说明，哪怕只是一个体量很小的浏览器游戏，只要状态边界清晰、深模块设计得当、离线优先策略落地，依然可以展现出超出体量的工程韧性。

<div class="mind-panel">
  <p><strong>本站目标：</strong>让资深工程师、严格评审者与贡献者能够快速理解项目论纲，沿着真实文件追踪运行时设计，并把页面中的结论映射回 <code>app.js</code>、<code>src/game-state.js</code>、<code>src/game-manager.js</code>、<code>sw.js</code> 等实现。</p>
</div>

## 一页理解项目

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>产品论纲</h3>
    <p>Mind Gym 通过经典配对、倒计时、每日挑战、N-back 与延迟回忆，把碎片时间转化为可重复的刻意练习。</p>
  </div>
  <div class="mind-panel">
    <h3>工程论纲</h3>
    <p>只要把持久化偏好、运行时会话控制和模式专属逻辑清晰拆开，较小的 JavaScript 代码面也能支撑丰富行为。</p>
  </div>
  <div class="mind-panel">
    <h3>运营论纲</h3>
    <p>离线优先、本地保存进度和静态部署同时降低了基础设施成本，并提升了隐私与可用性。</p>
  </div>
  <div class="mind-panel">
    <h3>文档论纲</h3>
    <p>站点被组织成白皮书、学院和参考手册三层入口，方便不同类型的读者按需进入。</p>
  </div>
</div>

## 为什么 Mind Gym 值得研究

| 信号 | 价值 |
| --- | --- |
| **零运行时依赖** | 应用以 HTML、CSS 与浏览器原生 JavaScript 交付，源码与运行时行为之间的映射极为直接。 |
| **三层状态模型** | Settings、GameState 与 ModeState 把持久偏好、会话控制与专项训练流程清晰拆开。 |
| **关键热点采用深模块** | `src/game-manager.js`、`src/modal-manager.js`、`src/ui/renderer.js`、`src/pipeline/win-pipeline.js` 以小接口封装集中复杂度。 |
| **默认离线优先** | `sw.js`、`manifest.webmanifest` 与 `localStorage` 协同工作，让大部分用户价值不依赖稳定网络。 |
| **双语文档外壳** | 英文与中文页面力求在核心架构层面保持对等表达，而不只是菜单翻译。 |

## 推荐阅读路线

| 如果你是... | 建议起点 | 然后阅读 |
| --- | --- | --- |
| **严格的评审者** | [项目论纲](./overview/project-thesis.md) | [系统总览](./architecture/system-overview.md) → [模块总览](./reference/module-catalog.md) |
| **资深 GitHub 开发者** | [状态架构](./architecture/state-architecture.md) | [PWA 与离线策略](./architecture/pwa-offline-strategy.md) → [开始使用](./guides/getting-started.md) |
| **新贡献者** | [学习路径](./academy/learning-path.md) | [开始使用](./guides/getting-started.md) → 回到仓库中的 OpenSpec |
| **产品视角读者** | [项目论纲](./overview/project-thesis.md) | [参考与相关工作](./research/references-and-related-work.md) |

## 能力版图

Mind Gym 在同一个浏览器外壳中整合了多种训练模式：

- **经典配对**：强调识别与成对关联。
- **倒计时模式**：引入压力、节奏与时间预算。
- **每日挑战**：通过确定性牌组提高可重复性。
- **N-back**：强调工作记忆负荷与反应时。
- **延迟回忆**：在对局结束后进行识别测试。
- **成就、统计、自适应评级与 FSRS 掌握度**：在无需账号系统的前提下，支撑长期进展追踪。

## 本白皮书要回答什么

1. **产品意图** —— 为什么 Mind Gym 被视为一个严肃的小型系统，而不是一个一次性的演示页。
2. **系统架构** —— 运行时模块、持久化机制和离线能力如何协作。
3. **贡献者杠杆** —— 从哪里入手、先读什么、怎样验证变更。
4. **研究背景** —— 哪些想法来自认知训练，哪些来自 Web 工程实践。

## 编辑说明

本站刻意保持“高信号”风格：尽量减少空泛口号，以真实文件、真实边界和真实约束为主线，避免把简单系统包装成复杂戏法。
