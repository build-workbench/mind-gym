# v1.2.1 代码优化与国际化完善

**日期**: 2026-07-15

## 修复 (Fixed)

| 问题                                | 修复方式                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `.gitattributes` 无效语法           | `glob:*.{html,css,js,json,md}` 改为每行一个模式（git 不支持 glob: 前缀） |
| `.gitignore` 矛盾                   | 移除 `.vscode/` 排除规则（该目录已被 Git 追踪，包含共享配置）            |
| `.vscode/tasks.json` 引用不存在脚本 | `build` 任务替换为 `format`（项目无构建步骤）                            |
| `importDataFromObj` 空 catch 块     | 添加 `logError` 错误日志记录                                             |

## 新增 (Added)

### 国际化 (i18n)

- 成就定义国际化：`achievementsDef` 从硬编码中文改为使用 i18n key
- 成就解锁提示国际化：`新解锁 N 项` 改为 `i18n().achNewUnlock`
- 最佳成绩单位国际化：硬编码 `步` 改为 `i18n().bestSteps`
- 新增 14 个 i18n 键（中英文）

### 测试

- `__tests__/helpers.test.js`：7 个测试用例，覆盖 DEFAULT_SETTINGS、adaptiveKey、loadAdaptive 往返、getAdaptiveAssist

### 工程质量

- `package.json` 补充元数据：`description`、`keywords`、`author`、`license`、`homepage`、`repository`
- 添加 `lint` / `format` 脚本：使用 Prettier 做代码格式检查与自动格式化
- 添加 `.prettierrc`：统一格式化配置
- `README.md` 完善：添加 CI/Deploy 徽章、项目结构树、Development 部分

## 变更 (Changed)

### 代码去重与重构

| 优化                           | 说明                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| 提取 `showModal` / `hideModal` | 替换 ~20 处重复的 `classList.add/remove('hidden'/'flex')` 模式 |
| 提取 `buildDeckItems`          | 消除 `createDeck` 中日常/普通模式的重复牌组构建逻辑            |

## 验证 (Verified)

- `npm test`：全部测试通过

## 项目状态

代码更简洁，国际化更完整，工程质量进一步提升。
