---
title: 模块总览
description: 对主应用关键运行时模块的简短导览。
---

# 模块总览

运行时核心围绕少数关键模块展开：`app.js` 负责整体编排，`src/game-state.js` 协调当前局面，而 `src/game-manager.js`、`src/modal-manager.js` 等深模块则以小接口封装集中复杂度。其余配套模块负责存储、统计、FSRS、国际化与交互效果。

这份总览不是完整 API 文档，而是帮助读者把站点章节快速映射回仓库中的真实文件。
