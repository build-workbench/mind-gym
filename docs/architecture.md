# 架构概览

## 项目形态

| 特性           | 说明                               |
| -------------- | ---------------------------------- |
| **部署方式**   | 纯静态前端，无需后端               |
| **构建工具**   | 无打包器；仅 Tailwind CLI 编译 CSS |
| **框架**       | 无框架，原生 JavaScript (ES2022)   |
| **数据持久化** | localStorage                       |
| **PWA**        | Service Worker + Web App Manifest  |

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      UI Layer                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │ Toolbar  │ │  Grid    │ │ Modals   │ │ Toasts   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    app.js (Orchestrator)                 │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │    │
│  │  │ State       │ │ Game Loop   │ │ Mode Logic  │       │    │
│  │  │ Management  │ │ (flip/match)│ │ (nback/etc) │       │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     src/ Modules                         │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│    │
│  │  │storage │ │ stats  │ │ modes  │ │  i18n  │ │effects ││    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│    │
│  │  │ timer  │ │ pools  │ │confetti│ │  ui    │ │ keys   ││    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    localStorage                          │    │
│  │  settings | stats | achievements | best | leaderboard   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 模块职责

### 核心模块

| 模块             | 文件                  | 职责                                  |
| ---------------- | --------------------- | ------------------------------------- |
| **Orchestrator** | `app.js`              | 游戏主循环、状态机、模式调度、UI 协调 |
| **Storage**      | `src/storage.js`      | localStorage CRUD，数据规范化         |
| **Stats**        | `src/stats.js`        | 统计数据累计与计算                    |
| **Modes**        | `src/modes.js`        | N-back、回忆测验纯逻辑                |
| **Achievements** | `src/achievements.js` | 成就定义与解锁检查                    |

### 支撑模块

| 模块              | 文件                   | 职责                      |
| ----------------- | ---------------------- | ------------------------- |
| **Keys**          | `src/keys.js`          | localStorage 键名常量     |
| **Utils**         | `src/utils.js`         | 洗牌、种子随机、HTML 转义 |
| **I18n**          | `src/i18n.js`          | 国际化词典与语言检测      |
| **Effects**       | `src/effects.js`       | 音效（Web Audio）与震动   |
| **Pools**         | `src/pools.js`         | 卡面素材池                |
| **Timer**         | `src/timer.js`         | 正计时/倒计时管理         |
| **Confetti**      | `src/confetti.js`      | 胜利粒子动画              |
| **UI**            | `src/ui.js`            | DOM 元素绑定              |
| **UI Events**     | `src/ui-events.js`     | 事件监听注册              |
| **Import/Export** | `src/import-export.js` | 备份数据规范化            |

## 数据流

### 初始化流程

```
DOMContentLoaded
    │
    ├── bind DOM elements (ui.js)
    │
    ├── load settings (storage.js)
    │
    ├── apply theme/accent/motion
    │
    ├── apply language (i18n.js)
    │
    ├── register Service Worker
    │
    └── initGame(difficulty)
            │
            ├── createDeck()
            │
            ├── render cards to grid
            │
            └── reset state (moves, timer, hints)
```

### 游戏进行中

```
onFlip(card)
    │
    ├── check lock/pause conditions
    │
    ├── flip card (animation)
    │
    ├── if firstCard:
    │       └── store and return
    │
    ├── if secondCard:
    │       │
    │       ├── match?
    │       │       ├── lock cards
    │       │       ├── update combo
    │       │       ├── check win
    │       │       └── update progress
    │       │
    │       └── no match?
    │               ├── flip back after delay
    │               └── reset combo
    │
    └── reset board state
```

### 结算流程

```
onWin()
    │
    ├── stop timer
    │
    ├── update best score
    │
    ├── update leaderboard
    │
    ├── update stats
    │
    ├── update adaptive rating
    │
    ├── apply spaced reinforcement
    │
    ├── check achievements
    │
    ├── show win modal
    │
    ├── run confetti animation
    │
    └── open recall test

onTimeUp()
    │
    ├── lock board
    │
    ├── show lose modal
    │
    └── update adaptive rating
```

## 状态管理

### 游戏状态变量 (app.js)

```javascript
// 游戏进度
let firstCard = null; // 第一张翻开的牌
let secondCard = null; // 第二张翻开的牌
let lockBoard = false; // 是否锁定棋盘
let moves = 0; // 步数
let matchedPairs = 0; // 已配对数
let started = false; // 游戏是否开始

// 计时
let elapsed = 0; // 已用时间（秒）
let countdownLeft = 0; // 倒计时剩余
let timerId = null; // 定时器 ID

// 难度与设置
let currentDifficulty = 'easy';
let settings = { ...DEFAULT_SETTINGS };

// 特殊状态
let paused = false;
let isPreviewing = false;
let timeUp = false;
let hintsLeft = 0;
let hintsUsed = 0;

// 连击系统
let comboCount = 0;
let maxComboThisGame = 0;
let lastMatchAt = 0;

// 回忆测验
let seenCountMap = new Map();
let lastGameValues = [];
let recallCorrectSet = new Set();

// N-back 模式
let nbackRunning = false;
let nbackTimer = null;
let nbackSeq = [];
let nbackIdx = 0;
// ... 更多 N-back 状态

// 每日挑战
let dailyActive = false;
let dailySeed = 0;
```

## 架构改进方向

当前 `app.js` 仍然较大（~2500 行），可按以下方向继续优化：

### 第一阶段：模块内分区 ✅

- [x] 抽出 `stats.js`、`achievements.js`、`modes.js`、`import-export.js`
- [x] 纯函数可独立测试

### 第二阶段：ES Modules 迁移

- [ ] 将 UMD 模块改为 ES Modules
- [ ] `index.html` 使用 `type="module"` 加载
- [ ] 支持 tree-shaking（如需打包）

### 第三阶段：复杂模式独立化

- [ ] N-back 模式独立为 `src/nback.js`
- [ ] 回忆测验独立为 `src/recall.js`
- [ ] 每日挑战独立为 `src/daily.js`
- [ ] 自适应系统独立为 `src/adaptive.js`

## 扩展指南

### 添加新训练模式

1. 在 `src/modes.js` 中添加模式逻辑
2. 在 `app.js` 中添加模式状态和 UI 控制
3. 在 `src/i18n.js` 中添加文案
4. 在 `index.html` 中添加模态框（如需要）
5. 编写单元测试

### 添加新卡面主题

1. 在 `src/pools.js` 中添加素材池
2. 在 `src/i18n.js` 中添加卡面标签
3. 在 `src/import-export.js` 中更新 `VALID_THEMES`
4. 更新文档

### 添加新成就

1. 在 `src/achievements.js` 的 `achievementsDef` 中添加定义
2. 在 `src/i18n.js` 中添加 `titleKey` 和 `descKey` 对应的文案
3. 在 `checkAchievementsOnWin` 中添加检查逻辑
