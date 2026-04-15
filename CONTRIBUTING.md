# Contributing to Mind Gym

感谢你对 Mind Gym 的关注！欢迎通过 Issue 和 Pull Request 参与贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [Pull Request 流程](#pull-request-流程)
- [测试](#测试)
- [文档](#文档)

## 行为准则

- 尊重所有贡献者
- 建设性的讨论和代码审查
- 包容和友好的社区氛围

## 如何贡献

### 报告 Bug

1. 在 [Issues](https://github.com/LessUp/mind-gym/issues) 中搜索是否已有相同问题
2. 如果没有，创建新 Issue，包含：
   - 清晰的标题描述问题
   - 复现步骤
   - 预期行为与实际行为
   - 浏览器和版本信息
   - 截图（如有帮助）

### 提出新功能

1. 在 Issues 中描述你的想法
2. 讨论实现方案和可行性
3. 获得维护者确认后再开始实现

### 提交代码

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 进行修改并确保测试通过
4. 提交 Pull Request

## 开发环境设置

```bash
# 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/mind-gym.git
cd mind-gym

# 安装开发依赖
npm install

# 启动本地服务器
npx serve .
```

### 可用命令

| 命令                     | 说明               |
| ------------------------ | ------------------ |
| `npm test`               | 运行 Jest 单元测试 |
| `npm run lint`           | 检查代码格式       |
| `npm run format`         | 自动格式化代码     |
| `npm run build:css`      | 编译 Tailwind CSS  |
| `npm run prepare:deploy` | 准备部署包         |

## 项目结构

```
mind-gym/
├── index.html          # 主页面
├── app.js              # 游戏主逻辑
├── sw.js               # Service Worker
├── src/                # 模块化源文件
│   ├── keys.js         # 存储键名
│   ├── utils.js        # 工具函数
│   ├── storage.js      # 数据持久化
│   ├── stats.js        # 统计逻辑
│   ├── achievements.js # 成就系统
│   ├── modes.js        # 训练模式
│   ├── import-export.js # 导入导出
│   ├── i18n.js         # 国际化
│   ├── effects.js      # 音效震动
│   ├── pools.js        # 卡面资源
│   ├── timer.js        # 计时器
│   ├── confetti.js     # 动画效果
│   ├── ui.js           # DOM 绑定
│   └── ui-events.js    # 事件绑定
├── __tests__/          # 单元测试
├── docs/               # 文档
└── changelog/          # 变更日志
```

## 代码规范

### JavaScript 风格

- 使用项目现有代码风格
- 运行 `npm run format` 自动格式化
- 遵循 `.editorconfig` 中的配置：
  - 2 空格缩进
  - 单引号字符串
  - 120 字符行宽
  - 尾随逗号

### 通用原则

- **保持简洁**：避免过度抽象
- **单一职责**：每个函数只做一件事
- **添加注释**：复杂逻辑需要说明
- **错误处理**：使用 try-catch 包裹可能失败的操作

### 新增功能

- 添加对应的单元测试
- 更新相关文档
- 在 `src/` 目录下创建新模块而非修改 `app.js`
- 导出纯函数以便测试

## 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>
```

### 类型 (type)

| 类型       | 说明                      |
| ---------- | ------------------------- |
| `feat`     | 新功能或新训练模式        |
| `fix`      | Bug 修复                  |
| `docs`     | 文档更新                  |
| `style`    | UI/样式调整（不影响逻辑） |
| `refactor` | 代码重构（不修改功能）    |
| `test`     | 测试相关                  |
| `chore`    | 构建、工具、依赖更新      |
| `ci`       | CI/CD 配置                |

### 作用域 (scope)

- `ci` — CI 配置
- `deps` — 依赖更新
- `docs` — 文档
- `ui` — 用户界面
- `gameplay` — 游戏逻辑

### 示例

```
feat(gameplay): add position N-back mode
fix(ui): resolve card flip animation on Safari
docs: update architecture diagram
style(ui): adjust modal padding
test(storage): add edge case tests for leaderboard
```

## Pull Request 流程

1. **创建分支**：从 `master` 创建特性分支
2. **进行修改**：遵循代码规范
3. **运行测试**：确保 `npm test` 通过
4. **更新文档**：如有必要，更新 README 或 docs/
5. **提交 PR**：清晰描述修改内容和原因
6. **代码审查**：响应审查意见

### PR 标题

PR 标题应遵循提交信息规范，例如：

- `feat: add sound pack selector`
- `fix: resolve timer drift issue`

## 测试

### 运行测试

```bash
npm test
```

### 编写测试

- 测试文件放在 `__tests__/` 目录
- 文件命名：`<module>.test.js`
- 测试纯函数而非 DOM 操作
- 使用 Jest 的 `describe` 和 `test` 组织测试

### 测试覆盖

重点关注以下模块的测试：

- `src/storage.js` — 数据读写
- `src/stats.js` — 统计计算
- `src/modes.js` — 训练模式逻辑
- `src/import-export.js` — 数据规范化

## 文档

### 更新文档

- **README** — 功能变更、新命令
- **docs/** — 架构变更、新模式说明
- **changelog/** — 每次发布创建新文件

### 文档风格

- 中文为主，必要时保留英文术语
- 使用 Markdown 格式
- 代码块指定语言
- 表格用于结构化数据

## 需要帮助？

- 查看 [文档](docs/)
- 在 [Discussions](https://github.com/LessUp/mind-gym/discussions) 提问
- 创建 [Issue](https://github.com/LessUp/mind-gym/issues)

---

再次感谢你的贡献！🎉
