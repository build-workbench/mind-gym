# 本地存储与数据模型

Mind Gym 的 localStorage 数据结构、键名约定和持久化机制的详细说明。

---

## 键名约定

### 前缀

所有键以 `memory_match_` 为前缀，避免与其他应用冲突。

### 完整键列表

| 键名 | 类型 | 说明 |
|------|------|------|
| `memory_match_settings` | Object | 用户偏好设置 |
| `memory_match_best_<difficulty>` | Object | 各难度最佳成绩 |
| `memory_match_lb_<difficulty>` | Array | 各难度排行榜 |
| `memory_match_achievements` | Object | 成就解锁状态 |
| `memory_match_stats` | Object | 累计统计数据 |
| `memory_match_adaptive` | Object | 自适应难度评分 |
| `memory_match_spaced_<theme>` | Object | 间隔复现权重 |
| `memory_match_daily_<date>_<difficulty>` | Object | 每日挑战完成状态 |
| `memory_match_onboarding_v1` | String | 新手引导完成标记 |

### 参数取值

- `<difficulty>`: `easy` | `medium` | `hard`
- `<theme>`: `emoji` | `numbers` | `letters` | `shapes` | `colors`
- `<date>`: 格式 `YYYY-MM-DD`（如 `2026-04-16`）

---

## 数据存储详解

### Settings（设置）

```typescript
interface Settings {
  sound: boolean;              // 是否启用音效
  vibrate: boolean;            // 是否启用震动
  previewSeconds: number;      // 开局预览秒数 (0-5)
  accent: 'indigo' | 'emerald' | 'rose';  // 主题强调色
  theme: 'auto' | 'light' | 'dark';       // 配色方案
  motion: 'auto' | 'on' | 'off';          // 动画偏好
  volume: number;              // 音量 (0-1)
  soundPack: 'clear' | 'electro' | 'soft'; // 音效包
  cardFace: 'emoji' | 'numbers' | 'letters' | 'shapes' | 'colors';
  gameMode: 'classic' | 'countdown';
  countdown: {
    easy: number;              // 简单限时 (10-999 秒)
    medium: number;            // 中等限时
    hard: number;              // 困难限时
  };
  language: 'auto' | 'zh' | 'en';
  adaptive: boolean;           // 自适应辅助
  spaced: boolean;             // 间隔复现
}
```

**默认值** (`DEFAULT_SETTINGS`):

```javascript
{
  sound: true,
  vibrate: true,
  previewSeconds: 1,
  accent: 'indigo',
  theme: 'auto',
  motion: 'auto',
  volume: 0.5,
  soundPack: 'clear',
  cardFace: 'emoji',
  gameMode: 'classic',
  countdown: { easy: 90, medium: 150, hard: 240 },
  language: 'auto',
  adaptive: false,
  spaced: false
}
```

### Best Score（最佳成绩）

```typescript
interface BestScore {
  time: number;    // 用时（秒）
  moves: number;   // 步数
}
```

**示例**:

```json
{
  "time": 45,
  "moves": 12
}
```

### Leaderboard（排行榜）

```typescript
type Leaderboard = LeaderboardEntry[];

interface LeaderboardEntry {
  time: number;    // 用时（秒）
  moves: number;   // 步数
  at: number;      // 完成时间戳
}
```

- 最多保留 3 条记录
- 排序规则: time → moves → at

**示例**:

```json
[
  { "time": 45, "moves": 12, "at": 1713264000000 },
  { "time": 52, "moves": 10, "at": 1713350400000 },
  { "time": 58, "moves": 15, "at": 1713436800000 }
]
```

### Achievements（成就）

```typescript
interface Achievements {
  [achievementId: string]: {
    unlocked: true;
    at: number;      // 解锁时间戳
  };
}
```

**成就 ID 列表**:

| ID | 条件 |
|----|------|
| `first_win` | 完成任意一局 |
| `easy_under_60` | 简单难度 60 秒内通关 |
| `medium_under_120` | 中等难度 120 秒内通关 |
| `hard_under_180` | 困难难度 180 秒内通关 |
| `no_hint_win` | 不使用提示完成一局 |
| `perfect_moves` | 零失误（步数 = 配对数） |

**示例**:

```json
{
  "first_win": { "unlocked": true, "at": 1713264000000 },
  "easy_under_60": { "unlocked": true, "at": 1713350400000 }
}
```

### Statistics（统计数据）

```typescript
interface Stats {
  games: number;           // 总局数
  wins: number;            // 胜局数
  timeSum: number;         // 累计用时（秒）
  movesSum: number;        // 累计步数
  hintsSum: number;        // 累计提示次数
  comboSum: number;        // 最高连击累计
  bestCombo: number;       // 历史最高连击
  recallAttempts: number;  // 回忆测验次数
  precisionSum: number;    // 精确率累计
  recallSum: number;       // 召回率累计
  nbackAttempts: number;   // N-back 尝试次数
  nbackAccSum: number;     // N-back 准确率累计
  nbackRtSum: number;      // N-back 反应时累计（ms）
  nbackRtCount: number;    // N-back 反应时样本数
}
```

**派生指标**:

| 指标 | 计算方式 |
|------|----------|
| 胜率 | `wins / games` |
| 平均用时 | `timeSum / wins` |
| 平均步数 | `movesSum / wins` |
| 平均提示 | `hintsSum / wins` |
| 平均连击 | `comboSum / wins` |
| 平均精确率 | `precisionSum / recallAttempts` |
| 平均召回率 | `recallSum / recallAttempts` |
| N-back 平均准确率 | `nbackAccSum / nbackAttempts` |
| N-back 平均反应时 | `nbackRtSum / nbackRtCount` |

### Adaptive Data（自适应数据）

```typescript
interface AdaptiveData {
  rating: number;              // 评分 (600-1600)
  lastDiff: 'easy' | 'medium' | 'hard';  // 上局难度
}
```

**默认值**:

```json
{ "rating": 1000, "lastDiff": "easy" }
```

### Spaced Repetition Data（间隔复现数据）

```typescript
interface SpacedData {
  [cardValue: string]: number;    // 卡面值 → 权重
}
```

**示例**:

```json
{
  "🍎": 2.4,
  "🍌": 1.6,
  "🍇": 0.8
}
```

**权重规则**:

- 每局结束时按曝光次数累加（>1 次才累加）
- 旧权重按 0.8 衰减
- 权重越高，后续越可能被选中

### Daily Challenge Data（每日挑战数据）

```typescript
interface DailyData {
  done: true;
  at: number;      // 完成时间戳
}
```

**示例**:

```json
{ "done": true, "at": 1713264000000 }
```

---

## 导入/导出

### 导出格式

```typescript
interface ExportPayload {
  version: 1;
  settings: Settings;
  bests: {
    easy?: BestScore;
    medium?: BestScore;
    hard?: BestScore;
  };
  leaderboards: {
    easy?: Leaderboard;
    medium?: Leaderboard;
    hard?: Leaderboard;
  };
  achievements: Achievements;
  stats: Stats;
  adaptive: AdaptiveData;
  spaced: {
    emoji?: SpacedData;
    numbers?: SpacedData;
    letters?: SpacedData;
    shapes?: SpacedData;
    colors?: SpacedData;
  };
}
```

### 导出流程

```javascript
// app.js
function buildExportPayload() {
  return {
    version: 1,
    settings: settings,
    bests: {
      easy: loadBest('easy'),
      medium: loadBest('medium'),
      hard: loadBest('hard'),
    },
    leaderboards: {
      easy: loadLeaderboard('easy'),
      medium: loadLeaderboard('medium'),
      hard: loadLeaderboard('hard'),
    },
    achievements: loadAchievements(),
    stats: loadStats(),
    adaptive: loadAdaptive(),
    spaced: {
      emoji: loadSpaced('emoji'),
      numbers: loadSpaced('numbers'),
      letters: loadSpaced('letters'),
      shapes: loadSpaced('shapes'),
      colors: loadSpaced('colors'),
    },
  };
}
```

### 导入流程

```javascript
// src/import-export.js
function normalizeImportData(raw, defaults) {
  return {
    version: clampInt(raw.version, 1, 999, 1),
    settings: normalizeSettings(raw.settings, defaults),
    bests: normalizeBests(raw.bests),
    leaderboards: normalizeLeaderboards(raw.leaderboards),
    achievements: normalizeAchievements(raw.achievements),
    stats: normalizeStats(raw.stats),
    adaptive: normalizeAdaptive(raw.adaptive),
    spaced: normalizeSpaced(raw.spaced),
  };
}
```

### 规范化原则

所有导入数据都会经过规范化处理：

1. **类型检查** — 确保字段类型正确
2. **范围限制** — 数值字段限制在合法范围内
3. **枚举验证** — 枚举值必须是允许的选项之一
4. **缺失填充** — 缺失字段使用默认值填充

---

## 数据安全

### 错误处理

所有 localStorage 操作都包裹在 try-catch 中：

```javascript
// src/storage.js
function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 静默失败（可能是隐私模式或配额超限）
  }
}
```

### 隐私模式兼容

- 在隐私/无痕模式下，localStorage 可能不可用或会话结束后清除
- 游戏会优雅降级，使用内存中的默认值

### 配额管理

- 数据量通常 < 50KB
- 不会主动清理旧数据
- 如遇配额问题，可使用「重置数据」功能清空

---

## 数据迁移

### 版本号

当前导出格式版本：`1`

### 迁移策略

未来如需修改数据结构：

1. 更新 `version` 号
2. 在 `normalizeImportData` 中添加版本迁移逻辑
3. 更新 `changelog/` 记录变更

```javascript
// 示例：未来版本迁移
function normalizeImportData(raw, defaults) {
  const version = clampInt(raw.version, 1, 999, 1);

  let data = { ...raw };

  // 版本迁移
  if (version < 2) {
    data = migrateV1ToV2(data);
  }

  // 继续规范化...
}
```

---

## 调试技巧

### 查看所有数据

在浏览器控制台执行：

```javascript
// 列出所有 memory_match_ 键
Object.keys(localStorage)
  .filter((k) => k.startsWith('memory_match_'))
  .forEach((k) => console.log(k, localStorage.getItem(k)));

// 清空所有数据
Object.keys(localStorage)
  .filter((k) => k.startsWith('memory_match_'))
  .forEach((k) => localStorage.removeItem(k));
```

### 导出当前状态

```javascript
// 导出 JSON
const data = JSON.parse(JSON.stringify(window.RememberStorage));
console.log(JSON.stringify(data, null, 2));
```

---

*有关游戏模式和逻辑，请参见 [训练模式](./modes.zh-CN.md)。有关系统架构，请参见 [架构概览](./architecture.zh-CN.md)。*
