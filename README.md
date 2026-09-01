# 🧠 Mind Gym

> 零依赖的浏览器端认知训练 PWA — N-back / 翻牌配对 / 每日挑战，开箱即玩、离线可用、零运行时依赖。

<p align="center">
  <a href="https://github.com/build-workbench/mind-gym/actions/workflows/ci.yml">
    <img src="https://github.com/build-workbench/mind-gym/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/build-workbench/mind-gym/actions/workflows/deploy-pages.yml">
    <img src="https://github.com/build-workbench/mind-gym/actions/workflows/deploy-pages.yml/badge.svg" alt="Deploy">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <a href="package.json">
    <img src="https://img.shields.io/github/package-json/v/build-workbench/mind-gym?label=version&color=4f46e5" alt="Version">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white" alt="Node >=18">
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA Ready">
  <img src="https://img.shields.io/badge/tests-337_passing-brightgreen" alt="Tests">
</p>

<p align="center">
  <a href="https://build-workbench.github.io/mind-gym/"><strong>🎮 在线试玩 Live Demo → https://build-workbench.github.io/mind-gym/</strong></a><br>
  <sub>支持桌面 / 移动端 · 中英双语 · 可安装为离线 PWA · 无需注册</sub>
</p>

<p align="center">
  <img src="./assets/screenshot-1.png" alt="Mind Gym 游戏桌面端截图" width="640">
  <br>
  <sub>经典配对 · N-back · 每日挑战 — 同一代码库，零依赖运行</sub>
</p>

---

## 目录

- [为什么做 Mind Gym](#为什么做-mind-gym)
- [特性亮点](#-特性亮点)
- [训练模式](#-训练模式)
- [快速开始](#-快速开始)
- [键盘快捷键](#️-键盘快捷键)
- [项目结构](#️-项目结构)
- [架构设计](#-架构设计)
- [常用命令](#️-常用命令)
- [测试与质量保障](#-测试与质量保障)
- [部署](#-部署)
- [贡献与反馈](#-贡献与反馈)
- [许可证](#-许可证)

---

## 为什么做 Mind Gym

市面上的脑力训练 App 往往臃肿、依赖多、需要登录。Mind Gym 追求三件事：

1. **极致轻量** — 原生 JavaScript (ES2022) 无框架，`npm install` 后即可跑，构建产物可直接托管到任意静态服务器。
2. **科学训练** — 引入 FSRS 4.5 间隔重复 + 类 ELO 自适应评分，易错卡优先重现，难度随水平自动调节（600–1600 分段）。
3. **离线优先的 PWA** — Service Worker 缓存 + `manifest.webmanifest`，支持「添加到主屏幕」，弱网/离线仍可训练，数据全在本地 `localStorage`。

> 适合作为「零依赖 PWA / 原生 JS 状态管理 / FSRS 算法落地」的参考实现。

---

## ✨ 特性亮点

| 亮点                | 说明                                                             |
| ------------------- | ---------------------------------------------------------------- |
| **自适应难度**      | 类 ELO 评分逐局调整预览时长与提示次数，越练越贴合你的水平        |
| **FSRS 间隔复现**   | 基于 FSRS-4.5 的掌握度建模，易错卡优先出现，长时记忆更稳固       |
| **连击 & 星级**     | 5 秒内连续配对累积连击，综合用时/步数/提示/连击给出 1–3 星评定   |
| **成就系统**        | 6 项成就：≤60/120/180 秒速通、无提示通关、零失误等               |
| **完整统计**        | 总局数、最佳用时、平均步数、连击纪录，支持 JSON 一键导出/导入    |
| **PWA 离线**        | 可安装、离线可用、自动更新提示                                   |
| **中英双语 + 主题** | 自动识别浏览器语言，支持浅色/深色/自动、靛蓝/翡翠/玫瑰三套主题色 |
| **无障碍 & 快捷键** | 全键盘操作、ARIA、减少动画偏好支持                               |

---

## 🎮 训练模式

| 模式            | 说明                                          | 认知目标           |
| --------------- | --------------------------------------------- | ------------------ |
| **经典配对**    | 翻牌找对，`4×4` / `4×5` / `6×6` 三档网格      | 视觉记忆、注意力   |
| **限时模式**    | 每难度可配置倒计时，超时自动判负              | 处理速度、压力管理 |
| **每日挑战**    | 按日期种子生成，全网同一牌组                  | 一致性、竞技性     |
| **N-back 训练** | 序列中判断与 N 步前是否相同，可调 N/节奏/长度 | 工作记忆、专注力   |
| **回忆测验**    | 通关后对本局卡面的再认测试                    | 长时记忆巩固       |

卡面主题可在设置中切换：`Emoji / 数字 / 字母 / 形状 / 颜色`。

---

## 🚀 快速开始

### 前置要求

- Node.js `>= 18`，npm `>= 9`（见 `package.json#engines`）

### 本地运行

```bash
git clone https://github.com/build-workbench/mind-gym.git
cd mind-gym
npm install
npm run dev          # http://localhost:3000  (npx serve .)
# 或直接用任意静态服务器： npx serve . / python3 -m http.server
```

> 首次打开点击「指南」可查看完整玩法与快捷键。

### 安装为 PWA

- **桌面端**：地址栏右侧点击「安装」图标
- **移动端**：Safari「添加到主屏幕」/ Chrome 菜单「安装应用 / 添加到主屏幕」
- 已安装后支持离线启动，更新时右下角会有「新版本可用」提示

---

## ⌨️ 键盘快捷键

| 按键              | 功能                       |
| ----------------- | -------------------------- |
| `N`               | 新开一局 / 重开            |
| `P`               | 暂停 / 继续                |
| `H`               | 使用提示（消耗次数）       |
| `J`               | N-back 判定“与 N 步前相同” |
| `↑ ↓ ← →`         | 方向键导航卡牌             |
| `Enter` / `Space` | 翻开选中卡牌               |
| `Esc`             | 关闭弹窗                   |

可在「指南」弹窗中随时查看。

---

## 🏗️ 项目结构

```
mind-gym/
├── index.html             # 单页入口，内联关键 CSS + JSON-LD
├── app.js                 # 编排器：状态机、模式切换、事件绑定
├── sw.js                  # Service Worker（版本化离线缓存）
├── manifest.webmanifest   # PWA 清单
├── assets/                # 编译后 CSS、图标、OG 图、截图
├── styles/app.css         # Tailwind 源文件
├── src/                   # UMD 模块（按 <script> 顺序加载）
│   ├── settings-defaults.js  # 默认设置单一来源
│   ├── storage.js / settings-manager.js
│   ├── game-state.js / game-manager.js
│   ├── timer.js / effects.js / confetti.js
│   ├── fsrs.js            # FSRS-4.5 掌握度算法
│   ├── daily.js / nback-state.js / recall-state.js
│   ├── stats.js / achievements.js / modes.js
│   ├── i18n.js / pools.js / pipeline/win-pipeline.js
│   └── ui/ + ui.js + ui-events.js + modal-manager.js
├── __tests__/             # Jest + jsdom 单测（23 套件 / 337 用例）
├── scripts/               # prepare-deploy.sh / 图标生成
└── changelog/CHANGELOG.md # 版本历史（Keep a Changelog）
```

<details>
<summary><strong>查看 src 模块加载顺序（与 index.html 一致）</strong></summary>

```
settings-defaults → keys → utils → shared → stats → achievements → modes
→ import-export → storage → settings-manager → fsrs → nback/recall
→ daily → game-manager → modal-manager → i18n → effects/pools/timer
→ confetti → game-state → ui/renderer → win-pipeline → ui-events → ui → app.js
```

</details>

---

## 🧩 架构设计

**三层状态模型** — 职责清晰，易于测试与扩展：

```
Settings（持久，localStorage） → GameState（单局运行时） → ModeState（按需，N-back / Recall / Daily）
     跨刷新保留                      只服务当前对局              只属于某模式的临时状态
```

- **Settings**：声音/震动/主题/语言/倒计时等，`memory_match_settings` 持久化，`src/settings-defaults.js` 为单一来源
- **GameState**：本局的难度、计时、步数、翻牌状态等，刷新即重置
- **ModeState**：`nback-state.js` / `recall-state.js` / `daily.js` 各自隔离，通过 `game-manager` 统一调度

渲染统一走 `getGameState()` 拉取，避免手工订阅同步；胜利流程由 `src/pipeline/win-pipeline.js` 串联（统计 → 成就 → FSRS → 排行榜 → 回忆测验）。

---

## 🛠️ 常用命令

| 命令                     | 用途                                                |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | 本地静态服务 `http://localhost:3000`                |
| `npm test`               | 运行 Jest 单测                                      |
| `npm run test:watch`     | 监听模式                                            |
| `npm run test:coverage`  | 覆盖率报告（阈值见下）                              |
| `npm run lint`           | Prettier 格式检查 + ESLint                          |
| `npm run lint:fix`       | 自动修复 ESLint                                     |
| `npm run format`         | Prettier 全量格式化                                 |
| `npm run build:css`      | 编译并压缩 Tailwind CSS → `assets/app.css`          |
| `npm run build:css:dev`  | 编译未压缩版（便于调试）                            |
| `npm run prepare:deploy` | 生产构建到 `dist/`（terser 压缩 JS + 拷贝静态资源） |
| `npm run validate`       | 一键校验：`lint && test && build:css`               |
| `npm run clean`          | 清理 `dist/` 与 `coverage/`                         |

---

## 🧪 测试与质量保障

- **测试**：Jest + jsdom，`__tests__/` 23 套件 · 337 用例，覆盖核心算法（FSRS/自适应/每日种子）、状态机、存储与 UI 渲染
- **覆盖率阈值**（`jest.config.cjs`，本地与 CI 一致）：
  ```
  statements 50% | lines 50% | functions 55% | branches 40%
  ```
  CI 中以 `npx jest --coverage --runInBand` 强制门控
- **代码风格**：Prettier（100 字符、`singleQuote`）+ ESLint 9 Flat Config，UMD 全局与 CJS 分支分别约束
- **CI**：`.github/workflows/ci.yml` 三阶段 `lint → test(22/24) → build:css`，全部通过后 `ci-passed` 汇总；`deploy-pages.yml` 需等待 CI 成功再发布

本地一键校验：

```bash
npm run validate
```

---

## 🚀 部署

**自动部署（推荐）**：推送到 `master` 分支后，`Deploy to GitHub Pages` 工作流自动执行 `scripts/prepare-deploy.sh` 构建并发布到 GitHub Pages：

`https://build-workbench.github.io/mind-gym/`

**手动部署到任意静态托管**：

```bash
npm run prepare:deploy   # 产物在 dist/
# 将 dist/ 上传至 Vercel / Netlify / Cloudflare Pages / Nginx 等
```

`dist/` 已包含压缩后的 JS、编译后的 CSS、图标与 `manifest`，开箱即用。

---

## 🤝 贡献与反馈

欢迎提 Issue / PR！

- 提交前请运行 `npm run validate`，确保 lint、测试与 CSS 构建均通过
- Commit 信息建议遵循 Conventional Commits（如 `fix: ...` / `feat: ...`）
- 发现 Bug 请附复现步骤与浏览器/系统版本；新功能建议先开 Issue 讨论
- 更多历史见 [changelog/CHANGELOG.md](changelog/CHANGELOG.md)

---

## 📄 许可证

[MIT License](LICENSE) © holtwood

> 数据说明：所有进度以 `memory_match_` 前缀存储于浏览器 `localStorage`，可通过设置面板「导出/导入」备份为 JSON，卸载/清空站点数据会丢失进度。
