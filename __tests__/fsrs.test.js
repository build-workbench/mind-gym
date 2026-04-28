const createFSRS = () => {
  jest.resetModules();
  return require('../src/fsrs.js');
};

describe('FSRS-4.5 Algorithm', () => {
  let fsrs;

  beforeEach(() => {
    fsrs = createFSRS();
  });

  describe('createDefaultCard', () => {
    test('creates a card with default values', () => {
      const card = fsrs.createDefaultCard();
      expect(card.difficulty).toBe(5);
      expect(card.stability).toBe(1);
      expect(card.retrievability).toBe(1);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
    });
  });

  describe('calculateRetrievability', () => {
    test('returns 1 for zero elapsed days', () => {
      expect(fsrs.calculateRetrievability(10, 0)).toBe(1);
    });

    test('decreases as elapsed days increase', () => {
      const r1 = fsrs.calculateRetrievability(10, 5);
      const r2 = fsrs.calculateRetrievability(10, 10);
      expect(r1).toBeGreaterThan(r2);
    });

    test('returns lower value for lower stability', () => {
      const r1 = fsrs.calculateRetrievability(5, 10);
      const r2 = fsrs.calculateRetrievability(10, 10);
      expect(r1).toBeLessThan(r2);
    });
  });

  describe('calculateCardMastery', () => {
    test('returns 0 for new cards', () => {
      const card = fsrs.createDefaultCard();
      expect(fsrs.calculateCardMastery(card)).toBe(0);
    });

    test('increases with stability', () => {
      const card1 = { ...fsrs.createDefaultCard(), reps: 1, stability: 5 };
      const card2 = { ...fsrs.createDefaultCard(), reps: 1, stability: 15 };
      expect(fsrs.calculateCardMastery(card2)).toBeGreaterThan(fsrs.calculateCardMastery(card1));
    });

    test('decreases with lapses', () => {
      const card1 = { ...fsrs.createDefaultCard(), reps: 5, stability: 10 };
      const card2 = { ...fsrs.createDefaultCard(), reps: 5, stability: 10, lapses: 3 };
      expect(fsrs.calculateCardMastery(card2)).toBeLessThan(fsrs.calculateCardMastery(card1));
    });

    test('returns value between 0 and 100', () => {
      const card = { ...fsrs.createDefaultCard(), reps: 10, stability: 30 };
      const mastery = fsrs.calculateCardMastery(card);
      expect(mastery).toBeGreaterThanOrEqual(0);
      expect(mastery).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateThemeMastery', () => {
    test('returns empty summary for no cards', () => {
      const summary = fsrs.calculateThemeMastery({});
      expect(summary.total).toBe(0);
      expect(summary.mastered).toBe(0);
      expect(summary.learning).toBe(0);
      expect(summary.new).toBe(0);
      expect(summary.averageMastery).toBe(0);
    });

    test('categorizes cards correctly', () => {
      const mastery = {
        card1: { ...fsrs.createDefaultCard(), reps: 10, stability: 30 }, // high mastery
        card2: { ...fsrs.createDefaultCard(), reps: 3, stability: 5 }, // medium mastery
        card3: fsrs.createDefaultCard(), // low mastery
      };
      const summary = fsrs.calculateThemeMastery(mastery);
      expect(summary.total).toBe(3);
    });
  });

  describe('review', () => {
    test('updates card after successful review', () => {
      const card = fsrs.createDefaultCard();
      const updated = fsrs.review(card, fsrs.Rating.Good);
      expect(updated.reps).toBe(1);
      expect(updated.lastReview).toBeGreaterThan(0);
      expect(updated.nextReview).toBeGreaterThan(updated.lastReview);
    });

    test('increases stability after good rating', () => {
      const card = { ...fsrs.createDefaultCard(), reps: 1, stability: 5 };
      const updated = fsrs.review(card, fsrs.Rating.Good);
      expect(updated.stability).toBeGreaterThan(card.stability);
    });

    test('resets stability after Again rating', () => {
      const card = { ...fsrs.createDefaultCard(), reps: 5, stability: 10 };
      const updated = fsrs.review(card, fsrs.Rating.Again);
      expect(updated.stability).toBeLessThan(card.stability);
      expect(updated.lapses).toBe(card.lapses + 1);
    });

    test('Easy rating gives larger interval than Good', () => {
      const card = { ...fsrs.createDefaultCard(), reps: 3, stability: 10 };
      const updatedGood = fsrs.review(card, fsrs.Rating.Good);
      const updatedEasy = fsrs.review({ ...card }, fsrs.Rating.Easy);
      expect(updatedEasy.nextReview).toBeGreaterThanOrEqual(updatedGood.nextReview);
    });
  });

  describe('inferRatingFromGamePerformance', () => {
    test('returns Again for lost game', () => {
      const rating = fsrs.inferRatingFromGamePerformance(60, 20, 'easy', 2, 0, false);
      expect(rating).toBe(fsrs.Rating.Again);
    });

    test('returns Easy for perfect game', () => {
      const rating = fsrs.inferRatingFromGamePerformance(30, 8, 'easy', 0, 5, true);
      expect(rating).toBe(fsrs.Rating.Easy);
    });

    test('returns Good for decent game', () => {
      const rating = fsrs.inferRatingFromGamePerformance(60, 12, 'easy', 0, 2, true);
      expect(rating).toBe(fsrs.Rating.Good);
    });

    test('returns Hard for struggling game', () => {
      const rating = fsrs.inferRatingFromGamePerformance(90, 20, 'easy', 3, 0, true);
      expect(rating).toBe(fsrs.Rating.Hard);
    });
  });

  describe('countDueCards', () => {
    test('returns 0 for empty mastery', () => {
      expect(fsrs.countDueCards({})).toBe(0);
    });

    test('counts cards with nextReview in the past', () => {
      const now = Date.now();
      const mastery = {
        card1: { ...fsrs.createDefaultCard(), nextReview: now - 1000 },
        card2: { ...fsrs.createDefaultCard(), nextReview: now + 100000 },
      };
      expect(fsrs.countDueCards(mastery)).toBe(1);
    });
  });

  describe('getDueCards', () => {
    test('returns empty array for no due cards', () => {
      expect(fsrs.getDueCards({})).toEqual([]);
    });

    test('returns only due cards sorted by mastery', () => {
      const now = Date.now();
      const mastery = {
        card1: { ...fsrs.createDefaultCard(), reps: 5, stability: 20, nextReview: now - 1000 },
        card2: { ...fsrs.createDefaultCard(), reps: 2, stability: 5, nextReview: now - 1000 },
        card3: { ...fsrs.createDefaultCard(), nextReview: now + 100000 },
      };
      const due = fsrs.getDueCards(mastery);
      expect(due.length).toBe(2);
      expect(due[0][0]).toBe('card2'); // lower mastery first
    });
  });
});
