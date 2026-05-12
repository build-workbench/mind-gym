/**
 * ClassicMode - 经典翻牌匹配模式
 *
 * 最基础的翻牌匹配模式：
 * - 翻开两张卡片，匹配则保留，不匹配则翻回
 * - 记录时间和步数
 * - 完成所有配对即获胜
 *
 * @module modes/classic
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberClassicMode = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    id: 'classic',
    name: 'Classic',
    nameZh: '经典模式',
    nameEn: 'Classic',

    // 经典模式不需要特殊初始化
    onInit(config) {
      // config 可能包含难度等信息
    },

    // 经典模式的 flip 逻辑由 GameStateManager 处理
    // 这里只是一个标记，表示这个模式支持翻牌

    getState() {
      return {
        id: 'classic',
        type: 'card-flip',
      };
    },
  };
});
