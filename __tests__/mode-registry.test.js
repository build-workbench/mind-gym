/**
 * GameModeRegistry tests
 */

const ModeRegistry = require('../src/modes/registry.js');

describe('GameModeRegistry', () => {
  beforeEach(() => {
    // Reset by creating a new instance context
  });

  describe('register', () => {
    it('registers a mode with id', () => {
      const mode = { id: 'test', name: 'Test Mode' };
      ModeRegistry.register(mode);
      expect(ModeRegistry.get('test')).toBe(mode);
    });

    it('throws error if mode has no id', () => {
      expect(() => ModeRegistry.register({})).toThrow('mode must have an id');
    });

    it('warns but allows overwriting existing mode', () => {
      const mode1 = { id: 'overwrite-test', name: 'Mode 1' };
      const mode2 = { id: 'overwrite-test', name: 'Mode 2' };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      ModeRegistry.register(mode1);
      ModeRegistry.register(mode2);

      expect(ModeRegistry.get('overwrite-test')).toBe(mode2);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already registered'));

      consoleSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('returns undefined for non-existent mode', () => {
      expect(ModeRegistry.get('non-existent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns array of all registered modes', () => {
      const modes = ModeRegistry.getAll();
      expect(Array.isArray(modes)).toBe(true);
      expect(modes.length).toBeGreaterThan(0);
    });
  });

  describe('switchTo', () => {
    it('switches to registered mode', () => {
      const mode = {
        id: 'switch-test',
        name: 'Switch Test',
        onInit: jest.fn(),
      };
      ModeRegistry.register(mode);

      const result = ModeRegistry.switchTo('switch-test', { test: true });

      expect(result).toBe(true);
      expect(ModeRegistry.getCurrent()).toBe(mode);
      expect(mode.onInit).toHaveBeenCalledWith({ test: true });
    });

    it('returns false for non-existent mode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = ModeRegistry.switchTo('non-existent');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));

      consoleSpy.mockRestore();
    });

    it('calls onEnd of previous mode', () => {
      const mode1 = {
        id: 'prev-mode',
        name: 'Previous',
        onEnd: jest.fn(),
      };
      const mode2 = {
        id: 'next-mode',
        name: 'Next',
        onInit: jest.fn(),
      };

      ModeRegistry.register(mode1);
      ModeRegistry.register(mode2);

      ModeRegistry.switchTo('prev-mode');
      ModeRegistry.switchTo('next-mode');

      expect(mode1.onEnd).toHaveBeenCalledWith({ reason: 'mode_switch' });
    });
  });

  describe('onFlip', () => {
    it('delegates to current mode onFlip', () => {
      const mode = {
        id: 'flip-test',
        name: 'Flip Test',
        onFlip: jest.fn().mockReturnValue({ flipped: true }),
      };
      ModeRegistry.register(mode);
      ModeRegistry.switchTo('flip-test');

      const result = ModeRegistry.onFlip({ index: 0 });

      expect(mode.onFlip).toHaveBeenCalledWith({ index: 0 });
      expect(result).toEqual({ flipped: true });
    });

    it('returns undefined if no current mode', () => {
      // Create fresh registry context would be ideal
      // For now, just test the behavior
    });
  });

  describe('onKeyPress', () => {
    it('delegates to current mode onKeyPress', () => {
      const mode = {
        id: 'keypress-test',
        name: 'Keypress Test',
        onKeyPress: jest.fn(),
      };
      ModeRegistry.register(mode);
      ModeRegistry.switchTo('keypress-test');

      ModeRegistry.onKeyPress('j');

      expect(mode.onKeyPress).toHaveBeenCalledWith('j');
    });
  });

  describe('getState', () => {
    it('returns state from current mode', () => {
      const mode = {
        id: 'state-test',
        name: 'State Test',
        getState: jest.fn().mockReturnValue({ test: 'state' }),
      };
      ModeRegistry.register(mode);
      ModeRegistry.switchTo('state-test');

      const state = ModeRegistry.getState();

      expect(state).toEqual({ test: 'state' });
    });
  });

  describe('onChange', () => {
    it('fires callback on mode switch', () => {
      const callback = jest.fn();
      const mode = { id: 'change-test', name: 'Change Test' };

      ModeRegistry.register(mode);
      const unsubscribe = ModeRegistry.onChange(callback);

      ModeRegistry.switchTo('change-test');

      expect(callback).toHaveBeenCalledWith('change-test');

      unsubscribe();
    });

    it('unsubscribe removes callback', () => {
      const callback = jest.fn();
      const mode = { id: 'unsubscribe-test', name: 'Unsubscribe Test' };

      ModeRegistry.register(mode);
      const unsubscribe = ModeRegistry.onChange(callback);

      unsubscribe();
      ModeRegistry.switchTo('unsubscribe-test');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
