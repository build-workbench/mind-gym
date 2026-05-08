/**
 * ModalManager 测试用例
 * 测试模态框统一管理的核心逻辑
 */

const { ModalManager } = require('../src/modal-manager.js');

describe('ModalManager', () => {
  let manager;
  let modalEl;
  let mockDocument;

  beforeEach(() => {
    // 创建模拟 DOM 环境
    mockDocument = {
      activeElement: null,
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    modalEl = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
      },
      setAttribute: jest.fn(),
      getAttribute: jest.fn(() => 'true'),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      focus: jest.fn(),
    };

    // 模拟全局 document
    global.document = mockDocument;

    manager = new ModalManager();
  });

  afterEach(() => {
    delete global.document;
  });

  describe('constructor', () => {
    it('应该初始化空栈', () => {
      expect(manager.getStack()).toEqual([]);
    });
  });

  describe('open', () => {
    it('应该添加 modal-visible 类', () => {
      manager.open(modalEl);
      expect(modalEl.classList.remove).toHaveBeenCalledWith('hidden');
      expect(modalEl.classList.add).toHaveBeenCalledWith('flex');
    });

    it('应该设置正确的 aria 属性', () => {
      manager.open(modalEl);
      expect(modalEl.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
    });

    it('应该将模态框加入栈', () => {
      manager.open(modalEl);
      expect(manager.getStack()).toHaveLength(1);
      expect(manager.getStack()[0]).toBe(modalEl);
    });

    it('应该记录之前的焦点元素', () => {
      const prevFocus = { focus: jest.fn() };
      mockDocument.activeElement = prevFocus;
      manager.open(modalEl);
      // 验证焦点被记录（通过 close 时恢复）
      manager.close(modalEl);
      expect(prevFocus.focus).toHaveBeenCalled();
    });

    it('支持嵌套模态框', () => {
      const modal2 = { ...modalEl, classList: { add: jest.fn(), remove: jest.fn() } };
      manager.open(modalEl);
      manager.open(modal2);
      expect(manager.getStack()).toHaveLength(2);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      manager.open(modalEl);
    });

    it('应该添加 modal-hidden 类', () => {
      manager.close(modalEl);
      expect(modalEl.classList.add).toHaveBeenCalledWith('hidden');
      expect(modalEl.classList.remove).toHaveBeenCalledWith('flex');
    });

    it('应该设置正确的 aria 属性', () => {
      manager.close(modalEl);
      expect(modalEl.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
    });

    it('应该从栈中移除模态框', () => {
      manager.close(modalEl);
      expect(manager.getStack()).toHaveLength(0);
    });

    it('应该恢复之前的焦点', () => {
      const prevFocus = { focus: jest.fn() };
      mockDocument.activeElement = prevFocus;
      manager.open(modalEl);
      manager.close(modalEl);
      expect(prevFocus.focus).toHaveBeenCalled();
    });
  });

  describe('closeTop', () => {
    it('应该关闭最顶层的模态框', () => {
      const modal2 = {
        classList: { add: jest.fn(), remove: jest.fn() },
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
      };
      manager.open(modalEl);
      manager.open(modal2);
      manager.closeTop();
      expect(modal2.classList.add).toHaveBeenCalledWith('hidden');
      expect(manager.getStack()).toHaveLength(1);
    });

    it('栈为空时不应报错', () => {
      expect(() => manager.closeTop()).not.toThrow();
    });
  });

  describe('isOpen', () => {
    it('模态框打开时应返回 true', () => {
      manager.open(modalEl);
      expect(manager.isOpen(modalEl)).toBe(true);
    });

    it('模态框关闭时应返回 false', () => {
      manager.open(modalEl);
      manager.close(modalEl);
      expect(manager.isOpen(modalEl)).toBe(false);
    });
  });

  describe('getStack', () => {
    it('应该返回当前模态框栈', () => {
      const modal2 = {
        classList: { add: jest.fn(), remove: jest.fn() },
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
      };
      manager.open(modalEl);
      manager.open(modal2);
      const stack = manager.getStack();
      expect(stack).toEqual([modalEl, modal2]);
    });
  });

  describe('closeAll', () => {
    it('应该关闭所有模态框', () => {
      const modal2 = {
        classList: { add: jest.fn(), remove: jest.fn() },
        setAttribute: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
      };
      manager.open(modalEl);
      manager.open(modal2);
      manager.closeAll();
      expect(manager.getStack()).toHaveLength(0);
      expect(modalEl.classList.add).toHaveBeenCalledWith('hidden');
      expect(modal2.classList.add).toHaveBeenCalledWith('hidden');
    });
  });
});
