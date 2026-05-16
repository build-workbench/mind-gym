---
title: 系统总览
description: 对 Mind Gym 应用与文档栈的高层总结。
---

# 系统总览

Mind Gym 以静态、浏览器优先的方式交付：游戏逻辑由原生 JavaScript 驱动，界面由 Tailwind CSS 提供样式，数据持久化与离线能力则依赖 localStorage 和 Service Worker。白皮书站点也延续这种轻量思路，使用 VitePress 作为发布层。

在运行时层面，系统主要划分为持久化设置、运行期游戏状态以及按模式按需加载的状态。这种边界让核心循环更容易理解，同时仍能容纳多种训练模式。
