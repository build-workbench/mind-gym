(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./keys.js'),
      require('./stats.js'),
      require('./achievements.js'),
      require('./import-export.js'),
      require('./settings-defaults.js')
    );
  } else {
    root.RememberStorage = factory(
      root.RememberKeys,
      root.RememberStats,
      root.RememberAchievements,
      root.RememberImportExport,
      root.RememberSettingsDefaults
    );
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (
    RememberKeys,
    RememberStats,
    RememberAchievements,
    RememberImportExport,
    SettingsDefaults
  ) {
    const { DEFAULT_SETTINGS } = SettingsDefaults;
    const DEFAULT_ADAPTIVE = { rating: 1000, lastDiff: 'easy' };

    function cloneSettings(defaults) {
      const base = defaults || DEFAULT_SETTINGS;
      return {
        ...base,
        countdown: { ...((base && base.countdown) || DEFAULT_SETTINGS.countdown) },
      };
    }

    function safeParseJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    }

    function safeWriteJSON(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    function normalizeSettings(raw, defaults) {
      return RememberImportExport.normalizeSettings(raw, cloneSettings(defaults));
    }

    function normalizeAdaptive(raw) {
      return RememberImportExport.normalizeAdaptive(raw || DEFAULT_ADAPTIVE);
    }

    function normalizeLeaderboard(raw) {
      return RememberImportExport.normalizeLeaderboard(raw);
    }

    function normalizeBest(raw) {
      return RememberImportExport.normalizeBestEntry(raw);
    }

    function normalizeSpaced(raw) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
      const result = {};
      for (const [key, value] of Object.entries(raw)) {
        const weight = Number(value);
        if (!Number.isFinite(weight) || weight < 0) continue;
        result[String(key)] = weight;
      }
      return result;
    }

    function normalizeMasteryBucket(raw) {
      return RememberImportExport.normalizeMasteryBucket(raw);
    }

    function normalizeDiff(diff) {
      return ['easy', 'medium', 'hard'].includes(diff) ? diff : 'easy';
    }

    function normalizeTheme(theme) {
      return ['emoji', 'numbers', 'letters', 'shapes', 'colors'].includes(theme) ? theme : 'emoji';
    }

    function loadAdaptive() {
      return normalizeAdaptive(safeParseJSON(RememberKeys.adaptiveKey(), DEFAULT_ADAPTIVE));
    }

    function saveAdaptive(a) {
      safeWriteJSON(RememberKeys.adaptiveKey(), normalizeAdaptive(a));
    }

    function loadSpaced(theme) {
      return normalizeSpaced(safeParseJSON(RememberKeys.spacedKey(normalizeTheme(theme)), {}));
    }

    function saveSpaced(theme, data) {
      safeWriteJSON(RememberKeys.spacedKey(normalizeTheme(theme)), normalizeSpaced(data));
    }

    function loadMastery(theme) {
      return normalizeMasteryBucket(
        safeParseJSON(RememberKeys.masteryKey(normalizeTheme(theme)), {})
      );
    }

    function saveMastery(theme, data) {
      safeWriteJSON(RememberKeys.masteryKey(normalizeTheme(theme)), normalizeMasteryBucket(data));
    }

    function loadStats() {
      return RememberStats.normalizeStats(
        safeParseJSON(RememberKeys.statsKey(), RememberStats.DEFAULT_STATS)
      );
    }

    function saveStats(s) {
      safeWriteJSON(RememberKeys.statsKey(), RememberStats.normalizeStats(s));
    }

    function loadSettings(fallbackSettings) {
      return normalizeSettings(
        safeParseJSON(RememberKeys.settingsKey(), cloneSettings(fallbackSettings)),
        fallbackSettings
      );
    }

    function saveSettings(s) {
      safeWriteJSON(RememberKeys.settingsKey(), normalizeSettings(s, DEFAULT_SETTINGS));
    }

    function loadLeaderboard(k) {
      return normalizeLeaderboard(safeParseJSON(RememberKeys.lbKey(normalizeDiff(k)), []));
    }

    function saveLeaderboard(k, arr) {
      safeWriteJSON(RememberKeys.lbKey(normalizeDiff(k)), normalizeLeaderboard(arr));
    }

    function loadBest(k) {
      return normalizeBest(safeParseJSON(RememberKeys.bestKey(normalizeDiff(k)), null));
    }

    function saveBest(k, data) {
      const normalized = normalizeBest(data);
      if (!normalized) return;
      safeWriteJSON(RememberKeys.bestKey(normalizeDiff(k)), normalized);
    }

    function loadAchievements() {
      return RememberAchievements.normalizeAchievements(safeParseJSON(RememberKeys.achKey(), {}));
    }

    function saveAchievements(obj) {
      safeWriteJSON(RememberKeys.achKey(), RememberAchievements.normalizeAchievements(obj));
    }

    function isDailyDone(dateStr, diff) {
      try {
        return !!localStorage.getItem(RememberKeys.dailyKey(dateStr, normalizeDiff(diff)));
      } catch {
        return false;
      }
    }

    function markDailyDone(dateStr, diff) {
      const key = RememberKeys.dailyKey(dateStr, normalizeDiff(diff));
      try {
        if (!localStorage.getItem(key)) {
          safeWriteJSON(key, { done: true, at: Date.now() });
        }
      } catch {}
    }

    function shouldAutoShowGuide(GUIDE_KEY) {
      try {
        return !localStorage.getItem(GUIDE_KEY);
      } catch {
        return true;
      }
    }

    function markGuideSeen(GUIDE_KEY) {
      try {
        localStorage.setItem(GUIDE_KEY, 'seen');
      } catch {}
    }

    function hideGuide(GUIDE_KEY) {
      try {
        localStorage.setItem(GUIDE_KEY, 'hidden');
      } catch {}
    }

    return {
      // 底层方法（保留向后兼容）
      loadAdaptive,
      saveAdaptive,
      loadSpaced,
      saveSpaced,
      loadMastery,
      saveMastery,
      loadStats,
      saveStats,
      loadSettings,
      saveSettings,
      loadLeaderboard,
      saveLeaderboard,
      loadBest,
      saveBest,
      loadAchievements,
      saveAchievements,
      isDailyDone,
      markDailyDone,
      shouldAutoShowGuide,
      markGuideSeen,
      hideGuide,
    };
  }
);
