---
title: Mind Gym 技术白皮书
description: Mind Gym 白皮书、架构展示与贡献者学院的中文首页。
---

# Mind Gym 技术白皮书

<div class="mind-hero">
  <div>
    <p class="mind-eyebrow">以浏览器原生记忆训练为对象的系统设计案例</p>
    <p class="mind-hero__lede">Mind Gym 是一个面向开放 Web 的零依赖记忆训练 PWA：没有后端、没有运行时框架、没有账号墙，也没有隐藏的基础设施。这个站点把项目同时当作可玩的产品与可被审视的技术论证来介绍。文档先建立论点，再由试玩版提供证据。</p>
    <div class="mind-link-list">
      <a class="mind-link-card" href="./overview/project-thesis.html">
        <strong>先读项目论纲</strong>
        <span>从产品意图、运行约束与核心工程判断开始。</span>
      </a>
      <a class="mind-link-card" href="./architecture/system-overview.html">
        <strong>再看系统地图</strong>
        <span>沿着总览进入状态架构、离线交付与模块边界。</span>
      </a>
      <a class="mind-link-card" href="../play/index.html">
        <strong>最后打开试玩版</strong>
        <span>在理解论点之后，再把游戏本体当作证据来审视。</span>
      </a>
    </div>
  </div>
  <aside class="mind-hero__aside">
    <h3>评审包</h3>
    <ul class="mind-checklist">
      <li><strong>产品主张：</strong>短时训练无需依赖后端，也可以长期可用。</li>
      <li><strong>工程主张：</strong>清晰的状态归属与深模块设计，能让小型 JavaScript 代码库产生真实杠杆。</li>
      <li><strong>运营主张：</strong>静态托管、本地保存进度与离线交付，足以支撑一个严肃产品。</li>
    </ul>
  </aside>
</div>

<div class="mind-rail">
  <div class="mind-rail__label">本站目标</div>
  <div>
    <p>资深工程师、严格评审者与贡献者应当可以把页面中的主要结论一路追溯到 <code>app.js</code>、<code>src/game-state.js</code>、<code>src/game-manager.js</code>、<code>src/storage.js</code>、<code>sw.js</code> 等真实文件。</p>
  </div>
</div>

## 一眼看到的系统杠杆

| 信号                   | 为什么重要                                                                              | 主要证据                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **零运行时依赖**       | 应用直接以 HTML、CSS 与浏览器原生 JavaScript 交付，源码与运行时行为之间的映射非常直接。 | `index.html`、`app.js`、`src/*.js`                                                                  |
| **三层状态模型**       | Settings、GameState 与 ModeState 把持久偏好、实时协调与专项流程明确拆开。               | `src/settings-manager.js`、`src/game-state.js`、`src/nback-state.js`、`src/recall-state.js`         |
| **关键热点使用深模块** | 复杂度被收束在局部，而不是扩散成一个巨型编排器。                                        | `src/game-manager.js`、`src/modal-manager.js`、`src/ui/renderer.js`、`src/pipeline/win-pipeline.js` |
| **离线优先交付**       | 首次成功加载之后，即使弱网或离线，短会话依然更可靠。                                    | `sw.js`、`manifest.webmanifest`、`src/storage.js`                                                   |
| **双语文档外壳**       | 英文与中文都能完整表达核心架构论点，而不只是翻译菜单。                                  | `docs/en/*`、`docs/zh/*`                                                                            |

## 推荐阅读路线

<div class="mind-route-list">
  <div class="mind-route">
    <p class="mind-route__for">如果你是严格评审者</p>
    <p class="mind-route__start"><strong>建议起点</strong> <a href="./overview/project-thesis.html">项目论纲</a></p>
    <p class="mind-route__next"><strong>继续阅读</strong> <a href="./architecture/system-overview.html">系统总览</a>，再读 <a href="./reference/module-catalog.html">模块总览</a>。</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">如果你是资深 GitHub 开发者</p>
    <p class="mind-route__start"><strong>建议起点</strong> <a href="./architecture/state-architecture.html">状态架构</a></p>
    <p class="mind-route__next"><strong>继续阅读</strong> <a href="./architecture/pwa-offline-strategy.html">PWA 与离线策略</a>，再读 <a href="./guides/getting-started.html">开始使用</a>。</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">如果你是新贡献者</p>
    <p class="mind-route__start"><strong>建议起点</strong> <a href="./academy/learning-path.html">学习路径</a></p>
    <p class="mind-route__next"><strong>继续阅读</strong> <a href="./guides/getting-started.html">开始使用</a>，然后回到仓库中的 OpenSpec 文件。</p>
  </div>
  <div class="mind-route">
    <p class="mind-route__for">如果你更关注产品判断</p>
    <p class="mind-route__start"><strong>建议起点</strong> <a href="./overview/project-thesis.html">项目论纲</a></p>
    <p class="mind-route__next"><strong>继续阅读</strong> <a href="./research/references-and-related-work.html">参考与相关工作</a>，把产品选择放回更大的背景里。</p>
  </div>
</div>

## 能力版图

| 训练能力       | 训练什么                   | 支撑系统                      |
| -------------- | -------------------------- | ----------------------------- |
| **经典配对**   | 识别、成对关联、节奏控制   | 核心牌面循环、计分、统计      |
| **倒计时模式** | 有时间预算的高压对局       | 计时器编排、成绩持久化        |
| **每日挑战**   | 可重复、可比较的确定性会话 | 日期种子、存储、比对逻辑      |
| **N-back**     | 工作记忆负荷与反应时       | 模式专属状态与训练逻辑        |
| **延迟回忆**   | 对局后的识别测试           | RecallState、胜利管道、评分   |
| **长期进展**   | 从重复使用中累积价值       | 成就、自适应评级、FSRS 掌握度 |

## 本白皮书覆盖什么

1. **产品意图：** 为什么 Mind Gym 被组织成一个严肃的小型系统，而不是一次性的演示页。
2. **系统架构：** 运行时模块、持久化机制与离线能力如何协作。
3. **贡献者杠杆：** 从哪里入手、先读什么、怎样验证变更。
4. **研究背景：** 哪些想法来自认知训练，哪些来自 Web 工程实践。

## 编辑说明

本站刻意保持高信号风格：尽量减少空泛口号，以真实文件、真实边界与真实约束为主线，避免把简单系统包装成复杂戏法。
