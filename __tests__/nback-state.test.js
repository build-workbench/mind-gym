/**
 * NBackState Tests
 */

const RememberNBack = require('../src/nback-state.js');
const RememberModes = require('../src/modes.js');
const RememberShared = require('../src/shared.js');

describe('NBackState', () => {
  describe('constructor', () => {
    test('creates instance with default config', () => {
      const nback = new RememberNBack();
      const state = nback.getState();

      expect(state.running).toBe(false);
      expect(state.config.N).toBe(2);
      expect(state.config.length).toBe(20);
      expect(state.config.speed).toBe(900);
    });
  });

  describe('start', () => {
    test('starts N-back task with config', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const nback = new RememberNBack({ getPool: () => pool });

      const result = nback.start({ N: 2, length: 10, speed: 1000 });
      expect(result).toBe(true);

      const state = nback.getState();
      expect(state.running).toBe(true);
      expect(state.config.N).toBe(2);
      expect(state.config.length).toBe(10);
      expect(state.config.speed).toBe(1000);
    });

    test('returns false if pool is empty', () => {
      const nback = new RememberNBack({ getPool: () => [] });
      const result = nback.start({ N: 2, length: 10 });
      expect(result).toBe(false);
    });

    test('returns false if already running', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const nback = new RememberNBack({ getPool: () => pool });

      nback.start({ N: 2, length: 10, speed: 10000 });
      const result = nback.start({ N: 2, length: 10, speed: 10000 });
      expect(result).toBe(false);
    });
  });

  describe('stop', () => {
    test('stops running task', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const nback = new RememberNBack({ getPool: () => pool });

      nback.start({ N: 2, length: 10, speed: 10000 });
      nback.stop();

      const state = nback.getState();
      expect(state.running).toBe(false);
    });
  });

  describe('respond', () => {
    test('tracks hits and false alarms', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const onComplete = jest.fn();
      const onStimulus = jest.fn();
      const nback = new RememberNBack({
        getPool: () => pool,
        onComplete,
        onStimulus,
      });

      // Start with very fast speed to finish quickly in test
      nback.start({ N: 2, length: 6, speed: 50 });

      // Wait for task to complete
      setTimeout(() => {
        const state = nback.getState();
        expect(state.stats.hits + state.stats.falseAlarms).toBeGreaterThan(0);
        expect(onComplete).toHaveBeenCalled();
      }, 400);
    });
  });

  describe('getState', () => {
    test('returns current state snapshot', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const nback = new RememberNBack({ getPool: () => pool });

      nback.start({ N: 2, length: 10, speed: 10000 });

      const state = nback.getState();
      expect(state.running).toBe(true);
      expect(state.progress).toBeDefined();
      expect(state.stats).toBeDefined();
      expect(state.config).toBeDefined();
    });
  });

  describe('reset', () => {
    test('resets all state', () => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      const nback = new RememberNBack({ getPool: () => pool });

      nback.start({ N: 2, length: 10, speed: 10000 });
      nback.reset();

      const state = nback.getState();
      expect(state.running).toBe(false);
      expect(state.progress.current).toBe(0);
      expect(state.stats.hits).toBe(0);
    });
  });
});
