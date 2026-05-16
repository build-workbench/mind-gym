---
title: 系统总览
description: 总结 Mind Gym 的运行时、文档外壳与主要系统边界。
---

# 系统总览

Mind Gym 仓库里实际上承载了两个彼此相关的系统：

1. **游戏运行时：** 以静态文件交付的浏览器原生记忆训练应用。
2. **文档外壳：** 以 VitePress 构建的白皮书层，用来向人类解释运行时。

最关键的架构特征是，这两个系统都不依赖自定义后端。游戏依赖浏览器原语，文档依赖静态生成。

<div class="mind-rail">
  <div class="mind-rail__label">如何阅读本页</div>
  <div>
    <p>把图和表当作一条可审计的路径来读：先从浏览器壳层开始，再进入运行时编排器，最后顺着状态与持久化边界落到具体文件。</p>
  </div>
</div>

## 运行时地图

<figure class="mind-diagram" role="img" aria-label="系统总览图">
  <img class="mind-diagram__image mind-diagram__image--light" src="/diagrams/system-overview-light.svg" alt="" />
  <img class="mind-diagram__image mind-diagram__image--dark" src="/diagrams/system-overview-dark.svg" alt="" />
</figure>

<p class="mind-caption">从左到右理解这张图：浏览器先装载可玩的应用壳或文档壳，再把运行时交给 <code>app.js</code>，由它协调 UI、状态、模式、存储与离线能力。</p>

## 部署模型

| 表面           | 技术                                           | 为什么适合                                 |
| -------------- | ---------------------------------------------- | ------------------------------------------ |
| **可玩的应用** | 静态 HTML + Vanilla JS + 编译后的 Tailwind CSS | 运行时复杂度低，源码与行为的映射直接       |
| **文档站点**   | 搭配静态 SVG 架构图的 VitePress                | 适合承载架构密集型页面的轻量发布层         |
| **持久化**     | localStorage                                   | 足以承载设置、成绩、统计、掌握度与离线进度 |
| **离线交付**   | Service Worker + Web App Manifest              | 支持重复访问、安装体验与碎片化短会话       |

## 主要运行时边界

### `index.html` 是组合根

应用通过脚本标签按依赖顺序装配。这一点很重要，因为仓库偏好通过 UMD 风格模块把对象挂到 `window` 上，使依赖关系在没有 JavaScript 打包器的情况下依然显式、可调试。

### `app.js` 是编排器

`app.js` 仍然承担游戏循环、UI 反应和模式切换的总体协调工作。架构目标并不是让 `app.js` 变得极小，而是避免它成为唯一能承载复杂逻辑的地方。

### 深模块负责集中复杂度

若干非平凡行为被下放到专门模块中：

- `src/game-manager.js`：负责翻牌、匹配、锁盘和胜利检测。
- `src/modal-manager.js`：负责模态框堆栈、焦点陷阱和焦点恢复。
- `src/ui/renderer.js`：负责 DOM 渲染细节。
- `src/pipeline/win-pipeline.js`：负责胜利后的多步骤编排。

### 状态模块的分层

Mind Gym 现在明确区分：

- **持久化设置**：`src/settings-manager.js`
- **运行时会话控制**：`src/game-state.js`
- **模式专属状态**：`src/nback-state.js` 与 `src/recall-state.js`

这种拆分是多种训练模式能够共存、又不坍塌成一个巨型状态对象的关键。

## 实际数据流

### 会话启动

1. 浏览器加载 `index.html` 与编译后的 CSS。
2. 脚本标签按声明顺序加载源码模块。
3. `app.js` 从 `src/ui.js` 绑定 DOM 引用。
4. 设置与持久化数据通过 `src/storage.js` 和 localStorage 读入。
5. 应用主题、语言、动效和默认玩法被应用到界面上。
6. 注册 Service Worker，为缓存和更新做准备。

### 会话进行

1. 玩家选择或恢复一种模式。
2. `app.js` 初始化 GameState 与任何模式专属状态。
3. 渲染器与效果模块把状态变化转化为可见反馈。
4. 在需要持久化的边界上调用存储：最佳成绩、排行榜、统计、成就、自适应数据与掌握度数据。

### 会话结束

胜利处理远不只是弹出模态框。胜利管道会停止计时器、更新成绩、写入统计、调整自适应评级、更新掌握度、检查成就，并在需要时打开回忆测试。这是把编排从 `app.js` 中抽取出来、形成独立深模块的典型例子。

## 文件系统分区

| 区域             | 代表文件                                                                                | 职责                       |
| ---------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| **壳层**         | `index.html`、`assets/app.css`、`manifest.webmanifest`                                  | 入口、样式产物、安装元数据 |
| **运行时编排**   | `app.js`、`src/game-state.js`、`src/settings-manager.js`                                | 会话协调与高层状态策略     |
| **领域逻辑**     | `src/game-manager.js`、`src/modes.js`、`src/fsrs.js`、`src/adaptive.js`、`src/daily.js` | 玩法规则与进展逻辑         |
| **模式专项**     | `src/nback-state.js`、`src/recall-state.js`、`src/modes/*.js`                           | 模式专属流程               |
| **UI 基础设施**  | `src/ui.js`、`src/ui-events.js`、`src/ui/renderer.js`、`src/modal-manager.js`           | 绑定、事件、渲染、可访问性 |
| **持久化与离线** | `src/storage.js`、`src/keys.js`、`sw.js`                                                | 本地持久化与缓存交付       |
| **文档外壳**     | `docs/.vitepress/*`、`docs/en/*`、`docs/zh/*`                                           | 白皮书导航与发布           |

## 为什么资深评审会在意

Mind Gym 的架构价值并不来自“大”，而来自“可快速验证”：

- 文件名基本直接对应职责。
- 运行时没有被大量构建期间接层遮蔽。
- 离线策略可以直接在 `sw.js` 里验证。
- 状态模型可以从文档一路追踪到具体模块。

## 实践结论

阅读完系统总览后，读者应建立起这样一个心智模型：**Mind Gym 是一个静态、浏览器优先的产品，它的工程杠杆来自边界纪律，而不是基础设施规模。**
