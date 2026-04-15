# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供项目指导，帮助 AI 助手更好地理解和操作此代码库。

## 命令

```bash
npm test                  # 运行 Jest 单元测试
npm run lint              # 使用 Prettier 检查代码格式
npm run format            # 自动格式化所有文件
npm run build:css         # 编译 Tailwind CSS → assets/app.css（压缩）
npm run prepare:deploy    # build:css + 复制文件到 dist/
```

运行单个测试文件：

```bash
npx jest __tests__/helpers.test.js
```

## 架构

**Mind Gym** 是一个零运行时依赖的浏览器记忆力训练游戏（Vanilla JS + Tailwind CSS）。无打包器 — 静态文件直接由服务器提供。

### 模块加载顺序 (index.html script tags)

```
src/keys.js → src/utils.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/i18n.js → src/effects.js
→ src/pools.js → src/timer.js → src/confetti.js → src/ui-events.js → src/ui.js → app.js
```

每个 `src/` 模块暴露一个全局对象（如 `window.RememberStorage`、`window.RememberI18n`）。`app.js` 是游戏编排器，消费所有模块。

### 关键文件

| 文件                   | 职责                                         |
| ---------------------- | -------------------------------------------- |
| `app.js`               | 游戏主循环、状态机、所有模式逻辑（~2500 行） |
| `src/storage.js`       | localStorage CRUD — 设置、成绩、统计、成就   |
| `src/stats.js`         | 统计数据规范化与累计逻辑                     |
| `src/achievements.js`  | 成就定义与检查逻辑                           |
| `src/modes.js`         | N-back 和回忆测验的纯逻辑                    |
| `src/import-export.js` | 备份/恢复数据规范化                          |
| `src/i18n.js`          | zh/en 词典；自动检测浏览器语言               |
| `src/ui.js`            | DOM 元素绑定（元素引用的单一真相来源）       |
| `src/ui-events.js`     | 事件监听器注册                               |
| `src/pools.js`         | 卡面素材池（emoji、数字、字母、形状、颜色）  |
| `src/timer.js`         | 倒计时和计时管理                             |
| `src/effects.js`       | Web Audio API 音效和 Vibration API           |
| `src/confetti.js`      | Canvas 2D 胜利动画                           |
| `sw.js`                | Service Worker：资源缓存优先，导航网络优先   |

### 游戏模式

1. **Classic** — 翻牌配对，记录时间和步数
2. **Countdown** — 每个难度有时间限制
3. **Daily Challenge** — 按日期 + 难度 + 卡面主题生成种子（全球同一牌组）
4. **N-back** — 判断当前卡是否与 N 步前相同（快捷键：J）
5. **Delayed Recall** — 通关后检查哪些卡出现过

### localStorage 键名约定

所有键以 `memory_match_` 为前缀：

- `_settings` — 用户设置
- `_best_<difficulty>` — 各难度最佳成绩
- `_lb_<difficulty>` — 各难度排行榜
- `_achievements` — 成就数据
- `_stats` — 统计数据
- `_adaptive` — 自适应评分（600–1600）
- `_spaced_<theme>` — 间隔复现权重表
- `_daily_<YYYY-MM-DD>_<difficulty>` — 每日挑战完成状态

### CSS 工作流

源文件：`styles/app.css` → 通过 Tailwind CLI 编译为 `assets/app.css`。
编辑 `styles/app.css` 后运行 `npm run build:css` 更新。**不要直接编辑 `assets/app.css`**。

### 部署

GitHub Actions (`pages.yml`) 执行 lint → test → `prepare:deploy` → 上传 `dist/` 到 GitHub Pages（推送到 master 时触发）。

## 代码风格

- Prettier：单引号、尾随逗号、120 字符行宽、2 空格缩进、LF
- 提交格式：Conventional Commits (`feat:`、`fix:`、`docs:`、`style:`、`test:`、`chore:`、`ci:`)
- 允许的 PR 作用域：`ci`、`deps`、`docs`、`ui`、`gameplay`、`tooling`

## 变更日志

所有修改记录在 `changelog/` 目录。

## currentDate

今天日期：2026/04/16。
