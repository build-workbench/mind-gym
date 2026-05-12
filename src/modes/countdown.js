/**
 * CountdownMode - 倒计时模式
 *
 * 在限定时间内完成翻牌匹配：
 * - 时间根据难度不同（easy: 90s, medium: 150s, hard: 240s）
 * - 时间耗尽则失败
 * - 完成所有配对即获胜
 *
 * @module modes/countdown
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberCountdownMode = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    id: 'countdown',
    name: 'Countdown',
    nameZh: '倒计时模式',
    nameEn: 'Countdown',

    onInit(config) {
      // config 可能包含倒计时时长等信息
    },

    getState() {
      return {
        id: 'countdown',
        type: 'card-flip',
        hasTimeLimit: true,
      };
    },
  };
});
