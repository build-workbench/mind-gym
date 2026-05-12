/**
 * WinPipeline - 胜利管道
 *
 * 这是一个**深层模块**，封装了游戏胜利后的所有操作：
 * - 调用者只需调用 execute(state)
 * - 不需关心各步骤的执行顺序
 * - 支持自定义步骤、重排序
 *
 * @module pipeline/win-pipeline
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberWinPipeline = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * 创建胜利管道实例
   * @param {Object} config - 配置
   * @param {Object} config.storage - 存储模块
   * @param {Object} config.stats - 统计模块
   * @param {Object} config.achievements - 成就模块
   * @param {Object} config.effects - 效果模块
   * @param {Object} config.ui - UI 渲染器
   * @param {Object} config.i18n - 国际化
   */
  function createPipeline(config = {}) {
    const steps = new Map();
    const order = [];

    // 默认步骤
    const defaultSteps = {
      stopTimer: {
        name: 'stopTimer',
        execute: (state, context) => {
          if (context.gameState) {
            context.gameState.stopTimer();
          }
        },
      },
      updateBestScore: {
        name: 'updateBestScore',
        execute: (state, context) => {
          const { loadBest, saveBest } = context.storage || {};
          if (!loadBest || !saveBest) return;

          const prev = loadBest(state.difficulty);
          const curr = { time: state.elapsed, moves: state.moves };
          let better = false;
          if (!prev) better = true;
          else if (curr.time < prev.time) better = true;
          else if (curr.time === prev.time && curr.moves < prev.moves) better = true;
          if (better) saveBest(state.difficulty, curr);
        },
      },
      updateStats: {
        name: 'updateStats',
        execute: (state, context) => {
          const { loadStats, saveStats, recordGameWon } = context.stats || {};
          if (!loadStats || !saveStats || !recordGameWon) return;

          saveStats(
            recordGameWon(loadStats(), {
              elapsed: state.elapsed,
              moves: state.moves,
              hintsUsed: state.hintsUsed,
              maxCombo: state.maxComboThisGame,
            })
          );
        },
      },
      updateAdaptive: {
        name: 'updateAdaptive',
        execute: (state, context) => {
          const { updateAdaptiveOnEnd, getRating } = context.adaptive || {};
          if (!updateAdaptiveOnEnd || !getRating) return;

          const stars = getRating(
            state.elapsed,
            state.moves,
            state.difficulty,
            state.hintsUsed,
            state.maxComboThisGame
          );
          updateAdaptiveOnEnd(true, stars, state.difficulty);
        },
      },
      updateMastery: {
        name: 'updateMastery',
        execute: (state, context) => {
          const { updateMasteryAfterGame, settings } = context.fsrs || {};
          if (!updateMasteryAfterGame) return;

          const matchedCards = Array.from(state.seenCountMap.keys());
          updateMasteryAfterGame(settings?.cardFace || 'emoji', matchedCards, {
            elapsed: state.elapsed,
            moves: state.moves,
            difficulty: state.difficulty,
            hintsUsed: state.hintsUsed,
            maxCombo: state.maxComboThisGame,
            win: true,
          });
        },
      },
      updateLeaderboard: {
        name: 'updateLeaderboard',
        execute: (state, context) => {
          const { loadLeaderboard, saveLeaderboard } = context.storage || {};
          if (!loadLeaderboard || !saveLeaderboard) return;

          const arr = loadLeaderboard(state.difficulty);
          const updated = [...arr, { time: state.elapsed, moves: state.moves, at: Date.now() }]
            .sort((a, b) => a.time - b.time || a.moves - b.moves)
            .slice(0, 3);
          saveLeaderboard(state.difficulty, updated);
        },
      },
      runConfetti: {
        name: 'runConfetti',
        execute: (state, context) => {
          const { runConfetti } = context.effects || {};
          if (runConfetti) runConfetti();
        },
      },
      checkAchievements: {
        name: 'checkAchievements',
        execute: (state, context) => {
          const { loadAchievements, saveAchievements, checkAchievements, difficulties } =
            context.achievements || {};
          if (!loadAchievements || !saveAchievements || !checkAchievements) return;

          const result = checkAchievements(loadAchievements(), {
            currentDifficulty: state.difficulty,
            elapsed: state.elapsed,
            hintsUsed: state.hintsUsed,
            moves: state.moves,
            pairs: difficulties?.[state.difficulty]?.pairs || 0,
          });
          if (result.newly.length) saveAchievements(result.store);
          return result.newly;
        },
      },
      showWinModal: {
        name: 'showWinModal',
        execute: (state, context) => {
          const { showModal, renderRating, renderWinStats } = context.ui || {};
          const { formatTime, getRating, i18n } = context.helpers || {};

          if (renderRating) {
            const stars = getRating?.(
              state.elapsed,
              state.moves,
              state.difficulty,
              state.hintsUsed,
              state.maxComboThisGame
            );
            renderRating(stars);
          }

          if (renderWinStats && formatTime && i18n) {
            const t = i18n();
            renderWinStats(
              `${t.timeFmt} ${formatTime(state.elapsed)} · ${state.moves} ${t.stepsFmt}`
            );
          }

          if (showModal && context.elements?.winModal) {
            showModal(context.elements.winModal);
          }
        },
      },
      openRecallTest: {
        name: 'openRecallTest',
        execute: (state, context) => {
          const { openRecallTest } = context.recall || {};
          if (openRecallTest) openRecallTest();
        },
      },
      markDailyDone: {
        name: 'markDailyDone',
        execute: (state, context) => {
          const { markDailyDone, todayStr } = context.storage || {};
          if (!markDailyDone || !state.dailyActive) return;

          markDailyDone(todayStr(), state.difficulty);
        },
      },
    };

    // 注册默认步骤
    for (const [key, step] of Object.entries(defaultSteps)) {
      steps.set(key, step);
      order.push(key);
    }

    /**
     * 添加自定义步骤
     * @param {string} name - 步骤名称
     * @param {Function} fn - 执行函数 (state, context) => void
     * @param {number} [position] - 插入位置（可选）
     */
    function addStep(name, fn, position) {
      const step = { name, execute: fn };
      steps.set(name, step);

      if (position !== undefined && position >= 0 && position <= order.length) {
        order.splice(position, 0, name);
      } else {
        order.push(name);
      }
    }

    /**
     * 移除步骤
     * @param {string} name - 步骤名称
     */
    function removeStep(name) {
      steps.delete(name);
      const index = order.indexOf(name);
      if (index >= 0) {
        order.splice(index, 1);
      }
    }

    /**
     * 重排序步骤
     * @param {string[]} newOrder - 新的步骤顺序
     */
    function reorderSteps(newOrder) {
      order.length = 0;
      for (const name of newOrder) {
        if (steps.has(name)) {
          order.push(name);
        }
      }
    }

    /**
     * 执行管道
     * @param {Object} state - 游戏状态
     * @param {Object} context - 上下文（包含各模块引用）
     */
    function execute(state, context = {}) {
      const results = {};

      for (const name of order) {
        const step = steps.get(name);
        if (step && step.execute) {
          try {
            const result = step.execute(state, context);
            if (result !== undefined) {
              results[name] = result;
            }
          } catch (err) {
            console.error(`WinPipeline: step "${name}" error`, err);
          }
        }
      }

      return results;
    }

    /**
     * 获取当前步骤顺序
     */
    function getOrder() {
      return [...order];
    }

    /**
     * 获取所有步骤
     */
    function getSteps() {
      return new Map(steps);
    }

    return {
      addStep,
      removeStep,
      reorderSteps,
      execute,
      getOrder,
      getSteps,
    };
  }

  return {
    create: createPipeline,
  };
});
