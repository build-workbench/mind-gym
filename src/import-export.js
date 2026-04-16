(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./stats.js'), require('./achievements.js'));
  } else {
    root.RememberImportExport = factory(root.RememberStats, root.RememberAchievements);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberStats, RememberAchievements) {
  const VALID_DIFFS = ['easy', 'medium', 'hard'];
  const VALID_THEMES = ['emoji', 'numbers', 'letters', 'shapes', 'colors'];
  const VALID_ACCENTS = ['indigo', 'emerald', 'rose'];
  const VALID_THEME_MODES = ['auto', 'light', 'dark'];
  const VALID_MOTION_MODES = ['auto', 'on', 'off'];
  const VALID_SOUND_PACKS = ['clear', 'electro', 'soft'];
  const VALID_LANGUAGES = ['auto', 'zh', 'en'];
  const VALID_GAME_MODES = ['classic', 'countdown'];

  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function clampInt(value, min, max, fallback) {
    return Math.round(clampNumber(value, min, max, fallback));
  }

  function pickEnum(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }

  function normalizeSettings(raw, defaults) {
    const source = isPlainObject(raw) ? raw : {};
    const fallback = isPlainObject(defaults) ? defaults : {};
    const countdownDefaults = isPlainObject(fallback.countdown)
      ? fallback.countdown
      : { easy: 90, medium: 150, hard: 240 };
    return {
      sound: source.sound === undefined ? !!fallback.sound : !!source.sound,
      vibrate: source.vibrate === undefined ? !!fallback.vibrate : !!source.vibrate,
      previewSeconds: clampInt(source.previewSeconds, 0, 5, Number(fallback.previewSeconds ?? 0)),
      accent: pickEnum(source.accent, VALID_ACCENTS, fallback.accent || 'indigo'),
      theme: pickEnum(source.theme, VALID_THEME_MODES, fallback.theme || 'auto'),
      motion: pickEnum(source.motion, VALID_MOTION_MODES, fallback.motion || 'auto'),
      volume: clampNumber(source.volume, 0, 1, Number(fallback.volume ?? 0.5)),
      soundPack: pickEnum(source.soundPack, VALID_SOUND_PACKS, fallback.soundPack || 'clear'),
      cardFace: pickEnum(source.cardFace, VALID_THEMES, fallback.cardFace || 'emoji'),
      gameMode: pickEnum(source.gameMode, VALID_GAME_MODES, fallback.gameMode || 'classic'),
      countdown: {
        easy: clampInt(source.countdown && source.countdown.easy, 10, 999, countdownDefaults.easy),
        medium: clampInt(
          source.countdown && source.countdown.medium,
          10,
          999,
          countdownDefaults.medium
        ),
        hard: clampInt(source.countdown && source.countdown.hard, 10, 999, countdownDefaults.hard),
      },
      language: pickEnum(source.language, VALID_LANGUAGES, fallback.language || 'auto'),
      adaptive: source.adaptive === undefined ? !!fallback.adaptive : !!source.adaptive,
      spaced: source.spaced === undefined ? !!fallback.spaced : !!source.spaced,
    };
  }

  function normalizeBestEntry(raw) {
    if (!isPlainObject(raw)) return null;
    const time = Number(raw.time);
    const moves = Number(raw.moves);
    if (!Number.isFinite(time) || time < 0 || !Number.isFinite(moves) || moves < 0) return null;
    return { time: Math.round(time), moves: Math.round(moves) };
  }

  function normalizeLeaderboardEntry(raw) {
    if (!isPlainObject(raw)) return null;
    const time = Number(raw.time);
    const moves = Number(raw.moves);
    const at = Number(raw.at);
    if (!Number.isFinite(time) || time < 0 || !Number.isFinite(moves) || moves < 0) return null;
    return {
      time: Math.round(time),
      moves: Math.round(moves),
      at: Number.isFinite(at) && at > 0 ? at : Date.now(),
    };
  }

  function normalizeLeaderboard(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(normalizeLeaderboardEntry)
      .filter(Boolean)
      .sort((a, b) => a.time - b.time || a.moves - b.moves || a.at - b.at)
      .slice(0, 3);
  }

  function normalizeAdaptive(raw) {
    const source = isPlainObject(raw) ? raw : {};
    return {
      rating: clampInt(source.rating, 600, 1600, 1000),
      lastDiff: pickEnum(source.lastDiff, VALID_DIFFS, 'easy'),
    };
  }

  function normalizeSpacedBucket(raw) {
    if (!isPlainObject(raw)) return {};
    const result = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!key) continue;
      const weight = Number(value);
      if (!Number.isFinite(weight) || weight < 0) continue;
      result[String(key)] = weight;
    }
    return result;
  }

  function normalizeSpaced(raw) {
    const source = isPlainObject(raw) ? raw : {};
    const result = {};
    for (const theme of VALID_THEMES) {
      if (source[theme]) result[theme] = normalizeSpacedBucket(source[theme]);
    }
    return result;
  }

  function normalizeBests(raw) {
    const source = isPlainObject(raw) ? raw : {};
    const result = {};
    for (const diff of VALID_DIFFS) {
      const entry = normalizeBestEntry(source[diff]);
      if (entry) result[diff] = entry;
    }
    return result;
  }

  function normalizeLeaderboards(raw) {
    const source = isPlainObject(raw) ? raw : {};
    const result = {};
    for (const diff of VALID_DIFFS) {
      const entries = normalizeLeaderboard(source[diff]);
      if (entries.length) result[diff] = entries;
    }
    return result;
  }

  function normalizeImportData(raw, defaults) {
    if (!isPlainObject(raw)) throw new Error('Invalid backup payload');
    return {
      version: clampInt(raw.version, 1, 999, 1),
      settings: normalizeSettings(raw.settings, defaults),
      bests: normalizeBests(raw.bests),
      leaderboards: normalizeLeaderboards(raw.leaderboards),
      achievements: RememberAchievements.normalizeAchievements(raw.achievements),
      stats: RememberStats.normalizeStats(raw.stats),
      adaptive: normalizeAdaptive(raw.adaptive),
      spaced: normalizeSpaced(raw.spaced),
    };
  }

  function collectExportData(params) {
    const data = isPlainObject(params) ? params : {};
    return {
      version: 1,
      settings: data.settings,
      bests: data.bests,
      leaderboards: data.leaderboards,
      achievements: data.achievements,
      stats: data.stats,
      adaptive: data.adaptive,
      spaced: data.spaced,
    };
  }

  return {
    VALID_DIFFS,
    VALID_THEMES,
    normalizeSettings,
    normalizeBestEntry,
    normalizeLeaderboardEntry,
    normalizeLeaderboard,
    normalizeAdaptive,
    normalizeSpaced,
    normalizeImportData,
    collectExportData,
  };
});
