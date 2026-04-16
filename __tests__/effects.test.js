const Effects = require('../src/effects.js');

describe('effects module', () => {
  describe('ensureAudio', () => {
    test('returns AudioContext or null', () => {
      const ctx = Effects.ensureAudio();
      // In Node test environment, AudioContext may not exist
      expect(ctx === null || typeof ctx === 'object').toBe(true);
    });

    test('returns cached context on subsequent calls', () => {
      const ctx1 = Effects.ensureAudio();
      const ctx2 = Effects.ensureAudio();
      expect(ctx1).toBe(ctx2);
    });
  });

  describe('beep', () => {
    let mockAudioContext;
    let mockOscillator;
    let mockGain;

    beforeEach(() => {
      mockGain = {
        gain: { value: 0 },
        connect: jest.fn(),
      };
      mockOscillator = {
        type: 'sine',
        frequency: { value: 0 },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      mockAudioContext = {
        currentTime: 100,
        createOscillator: jest.fn(() => mockOscillator),
        createGain: jest.fn(() => mockGain),
        destination: {},
      };

      // Mock global AudioContext
      global.AudioContext = jest.fn(() => mockAudioContext);
      global.webkitAudioContext = jest.fn(() => mockAudioContext);

      // Reset the module to use new mock
      jest.resetModules();
    });

    afterEach(() => {
      delete global.AudioContext;
      delete global.webkitAudioContext;
    });

    test('does nothing when AudioContext is not available', () => {
      delete global.AudioContext;
      delete global.webkitAudioContext;
      jest.resetModules();
      const NoAudioEffects = require('../src/effects.js');

      // Should not throw
      expect(() => NoAudioEffects.beep(440, 0.1)).not.toThrow();
    });

    test('creates oscillator with correct frequency', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio(); // Initialize context
      MockEffects.beep(880, 0.1);

      expect(mockOscillator.frequency.value).toBe(880);
    });

    test('creates oscillator with correct duration', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.beep(440, 0.5);

      expect(mockOscillator.start).toHaveBeenCalledWith(100);
      expect(mockOscillator.stop).toHaveBeenCalledWith(100.5);
    });

    test('sets oscillator type', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.beep(440, 0.1, 'square');

      expect(mockOscillator.type).toBe('square');
    });

    test('sets gain volume', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.beep(440, 0.1, 'sine', 0.1);

      expect(mockGain.gain.value).toBe(0.1);
    });

    test('connects oscillator to gain and gain to destination', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.beep(440, 0.1);

      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.connect).toHaveBeenCalled();
    });

    test('uses default type and volume', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.beep(440, 0.1);

      expect(mockOscillator.type).toBe('sine');
      expect(mockGain.gain.value).toBe(0.05);
    });
  });

  describe('sfx', () => {
    let mockAudioContext;
    let mockOscillator;
    let mockGain;

    beforeEach(() => {
      mockGain = {
        gain: { value: 0 },
        connect: jest.fn(),
      };
      mockOscillator = {
        type: 'sine',
        frequency: { value: 0 },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      mockAudioContext = {
        currentTime: 100,
        createOscillator: jest.fn(() => mockOscillator),
        createGain: jest.fn(() => mockGain),
        destination: {},
      };

      global.AudioContext = jest.fn(() => mockAudioContext);
      global.webkitAudioContext = jest.fn(() => mockAudioContext);
      jest.resetModules();
    });

    afterEach(() => {
      delete global.AudioContext;
      delete global.webkitAudioContext;
    });

    test('does nothing when sound is disabled', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: false });

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('does nothing when settings is null', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', null);

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('plays flip sound', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, volume: 0.5 });

      expect(mockOscillator.frequency.value).toBe(660);
    });

    test('plays match sound', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('match', { sound: true, volume: 0.5 });

      expect(mockOscillator.frequency.value).toBe(880);
    });

    test('plays mismatch sound', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('mismatch', { sound: true, volume: 0.5 });

      expect(mockOscillator.frequency.value).toBe(220);
    });

    test('plays win sound', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('win', { sound: true, volume: 0.5 });

      expect(mockOscillator.frequency.value).toBe(1200);
    });

    test('uses electro soundPack', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, soundPack: 'electro', volume: 0.5 });

      expect(mockOscillator.type).toBe('square');
    });

    test('uses soft soundPack', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, soundPack: 'soft', volume: 0.5 });

      expect(mockOscillator.type).toBe('triangle');
    });

    test('uses clear (default) soundPack', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, soundPack: 'clear', volume: 0.5 });

      expect(mockOscillator.type).toBe('sine');
    });

    test('applies volume setting', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, volume: 1.0 });

      // Base volume for flip is 0.05, with volume 1.0
      expect(mockGain.gain.value).toBe(0.05);
    });

    test('clamps volume between 0 and 1', () => {
      const MockEffects = require('../src/effects.js');
      MockEffects.ensureAudio();
      MockEffects.sfx('flip', { sound: true, volume: 2.0 });

      // Volume should be clamped to 1
      expect(mockGain.gain.value).toBe(0.05);
    });
  });

  describe('vibrateMs', () => {
    test('does nothing when vibration is disabled', () => {
      // Should not throw even with settings
      expect(() => Effects.vibrateMs(100, { vibrate: false })).not.toThrow();
    });

    test('does nothing when settings is null', () => {
      expect(() => Effects.vibrateMs(100, null)).not.toThrow();
    });

    test('handles missing navigator.vibrate gracefully', () => {
      // In Node.js environment, navigator.vibrate may not exist
      // The function should not throw
      expect(() => Effects.vibrateMs(100, { vibrate: true })).not.toThrow();
    });

    test('handles vibration pattern array', () => {
      expect(() => Effects.vibrateMs([100, 50, 100], { vibrate: true })).not.toThrow();
    });

    test('handles missing settings gracefully', () => {
      expect(() => Effects.vibrateMs(100, undefined)).not.toThrow();
    });
  });
});
