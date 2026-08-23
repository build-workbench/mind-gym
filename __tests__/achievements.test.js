const Achievements = require('../src/achievements.js');

describe('normalizeAchievements', () => {
  test('returns empty object for null/undefined input', () => {
    expect(Achievements.normalizeAchievements(null)).toEqual({});
    expect(Achievements.normalizeAchievements(undefined)).toEqual({});
  });

  test('returns empty object for non-object input', () => {
    expect(Achievements.normalizeAchievements('string')).toEqual({});
    expect(Achievements.normalizeAchievements(123)).toEqual({});
    expect(Achievements.normalizeAchievements([])).toEqual({});
  });

  test('returns empty object for empty object input', () => {
    expect(Achievements.normalizeAchievements({})).toEqual({});
  });

  test('ignores unknown achievement IDs', () => {
    const input = {
      unknown_achievement: { unlocked: true, at: 123456 },
      another_unknown: true,
    };
    expect(Achievements.normalizeAchievements(input)).toEqual({});
  });

  test('normalizes boolean true to object with timestamp', () => {
    const result = Achievements.normalizeAchievements({
      first_win: true,
    });
    expect(result.first_win).toBeDefined();
    expect(result.first_win.unlocked).toBe(true);
    expect(typeof result.first_win.at).toBe('number');
    expect(result.first_win.at).toBeGreaterThan(0);
  });

  test('keeps valid achievement entries', () => {
    const input = {
      first_win: { unlocked: true, at: 1700000000000 },
      no_hint_win: { unlocked: true, at: 1700000001000 },
    };
    const result = Achievements.normalizeAchievements(input);
    expect(result).toEqual({
      first_win: { unlocked: true, at: 1700000000000 },
      no_hint_win: { unlocked: true, at: 1700000001000 },
    });
  });

  test('ignores entries where unlocked is false', () => {
    const input = {
      first_win: { unlocked: false, at: 1700000000000 },
    };
    expect(Achievements.normalizeAchievements(input)).toEqual({});
  });

  test('normalizes invalid timestamp to Date.now()', () => {
    const input = {
      first_win: { unlocked: true, at: 'invalid' },
    };
    const result = Achievements.normalizeAchievements(input);
    expect(result.first_win.unlocked).toBe(true);
    expect(result.first_win.at).toBeGreaterThan(0);
  });

  test('handles negative timestamp', () => {
    const input = {
      first_win: { unlocked: true, at: -100 },
    };
    const result = Achievements.normalizeAchievements(input);
    expect(result.first_win.at).toBeGreaterThan(0);
  });
});

describe('checkAchievementsOnWin', () => {
  test('unlocks first_win achievement on first win', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 120,
        hintsUsed: 0,
        moves: 16,
        pairs: 8,
      }
    );

    expect(store.first_win).toBeDefined();
    expect(store.first_win.unlocked).toBe(true);
    expect(newly).toContain('first_win');
  });

  test('unlocks easy_under_60 when easy difficulty completed under 60 seconds', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 45,
        hintsUsed: 1,
        moves: 16,
        pairs: 8,
      }
    );

    expect(store.easy_under_60).toBeDefined();
    expect(store.easy_under_60.unlocked).toBe(true);
    expect(newly).toContain('easy_under_60');
  });

  test('does not unlock easy_under_60 when time exceeds 60 seconds', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 65,
        hintsUsed: 0,
        moves: 16,
        pairs: 8,
      }
    );

    expect(store.easy_under_60).toBeUndefined();
    expect(newly).not.toContain('easy_under_60');
  });

  test('unlocks medium_under_120 when medium difficulty completed under 120 seconds', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'medium',
        elapsed: 100,
        hintsUsed: 0,
        moves: 20,
        pairs: 10,
      }
    );

    expect(store.medium_under_120).toBeDefined();
    expect(newly).toContain('medium_under_120');
  });

  test('unlocks hard_under_180 when hard difficulty completed under 180 seconds', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'hard',
        elapsed: 150,
        hintsUsed: 0,
        moves: 36,
        pairs: 18,
      }
    );

    expect(store.hard_under_180).toBeDefined();
    expect(newly).toContain('hard_under_180');
  });

  test('unlocks no_hint_win when no hints used', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'hard',
        elapsed: 300,
        hintsUsed: 0,
        moves: 40,
        pairs: 18,
      }
    );

    expect(store.no_hint_win).toBeDefined();
    expect(newly).toContain('no_hint_win');
  });

  test('does not unlock no_hint_win when hints used', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 60,
        hintsUsed: 2,
        moves: 16,
        pairs: 8,
      }
    );

    expect(store.no_hint_win).toBeUndefined();
    expect(newly).not.toContain('no_hint_win');
  });

  test('unlocks perfect_moves when moves equals pairs', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 100,
        hintsUsed: 5,
        moves: 8,
        pairs: 8,
      }
    );

    expect(store.perfect_moves).toBeDefined();
    expect(newly).toContain('perfect_moves');
  });

  test('does not unlock perfect_moves when moves exceed pairs', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 60,
        hintsUsed: 0,
        moves: 10,
        pairs: 8,
      }
    );

    expect(store.perfect_moves).toBeUndefined();
    expect(newly).not.toContain('perfect_moves');
  });

  test('does not re-unlock already unlocked achievements', () => {
    const existingStore = {
      first_win: { unlocked: true, at: 1700000000000 },
    };

    const { store, newly } = Achievements.checkAchievementsOnWin(existingStore, {
      currentDifficulty: 'easy',
      elapsed: 60,
      hintsUsed: 0,
      moves: 16,
      pairs: 8,
    });

    expect(store.first_win.unlocked).toBe(true);
    expect(newly).not.toContain('first_win');
  });

  test('handles null payload gracefully', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin({}, null);

    expect(store.first_win).toBeDefined();
    expect(newly).toContain('first_win');
  });

  test('handles missing payload fields gracefully', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin({}, {});

    expect(store.first_win).toBeDefined();
    expect(store.no_hint_win).toBeDefined(); // hintsUsed defaults to 0
    expect(newly).toContain('first_win');
    expect(newly).toContain('no_hint_win');
  });

  test('unlocks multiple achievements at once', () => {
    const { newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 50,
        hintsUsed: 0,
        moves: 8,
        pairs: 8,
      }
    );

    expect(newly).toContain('first_win');
    expect(newly).toContain('easy_under_60');
    expect(newly).toContain('no_hint_win');
    expect(newly).toContain('perfect_moves');
    expect(newly.length).toBe(4);
  });

  test('handles exactly 60 seconds for easy_under_60', () => {
    const { store, newly } = Achievements.checkAchievementsOnWin(
      {},
      {
        currentDifficulty: 'easy',
        elapsed: 60,
        hintsUsed: 0,
        moves: 16,
        pairs: 8,
      }
    );

    expect(store.easy_under_60).toBeDefined();
    expect(newly).toContain('easy_under_60');
  });
});

describe('achievementsDef', () => {
  test('has expected achievement definitions', () => {
    const ids = Achievements.achievementsDef.map(def => def.id);
    expect(ids).toContain('first_win');
    expect(ids).toContain('easy_under_60');
    expect(ids).toContain('medium_under_120');
    expect(ids).toContain('hard_under_180');
    expect(ids).toContain('no_hint_win');
    expect(ids).toContain('perfect_moves');
  });

  test('each achievement has titleKey and descKey', () => {
    for (const def of Achievements.achievementsDef) {
      expect(def.id).toBeDefined();
      expect(def.titleKey).toBeDefined();
      expect(def.descKey).toBeDefined();
    }
  });
});
