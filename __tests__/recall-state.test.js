/**
 * RecallState Tests
 */

const RememberRecall = require('../src/recall-state.js');

describe('RecallState', () => {
  describe('recordGame', () => {
    test('records game values', () => {
      const recall = new RememberRecall();

      const result = recall.recordGame(['A', 'B', 'C', 'A', 'B']);
      expect(result).toBe(true);

      const state = recall.getState();
      expect(state.lastGameValues).toEqual(['A', 'B', 'C']);
    });

    test('returns false for invalid input', () => {
      const recall = new RememberRecall();

      const result = recall.recordGame('invalid');
      expect(result).toBe(false);
    });
  });

  describe('generateTest', () => {
    test('generates test items from recorded game', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const result = recall.generateTest(pool);

      expect(result).not.toBeNull();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.correctSet).toBeInstanceOf(Set);
      expect(result.correctSet.size).toBeGreaterThan(0);
    });

    test('returns null for invalid pool', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const result = recall.generateTest('invalid');
      expect(result).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    test('scores recall test correctly', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const { correctSet } = recall.generateTest(pool);

      // Select all correct items
      const result = recall.submitAnswer(correctSet);

      expect(result.precision).toBe(1);
      expect(result.recall).toBe(1);
      expect(result.tp).toBe(correctSet.size);
      expect(result.fp).toBe(0);
      expect(result.fn).toBe(0);
    });

    test('scores partial recall correctly', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const { correctSet } = recall.generateTest(pool);

      // Select only some correct items
      const selected = new Set([...correctSet].slice(0, 1));
      const result = recall.submitAnswer(selected);

      expect(result.recall).toBeGreaterThan(0);
      expect(result.recall).toBeLessThan(1);
    });

    test('handles false positives', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      recall.generateTest(pool);

      // Select an incorrect item
      const result = recall.submitAnswer(['X']);

      expect(result.fp).toBe(1);
      expect(result.precision).toBe(0);
    });
  });

  describe('getState', () => {
    test('returns current state snapshot', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);

      const state = recall.getState();
      expect(state.lastGameValues).toEqual(['A', 'B', 'C']);
      expect(state.correctSet).toBeInstanceOf(Set);
      expect(state.testItems).toEqual([]);
    });
  });

  describe('reset', () => {
    test('resets all state', () => {
      const recall = new RememberRecall();
      recall.recordGame(['A', 'B', 'C']);
      recall.reset();

      const state = recall.getState();
      expect(state.lastGameValues).toEqual([]);
      expect(state.correctSet.size).toBe(0);
    });
  });
});
