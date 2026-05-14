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

  describe('renderControls', () => {
    it('sets pause button text when paused', () => {
      const pauseBtn = { textContent: '' };
      const pauseOverlay = { classList: { remove: jest.fn(), add: jest.fn() } };
      const r = create({
        elements: { pauseBtn, pauseOverlay, hintLeftEl: { textContent: '' } },
        i18n: () => ({ resume: 'Resume', pause: 'Pause' }),
      });
      r.renderControls({ paused: true, hintsLeft: 2 });
      expect(pauseBtn.textContent).toBe('Resume');
      expect(pauseOverlay.classList.remove).toHaveBeenCalledWith('hidden');
      expect(pauseOverlay.classList.add).toHaveBeenCalledWith('flex');
    });

    it('sets pause button text when not paused', () => {
      const pauseBtn = { textContent: '' };
      const pauseOverlay = { classList: { remove: jest.fn(), add: jest.fn() } };
      const r = create({
        elements: { pauseBtn, pauseOverlay, hintLeftEl: { textContent: '' } },
        i18n: () => ({ resume: 'Resume', pause: 'Pause' }),
      });
      r.renderControls({ paused: false, hintsLeft: 1 });
      expect(pauseBtn.textContent).toBe('Pause');
      expect(pauseOverlay.classList.add).toHaveBeenCalledWith('hidden');
      expect(pauseOverlay.classList.remove).toHaveBeenCalledWith('flex');
    });
  });

  describe('renderLeaderboard', () => {
    it('renders leaderboard entries', () => {
      const leaderboardList = { innerHTML: '' };
      const r = create({
        elements: { leaderboardList },
        i18n: () => ({ leaderboardEmpty: 'No entries', stepsFmt: 'steps' }),
      });
      const entries = [{ time: 30, moves: 10, at: Date.now() }];
      r.renderLeaderboard(
        entries,
        { leaderboardEmpty: 'No entries', stepsFmt: 'steps' },
        t => `${t}s`
      );
      expect(leaderboardList.innerHTML).toContain('1. 30s');
    });

    it('renders empty message when no entries', () => {
      const leaderboardList = { innerHTML: '' };
      const r = create({ elements: { leaderboardList } });
      r.renderLeaderboard([], { leaderboardEmpty: 'Empty' }, t => t);
      expect(leaderboardList.innerHTML).toContain('Empty');
    });
  });

  describe('renderAchievements', () => {
    it('renders achievements list', () => {
      const achievementsList = { innerHTML: '' };
      const r = create({ elements: { achievementsList } });
      const defs = [{ id: 'first_win', titleKey: 'firstWin', descKey: 'firstWinDesc' }];
      const t = { firstWin: 'First Win', firstWinDesc: 'Win once' };
      r.renderAchievements({ first_win: { at: Date.now() } }, defs, t, at => '2024-01-01');
      expect(achievementsList.innerHTML).toContain('First Win');
      expect(achievementsList.innerHTML).toContain('✅');
    });
  });

  describe('renderStats', () => {
    it('renders stats list', () => {
      const statsListEl = { innerHTML: '' };
      const r = create({ elements: { statsListEl } });
      const stats = { games: 5, wins: 3, bestCombo: 2 };
      const summary = {
        winRate: '60%',
        avgTime: '1:00',
        avgMoves: '10',
        avgHints: '0',
        avgCombo: '1',
        avgPrecision: '80%',
        avgRecall: '70%',
        avgNBackAcc: '90%',
        avgNBackRt: '500ms',
      };
      const t = {
        statsTotalGames: 'Games',
        statsWins: 'Wins',
        statsWinRate: 'Win Rate',
        statsAvgTime: 'Avg Time',
        statsAvgMoves: 'Avg Moves',
        statsAvgHints: 'Avg Hints',
        statsAvgCombo: 'Avg Combo',
        statsHistoryBest: 'Best',
        statsRecallLabel: 'Recall',
        statsPrecision: 'Precision',
        statsRecall: 'Recall',
        statsTimes: 'times',
        statsNbackLabel: 'N-back',
        statsAvgAcc: 'Accuracy',
        statsAvgRt: 'RT',
      };
      r.renderStats(stats, summary, t);
      expect(statsListEl.innerHTML).toContain('5');
      expect(statsListEl.innerHTML).toContain('3');
    });
  });

  describe('getElements', () => {
    it('returns elements reference', () => {
      const elements = renderer.getElements();
      expect(elements).toBe(mockElements);
    });
  });
});
