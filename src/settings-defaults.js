/**
 * 设置默认值的单一来源（single source of truth）。
 *
 * storage.js / settings-manager.js / import-export.js 及 UI 层都从这里取默认值，
 * 避免多处副本漂移（历史上 previewSeconds 上限与 soundPack 枚举曾出现分歧）。
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberSettingsDefaults = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULT_SETTINGS = Object.freeze({
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
    countdown: Object.freeze({ easy: 90, medium: 150, hard: 240 }),
    language: 'auto',
    adaptive: false,
    spaced: false,
  });

  return { DEFAULT_SETTINGS };
});
