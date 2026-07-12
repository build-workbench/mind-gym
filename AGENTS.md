# AGENTS.md

AI 编码助手指南 (Claude Code, Cursor, GitHub Copilot, Devin 等)。

---

## 项目状态

> **版本**: 1.11.0 | **状态**: 维护模式

本项目处于维护模式，无新增功能计划。仅接受 Bug 修复和文档改进。

---

## 核心规则

1. **先读规范** — 修改代码前，先阅读 `openspec/specs/` 中的相关规范
2. **严格遵守** — 代码 100% 遵守 Spec 定义，不添加未定义功能 (No Gold-Plating)
3. **测试验证** — 根据 Spec 验收标准编写测试
4. **不编辑生成产物** — `assets/app.css` 由 `styles/app.css` 编译而来，禁止直接编辑

---

## 常用命令

```bash
npm test              # 运行 Jest 测试 (386 个用例)
npm run test:coverage # 含覆盖率报告
npx jest __tests__/helpers.test.js  # 跑单个测试文件
npm run lint          # Prettier 格式检查
npm run format        # 自动格式化
npm run build:css     # 编译 Tailwind CSS → assets/app.css (minified)
npm run prepare:deploy # build:css + 拷贝到 dist/
npm run validate      # lint + test + build 一键验证
```

---

## 架构概览

**Mind Gym** 是一个零依赖的浏览器端记忆训练 PWA (Vanilla JS + Tailwind CSS)。无打包器，静态文件直接交付。

### 三层状态架构

```
┌─────────────────────────────────────────────┐
│           Settings (Persistent)              │
│  sound, vibrate, theme, accent, volume...   │
│  → src/settings-manager.js                   │
│  → Auto-persist to localStorage             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      GameState (Runtime Core State)          │
│  difficulty, started, paused, elapsed...     │
│  [Delegates to GameManager for card state]   │
│  → src/game-state.js                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    ModeState (Mode-Specific, On-Demand)      │
│                                             │
│  NBackState: running, timer, seq, idx...    │
│  RecallState: lastGameValues, correctSet    │
│  → src/nback-state.js, src/recall-state.js  │
└─────────────────────────────────────────────┘
```

放置规则：跨刷新保留 → Settings；只服务当前对局 → GameState；只属于某训练模式 → ModeState。

### 模块加载顺序 (index.html script tags)

```
src/keys.js → src/utils.js → src/shared.js → src/stats.js → src/achievements.js → src/modes.js
→ src/import-export.js → src/storage.js → src/fsrs.js → src/game-manager.js → src/modal-manager.js
→ src/i18n.js → src/effects.js → src/pools.js → src/timer.js → src/confetti.js
→ src/ui-events.js → src/ui.js → app.js
```

每个 `src/` 模块通过 UMD 模式暴露全局对象 (如 `window.RememberStorage`)。`app.js` 是消费所有模块的游戏编排器。

### 核心模块职责

| 模块                      | 职责                                                 | 导出对象               |
| ------------------------- | ---------------------------------------------------- | ---------------------- |
| `app.js`                  | 游戏主循环、状态机、模式逻辑                         | 全局函数               |
| `src/game-state.js`       | 游戏状态协调器                                       | `RememberGameState`    |
| `src/game-manager.js`     | 卡牌翻转/匹配/胜利逻辑 (深度模块)                    | `RememberGameManager`  |
| `src/modal-manager.js`    | 模态框管理 + 焦点陷阱 (深度模块)                     | `RememberModalManager` |
| `src/settings-manager.js` | 用户设置管理 (auto-persist)                          | `RememberSettings`     |
| `src/nback-state.js`      | N-back 模式状态                                      | `NBackState`           |
| `src/recall-state.js`     | 延迟回忆模式状态                                     | `RecallState`          |
| `src/storage.js`          | localStorage CRUD                                    | `RememberStorage`      |
| `src/stats.js`            | 统计聚合与归一化                                     | `RememberStats`        |
| `src/achievements.js`     | 成就定义与检查逻辑                                   | `RememberAchievements` |
| `src/modes.js`            | N-back 与 recall 的纯逻辑                            | `RememberModes`        |
| `src/import-export.js`    | 备份/恢复数据归一化                                  | `RememberImportExport` |
| `src/fsrs.js`             | FSRS-4.5 间隔重复算法                                | `RememberFSRS`         |
| `src/adaptive.js`         | Elo 自适应评分 (600-1600)                            | `RememberAdaptive`     |
| `src/i18n.js`             | zh/en 词典，浏览器语言自动检测                       | `RememberI18n`         |
| `src/ui.js`               | DOM 元素绑定 (单一真相来源)                          | `RememberUI`           |
| `src/ui-events.js`        | 事件监听器注册                                       | `RememberUIEvents`     |
| `src/pools.js`            | 卡面资源池 (emoji/数字/字母/形状)                    | `RememberPools`        |
| `src/timer.js`            | 倒计时与计时管理                                     | `RememberTimer`        |
| `src/effects.js`          | Web Audio 音效 + Vibration API                       | `RememberEffects`      |
| `src/confetti.js`         | Canvas 2D 胜利动画                                   | `RememberConfetti`     |
| `src/shared.js`           | 共享工具 (isPlainObject/clampInt)                    | `RememberShared`       |
| `sw.js`                   | Service Worker: 资源 cache-first，导航 network-first | —                      |

### 游戏模式

1. **经典配对** — 翻牌匹配，记录时间与步数
2. **倒计时** — 各难度限时挑战
3. **每日挑战** — 由 日期+难度+主题 生成种子，全球同牌组
4. **N-back** — 判断当前卡是否与 N 步前相同 (热键: J)
5. **延迟回忆** — 对局后测试哪些卡出现过

---

## 深度模块设计原则

**深度模块** = 小接口 + 大实现

```javascript
// src/game-manager.js — 仅 3 个公开方法，隐藏完整状态机
window.RememberGameManager = {
  flip(cardIndex, cardValue), // Returns { matched, won, state }
  reset(totalPairs),
  getState(),
};
```

隐藏复杂度：翻牌校验 / 匹配检测 / 胜利判定 / 状态转移 / 步数计数。

益处：

1. **Locality** — 变更、Bug、知识集中一处
2. **Leverage** — 每单位接口提供高能力
3. **Testability** — 可独立测试每个模块

---

## localStorage 键名规范

所有键使用 `memory_match_` 前缀：

| 键名模式                           | 用途                  |
| ---------------------------------- | --------------------- |
| `_settings`                        | 用户设置              |
| `_best_<difficulty>`               | 各难度最佳成绩        |
| `_lb_<difficulty>`                 | 各难度排行榜          |
| `_achievements`                    | 成就数据              |
| `_stats`                           | 统计数据              |
| `_adaptive`                        | 自适应评分 (600-1600) |
| `_mastery_<theme>`                 | FSRS 掌握度数据       |
| `_daily_<YYYY-MM-DD>_<difficulty>` | 每日挑战完成状态      |

---

## 目录结构

| 目录              | 用途                        |
| ----------------- | --------------------------- |
| `openspec/specs/` | 能力规范 (单一真相来源)     |
| `openspec/rfc/`   | 架构决策记录 (ADR)          |
| `docs/`           | 用户文档 (VitePress 双语站) |
| `changelog/`      | 版本历史                    |
| `__tests__/`      | Jest 测试文件               |
| `scripts/`        | 构建与图标生成脚本          |
| `styles/`         | Tailwind CSS 源文件         |
| `assets/`         | 编译产物 (勿手改)           |

---

## 代码风格

- **Prettier**: 单引号, 100 字符行宽, 2 空格缩进, LF, trailing comma es5
- **JS**: UMD 模式暴露全局 (`window.RememberXxx`)，ES2022 特性可用
- **提交格式**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `ci:`, `spec:`)
- **允许的 Scope**: `ci`, `deps`, `docs`, `ui`, `gameplay`, `tooling`, `storage`, `i18n`, `pwa`

---

## 测试策略

- 总用例: 386 (27 个测试文件)
- 关键模块覆盖: storage, stats, fsrs, game-state, game-manager, modal-manager
- 模式: 测试深度模块的**接口**，不测内部实现
- 环境: Jest + jsdom，mock localStorage 与 DOM

```javascript
describe('GameManager', () => {
  test('flip returns match result', () => {
    const gm = new GameManager(6);
    const result = gm.flip(0, 'card1');
    expect(result).toHaveProperty('matched');
    expect(result).toHaveProperty('won');
    expect(result).toHaveProperty('state');
  });
});
```

---

## CSS 工作流

源文件 `styles/app.css` → Tailwind CLI 编译到 `assets/app.css`。
编辑后必须运行 `npm run build:css`。**禁止直接编辑 `assets/app.css`。**

---

## 部署

GitHub Actions (`docs-pages.yml`) 在 push 到 master 时：lint → test → `prepare:deploy` → 上传 `dist/` 与 docs 构建产物到 GitHub Pages。

---

## 国际化

- 代码与注释: 英文
- UI: 通过 i18n 系统支持中英双语，浏览器语言自动检测
- 用户文档: `docs/zh/` 与 `docs/en/` 双语

---

## 关键架构决策 (ADR)

详见 `openspec/rfc/`：

1. **ADR-0001**: 三层状态架构 (Settings → GameState → ModeState)
2. **ADR-0002**: i18n 策略 (浏览器自动检测，zh/en 词典)
3. **ADR-0003**: PWA 离线优先，Service Worker cache-first 策略
4. **ADR-0004**: app.js 重构记录

---

## 相关文档

- [README.md](./README.md) — 项目介绍
- [CONTEXT.md](./CONTEXT.md) — 领域术语
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 贡献指南
- [openspec/specs/](./openspec/specs/) — 技术规范
- [openspec/rfc/](./openspec/rfc/) — 架构决策记录
- [docs/](./docs/) — 用户文档站
