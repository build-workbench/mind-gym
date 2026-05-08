/**
 * RecallState - 延迟回忆模式状态管理
 *
 * 这是一个**深层模块**，封装了延迟回忆测试的完整生命周期：
 * - 调用者只需调用 recordGame(values) 和 generateTest(pool)
 * - 不需关心测试项生成、评分算法
 *
 * @module recall-state
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./modes.js'));
  } else {
    root.RememberRecall = factory(root.RememberModes);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberModes) {
  const { buildRecallItems, scoreRecall } = RememberModes;

  class RecallState {
    constructor(config = {}) {
      this._onComplete = config.onComplete || null;
      this._shuffle = config.shuffle || (arr => arr.slice().sort(() => Math.random() - 0.5));

      this._lastGameValues = [];
      this._correctSet = new Set();
      this._testItems = [];
    }

    recordGame(cardValues) {
      if (!Array.isArray(cardValues)) {
        console.error('RecallState: cardValues must be an array');
        return false;
      }

      this._lastGameValues = [...new Set(cardValues)];
      return true;
    }

    generateTest(poolValues, options = {}) {
      if (!Array.isArray(poolValues)) {
        console.error('RecallState: poolValues must be an array');
        return null;
      }

      const shuffle = options.shuffle || this._shuffle;

      const { items, correctSet } = buildRecallItems({
        truthValues: this._lastGameValues,
        poolValues,
        shuffle,
      });

      this._testItems = items;
      this._correctSet = correctSet;

      return {
        items: items.map(item => ({ v: item.v })),
        correctSet: new Set(correctSet),
      };
    }

    submitAnswer(selectedValues) {
      const selected =
        selectedValues instanceof Set
          ? selectedValues
          : new Set(Array.isArray(selectedValues) ? selectedValues : []);

      const result = scoreRecall(this._correctSet, selected);

      if (this._onComplete) {
        this._onComplete(result);
      }

      return result;
    }

    getState() {
      return {
        lastGameValues: [...this._lastGameValues],
        correctSet: new Set(this._correctSet),
        testItems: this._testItems.map(item => ({ v: item.v, correct: item.correct })),
      };
    }

    reset() {
      this._lastGameValues = [];
      this._correctSet = new Set();
      this._testItems = [];
    }
  }

  return RecallState;
});
