/**
 * GameStateManager Tests
 */

const RememberGameState = require('../src/game-state.js');

describe('GameStateManager', () => {
  beforeEach(() => {
    RememberGameState.reset();
  });

  describe('initGame', () => {
    test('initializes game state with config', () => {
      RememberGameState.initGame({
        difficulty: 'medium',
        totalPairs: 8,
      });

      const state = RememberGameState.getState();
      expect(state.difficulty).toBe('medium');
      expect(state.totalPairs).toBe(8);
      expect(state.moves).toBe(0);
      expect(state.matchedPairs).toBe(0);
      expect(state.elapsed).toBe(0);
      expect(state.started).toBe(false);
      expect(state.paused).toBe(false);
    });

    test('resets all state on re-initialization', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });
      RememberGameState.update({ paused: true, hintsUsed: 3 });

      RememberGameState.initGame({ difficulty: 'hard', totalPairs: 12 });

      const state = RememberGameState.getState();
      expect(state.difficulty).toBe('hard');
      expect(state.paused).toBe(false);
      expect(state.hintsUsed).toBe(0);
    });
  });

  describe('flip', () => {
    test('delegates to GameManager', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      const result = RememberGameState.flip(0, 'A');
      expect(result.canFlip).toBe(true);
      expect(result.isFirstCard).toBe(true);

      const state = RememberGameState.getState();
      expect(state.firstCard).not.toBeNull();
      if (state.firstCard) {
        expect(state.firstCard.index).toBe(0);
        expect(state.firstCard.value).toBe('A');
      }
    });

    test('tracks moves on second flip', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      RememberGameState.flip(0, 'A');
      RememberGameState.flip(1, 'B');

      const state = RememberGameState.getState();
      expect(state.moves).toBe(1);
    });
  });

  describe('update', () => {
    test('updates state properties', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      const changedKeys = RememberGameState.update({
        paused: true,
        hintsUsed: 2,
      });

      expect(changedKeys).toContain('paused');
      expect(changedKeys).toContain('hintsUsed');

      const state = RememberGameState.getState();
      expect(state.paused).toBe(true);
      expect(state.hintsUsed).toBe(2);
    });

    test('validates hint limits', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      RememberGameState.update({ hintsLeft: 100 });
      const state = RememberGameState.getState();
      expect(state.hintsLeft).toBe(3); // HINT_LIMITS.easy = 3
    });
  });

  describe('useHint', () => {
    test('decrements hintsLeft and increments hintsUsed', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6, hintsLeft: 3 });

      const result = RememberGameState.useHint();
      expect(result).toBe(true);

      const state = RememberGameState.getState();
      expect(state.hintsLeft).toBe(2);
      expect(state.hintsUsed).toBe(1);
    });

    test('returns false when no hints left', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6, hintsLeft: 0 });

      const result = RememberGameState.useHint();
      expect(result).toBe(false);
    });

    test('returns false when paused', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6, hintsLeft: 3 });
      RememberGameState.update({ paused: true });

      const result = RememberGameState.useHint();
      expect(result).toBe(false);
    });
  });

  describe('recordMatch', () => {
    test('tracks combo count', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      RememberGameState.recordMatch('A', 'A');
      const state1 = RememberGameState.getState();
      expect(state1.comboCount).toBe(1);
      expect(state1.maxComboThisGame).toBe(1);

      RememberGameState.recordMatch('B', 'B');
      const state2 = RememberGameState.getState();
      expect(state2.comboCount).toBe(2);
      expect(state2.maxComboThisGame).toBe(2);
    });
  });

  describe('pause / resume', () => {
    test('pause stops timer and locks board', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      RememberGameState.pause();

      const state = RememberGameState.getState();
      expect(state.paused).toBe(true);
      expect(state.isLocked).toBe(true);
    });

    test('resume unlocks board', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });
      RememberGameState.pause();

      RememberGameState.resume();

      const state = RememberGameState.getState();
      expect(state.paused).toBe(false);
      expect(state.isLocked).toBe(false);
    });
  });

  describe('onChange', () => {
    test('fires callback on state change', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      const callback = jest.fn();
      RememberGameState.onChange(callback);

      RememberGameState.update({ paused: true });

      expect(callback).toHaveBeenCalled();
      const [newState, changedKeys] = callback.mock.calls[0];
      expect(newState.paused).toBe(true);
      expect(changedKeys).toContain('paused');
    });

    test('returns unsubscribe function', () => {
      RememberGameState.initGame({ difficulty: 'easy', totalPairs: 6 });

      const callback = jest.fn();
      const unsubscribe = RememberGameState.onChange(callback);

      RememberGameState.update({ paused: true });
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      RememberGameState.update({ paused: false });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
