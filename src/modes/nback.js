/**
 * NBackMode - N-back 工作记忆训练模式
 *
 * 判断当前刺激是否与 N 步前的刺激相同：
 * - 使用 NBackState 管理状态
 * - 按 J 键表示"是目标"
 * - 记录命中率、误报率、反应时间
 *
 * @module modes/nback
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./nback-state.js'), require('../modes.js'));
  } else {
    root.RememberNBackMode = factory(root.RememberNBack, root.RememberModes);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberNBack, RememberModes) {
  const NBackState = RememberNBack;

  /**
   * 创建 N-back 模式实例
   * @param {Object} config - 配置
   * @param {Function} config.onComplete - 完成回调
   * @param {Function} config.onStimulus - 刺激显示回调
   * @param {Function} config.getPool - 获取刺激池函数
   */
  function create(config = {}) {
    const state = new NBackState({
      onComplete: config.onComplete || null,
      onStimulus: config.onStimulus || null,
      onProgress: config.onProgress || null,
      getPool: config.getPool || (() => []),
    });

    return {
      id: 'nback',
      name: 'N-back',
      nameZh: 'N-back 训练',
      nameEn: 'N-back',

      _state: state,

      onInit(initConfig) {
        // initConfig 包含 N, length, speed 等参数
      },

      onStart(rawConfig) {
        return state.start(rawConfig);
      },

      onEnd() {
        state.stop();
      },

      onReset() {
        state.reset();
      },

      onKeyPress(key) {
        if (key === 'j' || key === 'J') {
          state.respond();
          return true;
        }
        return false;
      },

      getState() {
        return {
          id: 'nback',
          type: 'nback',
          ...state.getState(),
        };
      },

      // N-back 特有方法
      start(rawConfig) {
        return state.start(rawConfig);
      },

      stop() {
        state.stop();
      },

      respond() {
        state.respond();
      },
    };
  }

  return {
    id: 'nback',
    name: 'N-back',
    nameZh: 'N-back 训练',
    nameEn: 'N-back',
    create,
  };
});
