# AGENTS.md

AI 编码助手指南 (Claude Code, Cursor, GitHub Copilot 等)

---

## 项目状态

> **版本**: 1.9.0 | **状态**: 维护模式

本项目处于维护模式，无新增功能计划。

---

## 核心规则

### 开发流程

1. **先读规范** — 修改代码前，先阅读 `openspec/specs/` 中的相关规范
2. **规范优先** — 新功能或接口变更必须通过 OpenSpec 流程 (`/opsx:propose`)
3. **严格遵守** — 代码 100% 遵守 Spec 定义，不添加未定义功能
4. **测试验证** — 根据 Spec 验收标准编写测试

### 常用命令

```bash
npm test          # 运行测试
npm run lint      # 检查代码格式
npm run format    # 自动格式化
npm run build:css # 编译 CSS
```

---

## 架构概览

**Mind Gym** 是一个零依赖的浏览器端记忆训练 PWA (Vanilla JS + Tailwind CSS)。

### 模块加载顺序

```
src/keys.js → src/utils.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/i18n.js → src/effects.js
→ src/pools.js → src/timer.js → src/confetti.js → src/ui-events.js → src/ui.js → app.js
```

### 核心文件

| 文件             | 职责                         |
| ---------------- | ---------------------------- |
| `app.js`         | 游戏主循环、状态机、模式逻辑 |
| `src/storage.js` | localStorage CRUD            |
| `src/fsrs.js`    | FSRS-4.5 间隔重复算法        |
| `sw.js`          | Service Worker               |

### 游戏模式

1. **经典配对** — 翻牌匹配
2. **倒计时** — 限时挑战
3. **每日挑战** — 全球相同牌组
4. **N-back** — 工作记忆训练
5. **延迟回忆** — 游戏后识别测试

---

## 目录结构

| 目录              | 用途                    |
| ----------------- | ----------------------- |
| `openspec/specs/` | 能力规范 (单一真相来源) |
| `openspec/rfc/`   | 架构决策记录            |
| `docs/`           | 用户文档                |
| `changelog/`      | 版本历史                |

---

## 代码风格

- **Prettier**: 单引号, 100 字符行宽, 2 空格缩进
- **提交格式**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)

---

## 详细文档

完整开发指南请参考 [`CLAUDE.md`](./CLAUDE.md)
