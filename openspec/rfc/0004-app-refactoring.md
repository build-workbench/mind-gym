---
openspec:
  type: rfc
  status: accepted
  created: 2026-05-12
  updated: 2026-05-12
---

# RFC-0004: app.js 全面重构

| Status  | Proposed   |
| ------- | ---------- |
| Created | 2026-05-12 |
| Updated | 2026-05-12 |

## Summary

将 `app.js`（2275 行）重构为薄协调器，正确使用已存在的深层模块（`GameStateManager`、`NBackState`、`RecallState`、`SettingsManager`），并引入游戏模式注册表和 UI 渲染抽象。

## Motivation

### 当前问题

1. **双重状态管理**: `app.js` 内联管理 30+ 状态变量，同时 `GameStateManager` 已存在但未被使用
2. **上帝模块**: `app.js` 同时负责状态管理、事件处理、DOM 操作、模式逻辑、数据持久化
3. **零测试覆盖**: `app.js` 无法测试，因为接口暴露 60+ DOM 引用
4. **模式逻辑散落**: N-back、Recall、Daily 模式逻辑散落在 `app.js` 各处
5. **已有模块未使用**: 四个设计良好的深层模块已存在但被忽略

### 目标

1. **局部性**: 每个关注点在独立模块中
2. **杠杆**: 通过小接口获得大能力
3. **可测试性**: 每个模块独立可测试
4. **可扩展性**: 添加新模式只需实现接口并注册

## Architecture

### 重构前

```
app.js (2275 行)
├── 30+ 内联状态变量
├── 50+ 事件处理器
├── 硬编码的 N-back 逻辑
├── 硬编码的 Recall 逻辑
├── 硬编码的 Daily 逻辑
├── 内联 DOM 操作
└── 零委托

已存在但未使用的模块:
├── src/game-state.js (423 行)
├── src/nback-state.js (230 行)
├── src/recall-state.js (95 行)
└── src/settings-manager.js (239 行)
```

### 重构后

```
app.js (~300 行) - 薄协调器
    │
    ├── GameStateManager (状态协调)
    │       ├── GameManager (翻牌逻辑)
    │       └── Timer (计时器)
    │
    ├── GameModeRegistry (模式注册表)
    │       ├── ClassicMode
    │       ├── CountdownMode
    │       ├── DailyMode
    │       ├── NBackMode → NBackState
    │       └── RecallMode → RecallState
    │
    ├── SettingsManager (设置管理)
    │
    └── UIRenderer (UI 渲染抽象)
```

## Design Decisions

### D1: GameStateManager 作为状态协调中心

**决策**: `app.js` 委托给 `GameStateManager` 管理所有运行时状态。

**接口扩展**:

```javascript
// src/game-state.js 扩展接口
interface GameStateManager {
  // 现有方法
  initGame(config): void;
  getState(): GameState;
  flip(cardIndex, cardValue): FlipResult;
  startTimer(): void;
  stopTimer(): void;
  pause(): void;
  resume(): void;
  update(partial): void;
  useHint(): boolean;
  recordMatch(card1, card2): void;
  onChange(callback): Unsubscribe;

  // 新增方法
  setMode(modeId): void;
  getMode(): string;
  onWin(callback): Unsubscribe;
  onTimeUp(callback): Unsubscribe;
}
```

**收益**:

- 单一状态来源
- 内置变更通知简化 UI 更新
- 已有测试覆盖

### D2: 游戏模式注册表

**决策**: 引入 `GameModeRegistry` 管理不同游戏模式。

**接口定义**:

```javascript
interface GameMode {
  id: string;

  // 生命周期
  onInit(config: GameConfig): void;
  onStart(): void;
  onEnd(result: GameResult): void;

  // 事件处理（可选）
  onFlip?(card: CardElement): FlipResult;
  onKeyPress?(key: string): void;
  onTimerTick?(elapsed: number): void;

  // 状态查询
  getState(): ModeState;
}

interface GameModeRegistry {
  register(mode: GameMode): void;
  get(id: string): GameMode | undefined;
  getCurrent(): GameMode;
  switchTo(id: string): void;
}
```

**模式实现**:

| 模式      | 文件                     | 特殊处理             |
| --------- | ------------------------ | -------------------- |
| Classic   | `src/modes/classic.js`   | 无                   |
| Countdown | `src/modes/countdown.js` | 超时失败             |
| Daily     | `src/modes/daily.js`     | 种子生成             |
| NBack     | `src/modes/nback.js`     | 委托给 `NBackState`  |
| Recall    | `src/modes/recall.js`    | 委托给 `RecallState` |

**收益**:

- 添加新模式只需实现接口并注册
- 每个模式逻辑隔离
- 模式独立可测试

### D3: UI 渲染抽象

**决策**: 引入 `UIRenderer` 抽象渲染操作。

**接口定义**:

```javascript
interface UIRenderer {
  // 卡片渲染
  renderCard(card: CardData): HTMLElement;
  renderFlip(card: HTMLElement): void;
  renderMatch(card1: HTMLElement, card2: HTMLElement): void;
  renderMismatch(card1: HTMLElement, card2: HTMLElement): void;

  // 状态显示
  renderMoves(count: number): void;
  renderTime(formatted: string): void;
  renderProgress(matched: number, total: number): void;
  renderHint(count: number): void;
  renderCombo(count: number): void;

  // 模态框
  showModal(modal: HTMLElement): void;
  hideModal(modal: HTMLElement): void;

  // 效果
  playSound(type: SoundType): void;
  vibrate(duration: number): void;
  runConfetti(): void;

  // 通知
  showToast(message: string): void;
}
```

**收益**:

- DOM 操作集中
- 可替换渲染器（测试用 mock）
- UI 逻辑与业务逻辑分离

### D4: 胜利管道

**决策**: 将 `onWin()` 分解为可配置的管道。

**管道步骤**:

```javascript
const WIN_PIPELINE = [
  'stopTimer', // 停止计时
  'updateBestScore', // 更新最佳成绩
  'updateStats', // 更新统计
  'updateAdaptive', // 更新自适应评级
  'updateMastery', // 更新 FSRS 掌握度
  'updateLeaderboard', // 更新排行榜
  'runConfetti', // 运行彩带动画
  'checkAchievements', // 检查成就
  'showWinModal', // 显示胜利弹窗
  'openRecallTest', // 打开回忆测试
  'markDailyDone', // 标记每日完成
];
```

**管道执行器**:

```javascript
interface WinPipeline {
  addStep(name: string, fn: WinStep): void;
  removeStep(name: string): void;
  reorderSteps(order: string[]): void;
  execute(state: GameState): void;
}
```

**收益**:

- 步骤可添加/删除/重排序
- 每个步骤独立可测试
- 支持模式自定义管道

### D5: 设置管理集成

**决策**: 使用 `SettingsManager` 替代内联设置管理。

**集成方式**:

```javascript
// app.js
const settings = RememberSettings.getAll();

// 监听变更
RememberSettings.onChange('theme', newTheme => {
  uiRenderer.applyTheme(newTheme);
});

RememberSettings.onChange('language', newLang => {
  i18n.setLang(newLang);
  uiRenderer.applyLanguage();
});
```

**收益**:

- 设置验证内置
- 变更通知自动
- 已有测试覆盖

## File Structure

### 新增文件

```
src/
├── modes/
│   ├── registry.js        # 模式注册表
│   ├── classic.js         # 经典模式
│   ├── countdown.js       # 倒计时模式
│   ├── daily.js           # 每日挑战
│   ├── nback.js           # N-back 模式
│   └── recall.js          # 延迟回忆模式
├── ui/
│   └── renderer.js        # UI 渲染器
└── pipeline/
    └── win-pipeline.js    # 胜利管道
```

### 修改文件

```
app.js                    # 2275 行 → ~300 行
src/game-state.js         # 扩展接口
index.html                # 添加新模块脚本标签
```

### 删除/废弃

```
src/ui.js                 # 合并到 ui/renderer.js
src/ui-events.js          # 合并到 app.js 事件绑定
```

## Migration Strategy

### 阶段 1: 状态迁移

1. 扩展 `GameStateManager` 接口
2. 修改 `app.js` 使用 `GameStateManager`
3. 删除 `app.js` 内联状态变量
4. 运行测试确保功能不变

### 阶段 2: 模式迁移

1. 创建 `GameModeRegistry`
2. 实现 `ClassicMode`
3. 实现 `CountdownMode`
4. 实现 `DailyMode`
5. 实现 `NBackMode`（委托给 `NBackState`）
6. 实现 `RecallMode`（委托给 `RecallState`）
7. 修改 `app.js` 使用注册表

### 阶段 3: UI 迁移

1. 创建 `UIRenderer`
2. 将 DOM 操作迁移到 `UIRenderer`
3. 修改 `app.js` 使用 `UIRenderer`

### 阶段 4: 管道迁移

1. 创建 `WinPipeline`
2. 将 `onWin()` 步骤迁移到管道
3. 修改 `app.js` 使用管道

### 阶段 5: 设置迁移

1. 修改 `app.js` 使用 `SettingsManager`
2. 删除内联设置变量
3. 添加变更监听

## Testing Strategy

### 单元测试

| 模块               | 测试文件                | 测试重点             |
| ------------------ | ----------------------- | -------------------- |
| `GameStateManager` | `game-state.test.js`    | 已存在，扩展测试     |
| `GameModeRegistry` | `mode-registry.test.js` | 注册、切换、生命周期 |
| `ClassicMode`      | `classic-mode.test.js`  | 翻牌、匹配、胜利     |
| `NBackMode`        | `nback-mode.test.js`    | 委托给 NBackState    |
| `UIRenderer`       | `ui-renderer.test.js`   | DOM 操作 mock        |
| `WinPipeline`      | `win-pipeline.test.js`  | 步骤执行、顺序       |

### 集成测试

- `app.test.js`: 端到端游戏流程
- 模式切换测试
- 设置变更传播测试

## Risks

### R1: 功能回归

**风险**: 重构过程中可能引入 bug。

**缓解**:

- 分阶段迁移，每阶段运行完整测试套件
- 保持现有测试通过
- 手动测试关键路径

### R2: 性能影响

**风险**: 额外的抽象层可能影响性能。

**缓解**:

- 无性能约束（用户已确认）
- 可在重构后进行性能分析
- 如有必要，可内联关键路径

### R3: 模块加载顺序

**风险**: 新模块可能影响 UMD 加载顺序。

**缓解**:

- 更新 `index.html` 脚本标签顺序
- 测试 Service Worker 缓存更新

## Success Criteria

1. `app.js` 行数 < 400 行
2. 所有现有测试通过
3. 新模块测试覆盖率 > 80%
4. 添加新模式无需修改 `app.js`
5. 所有状态通过 `GameStateManager.getState()` 访问

## References

- [RFC-0001: Core Architecture](./0001-core-architecture.md)
- [CONTEXT.md](../../CONTEXT.md)
- [LANGUAGE.md](../../.claude/skills/improve-codebase-architecture/LANGUAGE.md)
