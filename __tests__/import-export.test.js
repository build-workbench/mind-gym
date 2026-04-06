const ImportExport = require('../src/import-export.js')

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
}

describe('import/export normalization', () => {
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
          easy: [{ time: 30, moves: 10, at: 1 }, { time: -1, moves: 8, at: 2 }],
        },
        achievements: {
          first_win: { unlocked: true, at: 5 },
          bogus: { unlocked: true, at: 1 },
        },
        stats: { games: '4', wins: -1 },
        adaptive: { rating: 9999, lastDiff: 'oops' },
        spaced: { colors: { '#fff': 3, '#000': -1 }, bad: { foo: 1 } },
      },
      DEFAULT_SETTINGS,
    )

    expect(normalized.version).toBe(3)
    expect(normalized.settings).toMatchObject({
      accent: 'indigo',
      theme: 'dark',
      previewSeconds: 5,
      cardFace: 'colors',
      countdown: { easy: 10, medium: 100, hard: 999 },
    })
    expect(normalized.bests.easy).toEqual({ time: 40, moves: 12 })
    expect(normalized.bests.medium).toBeUndefined()
    expect(normalized.leaderboards.easy).toEqual([{ time: 30, moves: 10, at: 1 }])
    expect(normalized.achievements).toEqual({ first_win: { unlocked: true, at: 5 } })
    expect(normalized.stats).toMatchObject({ games: 4, wins: 0 })
    expect(normalized.adaptive).toEqual({ rating: 1600, lastDiff: 'easy' })
    expect(normalized.spaced).toEqual({ colors: { '#fff': 3 } })
  })

  test('normalizeImportData rejects non-object payload', () => {
    expect(() => ImportExport.normalizeImportData(null, DEFAULT_SETTINGS)).toThrow('Invalid backup payload')
  })

  test('collectExportData preserves provided sections', () => {
    const payload = ImportExport.collectExportData({
      settings: { cardFace: 'emoji' },
      bests: { easy: { time: 20, moves: 9 } },
      leaderboards: { easy: [] },
      achievements: { first_win: { unlocked: true, at: 1 } },
      stats: { games: 1 },
      adaptive: { rating: 1000, lastDiff: 'easy' },
      spaced: { emoji: { '🍎': 2 } },
    })

    expect(payload).toEqual({
      version: 1,
      settings: { cardFace: 'emoji' },
      bests: { easy: { time: 20, moves: 9 } },
      leaderboards: { easy: [] },
      achievements: { first_win: { unlocked: true, at: 1 } },
      stats: { games: 1 },
      adaptive: { rating: 1000, lastDiff: 'easy' },
      spaced: { emoji: { '🍎': 2 } },
    })
  })
})
