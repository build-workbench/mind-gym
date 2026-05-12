const ImportExport = require('../src/import-export.js');
const Keys = require('../src/keys.js');
const Storage = require('../src/storage.js');

const DEFAULT_SETTINGS = {
  sound: true,
  vibrate: true,
  previewSeconds: 1,
  accent: 'indigo',
  theme: 'auto',
  motion: 'auto',
  volume: 0.5,
  soundPack: 'clear',
  cardFace: 'emoji',
  gameMode: 'classic',
  countdown: { easy: 90, medium: 150, hard: 240 },
  language: 'auto',
  adaptive: false,
  spaced: false,
};

describe('storage normalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loadSettings falls back to defaults and normalizes values', () => {
    localStorage.setItem(
      Keys.settingsKey(),
      JSON.stringify({
        sound: 0,
        vibrate: 'yes',
        previewSeconds: 999,
        accent: 'invalid',
        theme: 'dark',
        motion: 'invalid',
        volume: 99,
        soundPack: 'electro',
        cardFace: 'invalid',
        gameMode: 'countdown',
        countdown: { easy: 1, medium: '200', hard: 5000 },
        language: 'zh',
        adaptive: 1,
        spaced: 'true',
      })
    );

    expect(Storage.loadSettings(DEFAULT_SETTINGS)).toEqual({
      sound: false,
      vibrate: true,
      previewSeconds: 5,
      accent: 'indigo',
      theme: 'dark',
      motion: 'auto',
      volume: 1,
      soundPack: 'electro',
      cardFace: 'emoji',
      gameMode: 'countdown',
      countdown: { easy: 10, medium: 200, hard: 999 },
      language: 'zh',
      adaptive: true,
      spaced: true,
    });
  });

  test('loadStats normalizes malformed values', () => {
    localStorage.setItem(
      Keys.statsKey(),
      JSON.stringify({ games: '3', wins: -1, timeSum: 'bad', nbackRtCount: 2.8 })
    );

    expect(Storage.loadStats()).toMatchObject({
      games: 3,
      wins: 0,
      timeSum: 0,
      nbackRtCount: 2,
    });
  });

  test('loadLeaderboard filters and sorts invalid entries', () => {
    localStorage.setItem(
      Keys.lbKey('easy'),
      JSON.stringify([
        { time: 50, moves: 12, at: 20 },
        { time: '40', moves: '10', at: 10 },
        { time: -1, moves: 8, at: 1 },
        { foo: 'bar' },
        { time: 40, moves: 9, at: 5 },
      ])
    );

    expect(Storage.loadLeaderboard('easy')).toEqual([
      { time: 40, moves: 9, at: 5 },
      { time: 40, moves: 10, at: 10 },
      { time: 50, moves: 12, at: 20 },
    ]);
  });

  test('loadBest returns null for invalid entries', () => {
    localStorage.setItem(Keys.bestKey('easy'), JSON.stringify({ time: 'bad', moves: 1 }));
    expect(Storage.loadBest('easy')).toBeNull();
  });

  test('loadAchievements keeps only unlocked known entries', () => {
    localStorage.setItem(
      Keys.achKey(),
      JSON.stringify({
        first_win: { unlocked: true, at: 123 },
        no_hint_win: { unlocked: false, at: 999 },
        random: { unlocked: true, at: 456 },
      })
    );

    expect(Storage.loadAchievements()).toEqual({
      first_win: { unlocked: true, at: 123 },
    });
  });

  test('saveLeaderboard persists normalized top three entries', () => {
    Storage.saveLeaderboard('easy', [
      { time: 70, moves: 12, at: 3 },
      { time: 20, moves: 7, at: 2 },
      { time: 20, moves: 6, at: 1 },
      { time: 90, moves: 20, at: 4 },
    ]);

    expect(JSON.parse(localStorage.getItem(Keys.lbKey('easy')))).toEqual([
      { time: 20, moves: 6, at: 1 },
      { time: 20, moves: 7, at: 2 },
      { time: 70, moves: 12, at: 3 },
    ]);
  });

  test('markDailyDone and isDailyDone use sanitized difficulty', () => {
    Storage.markDailyDone('2026-04-06', 'unexpected');
    expect(Storage.isDailyDone('2026-04-06', 'easy')).toBe(true);
  });

  test('loadMastery matches import-export mastery normalization', () => {
    const rawMastery = {
      '🍎': {
        difficulty: 0,
        stability: 'bad',
        retrievability: 0,
        lastReview: 10,
        nextReview: 20,
        reps: '3',
        lapses: -1,
      },
    };
    localStorage.setItem(Keys.masteryKey('emoji'), JSON.stringify(rawMastery));

    expect(Storage.loadMastery('emoji')).toEqual(ImportExport.normalizeMasteryBucket(rawMastery));
  });

  test('saveMastery persists the shared mastery normalization result', () => {
    const rawMastery = {
      '🍎': {
        difficulty: 0,
        stability: 'bad',
        retrievability: 0,
        lastReview: 10,
        nextReview: 20,
        reps: '3',
        lapses: -1,
      },
    };

    Storage.saveMastery('emoji', rawMastery);

    expect(JSON.parse(localStorage.getItem(Keys.masteryKey('emoji')))).toEqual(
      ImportExport.normalizeMasteryBucket(rawMastery)
    );
  });

  describe('high-level methods', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('getGameSnapshot returns all game data', () => {
      // 设置一些数据
      Storage.saveSettings(DEFAULT_SETTINGS);
      Storage.saveStats({ games: 5, wins: 3 });

      const snapshot = Storage.getGameSnapshot();

      expect(snapshot).toHaveProperty('settings');
      expect(snapshot).toHaveProperty('stats');
      expect(snapshot).toHaveProperty('achievements');
      expect(snapshot).toHaveProperty('bestScores');
      expect(snapshot).toHaveProperty('adaptive');
      expect(snapshot).toHaveProperty('leaderboards');

      expect(snapshot.stats.games).toBe(5);
      expect(snapshot.stats.wins).toBe(3);
    });

    test('resetAllData clears all game data', () => {
      // 设置一些数据
      Storage.saveSettings(DEFAULT_SETTINGS);
      Storage.saveStats({ games: 5, wins: 3 });

      // 验证数据存在
      expect(Storage.loadStats().games).toBe(5);

      // 重置
      Storage.resetAllData();

      // 验证数据被清除
      expect(Storage.loadStats().games).toBe(0);
    });
  });
});
