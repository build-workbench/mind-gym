/**
 * RecallMode - 延迟回忆测试模式
 *
 * 游戏结束后测试玩家记住了哪些卡片：
 * - 使用 RecallState 管理状态
 * - 显示混合了真实卡片和干扰项的选择列表
 * - 计算精确率和回忆率
 *
 * @module modes/recall
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./recall-state.js'), require('../modes.js'));
  } else {
    root.RememberRecallMode = factory(root.RememberRecall, root.RememberModes);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberRecall, RememberModes) {
  const RecallState = RememberRecall;

  /**
   * 创建延迟回忆模式实例
   * @param {Object} config - 配置
   * @param {Function} config.onComplete - 完成回调
   * @param {Function} config.shuffle - 洗牌函数
   */
  function create(config = {}) {
    const state = new RecallState({
      onComplete: config.onComplete || null,
      shuffle: config.shuffle || null,
    });

    return {
      id: 'recall',
      name: 'Delayed Recall',
      nameZh: '延迟回忆',
      nameEn: 'Delayed Recall',

      _state: state,

      onInit(initConfig) {
        // initConfig 包含卡片值等信息
      },

      onReset() {
        state.reset();
      },

      getState() {
        return {
          id: 'recall',
          type: 'recall',
          ...state.getState(),
        };
      },

      // Recall 特有方法
      recordGame(cardValues) {
        return state.recordGame(cardValues);
      },

      generateTest(poolValues, options) {
        return state.generateTest(poolValues, options);
      },

      submitAnswer(selectedValues) {
        return state.submitAnswer(selectedValues);
      },
    };
  }

  return {
    id: 'recall',
    name: 'Delayed Recall',
    nameZh: '延迟回忆',
    nameEn: 'Delayed Recall',
    create,
  };
});
