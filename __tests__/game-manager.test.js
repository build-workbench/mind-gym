/**
 * GameManager 测试用例
 * 测试翻牌匹配游戏的核心逻辑
 */

const { GameManager } = require('../src/game-manager.js');

describe('GameManager', () => {
  let game;
  let callbacks;

  beforeEach(() => {
    callbacks = {
      onMatch: jest.fn(),
      onMismatch: jest.fn(),
      onWin: jest.fn(),
      onProgress: jest.fn(),
    };
    game = new GameManager({ totalPairs: 2, ...callbacks });
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(game.config.totalPairs).toBe(2);
    });

    it('should call reset on construction', () => {
      const state = game.getState();
      expect(state.moves).toBe(0);
      expect(state.matchedPairs).toBe(0);
      expect(state.isLocked).toBe(false);
      expect(state.isComplete).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      game.flip(0, 'A');
      game.flip(1, 'A');
      game.reset();
      const state = game.getState();
      expect(state.moves).toBe(0);
      expect(state.matchedPairs).toBe(0);
    });
  });

  describe('flip', () => {
    describe('第一张卡', () => {
      it('应该接受第一张卡的翻转', () => {
        const result = game.flip(0, 'A');
        expect(result.canFlip).toBe(true);
        expect(result.isFirstCard).toBe(true);
        expect(result.matched).toBeUndefined();
        expect(result.isWin).toBeUndefined();
      });

      it('未锁定时应允许翻转', () => {
        const state = game.getState();
        expect(state.isLocked).toBe(false);
        const result = game.flip(0, 'A');
        expect(result.canFlip).toBe(true);
      });
    });

    describe('第二张卡 - 匹配', () => {
      it('应该检测到匹配', () => {
        game.flip(0, 'A');
        const result = game.flip(1, 'A');
        expect(result.canFlip).toBe(true);
        expect(result.matched).toBe(true);
        expect(result.isSecondCard).toBe(true);
      });

      it('匹配时应调用 onMatch 回调', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        expect(callbacks.onMatch).toHaveBeenCalledTimes(1);
        expect(callbacks.onMatch).toHaveBeenCalledWith(
          { index: 0, value: 'A' },
          { index: 1, value: 'A' }
        );
      });

      it('匹配时应调用 onProgress 回调', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        expect(callbacks.onProgress).toHaveBeenCalledWith(1, 2);
      });

      it('匹配时应增加 matchedPairs 计数', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        const state = game.getState();
        expect(state.matchedPairs).toBe(1);
      });

      it('匹配后不应锁定棋盘', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        const state = game.getState();
        expect(state.isLocked).toBe(false);
      });
    });

    describe('第二张卡 - 不匹配', () => {
      it('应该检测到不匹配', () => {
        game.flip(0, 'A');
        const result = game.flip(1, 'B');
        expect(result.canFlip).toBe(true);
        expect(result.matched).toBe(false);
        expect(result.isSecondCard).toBe(true);
      });

      it('不匹配时应调用 onMismatch 回调', () => {
        game.flip(0, 'A');
        game.flip(1, 'B');
        expect(callbacks.onMismatch).toHaveBeenCalledTimes(1);
        expect(callbacks.onMismatch).toHaveBeenCalledWith(
          { index: 0, value: 'A' },
          { index: 1, value: 'B' }
        );
      });

      it('不匹配时应锁定棋盘', () => {
        game.flip(0, 'A');
        game.flip(1, 'B');
        const state = game.getState();
        expect(state.isLocked).toBe(true);
      });

      it('锁定后不应允许翻转', () => {
        game.flip(0, 'A');
        game.flip(1, 'B'); // 不匹配，锁定
        const result = game.flip(2, 'C');
        expect(result.canFlip).toBe(false);
      });
    });

    describe('胜利检测', () => {
      it('所有配对匹配时应检测到胜利', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        game.flip(2, 'B');
        const result = game.flip(3, 'B');
        expect(result.isWin).toBe(true);
      });

      it('胜利时应调用 onWin 回调', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        game.flip(2, 'B');
        game.flip(3, 'B');
        expect(callbacks.onWin).toHaveBeenCalledTimes(1);
      });

      it('胜利时 isComplete 应为 true', () => {
        game.flip(0, 'A');
        game.flip(1, 'A');
        game.flip(2, 'B');
        game.flip(3, 'B');
        const state = game.getState();
        expect(state.isComplete).toBe(true);
      });
    });

    describe('边缘情况', () => {
      it('同一张卡不应允许连续点击两次', () => {
        game.flip(0, 'A');
        const result = game.flip(0, 'A');
        expect(result.canFlip).toBe(false);
      });

      it('翻转计数应正确', () => {
        game.flip(0, 'A');
        expect(game.getState().moves).toBe(0); // 第一张不计数
        game.flip(1, 'A');
        expect(game.getState().moves).toBe(1); // 第二张计数
        game.flip(2, 'B');
        game.flip(3, 'B');
        expect(game.getState().moves).toBe(2);
      });
    });
  });

  describe('afterMismatchFlipBack', () => {
    it('应解锁棋盘', () => {
      game.flip(0, 'A');
      game.flip(1, 'B'); // 不匹配，锁定
      expect(game.getState().isLocked).toBe(true);
      game.afterMismatchFlipBack();
      expect(game.getState().isLocked).toBe(false);
    });

    it('应允许继续翻转', () => {
      game.flip(0, 'A');
      game.flip(1, 'B'); // 不匹配
      game.afterMismatchFlipBack();
      const result = game.flip(0, 'A');
      expect(result.canFlip).toBe(true);
    });
  });

  describe('getState', () => {
    it('应返回状态快照', () => {
      game.flip(0, 'A');
      game.flip(1, 'A');
      const state = game.getState();
      expect(state).toEqual({
        moves: 1,
        matchedPairs: 1,
        totalPairs: 2,
        isLocked: false,
        isComplete: false,
      });
    });
  });

  describe('多个游戏周期', () => {
    it('重置后应能开始新游戏', () => {
      // 完成第一个游戏
      game.flip(0, 'A');
      game.flip(1, 'A');
      game.flip(2, 'B');
      game.flip(3, 'B');
      expect(game.getState().isComplete).toBe(true);

      // 重置并开始新游戏
      game.reset();
      expect(game.getState().isComplete).toBe(false);
      expect(game.getState().moves).toBe(0);

      // 新游戏应能正常工作
      game.flip(0, 'X');
      game.flip(1, 'X');
      expect(game.getState().matchedPairs).toBe(1);
    });
  });

  describe('回调安全调用', () => {
    it('回调未定义时不应报错', () => {
      const gameNoCallbacks = new GameManager({ totalPairs: 2 });
      expect(() => {
        gameNoCallbacks.flip(0, 'A');
        gameNoCallbacks.flip(1, 'A');
      }).not.toThrow();
    });
  });
});
