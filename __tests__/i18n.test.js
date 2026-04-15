const I18n = require('../src/i18n.js');

describe('i18n helpers', () => {
  test('currentLang respects explicit preference', () => {
    expect(I18n.currentLang('zh', 'en-US')).toBe('zh');
    expect(I18n.currentLang('en', 'zh-CN')).toBe('en');
  });

  test('currentLang auto-detects zh language family', () => {
    expect(I18n.currentLang('auto', 'zh-CN')).toBe('zh');
    expect(I18n.currentLang('auto', 'zh-TW')).toBe('zh');
    expect(I18n.currentLang('auto', 'en-US')).toBe('en');
  });

  test('i18n falls back to english for unknown language', () => {
    const en = I18n.i18n('en');
    expect(I18n.i18n('fr')).toEqual(en);
  });

  test('dictionaries expose key gameplay strings', () => {
    const zh = I18n.i18n('zh');
    const en = I18n.i18n('en');

    for (const dict of [zh, en]) {
      expect(dict.newGame).toBeTruthy();
      expect(dict.statsTitle).toBeTruthy();
      expect(dict.recallTitle).toBeTruthy();
      expect(Array.isArray(dict.guideBasics)).toBe(true);
      expect(Array.isArray(dict.guideShortcuts)).toBe(true);
    }
  });
});
