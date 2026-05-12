/**
 * GameModeRegistry - 游戏模式注册表
 *
 * 这是一个**深层模块**，封装了游戏模式的管理：
 * - 调用者只需调用 register(mode) 注册模式
 * - 调用 switchTo(modeId) 切换模式
 * - 模式实现统一接口，隐藏各自的具体逻辑
 *
 * @module modes/registry
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberModeRegistry = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * GameMode 接口（文档参考）
   *
   * interface GameMode {
   *   id: string;
   *   name: string;
   *
   *   // 生命周期
   *   onInit?(config: GameConfig): void;
   *   onStart?(): void;
   *   onEnd?(result: GameResult): void;
   *   onReset?(): void;
   *
   *   // 事件处理（可选，根据模式类型）
   *   onFlip?(card: CardElement): FlipResult;
   *   onKeyPress?(key: string): void;
   *   onTimerTick?(elapsed: number): void;
   *
   *   // 状态查询
   *   getState?(): ModeState;
   * }
   */

  class ModeRegistry {
    constructor() {
      this._modes = new Map();
      this._currentMode = null;
      this._listeners = [];
    }

    /**
     * 注册游戏模式
     * @param {Object} mode - 模式实现
     * @param {string} mode.id - 模式唯一标识
     * @param {string} mode.name - 模式显示名称
     */
    register(mode) {
      if (!mode || !mode.id) {
        throw new Error('ModeRegistry: mode must have an id');
      }
      if (this._modes.has(mode.id)) {
        console.warn(`ModeRegistry: mode "${mode.id}" already registered, overwriting`);
      }
      this._modes.set(mode.id, mode);
    }

    /**
     * 获取模式
     * @param {string} id - 模式 ID
     * @returns {Object|undefined}
     */
    get(id) {
      return this._modes.get(id);
    }

    /**
     * 获取所有已注册模式
     * @returns {Object[]}
     */
    getAll() {
      return Array.from(this._modes.values());
    }

    /**
     * 获取当前模式
     * @returns {Object|null}
     */
    getCurrent() {
      return this._currentMode;
    }

    /**
     * 获取当前模式 ID
     * @returns {string|null}
     */
    getCurrentId() {
      return this._currentMode ? this._currentMode.id : null;
    }

    /**
     * 切换到指定模式
     * @param {string} id - 模式 ID
     * @param {Object} [config] - 初始化配置
     * @returns {boolean} 是否切换成功
     */
    switchTo(id, config = {}) {
      const mode = this._modes.get(id);
      if (!mode) {
        console.error(`ModeRegistry: mode "${id}" not found`);
        return false;
      }

      // 调用当前模式的 onEnd（如果有）
      if (this._currentMode && this._currentMode.onEnd) {
        try {
          this._currentMode.onEnd({ reason: 'mode_switch' });
        } catch (err) {
          console.error(`ModeRegistry: onEnd error for mode "${this._currentMode.id}"`, err);
        }
      }

      this._currentMode = mode;

      // 调用新模式的 onInit（如果有）
      if (mode.onInit) {
        try {
          mode.onInit(config);
        } catch (err) {
          console.error(`ModeRegistry: onInit error for mode "${id}"`, err);
        }
      }

      this._notifyChange(id);

      return true;
    }

    /**
     * 重置当前模式
     */
    resetCurrent() {
      if (this._currentMode && this._currentMode.onReset) {
        try {
          this._currentMode.onReset();
        } catch (err) {
          console.error(`ModeRegistry: onReset error for mode "${this._currentMode.id}"`, err);
        }
      }
    }

    /**
     * 触发当前模式的 flip 事件
     * @param {Object} card - 卡片数据
     * @returns {Object|undefined}
     */
    onFlip(card) {
      if (this._currentMode && this._currentMode.onFlip) {
        return this._currentMode.onFlip(card);
      }
      return undefined;
    }

    /**
     * 触发当前模式的 keyPress 事件
     * @param {string} key - 按键
     */
    onKeyPress(key) {
      if (this._currentMode && this._currentMode.onKeyPress) {
        this._currentMode.onKeyPress(key);
      }
    }

    /**
     * 触发当前模式的 timerTick 事件
     * @param {number} elapsed - 已过时间
     */
    onTimerTick(elapsed) {
      if (this._currentMode && this._currentMode.onTimerTick) {
        this._currentMode.onTimerTick(elapsed);
      }
    }

    /**
     * 获取当前模式状态
     * @returns {Object|undefined}
     */
    getState() {
      if (this._currentMode && this._currentMode.getState) {
        return this._currentMode.getState();
      }
      return undefined;
    }

    /**
     * 监听模式变更
     * @param {Function} callback - 回调函数 (modeId) => void
     * @returns {Function} 取消订阅函数
     */
    onChange(callback) {
      if (typeof callback !== 'function') {
        throw new Error('ModeRegistry: onChange callback must be a function');
      }
      this._listeners.push(callback);
      return () => {
        const index = this._listeners.indexOf(callback);
        if (index >= 0) {
          this._listeners.splice(index, 1);
        }
      };
    }

    _notifyChange(modeId) {
      this._listeners.forEach(callback => {
        try {
          callback(modeId);
        } catch (err) {
          console.error('ModeRegistry: onChange callback error', err);
        }
      });
    }
  }

  const instance = new ModeRegistry();

  return {
    register: mode => instance.register(mode),
    get: id => instance.get(id),
    getAll: () => instance.getAll(),
    getCurrent: () => instance.getCurrent(),
    getCurrentId: () => instance.getCurrentId(),
    switchTo: (id, config) => instance.switchTo(id, config),
    resetCurrent: () => instance.resetCurrent(),
    onFlip: card => instance.onFlip(card),
    onKeyPress: key => instance.onKeyPress(key),
    onTimerTick: elapsed => instance.onTimerTick(elapsed),
    getState: () => instance.getState(),
    onChange: callback => instance.onChange(callback),
  };
});
