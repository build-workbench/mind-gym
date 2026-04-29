const App = require('../app.js');
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

describe('import/export normalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('normalizeImportData sanitizes malformed payloads', () => {
    const normalized = ImportExport.normalizeImportData(
      {
        version: '3',
        settings: {
          accent: 'bad',
          theme: 'dark',
          previewSeconds: 10,
          countdown: { easy: 2, medium: 100, hard: 5000 },
          cardFace: 'colors',
        },
        bests: {
          easy: { time: '40', moves: '12' },
          medium: { time: 'bad', moves: 1 },
        },
        leaderboards: {
          easy: [
            { time: 30, moves: 10, at: 1 },
            { time: -1, moves: 8, at: 2 },
          ],
        },
        achievements: {
          first_win: { unlocked: true, at: 5 },
          bogus: { unlocked: true, at: 1 },
        },
        stats: { games: '4', wins: -1 },
        adaptive: { rating: 9999, lastDiff: 'oops' },
        spaced: { colors: { '#fff': 3, '#000': -1 }, bad: { foo: 1 } },
        mastery: {
          emoji: {
            '🍎': {
              difficulty: 12,
              stability: '5',
              retrievability: 2,
              lastReview: 10,
              nextReview: 20,
              reps: '3',
              lapses: -1,
            },
          },
          bad: { foo: { difficulty: 1 } },
        },
      },
      DEFAULT_SETTINGS
    );

    expect(normalized.version).toBe(3);
    expect(normalized.settings).toMatchObject({
      accent: 'indigo',
      theme: 'dark',
      previewSeconds: 5,
      cardFace: 'colors',
      countdown: { easy: 10, medium: 100, hard: 999 },
    });
    expect(normalized.bests.easy).toEqual({ time: 40, moves: 12 });
    expect(normalized.bests.medium).toBeUndefined();
    expect(normalized.leaderboards.easy).toEqual([{ time: 30, moves: 10, at: 1 }]);
    expect(normalized.achievements).toEqual({ first_win: { unlocked: true, at: 5 } });
    expect(normalized.stats).toMatchObject({ games: 4, wins: 0 });
    expect(normalized.adaptive).toEqual({ rating: 1600, lastDiff: 'easy' });
    expect(normalized.spaced).toEqual({ colors: { '#fff': 3 } });
    expect(normalized.mastery).toEqual({
      emoji: {
        '🍎': {
          difficulty: 10,
          stability: 5,
          retrievability: 1,
          lastReview: 10,
          nextReview: 20,
          reps: 3,
          lapses: 0,
        },
      },
    });
  });

  test('normalizeImportData rejects non-object payload', () => {
    expect(() => ImportExport.normalizeImportData(null, DEFAULT_SETTINGS)).toThrow(
      'Invalid backup payload'
    );
  });

  test('normalizeImportData keeps legacy backups without mastery compatible', () => {
    const normalized = ImportExport.normalizeImportData({ version: 1, spaced: { emoji: { '🍎': 2 } } }, DEFAULT_SETTINGS);

    expect(normalized.mastery).toEqual({});
    expect(normalized.spaced).toEqual({ emoji: { '🍎': 2 } });
  });

  test('collectExportData preserves provided sections', () => {
    const payload = ImportExport.collectExportData({
      settings: { cardFace: 'emoji' },
      bests: { easy: { time: 20, moves: 9 } },
      leaderboards: { easy: [] },
      achievements: { first_win: { unlocked: true, at: 1 } },
      stats: { games: 1 },
      adaptive: { rating: 1000, lastDiff: 'easy' },
      spaced: { emoji: { '🍎': 2 } },
      mastery: {
        emoji: {
          '🍎': {
            difficulty: 5,
            stability: 1,
            retrievability: 1,
            lastReview: 10,
            nextReview: 20,
            reps: 0,
            lapses: 0,
          },
        },
      },
    });

    expect(payload).toEqual({
      version: 1,
      settings: { cardFace: 'emoji' },
      bests: { easy: { time: 20, moves: 9 } },
      leaderboards: { easy: [] },
      achievements: { first_win: { unlocked: true, at: 1 } },
      stats: { games: 1 },
      adaptive: { rating: 1000, lastDiff: 'easy' },
      spaced: { emoji: { '🍎': 2 } },
      mastery: {
        emoji: {
          '🍎': {
            difficulty: 5,
            stability: 1,
            retrievability: 1,
            lastReview: 10,
            nextReview: 20,
            reps: 0,
            lapses: 0,
          },
        },
      },
    });
  });
});

describe('app import/export mastery integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('buildExportPayload includes mastery from storage', () => {
    const emojiMastery = {
      '🍎': {
        difficulty: 5,
        stability: 1,
        retrievability: 1,
        lastReview: 10,
        nextReview: 20,
        reps: 0,
        lapses: 0,
      },
    };
    const lettersMastery = {
      A: {
        difficulty: 6,
        stability: 2,
        retrievability: 0.8,
        lastReview: 30,
        nextReview: 40,
        reps: 2,
        lapses: 1,
      },
    };

    Storage.saveMastery('emoji', emojiMastery);
    Storage.saveMastery('letters', lettersMastery);

    expect(App.buildExportPayload().mastery).toEqual({
      emoji: emojiMastery,
      numbers: {},
      letters: lettersMastery,
      shapes: {},
      colors: {},
    });
  });

  test('applyImportedSnapshot saves mastery by theme and keeps spaced legacy data', () => {
    const mastery = {
      emoji: {
        '🍎': {
          difficulty: 4,
          stability: 3,
          retrievability: 0.7,
          lastReview: 100,
          nextReview: 200,
          reps: 4,
          lapses: 1,
        },
      },
      colors: {
        '#fff': {
          difficulty: 7,
          stability: 2,
          retrievability: 0.4,
          lastReview: 110,
          nextReview: 210,
          reps: 5,
          lapses: 2,
        },
      },
    };
    const spaced = {
      emoji: { '🍎': 2 },
      colors: { '#fff': 3 },
    };

    App.applyImportedSnapshot({
      version: 1,
      settings: DEFAULT_SETTINGS,
      bests: {},
      leaderboards: {},
      achievements: {},
      stats: { games: 0, wins: 0 },
      adaptive: { rating: 1000, lastDiff: 'easy' },
      spaced,
      mastery,
    });

    expect(JSON.parse(localStorage.getItem(Keys.masteryKey('emoji')))).toEqual(mastery.emoji);
    expect(JSON.parse(localStorage.getItem(Keys.masteryKey('colors')))).toEqual(mastery.colors);
    expect(Storage.loadSpaced('emoji')).toEqual(spaced.emoji);
    expect(Storage.loadSpaced('colors')).toEqual(spaced.colors);
  });
});
