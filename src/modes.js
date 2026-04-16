(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberModes = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function buildRecallItems(params) {
    const data = isPlainObject(params) ? params : {};
    const truth = Array.isArray(data.truthValues) ? [...new Set(data.truthValues)] : [];
    const pool = Array.isArray(data.poolValues) ? data.poolValues.slice() : [];
    const shuffle = typeof data.shuffle === 'function' ? data.shuffle : arr => arr;
    const trueCount = Math.min(6, truth.length);
    const falseCandidates = pool.filter(value => !truth.includes(value));
    shuffle(truth);
    shuffle(falseCandidates);
    const trues = truth.slice(0, trueCount);
    const falses = falseCandidates.slice(0, Math.max(0, 9 - trueCount));
    const items = [
      ...trues.map(v => ({ v, correct: true })),
      ...falses.map(v => ({ v, correct: false })),
    ];
    shuffle(items);
    return { items, correctSet: new Set(trues) };
  }

  function scoreRecall(correctSet, selectedValues) {
    const truth = correctSet instanceof Set ? correctSet : new Set();
    const selected =
      selectedValues instanceof Set
        ? selectedValues
        : new Set(Array.isArray(selectedValues) ? selectedValues : []);
    let tp = 0;
    let fp = 0;
    let fn = 0;
    truth.forEach(value => {
      if (selected.has(value)) tp += 1;
      else fn += 1;
    });
    selected.forEach(value => {
      if (!truth.has(value)) fp += 1;
    });
    return {
      tp,
      fp,
      fn,
      precision: tp + fp > 0 ? tp / (tp + fp) : 1,
      recall: tp + fn > 0 ? tp / (tp + fn) : 0,
    };
  }

  function createNBackConfig(raw) {
    const source = isPlainObject(raw) ? raw : {};
    return {
      N: clampInt(source.N, 1, 3, 2),
      length: clampInt(source.length, 6, 999, 20),
      speed: clampInt(source.speed, 500, 5000, 900),
    };
  }

  function summarizeNBackResult(payload) {
    const data = isPlainObject(payload) ? payload : {};
    const targets = Math.max(0, Number(data.targets) || 0);
    const hits = Math.max(0, Number(data.hits) || 0);
    const falseAlarms = Math.max(0, Number(data.falseAlarms) || 0);
    const length = Math.max(1, Number(data.length) || 1);
    const rtSum = Math.max(0, Number(data.rtSum) || 0);
    const rtCount = Math.max(0, Number(data.rtCount) || 0);
    const accuracy = targets > 0 ? hits / targets : 1 - falseAlarms / length;
    return {
      accuracy: Math.max(0, Math.min(1, accuracy)),
      avgRt: rtCount > 0 ? Math.round(rtSum / rtCount) : 0,
      rtSum,
      rtCount,
    };
  }

  return {
    buildRecallItems,
    scoreRecall,
    createNBackConfig,
    summarizeNBackResult,
  };
});
