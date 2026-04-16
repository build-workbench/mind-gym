const Stats = require('../src/stats.js');

describe('normalizeStats', () => {
  test('returns default stats for null/undefined input', () => {
    const result = Stats.normalizeStats(null);
    expect(result.games).toBe(0);
    expect(result.wins).toBe(0);
    expect(result.timeSum).toBe(0);
  });

  test('returns default stats for non-object input', () => {
    expect(Stats.normalizeStats('string')).toEqual(Stats.DEFAULT_STATS);
    expect(Stats.normalizeStats(123)).toEqual(Stats.DEFAULT_STATS);
    expect(Stats.normalizeStats([])).toEqual(Stats.DEFAULT_STATS);
  });

  test('normalizes valid stats object', () => {
    const input = {
      games: 10,
      wins: 8,
      timeSum: 500,
      movesSum: 200,
    };
    const result = Stats.normalizeStats(input);
    expect(result.games).toBe(10);
    expect(result.wins).toBe(8);
    expect(result.timeSum).toBe(500);
    expect(result.movesSum).toBe(200);
  });

  test('converts string numbers to integers', () => {
    const input = {
      games: '10',
      wins: '5',
      timeSum: '100',
    };
    const result = Stats.normalizeStats(input);
    expect(result.games).toBe(10);
    expect(result.wins).toBe(5);
    expect(result.timeSum).toBe(100);
  });

  test('handles negative values by clamping to 0', () => {
    const input = {
      games: -5,
      wins: -3,
      timeSum: -100,
    };
    const result = Stats.normalizeStats(input);
    expect(result.games).toBe(0);
    expect(result.wins).toBe(0);
    expect(result.timeSum).toBe(0);
  });

  test('handles invalid values gracefully', () => {
    const input = {
      games: NaN,
      wins: Infinity,
      timeSum: 'invalid',
    };
    const result = Stats.normalizeStats(input);
    expect(result.games).toBe(0);
    expect(result.wins).toBe(0);
    expect(result.timeSum).toBe(0);
  });

  test('preserves floating point numbers for combo fields', () => {
    const input = {
      comboSum: 15.5,
      precisionSum: 0.85,
    };
    const result = Stats.normalizeStats(input);
    expect(result.comboSum).toBe(15.5);
    expect(result.precisionSum).toBe(0.85);
  });

  test('floors integer fields', () => {
    const input = {
      games: 10.9,
      wins: 5.5,
    };
    const result = Stats.normalizeStats(input);
    expect(result.games).toBe(10);
    expect(result.wins).toBe(5);
  });
});

describe('recordGameStarted', () => {
  test('increments games counter', () => {
    const stats = { games: 5, wins: 2 };
    const result = Stats.recordGameStarted(stats);
    expect(result.games).toBe(6);
    expect(result.wins).toBe(2);
  });

  test('starts from 0 if no previous stats', () => {
    const result = Stats.recordGameStarted(null);
    expect(result.games).toBe(1);
  });

  test('preserves other stats fields', () => {
    const stats = {
      games: 5,
      wins: 3,
      timeSum: 200,
      bestCombo: 5,
    };
    const result = Stats.recordGameStarted(stats);
    expect(result.wins).toBe(3);
    expect(result.timeSum).toBe(200);
    expect(result.bestCombo).toBe(5);
  });
});

describe('recordGameWon', () => {
  test('increments wins counter and accumulates stats', () => {
    const stats = { games: 10, wins: 5, timeSum: 100, movesSum: 50 };
    const result = Stats.recordGameWon(stats, {
      elapsed: 30,
      moves: 10,
      hintsUsed: 2,
      maxCombo: 3,
    });

    expect(result.wins).toBe(6);
    expect(result.timeSum).toBe(130);
    expect(result.movesSum).toBe(60);
    expect(result.hintsSum).toBe(2);
    expect(result.comboSum).toBe(3);
    expect(result.bestCombo).toBe(3);
  });

  test('updates bestCombo when new combo is higher', () => {
    const stats = { games: 10, wins: 5, bestCombo: 3, comboSum: 10 };
    const result = Stats.recordGameWon(stats, {
      elapsed: 30,
      moves: 10,
      maxCombo: 7,
    });

    expect(result.bestCombo).toBe(7);
  });

  test('preserves bestCombo when new combo is lower', () => {
    const stats = { games: 10, wins: 5, bestCombo: 7, comboSum: 10 };
    const result = Stats.recordGameWon(stats, {
      elapsed: 30,
      moves: 10,
      maxCombo: 3,
    });

    expect(result.bestCombo).toBe(7);
  });

  test('handles null payload gracefully', () => {
    const stats = { games: 10, wins: 5 };
    const result = Stats.recordGameWon(stats, null);
    expect(result.wins).toBe(6);
  });

  test('handles missing payload fields gracefully', () => {
    const stats = { games: 10, wins: 5, timeSum: 0 };
    const result = Stats.recordGameWon(stats, {});
    expect(result.wins).toBe(6);
    expect(result.timeSum).toBe(0);
    expect(result.movesSum).toBe(0);
  });

  test('handles negative payload values', () => {
    const stats = { games: 10, wins: 5, timeSum: 100 };
    const result = Stats.recordGameWon(stats, {
      elapsed: -10,
      moves: -5,
      hintsUsed: -3,
      maxCombo: -2,
    });

    expect(result.timeSum).toBe(100);
    expect(result.movesSum).toBe(0);
    expect(result.hintsSum).toBe(0);
    expect(result.comboSum).toBe(0);
  });
});

describe('getRating', () => {
  test('returns rating between 1 and 5', () => {
    const rating = Stats.getRating(100, 20, 'easy', 0, 0);
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });

  test('better time gives better rating', () => {
    const ratingFast = Stats.getRating(30, 8, 'easy', 0, 0);
    const ratingSlow = Stats.getRating(120, 8, 'easy', 0, 0);
    expect(ratingFast).toBeGreaterThan(ratingSlow);
  });

  test('fewer moves gives better rating', () => {
    const ratingFewMoves = Stats.getRating(60, 8, 'easy', 0, 0);
    const ratingManyMoves = Stats.getRating(60, 20, 'easy', 0, 0);
    expect(ratingFewMoves).toBeGreaterThan(ratingManyMoves);
  });

  test('no hints gives better rating', () => {
    const ratingNoHints = Stats.getRating(60, 10, 'easy', 0, 0);
    const ratingWithHints = Stats.getRating(60, 10, 'easy', 3, 0);
    expect(ratingNoHints).toBeGreaterThan(ratingWithHints);
  });

  test('higher combo improves rating', () => {
    const ratingNoCombo = Stats.getRating(60, 10, 'easy', 0, 0);
    const ratingHighCombo = Stats.getRating(60, 10, 'easy', 0, 5);
    expect(ratingHighCombo).toBeGreaterThan(ratingNoCombo);
  });

  test('handles different difficulties', () => {
    const easyRating = Stats.getRating(60, 8, 'easy', 0, 0);
    const mediumRating = Stats.getRating(120, 10, 'medium', 0, 0);
    const hardRating = Stats.getRating(180, 18, 'hard', 0, 0);

    // Each difficulty has different par times/moves
    expect(easyRating).toBeGreaterThanOrEqual(1);
    expect(mediumRating).toBeGreaterThanOrEqual(1);
    expect(hardRating).toBeGreaterThanOrEqual(1);
  });

  test('handles unknown difficulty as easy', () => {
    const rating = Stats.getRating(60, 8, 'unknown', 0, 0);
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });

  test('handles null/undefined values gracefully', () => {
    const rating = Stats.getRating(null, undefined, 'easy', null, undefined);
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });
});

describe('formatRate', () => {
  test('returns percentage string for valid inputs', () => {
    expect(Stats.formatRate(1, 2)).toBe('50%');
    expect(Stats.formatRate(3, 4)).toBe('75%');
    expect(Stats.formatRate(1, 3)).toBe('33%');
  });

  test('returns em-dash when denominator is 0', () => {
    expect(Stats.formatRate(5, 0)).toBe('—');
  });

  test('rounds to nearest integer', () => {
    expect(Stats.formatRate(1, 3)).toBe('33%');
    expect(Stats.formatRate(2, 3)).toBe('67%');
  });

  test('handles 100%', () => {
    expect(Stats.formatRate(10, 10)).toBe('100%');
  });

  test('handles 0%', () => {
    expect(Stats.formatRate(0, 10)).toBe('0%');
  });
});

describe('recordRecallAttempt', () => {
  test('increments recallAttempts and accumulates precision/recall', () => {
    const stats = { recallAttempts: 2, precisionSum: 1.5, recallSum: 1.2 };
    const result = Stats.recordRecallAttempt(stats, {
      precision: 0.8,
      recall: 0.6,
    });

    expect(result.recallAttempts).toBe(3);
    expect(result.precisionSum).toBeCloseTo(2.3);
    expect(result.recallSum).toBeCloseTo(1.8);
  });

  test('handles null payload', () => {
    const stats = { recallAttempts: 1 };
    const result = Stats.recordRecallAttempt(stats, null);
    expect(result.recallAttempts).toBe(2);
  });
});

describe('recordNBackAttempt', () => {
  test('increments nbackAttempts and accumulates stats', () => {
    const stats = { nbackAttempts: 3, nbackAccSum: 2.5, nbackRtSum: 600, nbackRtCount: 3 };
    const result = Stats.recordNBackAttempt(stats, {
      accuracy: 0.9,
      rtSum: 300,
      rtCount: 3,
    });

    expect(result.nbackAttempts).toBe(4);
    expect(result.nbackAccSum).toBeCloseTo(3.4);
    expect(result.nbackRtSum).toBeCloseTo(900);
    expect(result.nbackRtCount).toBe(6);
  });

  test('handles null payload', () => {
    const stats = { nbackAttempts: 1 };
    const result = Stats.recordNBackAttempt(stats, null);
    expect(result.nbackAttempts).toBe(2);
  });
});

describe('buildStatsSummary', () => {
  test('returns summary with dashes for empty stats', () => {
    const summary = Stats.buildStatsSummary({});
    expect(summary.avgTime).toBe('—');
    expect(summary.avgMoves).toBe('—');
    expect(summary.avgHints).toBe('—');
    expect(summary.avgCombo).toBe('—');
    expect(summary.winRate).toBe('—');
  });

  test('calculates averages correctly', () => {
    const stats = {
      games: 10,
      wins: 5,
      timeSum: 250,
      movesSum: 100,
      hintsSum: 10,
      comboSum: 15,
    };
    const summary = Stats.buildStatsSummary(stats, s => `${s}s`);

    expect(summary.avgTime).toBe('50s');
    expect(summary.avgMoves).toBe(20);
    expect(summary.avgHints).toBe('2.00');
    expect(summary.avgCombo).toBe('3.00');
    expect(summary.winRate).toBe('50%');
  });

  test('formats time using custom formatter', () => {
    const stats = { games: 2, wins: 2, timeSum: 120 };
    const summary = Stats.buildStatsSummary(
      stats,
      s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    );
    expect(summary.avgTime).toBe('1:00');
  });

  test('uses default string formatter if no formatter provided', () => {
    const stats = { games: 2, wins: 2, timeSum: 120 };
    const summary = Stats.buildStatsSummary(stats);
    expect(summary.avgTime).toBe('60');
  });
});

describe('DEFAULT_STATS', () => {
  test('is frozen', () => {
    expect(Object.isFrozen(Stats.DEFAULT_STATS)).toBe(true);
  });

  test('has all required fields', () => {
    expect(Stats.DEFAULT_STATS).toHaveProperty('games');
    expect(Stats.DEFAULT_STATS).toHaveProperty('wins');
    expect(Stats.DEFAULT_STATS).toHaveProperty('timeSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('movesSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('hintsSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('comboSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('bestCombo');
    expect(Stats.DEFAULT_STATS).toHaveProperty('recallAttempts');
    expect(Stats.DEFAULT_STATS).toHaveProperty('precisionSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('recallSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('nbackAttempts');
    expect(Stats.DEFAULT_STATS).toHaveProperty('nbackAccSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('nbackRtSum');
    expect(Stats.DEFAULT_STATS).toHaveProperty('nbackRtCount');
  });

  test('all default values are 0', () => {
    Object.values(Stats.DEFAULT_STATS).forEach(value => {
      expect(value).toBe(0);
    });
  });
});
