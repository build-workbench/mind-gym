(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./shared.js'));
  } else {
    root.RememberStats = factory(root.RememberShared);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberShared) {
  const { isPlainObject } = RememberShared;
  const DEFAULT_STATS = Object.freeze({
    games: 0,
    wins: 0,
    timeSum: 0,
    movesSum: 0,
    hintsSum: 0,
    comboSum: 0,
    bestCombo: 0,
    recallAttempts: 0,
    precisionSum: 0,
    recallSum: 0,
    nbackAttempts: 0,
    nbackAccSum: 0,
    nbackRtSum: 0,
    nbackRtCount: 0,
  });
  const PAIRS_BY_DIFFICULTY = { easy: 8, medium: 10, hard: 18 };

  function toNonNegativeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function toNonNegativeInt(value, fallback = 0) {
    return Math.floor(toNonNegativeNumber(value, fallback));
  }

  function normalizeStats(raw) {
    const source = isPlainObject(raw) ? raw : {};
    return {
      games: toNonNegativeInt(source.games),
      wins: toNonNegativeInt(source.wins),
      timeSum: toNonNegativeInt(source.timeSum),
      movesSum: toNonNegativeInt(source.movesSum),
      hintsSum: toNonNegativeInt(source.hintsSum),
      comboSum: toNonNegativeNumber(source.comboSum),
      bestCombo: toNonNegativeInt(source.bestCombo),
      recallAttempts: toNonNegativeInt(source.recallAttempts),
      precisionSum: toNonNegativeNumber(source.precisionSum),
      recallSum: toNonNegativeNumber(source.recallSum),
      nbackAttempts: toNonNegativeInt(source.nbackAttempts),
      nbackAccSum: toNonNegativeNumber(source.nbackAccSum),
      nbackRtSum: toNonNegativeNumber(source.nbackRtSum),
      nbackRtCount: toNonNegativeInt(source.nbackRtCount),
    };
  }

  function recordGameStarted(stats) {
    const next = normalizeStats(stats);
    next.games += 1;
    return next;
  }

  function recordGameWon(stats, payload) {
    const next = normalizeStats(stats);
    const data = isPlainObject(payload) ? payload : {};
    next.wins += 1;
    next.timeSum += toNonNegativeInt(data.elapsed);
    next.movesSum += toNonNegativeInt(data.moves);
    next.hintsSum += toNonNegativeInt(data.hintsUsed);
    next.comboSum += toNonNegativeNumber(data.maxCombo);
    next.bestCombo = Math.max(next.bestCombo, toNonNegativeInt(data.maxCombo));
    return next;
  }

  function recordRecallAttempt(stats, payload) {
    const next = normalizeStats(stats);
    const data = isPlainObject(payload) ? payload : {};
    next.recallAttempts += 1;
    next.precisionSum += toNonNegativeNumber(data.precision);
    next.recallSum += toNonNegativeNumber(data.recall);
    return next;
  }

  function recordNBackAttempt(stats, payload) {
    const next = normalizeStats(stats);
    const data = isPlainObject(payload) ? payload : {};
    next.nbackAttempts += 1;
    next.nbackAccSum += toNonNegativeNumber(data.accuracy);
    next.nbackRtSum += toNonNegativeNumber(data.rtSum);
    next.nbackRtCount += toNonNegativeInt(data.rtCount);
    return next;
  }

  function formatRate(a, b) {
    return b > 0 ? Math.round((a / b) * 100) + '%' : '—';
  }

  function getRating(elapsedSec, movesCount, diffKey, usedHints, comboMax = 0) {
    const parTime = diffKey === 'easy' ? 60 : diffKey === 'medium' ? 120 : 180;
    const parMoves = PAIRS_BY_DIFFICULTY[diffKey] || PAIRS_BY_DIFFICULTY.easy;
    let score = 100;
    score -= Math.min(60, (toNonNegativeNumber(elapsedSec) / parTime) * 40);
    score -= Math.max(0, toNonNegativeInt(movesCount) - parMoves) * 3;
    score -= toNonNegativeInt(usedHints) * 10;
    score += Math.min(10, toNonNegativeInt(comboMax) * 2);
    score = Math.max(0, Math.min(100, score));
    return Math.max(1, Math.min(5, Math.ceil(score / 20)));
  }

  function buildStatsSummary(stats, formatTime) {
    const s = normalizeStats(stats);
    const formatTimeFn = typeof formatTime === 'function' ? formatTime : value => String(value);
    return {
      avgTime: s.wins > 0 ? formatTimeFn(Math.round(s.timeSum / s.wins)) : '—',
      avgMoves: s.wins > 0 ? Math.round(s.movesSum / s.wins) : '—',
      avgHints: s.wins > 0 ? (s.hintsSum / s.wins).toFixed(2) : '—',
      avgCombo: s.wins > 0 ? (s.comboSum / s.wins).toFixed(2) : '—',
      winRate: formatRate(s.wins, s.games),
      avgPrecision:
        s.recallAttempts > 0 ? Math.round((s.precisionSum / s.recallAttempts) * 100) + '%' : '—',
      avgRecall:
        s.recallAttempts > 0 ? Math.round((s.recallSum / s.recallAttempts) * 100) + '%' : '—',
      avgNBackAcc:
        s.nbackAttempts > 0 ? Math.round((s.nbackAccSum / s.nbackAttempts) * 100) + '%' : '—',
      avgNBackRt: s.nbackRtCount > 0 ? Math.round(s.nbackRtSum / s.nbackRtCount) + 'ms' : '—',
    };
  }

  return {
    DEFAULT_STATS,
    normalizeStats,
    recordGameStarted,
    recordGameWon,
    recordRecallAttempt,
    recordNBackAttempt,
    formatRate,
    getRating,
    buildStatsSummary,
  };
});
