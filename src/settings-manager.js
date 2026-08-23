/**
 * SettingsManager - 用户设置统一管理
 *
 * 这是一个**深层模块**，封装了设置的完整生命周期：
 * - 调用者只需调用 set(key, value)
 * - 不需关心验证、持久化、变更通知
 *
 * @module settings-manager
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(
      require('./keys.js'),
      require('./storage.js'),
      require('./settings-defaults.js')
    );
  } else {
    root.RememberSettings = factory(
      root.RememberKeys,
      root.RememberStorage,
      root.RememberSettingsDefaults
    );
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (RememberKeys, RememberStorage, SettingsDefaults) {
    const VALID_ACCENTS = ['indigo', 'emerald', 'rose'];
    const VALID_THEMES = ['auto', 'light', 'dark'];
    const VALID_MOTIONS = ['auto', 'on', 'off'];
    const VALID_SOUND_PACKS = ['clear', 'electro', 'soft'];
    const VALID_CARD_FACES = ['emoji', 'numbers', 'letters', 'shapes', 'colors'];
    const VALID_GAME_MODES = ['classic', 'countdown'];
    const VALID_LANGUAGES = ['auto', 'zh', 'en'];

    const DEFAULT_SETTINGS = SettingsDefaults.DEFAULT_SETTINGS;

    class SettingsManager {
      constructor() {
        this._settings = this._loadFromStorage();
        this._listeners = new Map();
      }

      _loadFromStorage() {
        return RememberStorage.loadSettings(DEFAULT_SETTINGS);
      }

      _saveToStorage() {
        RememberStorage.saveSettings(this._settings);
      }

      _validate(key, value) {
        switch (key) {
          case 'sound':
          case 'vibrate':
          case 'adaptive':
          case 'spaced':
            return typeof value === 'boolean';

          case 'previewSeconds':
            return typeof value === 'number' && value >= 0 && value <= 5;

          case 'volume':
            return typeof value === 'number' && value >= 0 && value <= 1;

          case 'accent':
            return VALID_ACCENTS.includes(value);

          case 'theme':
            return VALID_THEMES.includes(value);

          case 'motion':
            return VALID_MOTIONS.includes(value);

          case 'soundPack':
            return VALID_SOUND_PACKS.includes(value);

          case 'cardFace':
            return VALID_CARD_FACES.includes(value);

          case 'gameMode':
            return VALID_GAME_MODES.includes(value);

          case 'language':
            return VALID_LANGUAGES.includes(value);

          case 'countdown':
            if (typeof value !== 'object' || value === null) return false;
            const { easy, medium, hard } = value;
            return (
              typeof easy === 'number' &&
              easy >= 10 &&
              easy <= 999 &&
              typeof medium === 'number' &&
              medium >= 10 &&
              medium <= 999 &&
              typeof hard === 'number' &&
              hard >= 10 &&
              hard <= 999
            );

          default:
            return false;
        }
      }

      _notify(key, newValue, oldValue) {
        const listeners = this._listeners.get(key);
        if (!listeners) return;

        listeners.forEach(callback => {
          try {
            callback(newValue, oldValue);
          } catch (err) {
            console.error(`SettingsManager: onChange callback error for key "${key}"`, err);
          }
        });
      }

      get(key) {
        if (key in this._settings) {
          return this._settings[key];
        }
        if (key in DEFAULT_SETTINGS) {
          return DEFAULT_SETTINGS[key];
        }
        return undefined;
      }

      getAll() {
        return {
          ...this._settings,
          countdown: { ...this._settings.countdown },
        };
      }

      set(key, value) {
        if (!this._validate(key, value)) {
          throw new Error(`SettingsManager: Invalid value for key "${key}": ${value}`);
        }

        const oldValue = this._settings[key];
        this._settings[key] = value;

        this._saveToStorage();
        this._notify(key, value, oldValue !== undefined ? oldValue : DEFAULT_SETTINGS[key]);

        return true;
      }

      setAll(partial) {
        if (typeof partial !== 'object' || partial === null) {
          throw new Error('SettingsManager: setAll requires an object');
        }

        const oldValues = {};
        const newValues = {};

        for (const [key, value] of Object.entries(partial)) {
          if (!this._validate(key, value)) {
            throw new Error(`SettingsManager: Invalid value for key "${key}": ${value}`);
          }
          oldValues[key] = this._settings[key];
          newValues[key] = value;
        }

        Object.assign(this._settings, newValues);
        this._saveToStorage();

        for (const [key, newValue] of Object.entries(newValues)) {
          this._notify(key, newValue, oldValues[key]);
        }

        return true;
      }

      onChange(key, callback) {
        if (typeof callback !== 'function') {
          throw new Error('SettingsManager: onChange callback must be a function');
        }

        if (!this._listeners.has(key)) {
          this._listeners.set(key, new Set());
        }

        this._listeners.get(key).add(callback);

        return () => {
          const listeners = this._listeners.get(key);
          if (listeners) {
            listeners.delete(callback);
          }
        };
      }

      reset() {
        const oldSettings = { ...this._settings };
        this._settings = {
          ...DEFAULT_SETTINGS,
          countdown: { ...DEFAULT_SETTINGS.countdown },
        };

        this._saveToStorage();

        for (const [key, newValue] of Object.entries(this._settings)) {
          this._notify(key, newValue, oldSettings[key]);
        }
      }

      _setWithoutValidation(key, value) {
        const oldValue = this._settings[key];
        this._settings[key] = value;
        this._saveToStorage();
        this._notify(key, value, oldValue);
      }
    }

    const instance = new SettingsManager();

    return {
      get: key => instance.get(key),
      getAll: () => instance.getAll(),
      set: (key, value) => instance.set(key, value),
      setAll: partial => instance.setAll(partial),
      onChange: (key, callback) => instance.onChange(key, callback),
      reset: () => instance.reset(),
      DEFAULT_SETTINGS,
      _setWithoutValidation: (key, value) => instance._setWithoutValidation(key, value),
      _reload: () => {
        instance._settings = instance._loadFromStorage();
        instance._listeners.clear();
      },
    };
  }
);
