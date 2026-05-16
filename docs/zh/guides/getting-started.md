---
title: 开始使用
description: 面向读者、贡献者与文档作者的实用入门页。
---

# 开始使用

本页主要服务两类人：

- **读者**：希望从架构页进入仓库实物。
- **贡献者**：希望建立一个有纪律的首轮修改闭环。

## 按目标选择起点

| 目标 | 第一步 | 第二步 |
| --- | --- | --- |
| 快速理解产品 | 先读论纲和架构页 | 再打开在线试玩，用文档视角观察界面 |
| 评审实现质量 | 先读模块总览 | 再检查 `app.js`、深模块和 `sw.js` |
| 贡献文档 | 先读本页与相关章节 | 再在本地构建文档站 |
| 贡献运行时行为 | 先读本页与相关架构页 | 修改前回到 `openspec/specs/` 交叉核对 |

## 仓库基础命令

```bash
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym
npm install
```

仓库中已建立的核心验证命令如下：

| 命令 | 用途 |
| --- | --- |
| `npm test` | 运行 Jest 测试，覆盖运行时模块与玩法行为 |
| `npm run lint` | 检查格式与仓库风格要求 |
| `npm run build:css` | 将 `styles/app.css` 编译成实际交付的 CSS |
| `npm run docs:install` | 在全新克隆后安装文档工作区依赖 |
| `npm run docs:build` | 构建 VitePress 白皮书站点（并先安装文档依赖） |

## 修改前至少要建立的心智模型

1. 运行时是 **浏览器原生 JavaScript**，不是打包后的 SPA。
2. `index.html` 中的脚本加载顺序非常重要。
3. Settings、GameState 与 mode-specific state 是有意拆开的。
4. 某些文件是总协调器（如 `app.js`），而另一些是为了局部化复杂度而设计的深模块。
5. 行为层面的最终约束仍来自 OpenSpec。

## 贡献者工作流

### 针对运行时变更

1. 先阅读本站对应架构页面。
2. 再阅读归属源码文件。
3. 检查匹配的 OpenSpec spec 或 RFC。
4. 做最小但完整的实现修改。
5. 运行对应的验证命令。
6. 若用户行为或架构叙事发生变化，补充更新文档。

### 针对文档变更

1. 所有结论都以仓库事实为准，而不是凭记忆。
2. 尽量使用真实文件名，而不是空泛描述。
3. 英文页面保持编辑部式、高信号表达；中文页面保持核心语义对齐。
4. 在认为任务完成之前，务必运行 `npm run docs:build`。

## 新贡献者建议的源码阅读顺序

| 关注方向 | 从哪里开始 | 然后继续看 |
| --- | --- | --- |
| 玩法主循环 | `app.js` | `src/game-state.js` → `src/game-manager.js` |
| 持久化 | `src/storage.js` | `src/keys.js` → `src/settings-manager.js` |
| 专项模式 | `src/modes.js` | `src/nback-state.js` / `src/recall-state.js` / `src/modes/*.js` |
| 离线能力 | `sw.js` | `manifest.webmanifest` → `index.html` |
| UI 与可访问性 | `src/ui.js` | `src/ui-events.js` → `src/ui/renderer.js` → `src/modal-manager.js` |
| 胜利 / 结算流程 | `src/pipeline/win-pipeline.js` | `app.js` 中的回调以及 stats / achievements 模块 |

## 实际验证闭环

<div class="mind-matrix">
  <div class="mind-panel">
    <h3>文档创作</h3>
    <p>构建文档站，点击检查受影响页面，并确认 Mermaid 图与本地链接都能正确渲染。</p>
  </div>
  <div class="mind-panel">
    <h3>玩法修改</h3>
    <p>先运行相关测试，再在修改后复跑。只有在触碰 <code>styles/app.css</code> 时才需要重新编译 CSS。</p>
  </div>
  <div class="mind-panel">
    <h3>架构文案调整</h3>
    <p>逐条回到仓库求证，让白皮书继续充当可信地图，而不是营销文案。</p>
  </div>
</div>

## 常见错误

- 描述仓库中并不存在的系统。
- 把 `app.js` 当作唯一值得阅读的文件。
- 忘记离线能力同时依赖缓存资源和本地持久化数据。
- 直接编辑生成后的 CSS，而不是遵守源文件工作流。
- 修改英文文档后忘记检查中文是否仍保持基本对等。

## 何时算“可以提交”

当满足以下条件时，贡献就具备提交质量：

- 已清楚识别归属文件；
- 修改符合现有架构边界；
- 对应验证已经通过；
- 文档对系统的描述仍然真实可信。
