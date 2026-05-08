/**
 * GameManager - 翻牌匹配游戏的核心逻辑
 *
 * 这是一个**深层模块**，封装了翻牌匹配游戏的完整状态机：
 * - 调用者只需调用 flip(cardIndex, cardValue)
 * - 不需关心内部状态机、匹配算法、胜利检测
 *
 * @module game-manager
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberGameManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * GameManager 类
   * 管理翻牌匹配游戏的核心逻辑
   */
  class GameManager {
    /**
     * @param {Object} config - 配置对象
     * @param {number} config.totalPairs - 总配对数
     * @param {Function} [config.onMatch] - 匹配回调 (card1, card2) => void
     * @param {Function} [config.onMismatch] - 不匹配回调 (card1, card2) => void
     * @param {Function} [config.onWin] - 胜利回调 () => void
     * @param {Function} [config.onProgress] - 进度回调 (matched, total) => void
     */
    constructor(config) {
      this.config = config;
      this.reset();
    }

    /**
     * 重置游戏状态
     * 用于开始新游戏或重新开始
     */
    reset() {
      /** @type {{ index: number, value: string } | null} 第一张翻开的卡 */
      this.firstCard = null;

      /** @type {{ index: number, value: string } | null} 第二张翻开的卡 */
      this.secondCard = null;

      /** @type {boolean} 棋盘是否锁定（等待翻回不匹配的卡） */
      this.locked = false;

      /** @type {number} 已匹配的配对数 */
      this.matchedPairs = 0;

      /** @type {number} 翻牌次数（每翻开第二张计数一次） */
      this.moves = 0;
    }

    /**
     * 翻开一张卡片
     *
     * @param {number} cardIndex - 卡片索引
     * @param {string} cardValue - 卡片值（用于匹配判断）
     * @returns {Object} 翻牌结果
     * @returns {boolean} returns.canFlip - 是否允许翻转
     * @returns {boolean} [returns.isFirstCard] - 是否是第一张卡
     * @returns {boolean} [returns.isSecondCard] - 是否是第二张卡
     * @returns {boolean} [returns.matched] - 是否匹配（仅第二张卡时返回）
     * @returns {boolean} [returns.isWin] - 是否获胜（匹配且完成所有配对时返回）
     */
    flip(cardIndex, cardValue) {
      // 棋盘锁定时不允许翻转
      if (this.locked) {
        return { canFlip: false };
      }

      // 第一张卡
      if (this.firstCard === null) {
        this.firstCard = { index: cardIndex, value: cardValue };
        return { canFlip: true, isFirstCard: true };
      }

      // 同一张卡不能连续点两次
      if (this.firstCard.index === cardIndex) {
        return { canFlip: false };
      }

      // 第二张卡
      this.secondCard = { index: cardIndex, value: cardValue };
      this.moves++;

      const matched = this.firstCard.value === this.secondCard.value;

      if (matched) {
        // 匹配成功
        this.matchedPairs++;
        this.config.onMatch?.(this.firstCard, this.secondCard);

        const isWin = this.matchedPairs >= this.config.totalPairs;
        if (isWin) {
          this.config.onWin?.();
        }

        this.config.onProgress?.(this.matchedPairs, this.config.totalPairs);
        this.resetBoardState();

        return { canFlip: true, matched: true, isSecondCard: true, isWin };
      } else {
        // 匹配失败，锁定棋盘
        this.locked = true;
        this.config.onMismatch?.(this.firstCard, this.secondCard);

        return { canFlip: true, matched: false, isSecondCard: true };
      }
    }

    /**
     * 翻回不匹配的卡片后调用
     * 解锁棋盘，允许继续游戏
     */
    afterMismatchFlipBack() {
      this.resetBoardState();
      this.locked = false;
    }

    /**
     * 获取当前状态快照
     * 用于测试和调试
     *
     * @returns {Object} 状态快照
     */
    getState() {
      return {
        moves: this.moves,
        matchedPairs: this.matchedPairs,
        totalPairs: this.config.totalPairs,
        isLocked: this.locked,
        isComplete: this.matchedPairs >= this.config.totalPairs,
      };
    }

    /**
     * 重置棋盘状态（内部方法）
     * 清空第一张和第二张卡，但保留匹配数和移动数
     * @private
     */
    resetBoardState() {
      this.firstCard = null;
      this.secondCard = null;
    }
  }

  return { GameManager };
});
