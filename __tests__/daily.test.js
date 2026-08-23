/**
 * DailyChallengeManager Tests
 */

const RememberDaily = require('../src/daily.js');

describe('DailyChallengeManager', () => {
  describe('todayStr', () => {
    test('returns today date string in YYYY-MM-DD format', () => {
      const result = RememberDaily.todayStr();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('seedFromDate', () => {
    test('generates consistent seed for same inputs', () => {
      const seed1 = RememberDaily.seedFromDate('2026-05-13', 'easy', 'emoji');
      const seed2 = RememberDaily.seedFromDate('2026-05-13', 'easy', 'emoji');
      expect(seed1).toBe(seed2);
    });

    test('generates different seeds for different inputs', () => {
      const seed1 = RememberDaily.seedFromDate('2026-05-13', 'easy', 'emoji');
      const seed2 = RememberDaily.seedFromDate('2026-05-14', 'easy', 'emoji');
      expect(seed1).not.toBe(seed2);
    });
  });

  describe('getSeed', () => {
    test('generates seed for today', () => {
      const seed = RememberDaily.getSeed('easy', 'emoji');
      expect(typeof seed).toBe('number');
    });
  });

  describe('isDone and markDone', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('returns false initially', () => {
      const result = RememberDaily.isDone('easy');
      expect(result).toBe(false);
    });

    test('returns true after marking done', () => {
      RememberDaily.markDone('easy');
      const result = RememberDaily.isDone('easy');
      expect(result).toBe(true);
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('returns status for all difficulties', () => {
      const status = RememberDaily.getStatus(['easy', 'medium'], 'emoji');
      expect(status).toHaveProperty('easy');
      expect(status).toHaveProperty('medium');
      expect(status.easy).toHaveProperty('done');
      expect(status.easy).toHaveProperty('seed');
    });
  });

  describe('startChallenge', () => {
    test('returns challenge config', () => {
      const config = RememberDaily.startChallenge('easy', 'emoji');
      expect(config).toHaveProperty('seed');
      expect(config).toHaveProperty('difficulty', 'easy');
      expect(config).toHaveProperty('theme', 'emoji');
      expect(config).toHaveProperty('date');
    });
  });

  describe('completeChallenge', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('marks challenge as done', () => {
      RememberDaily.completeChallenge('easy');
      expect(RememberDaily.isDone('easy')).toBe(true);
    });
  });

  describe('DailyChallengeManager class', () => {
    test('can create instance', () => {
      const manager = new RememberDaily.DailyChallengeManager();
      expect(manager).toBeInstanceOf(RememberDaily.DailyChallengeManager);
    });

    test('instance methods work', () => {
      localStorage.clear();
      const manager = new RememberDaily.DailyChallengeManager();
      expect(manager.isDone('hard')).toBe(false);
      manager.markDone('hard');
      expect(manager.isDone('hard')).toBe(true);
    });
  });
});
