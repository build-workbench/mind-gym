/**
 * UIRenderer tests
 */

const { create } = require('../src/ui/renderer.js');

describe('UIRenderer', () => {
  let renderer;
  let mockElements;

  beforeEach(() => {
    mockElements = {
      movesEl: { textContent: '' },
      timeEl: { textContent: '' },
      pairsLeftEl: { textContent: '' },
      progressBarEl: { style: { width: '0%' } },
      hintLeftEl: { textContent: '' },
      comboToastEl: { textContent: '', classList: { remove: jest.fn(), add: jest.fn() } },
      bestEl: { textContent: '' },
      ratingStarsEl: { textContent: '', setAttribute: jest.fn() },
      toastEl: { textContent: '', classList: { remove: jest.fn(), add: jest.fn() } },
      winModal: { classList: { remove: jest.fn(), add: jest.fn() }, setAttribute: jest.fn() },
    };

    renderer = create({
      elements: mockElements,
      getSettings: () => ({ accent: 'indigo', theme: 'auto' }),
      i18n: () => ({ comboLabel: 'Combo', bestSteps: ' steps' }),
      currentLang: () => 'en',
    });
  });

  describe('renderMoves', () => {
    it('updates moves element', () => {
      renderer.renderMoves(42);
      expect(mockElements.movesEl.textContent).toBe('42');
    });

    it('handles missing element', () => {
      const r = create({ elements: {} });
      expect(() => r.renderMoves(42)).not.toThrow();
    });
  });

  describe('renderTime', () => {
    it('updates time element', () => {
      renderer.renderTime('1:30');
      expect(mockElements.timeEl.textContent).toBe('1:30');
    });
  });

  describe('renderProgress', () => {
    it('updates progress elements', () => {
      renderer.renderProgress(6, 10);
      expect(mockElements.pairsLeftEl.textContent).toBe('4');
      expect(mockElements.progressBarEl.style.width).toBe('60%');
    });

    it('handles zero total', () => {
      renderer.renderProgress(0, 0);
      expect(mockElements.progressBarEl.style.width).toBe('0%');
    });
  });

  describe('renderHint', () => {
    it('updates hint count', () => {
      renderer.renderHint(3);
      expect(mockElements.hintLeftEl.textContent).toBe('3');
    });
  });

  describe('renderRating', () => {
    it('renders star rating', () => {
      renderer.renderRating(3);
      expect(mockElements.ratingStarsEl.textContent).toBe('⭐⭐⭐☆☆');
    });

    it('renders zero stars', () => {
      renderer.renderRating(0);
      expect(mockElements.ratingStarsEl.textContent).toBe('☆☆☆☆☆');
    });

    it('renders five stars', () => {
      renderer.renderRating(5);
      expect(mockElements.ratingStarsEl.textContent).toBe('⭐⭐⭐⭐⭐');
    });
  });

  describe('showModal', () => {
    it('shows modal element', () => {
      renderer.showModal(mockElements.winModal);
      expect(mockElements.winModal.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockElements.winModal.classList.add).toHaveBeenCalledWith('flex');
      expect(mockElements.winModal.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
    });

    it('handles null element', () => {
      expect(() => renderer.showModal(null)).not.toThrow();
    });
  });

  describe('hideModal', () => {
    it('hides modal element', () => {
      renderer.hideModal(mockElements.winModal);
      expect(mockElements.winModal.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockElements.winModal.classList.remove).toHaveBeenCalledWith('flex');
      expect(mockElements.winModal.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
    });
  });

  describe('showToast', () => {
    it('shows toast message', () => {
      jest.useFakeTimers();
      renderer.showToast('Test message');
      expect(mockElements.toastEl.textContent).toBe('Test message');
      expect(mockElements.toastEl.classList.remove).toHaveBeenCalledWith('hidden');
      jest.useRealTimers();
    });
  });

  describe('renderCard', () => {
    it('creates card element', () => {
      const card = renderer.renderCard({ v: 'A', type: 'emoji' }, 0);
      expect(card.tagName).toBe('BUTTON');
      expect(card.dataset.value).toBe('A');
      expect(card.dataset.index).toBe('0');
    });
  });

  describe('applyTheme', () => {
    it('applies dark theme by adding dark class', () => {
      // Remove dark class first
      document.documentElement.classList.remove('dark');

      renderer.applyTheme('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Cleanup
      document.documentElement.classList.remove('dark');
    });

    it('applies light theme by removing dark class', () => {
      // Add dark class first
      document.documentElement.classList.add('dark');

      renderer.applyTheme('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('respects auto theme with prefers-color-scheme', () => {
      document.documentElement.classList.remove('dark');

      // Mock prefers-color-scheme: dark
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn().mockReturnValue({ matches: true });

      renderer.applyTheme('auto');

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      window.matchMedia = originalMatchMedia;
      document.documentElement.classList.remove('dark');
    });
  });

  describe('getElements', () => {
    it('returns elements reference', () => {
      const elements = renderer.getElements();
      expect(elements).toBe(mockElements);
    });
  });
});
