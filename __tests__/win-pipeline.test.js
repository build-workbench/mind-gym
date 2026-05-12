/**
 * WinPipeline tests
 */

const { create } = require('../src/pipeline/win-pipeline.js');

describe('WinPipeline', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = create();
  });

  describe('getOrder', () => {
    it('returns default step order', () => {
      const order = pipeline.getOrder();
      expect(order).toContain('stopTimer');
      expect(order).toContain('updateBestScore');
      expect(order).toContain('updateStats');
      expect(order).toContain('runConfetti');
      expect(order).toContain('checkAchievements');
    });
  });

  describe('addStep', () => {
    it('adds step at end by default', () => {
      const fn = jest.fn();
      pipeline.addStep('customStep', fn);

      const order = pipeline.getOrder();
      expect(order[order.length - 1]).toBe('customStep');
    });

    it('adds step at specific position', () => {
      const fn = jest.fn();
      const originalOrder = pipeline.getOrder();

      pipeline.addStep('earlyStep', fn, 0);

      const order = pipeline.getOrder();
      expect(order[0]).toBe('earlyStep');
    });
  });

  describe('removeStep', () => {
    it('removes existing step', () => {
      const originalOrder = pipeline.getOrder();
      expect(originalOrder).toContain('runConfetti');

      pipeline.removeStep('runConfetti');

      const order = pipeline.getOrder();
      expect(order).not.toContain('runConfetti');
    });

    it('handles non-existent step', () => {
      expect(() => pipeline.removeStep('nonExistent')).not.toThrow();
    });
  });

  describe('reorderSteps', () => {
    it('reorders steps', () => {
      pipeline.reorderSteps(['stopTimer', 'runConfetti', 'checkAchievements']);

      const order = pipeline.getOrder();
      expect(order).toEqual(['stopTimer', 'runConfetti', 'checkAchievements']);
    });

    it('ignores non-existent steps', () => {
      pipeline.reorderSteps(['stopTimer', 'nonExistent', 'runConfetti']);

      const order = pipeline.getOrder();
      expect(order).toEqual(['stopTimer', 'runConfetti']);
    });
  });

  describe('execute', () => {
    it('executes steps in order', () => {
      const callOrder = [];
      const context = {
        gameState: {
          stopTimer: () => callOrder.push('stopTimer'),
        },
        effects: {
          runConfetti: () => callOrder.push('runConfetti'),
        },
      };

      pipeline.reorderSteps(['stopTimer', 'runConfetti']);
      pipeline.execute({}, context);

      expect(callOrder).toEqual(['stopTimer', 'runConfetti']);
    });

    it('passes state to steps', () => {
      const mockSaveBest = jest.fn();
      const context = {
        storage: {
          loadBest: jest.fn().mockReturnValue(null),
          saveBest: mockSaveBest,
        },
      };
      const state = {
        difficulty: 'easy',
        elapsed: 60,
        moves: 20,
      };

      pipeline.reorderSteps(['updateBestScore']);
      pipeline.execute(state, context);

      expect(mockSaveBest).toHaveBeenCalledWith('easy', { time: 60, moves: 20 });
    });

    it('handles step errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const context = {
        gameState: {
          stopTimer: () => {
            throw new Error('Test error');
          },
        },
      };

      expect(() => pipeline.execute({}, context)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('stopTimer'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('returns results from steps', () => {
      const context = {
        achievements: {
          loadAchievements: jest.fn().mockReturnValue({}),
          saveAchievements: jest.fn(),
          checkAchievements: jest.fn().mockReturnValue({ newly: ['ach1'], store: {} }),
          difficulties: { easy: { pairs: 8 } },
        },
      };
      const state = {
        difficulty: 'easy',
        elapsed: 60,
        moves: 20,
        hintsUsed: 0,
        maxComboThisGame: 0,
      };

      pipeline.reorderSteps(['checkAchievements']);
      const results = pipeline.execute(state, context);

      expect(results.checkAchievements).toEqual(['ach1']);
    });
  });

  describe('getSteps', () => {
    it('returns all steps', () => {
      const steps = pipeline.getSteps();
      expect(steps.has('stopTimer')).toBe(true);
      expect(steps.has('runConfetti')).toBe(true);
    });
  });
});
