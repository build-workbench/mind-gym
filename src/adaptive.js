/**
 * AdaptiveRating - 自适应评级系统
 *
 * 这是一个**深层模块**，封装了自适应难度调整逻辑：
 * - 根据玩家表现调整评级
 * - 决定合适的难度和辅助
 *
 * @module adaptive
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./keys.js'), require('./storage.js'));
  } else {
    root.RememberAdaptive = factory(root.RememberKeys, root.RememberStorage);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberKeys, RememberStorage) {
  const ELO_K_FACTOR = 12;
  const RATING_BRONZE = 920;
  const RATING_SILVER = 1080;
  const RATING_DEFAULT = 1200;
  const RATING_MIN = 600;
  const RATING_MAX = 1600;

  const HINT_LIMITS = { easy: 3, medium: 2, hard: 1 };
  const PREVIEW_SECONDS = { easy: 2, medium: 1, hard: 0 };

  function load() {
    const key = RememberKeys.adaptiveKey();
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          rating: Math.max(RATING_MIN, Math.min(RATING_MAX, parsed.rating || RATING_DEFAULT)),
          games: Math.max(0, parsed.games || 0),
        };
      }
    } catch (_) {}
    return { rating: RATING_DEFAULT, games: 0 };
  }

  function save(data) {
    const key = RememberKeys.adaptiveKey();
    localStorage.setItem(key, JSON.stringify(data));
  }

  function expectedStarsFor(diff) {
    return { easy: 3, medium: 4, hard: 5 }[diff] || 3;
  }

  function getAssist(diff, rating) {
    const targetRating =
      { easy: RATING_BRONZE, medium: RATING_SILVER, hard: RATING_MAX }[diff] || RATING_BRONZE;

    // 如果评级低于目标，提供更多辅助
    const ratio = rating / targetRating;

    let previewSec = PREVIEW_SECONDS[diff] || 0;
    let hintLimit = HINT_LIMITS[diff] || 0;

    if (ratio < 0.8) {
      previewSec = Math.min(3, previewSec + 1);
      hintLimit = Math.min(5, hintLimit + 1);
    } else if (ratio > 1.2) {
      previewSec = Math.max(0, previewSec - 1);
      hintLimit = Math.max(0, hintLimit - 1);
    }

    return { previewSec, hintLimit };
  }

  function updateOnEnd(won, stars, diff, currentRating) {
    const expected = expectedStarsFor(diff);
    const actual = won ? stars : 0;
    const diff_rating = actual - expected;

    // ELO-like update
    const newRating = Math.max(
      RATING_MIN,
      Math.min(RATING_MAX, currentRating + ELO_K_FACTOR * diff_rating)
    );

    return newRating;
  }

  function decideDifficulty(rating) {
    if (rating < RATING_BRONZE) return 'easy';
    if (rating < RATING_SILVER) return 'medium';
    return 'hard';
  }

  function getRating() {
    const data = load();
    return data.rating;
  }

  function getGames() {
    const data = load();
    return data.games;
  }

  function recordGame(won, stars, diff) {
    const data = load();
    data.rating = updateOnEnd(won, stars, diff, data.rating);
    data.games += 1;
    save(data);
    return data;
  }

  return {
    load,
    save,
    getAssist,
    updateOnEnd,
    decideDifficulty,
    getRating,
    getGames,
    recordGame,
    RATING_DEFAULT,
    RATING_MIN,
    RATING_MAX,
    RATING_BRONZE,
    RATING_SILVER,
    ELO_K_FACTOR,
    HINT_LIMITS,
  };
});
