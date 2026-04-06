# 质量、健壮性与结构升级

日期：2026-04-06

## 变更内容

- 新增 `src/stats.js`、`src/achievements.js`、`src/modes.js`、`src/import-export.js`，把统计、成就、模式纯逻辑、导入导出归一化从 `app.js` 中抽离。
- `src/storage.js` 改为统一走规范化读写：设置、统计、成就、最佳成绩、排行榜、自适应与 spaced 数据在读写时都会被收紧到合法结构。
- `src/timer.js` 改为基于时间戳计算经过时间，减少 `setInterval(1000)` 累加带来的漂移问题，并支持更高频率刷新。
- `app.js` 接入新的 stats / achievements / modes / import-export 模块，回忆测验、N-back 统计、成就结算、备份导入导出改为复用纯逻辑函数。
- `app.js` 为卡牌和模态框补了一轮可访问性改进：卡牌增加 `aria-label` / `aria-pressed`，模态框打开与关闭时补 `aria-hidden` 与焦点恢复。
- `index.html` 调整脚本顺序，确保新增模块先于 `storage.js` / `app.js` 加载。
- 新增测试文件：
  - `__tests__/storage.test.js`
  - `__tests__/timer.test.js`
  - `__tests__/i18n.test.js`
  - `__tests__/import-export.test.js`
  - `__tests__/modes.test.js`
- 更新文档：
  - `README.md` 改正 `deploy.yml` → `pages.yml` 徽章，并补充 `npm install` / `npm run build:css` 开发说明
  - `README.zh-CN.md` 修正 workflow 名称与 `master` / `main` 触发描述，并统一“无打包器但有样式/部署脚本”的口径
  - `docs/architecture.md` 同步当前模块拆分进展
- 更新 `.gitignore`，忽略 `.claude/` 本地 Claude 配置与 worktree 临时目录，避免将本地会话产物误提交到仓库

## 影响范围

- 游戏运行时主逻辑：`app.js`
- 持久化与导入导出：`src/storage.js`、`src/import-export.js`
- 统计 / 成就 / 模式：`src/stats.js`、`src/achievements.js`、`src/modes.js`
- 计时器：`src/timer.js`
- 文档与变更记录：`README.md`、`README.zh-CN.md`、`docs/architecture.md`、`changelog/`

## 验证

- 进行了 `node --check` 级别的语法检查，确保核心 JS 文件无语法错误。
- 当前环境缺少本地 `jest` 可执行文件，完整测试仍需在已执行 `npm install` 的环境中运行：
  - `npm test`
  - `npm run lint`
  - `npm run build:css`
  - `npm run prepare:deploy`

## 备注

- 本轮属于增量重构与加固，`app.js` 仍保留主编排职责；后续可继续按相同方式收缩 UI/i18n 绑定层。
