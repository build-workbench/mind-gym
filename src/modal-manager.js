/**
 * ModalManager - 模态框统一管理
 *
 * 这是一个**深层模块**，封装了模态框管理的完整逻辑：
 * - 调用者只需调用 open(modalEl) / close(modalEl)
 * - 不需关心 focus trap、aria 属性、焦点恢复等细节
 *
 * @module modal-manager
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberModalManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * 可聚焦元素选择器
   * @type {string}
   */
  const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  /**
   * ModalManager 类
   * 统一管理所有模态框的开/关、focus trap、aria 属性
   */
  class ModalManager {
    constructor() {
      /** @type {HTMLElement[]} 模态框栈，支持嵌套 */
      this.stack = [];

      /** @type {WeakMap<HTMLElement, HTMLElement>} 记录每个模态框打开前的焦点元素 */
      this.prevFocusMap = new WeakMap();

      /** @type {WeakMap<HTMLElement, Function>} 记录每个模态框的 focus trap 处理器 */
      this.focusTrapMap = new WeakMap();
    }

    /**
     * 打开模态框
     *
     * @param {HTMLElement} modalEl - 模态框元素
     * @param {Object} [options] - 配置选项
     * @param {boolean} [options.trapFocus=true] - 是否启用 focus trap
     */
    open(modalEl, options = {}) {
      if (!modalEl) return;

      const { trapFocus = true } = options;

      // 记录当前焦点元素
      const prevFocus = this.getActiveElement();
      if (prevFocus) {
        this.prevFocusMap.set(modalEl, prevFocus);
      }

      // 显示模态框
      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');
      modalEl.setAttribute('aria-hidden', 'false');

      // 启用 focus trap
      if (trapFocus) {
        this.activateFocusTrap(modalEl);
      }

      // 聚焦模态框内第一个可聚焦元素
      this.focusFirst(modalEl);

      // 加入栈
      this.stack.push(modalEl);
    }

    /**
     * 关闭模态框
     *
     * @param {HTMLElement} modalEl - 模态框元素
     */
    close(modalEl) {
      if (!modalEl) return;

      // 隐藏模态框
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
      modalEl.setAttribute('aria-hidden', 'true');

      // 停用 focus trap
      this.deactivateFocusTrap(modalEl);

      // 恢复之前的焦点
      const prevFocus = this.prevFocusMap.get(modalEl);
      if (prevFocus && typeof prevFocus.focus === 'function') {
        prevFocus.focus();
      }

      // 从栈中移除
      const index = this.stack.indexOf(modalEl);
      if (index > -1) {
        this.stack.splice(index, 1);
      }
    }

    /**
     * 关闭最顶层的模态框
     */
    closeTop() {
      if (this.stack.length === 0) return;
      const topModal = this.stack[this.stack.length - 1];
      this.close(topModal);
    }

    /**
     * 关闭所有模态框
     */
    closeAll() {
      while (this.stack.length > 0) {
        this.closeTop();
      }
    }

    /**
     * 检查模态框是否打开
     *
     * @param {HTMLElement} modalEl - 模态框元素
     * @returns {boolean}
     */
    isOpen(modalEl) {
      return this.stack.includes(modalEl);
    }

    /**
     * 获取当前模态框栈
     *
     * @returns {HTMLElement[]}
     */
    getStack() {
      return [...this.stack];
    }

    // ==================== 私有方法 ====================

    /**
     * 获取当前活动元素
     * @private
     */
    getActiveElement() {
      if (typeof document !== 'undefined') {
        return document.activeElement;
      }
      return null;
    }

    /**
     * 获取元素内所有可聚焦元素
     * @private
     */
    getFocusableElements(el) {
      if (!el) return [];
      return Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        node =>
          !node.disabled && node.offsetParent !== null && node.getAttribute('tabindex') !== '-1'
      );
    }

    /**
     * 聚焦模态框内第一个可聚焦元素
     * @private
     */
    focusFirst(modalEl) {
      const focusable = this.getFocusableElements(modalEl);
      const first = focusable[0];
      if (first) {
        this.queueFocus(() => first.focus());
      } else if (modalEl) {
        // 如果没有可聚焦元素，聚焦模态框本身
        this.queueFocus(() => modalEl.focus());
      }
    }

    /**
     * 创建 focus trap 处理器
     * @private
     */
    createFocusTrap(modalEl) {
      const handler = e => {
        if (e.key !== 'Tab') return;

        const focusable = this.getFocusableElements(modalEl);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      return handler;
    }

    /**
     * 激活 focus trap
     * @private
     */
    activateFocusTrap(modalEl) {
      const handler = this.createFocusTrap(modalEl);
      modalEl.addEventListener('keydown', handler);
      this.focusTrapMap.set(modalEl, handler);
    }

    /**
     * 停用 focus trap
     * @private
     */
    deactivateFocusTrap(modalEl) {
      const handler = this.focusTrapMap.get(modalEl);
      if (handler) {
        modalEl.removeEventListener('keydown', handler);
        this.focusTrapMap.delete(modalEl);
      }
    }

    /**
     * 异步执行焦点操作
     * @private
     */
    queueFocus(fn) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(fn);
      } else {
        setTimeout(fn, 0);
      }
    }
  }

  return { ModalManager };
});
