# 训练模式说明

本文档详细说明 Mind Gym 的所有训练模式及其实现。

## 模式概览

| 模式     | 触发方式           | 主要目标     | 核心指标       |
| -------- | ------------------ | ------------ | -------------- |
| 经典配对 | 默认模式           | 翻牌配对     | 时间、步数     |
| 限时模式 | 设置切换           | 限时配对     | 时间限制内完成 |
| 每日挑战 | 点击「每日」按钮   | 固定种子挑战 | 与全球玩家比较 |
| 回忆测验 | 通关后自动触发     | 再认记忆     | 精确率、召回率 |
| N-back   | 点击「N-back」按钮 | 工作记忆     | 准确率、反应时 |

---

## 经典配对（Classic）

### 玩法说明

翻开两张卡片，若相同则配对成功并锁定，否则翻回继续。目标是以最少步数、最短时间完成所有配对。

### 难度配置

| 难度   | 网格 | 配对数 | 默认提示数 |
| ------ | ---- | ------ | ---------- |
| Easy   | 4×4  | 8 对   | 3          |
| Medium | 4×5  | 10 对  | 2          |
| Hard   | 6×6  | 18 对  | 1          |

### 结算内容

- **用时** — 从第一次翻牌到完成
- **步数** — 翻开第二张牌计为一步
- **星级评分** — 基于时间、步数、提示、连击综合评定
- **排行榜** — 当前难度前 3 名
- **最佳成绩** — 当前难度历史最佳

### 快捷键

| 按键              | 功能         |
| ----------------- | ------------ |
| `N`               | 新开一局     |
| `P`               | 暂停/继续    |
| `H`               | 使用提示     |
| `↑↓←→`            | 导航卡牌     |
| `Enter` / `Space` | 翻开选中卡牌 |

### 实现要点

```javascript
// 翻牌状态机 (app.js)
function onFlip(cardEl) {
  if (paused || isPreviewing || lockBoard) return;
  if (cardEl.classList.contains('flipped')) return;

  // 开始计时
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

  // 第二张牌
  secondCard = cardEl;
  moves++;

  // 检查匹配...
}
```

---

## 限时模式（Countdown）

### 开启方式

设置 → 玩法 → 选择「限时」

### 配置选项

在设置中可自定义各难度的倒计时秒数（10-999 秒）：

| 难度   | 默认时限 |
| ------ | -------- |
| Easy   | 90 秒    |
| Medium | 150 秒   |
| Hard   | 240 秒   |

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

## 每日挑战（Daily Challenge）

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

- 以 `memory_match_daily_<date>_<difficulty>` 记录
- 显示「已完成」/「未完成」状态
- 不记录成绩，仅记录完成

### 流程

1. 点击「每日」按钮
2. 选择难度
3. 点击「开始挑战」
4. 完成后标记为已完成

---

## 回忆测验（Delayed Recall）

### 触发时机

通关后自动弹出，可跳过。

### 测试内容

- 从本局出现的卡面中选取若干「真项」
- 从未出现的卡面中选取若干「伪项」
- 玩家勾选「本局出现过」的项

### 构造算法

```javascript
// src/modes.js
function buildRecallItems(params) {
  const truth = params.truthValues; // 本局出现过的卡面
  const pool = params.poolValues; // 所有可选卡面

  const trueCount = Math.min(6, truth.length);
  const falseCandidates = pool.filter((v) => !truth.includes(v));

  const trues = shuffle(truth).slice(0, trueCount);
  const falses = shuffle(falseCandidates).slice(0, 9 - trueCount);

  const items = [...trues.map((v) => ({ v, correct: true })), ...falses.map((v) => ({ v, correct: false }))];
  return { items: shuffle(items), correctSet: new Set(trues) };
}
```

### 评分指标

| 指标   | 公式           | 说明                 |
| ------ | -------------- | -------------------- |
| 精确率 | TP / (TP + FP) | 选中的有多少是正确的 |
| 召回率 | TP / (TP + FN) | 正确的有多少被选中   |

### 数据记录

写入 `stats` 的 `recallAttempts`、`precisionSum`、`recallSum`。

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

- 按 `J` 键表示「与 N 步前相同」
- 不按键表示「不同」

### 评分指标

| 指标   | 说明                                   |
| ------ | -------------------------------------- |
| 准确率 | 正确响应 / 目标总数                    |
| 反应时 | 从刺激呈现到按键的时间（仅命中时统计） |

### 统计内容

```javascript
// app.js
let nbackTargets = 0; // 目标数（与 N 步前相同的刺激）
let nbackHits = 0; // 命中数（正确按 J）
let nbackMisses = 0; // 漏报数（目标未按 J）
let nbackFalseAlarms = 0; // 虚报数（非目标按 J）
let nbackRtSum = 0; // 反应时累计
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

## 自适应辅助（Adaptive Assist）

### 功能说明

根据玩家评分动态调整每局的「预览时间」和「提示次数」。

### 评分范围

- 初始评分：1000
- 范围：600 ~ 1600

### 调整策略

| 评分范围    | 预览时间 | 提示调整 |
| ----------- | -------- | -------- |
| < 940       | ≥ 2 秒   | +1       |
| 940 ~ 1040  | ≥ 1 秒   | 不变     |
| 1040 ~ 1140 | ≤ 1 秒   | 不变     |
| > 1140      | 0 秒     | -1       |

### 结算更新

```javascript
// app.js
function updateAdaptiveOnEnd(win, stars, diff) {
  if (!settings.adaptive) return;

  const a = loadAdaptive();
  const exp = expectedStarsFor(diff); // easy:4, medium:3.5, hard:3
  const perf = win ? stars : 1.5; // 失败视为较差表现
  const k = 12; // ELO-like K 因子

  a.rating = Math.max(600, Math.min(1600, Math.round(a.rating + k * (perf - exp))));
  a.lastDiff = diff;

  saveAdaptive(a);
}
```

---

## 间隔复现（Spaced Reinforcement）

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
  const rest = pool.filter((x) => !picksTop.some((y) => y.v === x.v));

  shuffle(rest);
  return [...picksTop, ...rest.slice(0, pairs - picksTop.length)];
}
```

### 后续规划

- 升级为 SM-2 / Leitner 算法
- 引入复习间隔与掌握度评分
- 支持跨设备同步

---

## 连击系统（Combo）

### 触发条件

5 秒内连续配对成功。

### 效果

- 连击计数累加
- 显示连击 Toast
- 结算时统计最高连击
- 影响星级评分

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

| 因素 | 影响            |
| ---- | --------------- |
| 时间 | 超时按比例扣分  |
| 步数 | 超出配对数扣分  |
| 提示 | 每次扣 10 分    |
| 连击 | 每次连击加 2 分 |
