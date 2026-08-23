/**
 * SettingsManager Tests
 */

const RememberSettings = require('../src/settings-manager.js');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('SettingsManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    RememberSettings._reload();
  });

  describe('get / set', () => {
    test('get returns default value for missing key', () => {
      expect(RememberSettings.get('sound')).toBe(true);
    });

    test('set validates and persists value', () => {
      RememberSettings.set('sound', false);
      expect(RememberSettings.get('sound')).toBe(false);

      const stored = JSON.parse(localStorageMock.getItem('memory_match_settings'));
      expect(stored.sound).toBe(false);
    });

    test('set throws on invalid value', () => {
      expect(() => RememberSettings.set('volume', 1.5)).toThrow();
      expect(() => RememberSettings.set('volume', -0.1)).toThrow();
      expect(() => RememberSettings.set('accent', 'invalid')).toThrow();
    });

    test('set validates countdown object', () => {
      expect(() =>
        RememberSettings.set('countdown', { easy: 10, medium: 150, hard: 240 })
      ).not.toThrow();

      expect(() =>
        RememberSettings.set('countdown', { easy: 9, medium: 150, hard: 240 })
      ).toThrow();
    });
  });

  describe('getAll', () => {
    test('returns copy of all settings', () => {
      const settings1 = RememberSettings.getAll();
      const settings2 = RememberSettings.getAll();

      expect(settings1).toEqual(settings2);
      expect(settings1).not.toBe(settings2);
      expect(settings1.countdown).not.toBe(settings2.countdown);
    });
  });

  describe('setAll', () => {
    test('batch sets multiple values', () => {
      RememberSettings.setAll({
        sound: false,
        vibrate: false,
        volume: 0.7,
      });

      expect(RememberSettings.get('sound')).toBe(false);
      expect(RememberSettings.get('vibrate')).toBe(false);
      expect(RememberSettings.get('volume')).toBe(0.7);
    });

    test('throws if any value is invalid', () => {
      expect(() =>
        RememberSettings.setAll({
          sound: false,
          volume: 1.5,
        })
      ).toThrow();
    });
  });

  describe('onChange', () => {
    test('fires callback on set', () => {
      const callback = jest.fn();
      RememberSettings.onChange('sound', callback);

      RememberSettings.set('sound', false);

      expect(callback).toHaveBeenCalledWith(false, true);
    });

    test('returns unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = RememberSettings.onChange('sound', callback);

      RememberSettings.set('sound', false);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      RememberSettings.set('sound', true);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    test('resets all settings to defaults', () => {
      RememberSettings.set('sound', false);
      RememberSettings.set('volume', 0.8);

      RememberSettings.reset();

      expect(RememberSettings.get('sound')).toBe(true);
      expect(RememberSettings.get('volume')).toBe(0.5);
    });
  });
});
