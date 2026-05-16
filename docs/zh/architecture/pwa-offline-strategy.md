---
title: PWA 与离线策略
description: 说明 Mind Gym 如何利用 Service Worker、安装能力与本地持久化支撑可靠训练。
---

# PWA 与离线策略

在 Mind Gym 中，离线支持不是装饰，而是产品承诺的一部分：应用应当能在短时训练场景、移动弱网环境以及首次成功加载之后继续保持可用。

<div class="mind-rail">
  <div class="mind-rail__label">核心区分</div>
  <div>
    <p>离线故事由两部分组成：Service Worker 保护已交付的应用壳，localStorage 保护玩家拥有的本地进度。正是这种角色拆分，让系统既诚实又可审视。</p>
  </div>
</div>

## 交付模型

Mind Gym 将三种浏览器能力组合在一起：

1. **Service Worker（`sw.js`）：** 负责缓存与更新流程。
2. **Web App Manifest（`manifest.webmanifest`）：** 负责安装能力与独立窗口启动。
3. **localStorage（`src/storage.js`）：** 负责用户拥有的本地进度数据。

它们共同塑造出一种更像“本地工具”的产品感觉，而不只是一个碰巧包含小游戏的网页。

## 请求与缓存流程

<figure class="mind-diagram" role="img" aria-label="请求与缓存流程图">
  <img class="mind-diagram__image mind-diagram__image--light" src="/diagrams/pwa-request-flow-light.svg" alt="" />
  <img class="mind-diagram__image mind-diagram__image--dark" src="/diagrams/pwa-request-flow-dark.svg" alt="" />
</figure>

<p class="mind-caption">这条路径说明，离线能力并不是单一功能。Cache Storage 负责代码与应用壳，localStorage 负责玩家历史与产品设置。</p>

## 策略矩阵

| 资源类型        | 代表例子                               | 实际策略                          | 原因                                 |
| --------------- | -------------------------------------- | --------------------------------- | ------------------------------------ |
| **导航 / HTML** | `./`、`index.html`                     | 网络优先，缓存回退                | 联网时优先获得新壳层，但离线仍可恢复 |
| **核心 JS/CSS** | `app.js`、`src/*.js`、`assets/app.css` | stale-while-revalidate / 静态缓存 | 重访速度快，同时后台可更新           |
| **图片与图标**  | `assets/icon.svg`、PNG 图标            | cache-first + 过期控制            | 稳定资源适合激进复用                 |
| **字体**        | Google Fonts 请求                      | 独立缓存处理                      | 外部依赖需要单独策略                 |
| **进度数据**    | 设置、统计、成就、掌握度               | localStorage 持久化               | 这部分是用户数据，不应混进 HTTP 缓存 |

## 预缓存了什么

Service Worker 会显式预缓存应用壳与主要运行时模块，包括：

- `index.html`
- `app.js`
- 按加载顺序列出的关键 `src/` 模块
- `manifest.webmanifest`
- 核心图标与编译后的 CSS
- `404.html`、`offline.html` 等支撑页面

这一点很重要，因为离线能力不是抽象口号，而是 `sw.js` 中一份真实维护的资源清单。

## 安装能力模型

| 能力                  | 用户可感知结果                                   |
| --------------------- | ------------------------------------------------ |
| **Manifest 元数据**   | 浏览器可将应用识别为可安装                       |
| **独立显示模式**      | 应用可脱离常规浏览器边框启动                     |
| **图标与主题色**      | 安装后的入口更像刻意设计的应用，而非网页快捷方式 |
| **启动 URL / 作用域** | 安装启动后仍能正确回到应用壳                     |

## 持久化模型

只有 HTTP 缓存是不够的，Mind Gym 还将用户进度保存在 localStorage 中。

| 数据族   | 存储作用                                |
| -------- | --------------------------------------- |
| 设置     | 主题、音效、倒计时预设、语言、模式偏好  |
| 表现数据 | 最佳成绩、排行榜、聚合统计              |
| 进展数据 | 成就、自适应评级、spaced / mastery 数据 |
| 每日参与 | 以日期和难度为键的完成标记              |

这一区分非常关键：Service Worker 保护的是 **代码与应用壳**，而 localStorage 保护的是 **玩家本地历史**。

## 更新行为

<figure class="mind-diagram" role="img" aria-label="更新行为图">
  <img class="mind-diagram__image mind-diagram__image--light" src="/diagrams/pwa-update-flow-light.svg" alt="" />
  <img class="mind-diagram__image mind-diagram__image--dark" src="/diagrams/pwa-update-flow-dark.svg" alt="" />
</figure>

<p class="mind-caption">更新策略刻意保持保守：能拿到新壳层时就拿新壳层，但始终保留缓存回退，避免短会话因网络路径脆弱而失效。</p>

## PWA 模型带来的产品优势

- **短会话更可靠：** 重访时能更快打开。
- **感知脆弱性更低：** 弱网不会立刻摧毁体验。
- **默认更重隐私：** 日常游玩不依赖服务端账号体系。
- **静态部署杠杆更高：** 即便只有 GitHub Pages，也能提供接近应用级的体验。

## 局限与诚实边界

Mind Gym 的离线能力很强，但并非无限：

- **首次访问仍需联网** 才能填充缓存。
- 字体等外部资源仍然受浏览器缓存策略与网络策略影响。
- 离线表现依赖 **Service Worker 支持与浏览器存储可用性**。
- 本地优先进度意味着 **没有内建跨设备同步**。

## 贡献者验证清单

当你修改资源、运行时模块或应用壳时，请检查：

1. `sw.js` 的预缓存条目是否需要更新；
2. 安装元数据是否仍然准确描述实际体验；
3. 新的持久化数据是否应进入 localStorage，并遵守 `memory_match_` 键规范；
4. 文档是否仍准确描述离线模型。

## 结论

Mind Gym 的 PWA 架构并不是为了模仿原生应用，而是为了让一个浏览器交付的训练系统在首次加载之后变得更可靠、可审视、且持续有用。
