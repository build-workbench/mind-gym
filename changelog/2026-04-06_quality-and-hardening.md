# v1.2.0 质量与健壮性升级

**日期**: 2026-04-06

## 新增 (Added)

### 新模块

| 模块          | 文件                   | 职责                     |
| ------------- | ---------------------- | ------------------------ |
| Stats         | `src/stats.js`         | 统计数据规范化与累计逻辑 |
| Achievements  | `src/achievements.js`  | 成就定义与检查逻辑       |
| Modes         | `src/modes.js`         | N-back 和回忆测验纯逻辑  |
| Import/Export | `src/import-export.js` | 备份数据规范化           |

### 新测试

| 测试文件                          | 说明             |
| --------------------------------- | ---------------- |
| `__tests__/storage.test.js`       | 存储模块测试     |
| `__tests__/timer.test.js`         | 计时器模块测试   |
| `__tests__/i18n.test.js`          | 国际化模块测试   |
| `__tests__/import-export.test.js` | 导入导出模块测试 |
| `__tests__/modes.test.js`         | 训练模式模块测试 |

## 变更 (Changed)

### src/storage.js

- 改为统一走规范化读写
- 设置、统计、成就、最佳成绩、排行榜、自适应与 spaced 数据在读写时收紧到合法结构

### src/timer.js

- 改为基于时间戳计算经过时间
- 减少 `setInterval(1000)` 累加带来的漂移问题
- 支持更高频率刷新

### app.js

- 接入新的 stats / achievements / modes / import-export 模块
- 回忆测验、N-back 统计、成就结算、备份导入导出改为复用纯逻辑函数
- 补充可访问性改进：卡牌增加 `aria-label` / `aria-pressed`，模态框补 `aria-hidden` 与焦点恢复

### index.html

- 调整脚本顺序，确保新增模块先于 `storage.js` / `app.js` 加载

## 修复 (Fixed)

- 修复 `.gitattributes` 无效语法：`glob:*.{html,css,js,json,md}` 改为每行一个模式
- 修复 `.gitignore` 矛盾：移除 `.vscode/` 排除规则（该目录已被 Git 追踪）
- 修复 `.vscode/tasks.json` 引用不存在的脚本：`build` 任务替换为 `format`

## 文档 (Documentation)

- `README.md` 改正 `deploy.yml` → `pages.yml` 徽章，补充开发说明
- `README.zh-CN.md` 修正 workflow 名称与触发描述
- `docs/architecture.md` 同步当前模块拆分进展
- `.gitignore` 忽略 `.claude/` 本地配置

## 影响范围

- 游戏运行时主逻辑：`app.js`
- 持久化与导入导出：`src/storage.js`、`src/import-export.js`
- 统计 / 成就 / 模式：`src/stats.js`、`src/achievements.js`、`src/modes.js`
- 计时器：`src/timer.js`

## 验证 (Verified)

- `npm test`：通过
- `npm run lint`：通过
- `npm run build:css`：成功
- `npm run prepare:deploy`：成功

## 项目状态

代码质量和健壮性大幅提升，模块化程度更高，可测试性更强。
