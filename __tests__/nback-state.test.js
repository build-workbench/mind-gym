/**
 * NBackState Tests
 */

const RememberNBack = require('../src/nback-state.js');

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
    test('returns null when not running', () => {
      const nback = new RememberNBack();
      const result = nback.respond();
      expect(result).toBeNull();
    });

    test('returns result object with wasTarget, wasHit, wasFalseAlarm, responseTime', done => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      let responded = false;
      const nback = new RememberNBack({
        getPool: () => pool,
        onStimulus: () => {
          if (!responded) {
            responded = true;
            const result = nback.respond();
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('wasTarget');
            expect(result).toHaveProperty('wasHit');
            expect(result).toHaveProperty('wasFalseAlarm');
            expect(result).toHaveProperty('responseTime');
            expect(typeof result.responseTime).toBe('number');
            // wasHit and wasFalseAlarm should be opposites
            expect(result.wasHit).toBe(!result.wasFalseAlarm);
            nback.stop();
            done();
          }
        },
      });

      nback.start({ N: 2, length: 10, speed: 100 });
    });

    test('returns null on second call (already responded)', done => {
      const pool = ['😀', '😎', '🎉', '🌟'];
      let callCount = 0;
      const nback = new RememberNBack({
        getPool: () => pool,
        onStimulus: () => {
          callCount++;
          if (callCount === 1) {
            const result1 = nback.respond();
            expect(result1).not.toBeNull();
            const result2 = nback.respond();
            expect(result2).toBeNull(); // already responded
            nback.stop();
            done();
          }
        },
      });

      nback.start({ N: 2, length: 10, speed: 100 });
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
