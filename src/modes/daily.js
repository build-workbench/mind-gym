/**
 * DailyMode - 每日挑战模式
 *
 * 全球同一天同一难度的玩家使用相同的卡片布局：
 * - 种子由日期 + 难度 + 主题生成
 * - 每天每个难度只有一次挑战机会
 * - 完成后标记当天已完成
 *
 * @module modes/daily
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberDailyMode = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    id: 'daily',
    name: 'Daily Challenge',
    nameZh: '每日挑战',
    nameEn: 'Daily Challenge',

    onInit(config) {
      // config 可能包含种子、日期等信息
    },

    getState() {
      return {
        id: 'daily',
        type: 'card-flip',
        isDaily: true,
      };
    },
  };
});
