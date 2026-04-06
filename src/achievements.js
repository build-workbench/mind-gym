(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberAchievements = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const achievementsDef = [
    { id: 'first_win', titleKey: 'achFirstWin', descKey: 'achFirstWinDesc' },
    { id: 'easy_under_60', titleKey: 'achEasyUnder60', descKey: 'achEasyUnder60Desc' },
    { id: 'medium_under_120', titleKey: 'achMediumUnder120', descKey: 'achMediumUnder120Desc' },
    { id: 'hard_under_180', titleKey: 'achHardUnder180', descKey: 'achHardUnder180Desc' },
    { id: 'no_hint_win', titleKey: 'achNoHint', descKey: 'achNoHintDesc' },
    { id: 'perfect_moves', titleKey: 'achPerfect', descKey: 'achPerfectDesc' },
  ];

  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function toValidTimestamp(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : Date.now();
  }

  function normalizeAchievements(raw) {
    const source = isPlainObject(raw) ? raw : {};
    const result = {};
    for (const def of achievementsDef) {
      const entry = source[def.id];
      if (!entry) continue;
      if (entry === true) {
        result[def.id] = { unlocked: true, at: Date.now() };
        continue;
      }
      if (!isPlainObject(entry)) continue;
      if (!entry.unlocked) continue;
      result[def.id] = { unlocked: true, at: toValidTimestamp(entry.at) };
    }
    return result;
  }

  function checkAchievementsOnWin(store, payload) {
    const normalized = normalizeAchievements(store);
    const data = isPlainObject(payload) ? payload : {};
    const currentDifficulty = data.currentDifficulty || 'easy';
    const elapsed = Number(data.elapsed) || 0;
    const hintsUsed = Number(data.hintsUsed) || 0;
    const moves = Number(data.moves) || 0;
    const pairs = Number(data.pairs) || 0;
    const now = Date.now();
    const newly = [];
    const checks = [
      ['first_win', true],
      ['easy_under_60', currentDifficulty === 'easy' && elapsed <= 60],
      ['medium_under_120', currentDifficulty === 'medium' && elapsed <= 120],
      ['hard_under_180', currentDifficulty === 'hard' && elapsed <= 180],
      ['no_hint_win', hintsUsed === 0],
      ['perfect_moves', moves === pairs],
    ];
    for (const [id, cond] of checks) {
      if (cond && !normalized[id]) {
        normalized[id] = { unlocked: true, at: now };
        newly.push(id);
      }
    }
    return { store: normalized, newly };
  }

  return {
    achievementsDef,
    normalizeAchievements,
    checkAchievementsOnWin,
  };
});
