/**
 * GameState - 游戏运行时状态统一管理
 *
 * 这是一个**深层模块**，封装了游戏状态的生命周期：
 * - 调用者只需调用 initGame(config)
 * - 不需关心 GameManager、Timer 的生命周期管理
 * - moves/matchedPairs 委托给 GameManager，不重复存储
 *
 * @module game-state
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./game-manager.js'),
      require('./timer.js'),
      require('./shared.js')
    );
  } else {
    root.RememberGameState = factory(
      root.RememberGameManager,
      root.RememberTimer,
      root.RememberShared
    );
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (RememberGameManager, RememberTimer, RememberShared) {
    const COMBO_WINDOW_MS = 3000;
    const HINT_LIMITS = { easy: 3, medium: 2, hard: 1 };
    const VALID_MODES = ['classic', 'countdown', 'daily', 'nback', 'recall'];

    class GameStateManager {
      constructor() {
        this._timerId = null;
        this._listeners = [];

        // 核心游戏状态
        this._difficulty = 'easy';
        this._totalPairs = 6;
        this._started = false;
        this._paused = false;
        this._isPreviewing = false;
        this._timeUp = false;
        this._lockBoard = false;

        // 游戏模式
        this._mode = 'classic';

        // 定时器状态
        this._elapsed = 0;
        this._countdownLeft = 0;
        this._isCountdownMode = false;
        this._getCountdownFor = () => 90;

        // 提示系统
        this._hintsLeft = 0;
        this._hintsUsed = 0;

        // 连击系统
        this._comboCount = 0;
        this._maxComboThisGame = 0;
        this._lastMatchAt = 0;

        // 每日挑战
        this._dailyActive = false;
        this._dailySeed = 0;

        // FSRS 掌握度跟踪
        this._seenCountMap = new Map();

        // 回忆测试
        this._lastGameValues = [];

        // 回调（兼容旧接口）
        this._onWin = null;
        this._onTimeUp = null;
        this._onTimerUpdate = null;
        this._onMatch = null;
        this._onMismatch = null;
      }

      initGame(config) {
        const { GameManager } = RememberGameManager;
        this._gameManager = new GameManager({
          totalPairs: config.totalPairs,
          onMatch: config.onMatch || null,
          onMismatch: config.onMismatch || null,
          onWin: config.onWin || null,
          onProgress: config.onProgress || null,
        });

        this._difficulty = config.difficulty || 'easy';
        this._totalPairs = config.totalPairs;
        this._started = false;
        this._paused = false;
        this._isPreviewing = config.isPreviewing || false;
        this._timeUp = false;
        this._lockBoard = false;

        this._mode = config.mode || 'classic';

        this._elapsed = 0;
        this._countdownLeft = config.countdownLeft || 0;
        this._isCountdownMode = config.isCountdownMode || false;
        this._getCountdownFor = config.getCountdownFor || (() => 90);

        this._hintsLeft =
          config.hintsLeft != null ? config.hintsLeft : HINT_LIMITS[this._difficulty] || 0;
        this._hintsUsed = 0;

        this._comboCount = 0;
        this._maxComboThisGame = 0;
        this._lastMatchAt = 0;

        this._dailyActive = config.dailyActive || false;
        this._dailySeed = config.dailySeed || 0;

        this._seenCountMap = new Map();
        this._lastGameValues = [];

        this._onWin = config.onWin || null;
        this._onTimeUp = config.onTimeUp || null;
        this._onTimerUpdate = config.onTimerUpdate || null;
        this._onMatch = config.onMatch || null;
        this._onMismatch = config.onMismatch || null;

        if (this._timerId) {
          clearInterval(this._timerId);
          this._timerId = null;
        }

        this._notifyChange();
      }

      getState() {
        const gmState = this._gameManager ? this._gameManager.getState() : null;

        return {
          // 从 GameManager 委托
          moves: gmState ? gmState.moves : 0,
          matchedPairs: gmState ? gmState.matchedPairs : 0,
          totalPairs: this._totalPairs,
          isLocked: gmState ? gmState.isLocked : false,
          firstCard: gmState ? gmState.firstCard : null,
          secondCard: gmState ? gmState.secondCard : null,

          // 直接管理
          difficulty: this._difficulty,
          elapsed: this._elapsed,
          countdownLeft: this._countdownLeft,
          started: this._started,
          paused: this._paused,
          isPreviewing: this._isPreviewing,
          timeUp: this._timeUp,
          lockBoard: this._lockBoard,

          mode: this._mode,

          hintsLeft: this._hintsLeft,
          hintsUsed: this._hintsUsed,

          comboCount: this._comboCount,
          maxComboThisGame: this._maxComboThisGame,
          lastMatchAt: this._lastMatchAt,

          dailyActive: this._dailyActive,
          dailySeed: this._dailySeed,

          isCountdownMode: this._isCountdownMode,

          // FSRS 跟踪
          seenCountMap: new Map(this._seenCountMap),

          // 回忆测试
          lastGameValues: [...this._lastGameValues],
        };
      }

      flip(cardIndex, cardValue) {
        if (!this._gameManager) {
          return { canFlip: false };
        }

        const result = this._gameManager.flip(cardIndex, cardValue);

        if (result.canFlip && result.isSecondCard) {
          this._notifyChange(['moves']);
        }

        return result;
      }

      afterMismatchFlipBack() {
        if (this._gameManager) {
          this._gameManager.afterMismatchFlipBack();
        }
      }

      // 棋盘锁定
      setLockBoard(locked) {
        this._lockBoard = !!locked;
        this._notifyChange(['lockBoard']);
      }

      // FSRS 掌握度跟踪
      recordSeenCard(cardValue) {
        this._seenCountMap.set(cardValue, (this._seenCountMap.get(cardValue) || 0) + 1);
      }

      getSeenCountMap() {
        return new Map(this._seenCountMap);
      }

      // 回忆测试
      setLastGameValues(values) {
        this._lastGameValues = [...new Set(values)];
        this._notifyChange(['lastGameValues']);
      }

      getLastGameValues() {
        return [...this._lastGameValues];
      }

      update(partial) {
        const changedKeys = [];

        for (const [key, value] of Object.entries(partial)) {
          if (key === 'difficulty') {
            this._difficulty = value;
            changedKeys.push(key);
          } else if (key === 'paused') {
            this._paused = value;
            changedKeys.push(key);
          } else if (key === 'isPreviewing') {
            this._isPreviewing = value;
            changedKeys.push(key);
          } else if (key === 'timeUp') {
            this._timeUp = value;
            changedKeys.push(key);
          } else if (key === 'lockBoard') {
            this._lockBoard = !!value;
            changedKeys.push(key);
          } else if (key === 'mode') {
            if (VALID_MODES.includes(value)) {
              this._mode = value;
              changedKeys.push(key);
            }
          } else if (key === 'hintsLeft') {
            this._hintsLeft = RememberShared.clampInt(value, 0, HINT_LIMITS[this._difficulty]);
            changedKeys.push(key);
          } else if (key === 'hintsUsed') {
            this._hintsUsed = Math.max(0, Math.floor(value));
            changedKeys.push(key);
          } else if (key === 'comboCount') {
            this._comboCount = Math.max(0, Math.floor(value));
            changedKeys.push(key);
          } else if (key === 'maxComboThisGame') {
            this._maxComboThisGame = Math.max(0, Math.floor(value));
            changedKeys.push(key);
          } else if (key === 'dailyActive') {
            this._dailyActive = !!value;
            changedKeys.push(key);
          } else if (key === 'dailySeed') {
            this._dailySeed = Math.floor(value) || 0;
            changedKeys.push(key);
          }
        }

        if (changedKeys.length > 0) {
          this._notifyChange(changedKeys);
        }

        return changedKeys;
      }

      useHint() {
        if (this._hintsLeft <= 0 || this._paused || this._isPreviewing || this._lockBoard) {
          return false;
        }

        this._hintsLeft -= 1;
        this._hintsUsed += 1;
        this._notifyChange(['hintsLeft', 'hintsUsed']);
        return true;
      }

      recordMatch(card1Value, card2Value) {
        const now = performance.now();
        if (now - this._lastMatchAt <= COMBO_WINDOW_MS) {
          this._comboCount += 1;
        } else {
          this._comboCount = 1;
        }
        this._lastMatchAt = now;
        this._maxComboThisGame = Math.max(this._maxComboThisGame, this._comboCount);

        // 记录已见卡片
        this.recordSeenCard(card1Value);
        this.recordSeenCard(card2Value);

        this._notifyChange(['comboCount', 'maxComboThisGame', 'lastMatchAt', 'matchedPairs']);
      }

      startTimer() {
        if (this._timerId) {
          return;
        }

        const timerResult = RememberTimer.startTimer({
          elapsed: this._elapsed,
          countdownLeft: this._countdownLeft,
          isCountdownMode: () => this._isCountdownMode,
          getCountdownFor: this._getCountdownFor,
          currentDifficulty: this._difficulty,
          onUpdate: ({ elapsed, countdownLeft, displayText }) => {
            this._elapsed = elapsed;
            this._countdownLeft = countdownLeft;
            if (this._onTimerUpdate) {
              this._onTimerUpdate({ elapsed, countdownLeft, displayText });
            }
          },
          onStop: () => {
            this._timerId = null;
          },
          onTimeUp: () => {
            this._timeUp = true;
            this._notifyChange(['timeUp']);
            if (this._onTimeUp) {
              this._onTimeUp();
            }
          },
        });

        this._timerId = timerResult.timerId;
        this._elapsed = timerResult.elapsed;
        this._countdownLeft = timerResult.countdownLeft;

        this._notifyChange(['elapsed', 'countdownLeft']);
      }

      stopTimer() {
        if (this._timerId) {
          clearInterval(this._timerId);
          this._timerId = null;
          this._notifyChange(['timerId']);
        }
      }

      resetTimer() {
        this.stopTimer();

        const timerResult = RememberTimer.resetTimer({
          isCountdownMode: () => this._isCountdownMode,
          getCountdownFor: this._getCountdownFor,
          currentDifficulty: this._difficulty,
        });

        this._elapsed = timerResult.elapsed;
        this._countdownLeft = timerResult.countdownLeft;

        this._notifyChange(['elapsed', 'countdownLeft']);
      }

      pause() {
        if (this._paused) return;

        this._paused = true;
        this.stopTimer();

        if (this._gameManager) {
          this._gameManager.locked = true;
        }
        this._lockBoard = true;

        this._notifyChange(['paused', 'isLocked', 'lockBoard']);
      }

      resume() {
        if (!this._paused) return;

        this._paused = false;

        if (this._started) {
          this.startTimer();
        }

        if (this._gameManager) {
          this._gameManager.locked = false;
        }
        this._lockBoard = false;

        this._notifyChange(['paused', 'isLocked', 'lockBoard']);
      }

      markStarted() {
        if (!this._started) {
          this._started = true;
          this._notifyChange(['started']);
        }
      }

      setPreviewing(value) {
        this._isPreviewing = value;
        this._notifyChange(['isPreviewing']);
      }

      reset() {
        this.stopTimer();

        this._gameManager = null;
        this._difficulty = 'easy';
        this._totalPairs = 6;
        this._started = false;
        this._paused = false;
        this._isPreviewing = false;
        this._timeUp = false;
        this._lockBoard = false;
        this._mode = 'classic';

        this._elapsed = 0;
        this._countdownLeft = 0;

        this._hintsLeft = 0;
        this._hintsUsed = 0;

        this._comboCount = 0;
        this._maxComboThisGame = 0;
        this._lastMatchAt = 0;

        this._dailyActive = false;
        this._dailySeed = 0;

        this._seenCountMap = new Map();
        this._lastGameValues = [];

        this._notifyChange();
      }

      onChange(callback) {
        if (typeof callback !== 'function') {
          throw new Error('GameStateManager: onChange callback must be a function');
        }

        this._listeners.push(callback);

        return () => {
          const index = this._listeners.indexOf(callback);
          if (index >= 0) {
            this._listeners.splice(index, 1);
          }
        };
      }

      _notifyChange(changedKeys = null) {
        const newState = this.getState();

        this._listeners.forEach(callback => {
          try {
            callback(newState, changedKeys);
          } catch (err) {
            console.error('GameStateManager: onChange callback error', err);
          }
        });
      }
    }

    const instance = new GameStateManager();

    return {
      initGame: config => instance.initGame(config),
      getState: () => instance.getState(),
      flip: (cardIndex, cardValue) => instance.flip(cardIndex, cardValue),
      afterMismatchFlipBack: () => instance.afterMismatchFlipBack(),
      update: partial => instance.update(partial),
      useHint: () => instance.useHint(),
      recordMatch: (card1Value, card2Value) => instance.recordMatch(card1Value, card2Value),
      startTimer: () => instance.startTimer(),
      stopTimer: () => instance.stopTimer(),
      resetTimer: () => instance.resetTimer(),
      pause: () => instance.pause(),
      resume: () => instance.resume(),
      markStarted: () => instance.markStarted(),
      setPreviewing: value => instance.setPreviewing(value),
      reset: () => instance.reset(),
      onChange: callback => instance.onChange(callback),
      setLockBoard: locked => instance.setLockBoard(locked),
      recordSeenCard: value => instance.recordSeenCard(value),
      getSeenCountMap: () => instance.getSeenCountMap(),
      setLastGameValues: values => instance.setLastGameValues(values),
      getLastGameValues: () => instance.getLastGameValues(),
      HINT_LIMITS,
    };
  }
);
