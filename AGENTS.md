# AGENTS.md — Mind Gym

纯前端、零依赖的浏览器端认知训练 PWA（经典配对、N-back、每日挑战、FSRS 回忆测验），开箱即玩、离线可用、数据全存 localStorage。

## 常用命令

- `npm run dev` — 本地运行（`npx serve . -p 3000`，访问 http://localhost:3000，纯静态无构建步骤）
- `npm test` / `npm run test:watch` — 运行 Jest 测试（jsdom 环境，测试文件在 `__tests__/`）
- `npm run test:coverage` — 带覆盖率测试，强制执行 `jest.config.cjs` 的门槛；CI 同款为 `npx jest --coverage --runInBand`
- `npm run lint` — prettier --check + ESLint 9（flat config）双检查；`npm run lint:fix` 自动修复
- `npm run format` — prettier 写回格式化
- `npm run build:css` — Tailwind 编译 `styles/app.css` → `assets/app.css`（minify）；`build:css:dev` 为非压缩版
- `npm run prepare:deploy` — 生产构建到 `dist/`（terser 压缩 JS + Tailwind + 图标生成），GitHub Pages 部署即用此脚本
- `npm run validate` — lint + test + build:css 一键校验
- `npm run clean` — 清理 `dist/` 与 `coverage/`

CI（`.github/workflows/ci.yml`）：Lint → Test（Node 22/24 矩阵，强制覆盖率）→ Build CSS（验证 `assets/app.css` 产出）→ CI Passed 汇总；`.github/workflows/pages.yml` 在 CI 通过后执行 `prepare-deploy.sh` 部署 GitHub Pages。

## 代码结构

- `index.html` — 单页入口，底部以 classic `<script>` 按固定顺序加载全部 src 模块（无打包器），顺序即依赖关系
- `app.js` — 主入口/装配层，串联各模块与 UI
- `src/` — 领域模块（全局命名空间式，非 ES Module）：`game-state.js`/`game-manager.js`/`nback-state.js`/`recall-state.js`/`daily.js` 为各玩法状态与流程；`pipeline/win-pipeline.js` 为通关后处理管道；`ui/renderer.js`、`ui.js`、`ui-events.js` 负责渲染与交互；`storage.js`、`settings-manager.js`、`settings-defaults.js`、`import-export.js` 负责持久化、设置与 JSON 备份；`fsrs.js` 实现 FSRS-4.5 间隔重复算法；其余为 stats/achievements/timer/effects/confetti/i18n/modal-manager/pools/modes/keys/utils/shared/app-init
- `styles/app.css` — Tailwind 源文件（`assets/app.css` 是编译产物）
- `sw.js` — Service Worker：多级缓存策略 + `PRECACHE_ASSETS` 预缓存清单，`CACHE_VERSION` 当前与 package.json 版本一致（v1.11.1）
- `manifest.webmanifest` / `offline.html` / `404.html` / `browserconfig.xml` — PWA 与站点配套
- `__tests__/` — 23 个 Jest 套件，文件名与 src 模块一一对应
- `scripts/` — `prepare-deploy.sh`（生产构建）、`generate-icons.*`（PWA 图标生成）
- `assets/` — 图标、截图与编译后的 `app.css`

## 关键约束

- 零运行时依赖、无打包器：新增/重命名 JS 模块必须同步维护 `index.html` 的 script 加载顺序（顺序错误会破坏 UMD 工厂对全局的捕获，`script-load-order.test.js` 有守护）和 `sw.js` 的 `PRECACHE_ASSETS`
- 覆盖率门槛（本地与 CI 一致，见 `jest.config.cjs`）：statements 50 / lines 50 / functions 55 / branches 40，低于阈值测试失败
- 离线优先 PWA：新增/变更静态资源需更新 `sw.js` 预缓存清单并递增 `CACHE_VERSION`，否则线上缓存不刷新
- 改样式只改 `styles/app.css`，再运行 `npm run build:css`；不要手改 `assets/app.css`
- 引擎要求 Node >= 18、npm >= 9（`package.json` engines）；代码风格遵循 package.json 内联 prettier 配置（singleQuote、printWidth 100 等）

## 文档约定

- CHANGELOG.md：面向用户的变更在合入时写入 [Unreleased]（Keep a Changelog zh-CN 格式）
- 文档全中文
