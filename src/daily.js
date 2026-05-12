/**
 * DailyChallengeManager - 每日挑战模式管理器
 *
 * 这是一个**深层模块**，封装了每日挑战的完整生命周期：
 * - 根据日期+难度+主题生成种子
 * - 检查完成状态
 * - 标记完成
 * - 追踪历史
 *
 * @module daily
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./keys.js'), require('./utils.js'), require('./storage.js'));
  } else {
    root.RememberDaily = factory(root.RememberKeys, root.RememberUtils, root.RememberStorage);
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (RememberKeys, RememberUtils, RememberStorage) {
    class DailyChallengeManager {
      constructor(config = {}) {
        this._storage = config.storage || RememberStorage;
        this._keys = config.keys || RememberKeys;
        this._utils = config.utils || RememberUtils;
      }

      /**
       * 获取今天的日期字符串 (YYYY-MM-DD)
       * @returns {string}
       */
      todayStr() {
        return this._keys.todayStr();
      }

      /**
       * 从日期字符串生成种子
       * @param {string} dateStr - 日期字符串
       * @param {string} difficulty - 难度
       * @param {string} theme - 主题
       * @returns {number}
       */
      seedFromDate(dateStr, difficulty, theme) {
        return this._utils.seedFromDate(dateStr, difficulty, theme);
      }

      /**
       * 获取今天指定难度的种子
       * @param {string} difficulty - 难度
       * @param {string} theme - 主题
       * @returns {number}
       */
      getSeed(difficulty, theme) {
        return this.seedFromDate(this.todayStr(), difficulty, theme);
      }

      /**
       * 检查今天指定难度是否已完成
       * @param {string} difficulty - 难度
       * @returns {boolean}
       */
      isDone(difficulty) {
        return this._storage.isDailyDone(this.todayStr(), difficulty);
      }

      /**
       * 标记今天指定难度为已完成
       * @param {string} difficulty - 难度
       */
      markDone(difficulty) {
        this._storage.markDailyDone(this.todayStr(), difficulty);
      }

      /**
       * 获取指定难度的完成状态键
       * @param {string} difficulty - 难度
       * @returns {string}
       */
      getCompletionKey(difficulty) {
        return `daily_${this.todayStr()}_${difficulty}`;
      }

      /**
       * 获取所有难度的状态
       * @param {string[]} difficulties - 难度列表
       * @param {string} theme - 主题
       * @returns {Record<string, { done: boolean, seed: number }>}
       */
      getStatus(difficulties, theme) {
        const status = {};
        for (const diff of difficulties) {
          status[diff] = {
            done: this.isDone(diff),
            seed: this.getSeed(diff, theme),
          };
        }
        return status;
      }

      /**
       * 开始每日挑战
       * @param {string} difficulty - 难度
       * @param {string} theme - 主题
       * @returns {{ seed: number, difficulty: string, theme: string, date: string }}
       */
      startChallenge(difficulty, theme) {
        const date = this.todayStr();
        const seed = this.getSeed(difficulty, theme);
        return {
          seed,
          difficulty,
          theme,
          date,
        };
      }

      /**
       * 完成每日挑战
       * @param {string} difficulty - 难度
       */
      completeChallenge(difficulty) {
        this.markDone(difficulty);
      }
    }

    // 创建默认实例（向后兼容）
    const defaultInstance = new DailyChallengeManager();

    // 导出实例方法和类
    return {
      // 实例方法（向后兼容）
      todayStr: () => defaultInstance.todayStr(),
      seedFromDate: (dateStr, diff, theme) => defaultInstance.seedFromDate(dateStr, diff, theme),
      getSeed: (diff, theme) => defaultInstance.getSeed(diff, theme),
      isDone: diff => defaultInstance.isDone(diff),
      markDone: diff => defaultInstance.markDone(diff),
      getCompletionKey: diff => defaultInstance.getCompletionKey(diff),
      getStatus: (difficulties, theme) => defaultInstance.getStatus(difficulties, theme),

      // 新增实例方法
      startChallenge: (diff, theme) => defaultInstance.startChallenge(diff, theme),
      completeChallenge: diff => defaultInstance.completeChallenge(diff),

      // 类导出（用于创建新实例）
      DailyChallengeManager,
    };
  }
);
