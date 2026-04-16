# 训练模式说明

Mind Gym 所有训练模式及游戏机制的完整规格说明。

---

## 模式概览

| 模式         | 触发方式           | 主要目标     | 核心指标       |
| ------------ | ------------------ | ------------ | -------------- |
| **经典配对** | 默认模式           | 翻牌配对     | 时间、步数     |
| **限时模式** | 设置切换           | 限时配对     | 时间限制内完成 |
| **每日挑战** | 点击「每日」按钮   | 固定种子挑战 | 与全球玩家比较 |
| **回忆测验** | 通关后自动触发     | 再认记忆     | 精确率、召回率 |
| **N-back**   | 点击「N-back」按钮 | 工作记忆     | 准确率、反应时 |

---

## 经典配对

### 玩法说明

每回合翻开两张卡片，相同则配对成功并锁定，不同则翻回继续。目标是以最少步数、最短时间完成所有配对。

### 难度配置

| 难度 | 网格 | 配对数 | 默认提示数 | 目标时间 |
| ---- | ---- | ------ | ---------- | -------- |
| 简单 | 4×4  | 8 对   | 3          | 60秒     |
| 中等 | 4×5  | 10 对  | 2          | 120秒    |
| 困难 | 6×6  | 18 对  | 1          | 180秒    |

### 结算内容

| 指标         | 说明                               |
| ------------ | ---------------------------------- |
| **用时**     | 从第一次翻牌到完成                 |
| **步数**     | 翻开第二张牌计为一步               |
| **星级评分** | 1-5 星，基于时间、步数、提示、连击 |
| **排行榜**   | 各难度前 3 名                      |
| **最佳成绩** | 各难度个人历史最佳                 |

### 快捷键

| 按键              | 功能         |
| ----------------- | ------------ |
| `N`               | 新开一局     |
| `P`               | 暂停/继续    |
| `H`               | 使用提示     |
| `↑↓←→`            | 导航卡牌     |
| `Enter` / `Space` | 翻开选中卡牌 |

### 状态机实现

```javascript
function onFlip(cardEl) {
  if (paused || isPreviewing || lockBoard) return;
  if (cardEl.classList.contains('flipped')) return;

  // 首次翻牌开始计时
  if (!started) {
    started = true;
    startTimer();
  }

  // 翻牌动画
  cardEl.classList.add('flipped');

  if (!firstCard) {
    firstCard = cardEl;
    return;
  }

  // 第二张牌逻辑
  secondCard = cardEl;
  moves++;

  // 检查匹配...
}
```

---

## 限时模式

### 开启方式

设置 → 玩法 → 选择「限时」

### 配置选项

可自定义各难度的倒计时秒数（10-999 秒）：

| 难度 | 默认时限 |
| ---- | -------- |
| 简单 | 90 秒    |
| 中等 | 150 秒   |
| 困难 | 240 秒   |

### 机制说明

- 倒计时显示在时间区域
- 时间到自动判负
- 弹出失败模态框，可重试或返回

### 实现要点

```javascript
// src/timer.js
function startTimer(params) {
  if (isCountdown && countdownLeft <= 0 && !finished) {
    finished = true;
    clearInterval(id);
    params.onStop();
    params.onTimeUp();
  }
}
```

---

## 每日挑战

### 玩法说明

每日为所有玩家生成相同的牌组，便于公平比较。种子由日期 + 难度 + 卡面主题组合生成。

### 种子算法

```javascript
// src/utils.js
function seedFromDate(dateStr, diff, theme) {
  let h = 2166136261; // FNV offset basis
  const s = `${dateStr}|${diff}|${theme}`;
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0; // FNV prime
  }
  return h >>> 0;
}
```

### 完成状态

- 键名: `memory_match_daily_<date>_<difficulty>`
- 存储: `{ done: true, at: timestamp }`
- 显示: 「已完成」/「未完成」徽章
- 不记录成绩，仅记录完成

### 流程

1. 点击「每日」按钮
2. 选择难度
3. 点击「开始挑战」
4. 完成后标记为已完成

---

## 回忆测验

### 触发时机

通关后自动弹出，可跳过。

### 测试内容

| 组件     | 说明                     |
| -------- | ------------------------ |
| **真项** | 本局出现的卡牌           |
| **伪项** | 本局未出现的卡牌         |
| **任务** | 选择本局出现过的所有卡牌 |

### 构造算法

```javascript
// src/modes.js
function buildRecallItems(params) {
  const truth = params.truthValues; // 本局出现过的卡面
  const pool = params.poolValues; // 所有可选卡面

  const trueCount = Math.min(6, truth.length);
  const falseCandidates = pool.filter(v => !truth.includes(v));

  const trues = shuffle(truth).slice(0, trueCount);
  const falses = shuffle(falseCandidates).slice(0, 9 - trueCount);

  const items = [
    ...trues.map(v => ({ v, correct: true })),
    ...falses.map(v => ({ v, correct: false })),
  ];
  return { items: shuffle(items), correctSet: new Set(trues) };
}
```

### 评分指标

| 指标       | 公式           | 说明                 |
| ---------- | -------------- | -------------------- |
| **精确率** | TP / (TP + FP) | 选中的有多少是正确的 |
| **召回率** | TP / (TP + FN) | 正确的有多少被选中   |

其中：

- TP = 真正例（正确选择的卡牌）
- FP = 假正例（错误选择的卡牌）
- FN = 假负例（漏选的卡牌）

### 数据记录

更新统计: `recallAttempts`, `precisionSum`, `recallSum`

---

## N-back 训练

### 玩法说明

连续呈现刺激（emoji），玩家判断当前刺激是否与 N 步前的刺激相同。

### 配置选项

| 参数 | 可选值            | 说明         |
| ---- | ----------------- | ------------ |
| N    | 1, 2, 3           | 回溯步数     |
| 节奏 | 1200, 900, 700 ms | 刺激呈现间隔 |
| 长度 | 20, 30, 40        | 刺激序列长度 |

### 操作方式

- 按 `J` 键：「与 N 步前相同」
- 不按键：「不同」

### 评分指标

| 指标       | 说明                                   |
| ---------- | -------------------------------------- |
| **准确率** | 正确响应 / 目标总数                    |
| **反应时** | 从刺激呈现到按键的时间（仅命中时统计） |

### 统计数据

```javascript
// app.js 中统计
let nbackTargets = 0; // 目标数（与 N 步前相同的刺激）
let nbackHits = 0; // 命中数（正确按 J）
let nbackMisses = 0; // 漏报数（目标未按 J）
let nbackFalseAlarms = 0; // 虚报数（非目标按 J）
let nbackRtSum = 0; // 反应时累计（ms）
let nbackRtCount = 0; // 反应时样本数
```

### 实现要点

```javascript
// app.js
function tickNBack(N, speed) {
  nbackTimer = setInterval(() => {
    // 检查上一拍是否漏报
    if (nbackIdx >= N) {
      const targetPrev = nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N];
      if (targetPrev && !nbackResponded) nbackMisses++;
    }

    // 前进到下一拍
    nbackIdx++;
    if (nbackIdx >= nbackSeq.length) {
      finishNBack();
      return;
    }

    // 显示刺激
    nbackStimEl.textContent = nbackSeq[nbackIdx];
    nbackResponded = false;
    nbackStepStart = performance.now();

    // 统计目标数
    if (nbackIdx >= N && nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N]) {
      nbackTargets++;
    }
  }, speed);
}
```

---

## 自适应辅助

### 功能说明

根据玩家评分动态调整每局的「预览时间」和「提示次数」。

### 评分范围

| 统计     | 数值 |
| -------- | ---- |
| 初始评分 | 1000 |
| 最低     | 600  |
| 最高     | 1600 |

### 调整策略

| 评分范围    | 预览时间 | 提示调整 |
| ----------- | -------- | -------- |
| < 940       | ≥ 2 秒   | +1       |
| 940 - 1040  | ≥ 1 秒   | 不变     |
| 1040 - 1140 | ≤ 1 秒   | 不变     |
| > 1140      | 0 秒     | -1       |

### 评分更新

```javascript
// app.js
function updateAdaptiveOnEnd(win, stars, diff) {
  if (!settings.adaptive) return;

  const a = loadAdaptive();
  const exp = expectedStarsFor(diff); // 简单:4, 中等:3.5, 困难:3
  const perf = win ? stars : 1.5; // 失败视为较差表现
  const k = 12; // 类 ELO K 因子

  a.rating = Math.max(600, Math.min(1600, Math.round(a.rating + k * (perf - exp))));
  a.lastDiff = diff;

  saveAdaptive(a);
}
```

---

## 间隔复现

### 功能说明

对「易错卡面」施加权重，使其在后续局中更可能出现。

### 权重机制

```javascript
// app.js
function applySpacedAfterWin(theme) {
  if (!settings.spaced) return;

  const weights = loadSpaced(theme);

  // 衰减旧权重
  for (const k of Object.keys(weights)) {
    weights[k] = Math.max(0, weights[k] * 0.8);
  }

  // 累加本局曝光（>1 次才计为"困难"）
  seenCountMap.forEach((cnt, v) => {
    const extra = Math.max(0, cnt - 1);
    if (extra > 0) weights[v] = (weights[v] || 0) + extra;
  });

  saveSpaced(theme, weights);
}
```

### 选卡策略

```javascript
// app.js
function pickWithSpaced(theme, pool, pairs) {
  const weights = loadSpaced(theme);
  const copy = pool.slice();

  // 按权重降序排列
  copy.sort((a, b) => (weights[b.v] || 0) - (weights[a.v] || 0));

  // 取前 40% 高权重卡
  const topN = Math.min(Math.floor(pairs * 0.4), copy.length);
  const picksTop = copy.slice(0, topN);
  const rest = pool.filter(x => !picksTop.some(y => y.v === x.v));

  shuffle(rest);
  return [...picksTop, ...rest.slice(0, pairs - picksTop.length)];
}
```

### 后续规划

- 升级为 SM-2 / Leitner 算法
- 引入复习间隔与掌握度评分
- 支持跨设备同步

---

## 连击系统

### 触发条件

5 秒内连续配对成功。

### 效果

- 连击计数累加
- 连击 ≥2 时显示 Toast 提示
- 本局最高连击被记录
- 影响星级评分计算

### 实现

```javascript
// app.js
const now = performance.now();
if (now - lastMatchAt <= 5000) {
  comboCount++;
} else {
  comboCount = 1;
}
lastMatchAt = now;

if (comboCount >= 2) {
  maxComboThisGame = Math.max(maxComboThisGame, comboCount);
  showCombo(comboCount);
}
```

---

## 星级评分

### 计算公式

```javascript
// src/stats.js
function getRating(elapsedSec, movesCount, diffKey, usedHints, comboMax) {
  const parTime = { easy: 60, medium: 120, hard: 180 }[diffKey];
  const parMoves = { easy: 8, medium: 10, hard: 18 }[diffKey];

  let score = 100;

  // 时间扣分（最多 40 分）
  score -= Math.min(60, (elapsedSec / parTime) * 40);

  // 步数扣分
  score -= Math.max(0, movesCount - parMoves) * 3;

  // 提示扣分
  score -= usedHints * 10;

  // 连击加分（最多 10 分）
  score += Math.min(10, comboMax * 2);

  // 归一化到 1-5 星
  score = Math.max(0, Math.min(100, score));
  return Math.max(1, Math.min(5, Math.ceil(score / 20)));
}
```

### 评分因素

| 因素 | 影响                  |
| ---- | --------------------- |
| 时间 | 超时按比例扣分        |
| 步数 | 超出配对数每步扣 3 分 |
| 提示 | 每次扣 10 分          |
| 连击 | 每次加 2 分           |

---

## 扩展指南

### 添加新模式

1. **逻辑**: 添加纯函数到 `src/modes.js`
2. **状态**: 添加状态变量到 `app.js`
3. **UI**: 添加模态框到 `index.html`，绑定到 `src/ui.js`
4. **国际化**: 添加翻译到 `src/i18n.js`
5. **文档**: 更新本文档添加规格说明
6. **测试**: 创建 `__tests__/newmode.test.js`

### 模式检查清单

- [ ] `modes.js` 中的核心逻辑
- [ ] `app.js` 中的状态管理
- [ ] `index.html` & `ui.js` 中的 UI 集成
- [ ] `i18n.js` 中的本地化（中英文）
- [ ] `stats.js` 中的统计集成
- [ ] `achievements.js` 中的成就钩子
- [ ] 文档已更新
- [ ] 单元测试已编写

---

_有关系统架构，请参见 [架构概览](./architecture.zh-CN.md)。有关数据结构，请参见 [存储模型](./storage.zh-CN.md)。_
