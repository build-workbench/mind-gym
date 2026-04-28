/**
 * FSRS-4.5 (Free Spaced Repetition Scheduler)
 * Based on the open-source FSRS algorithm with optimizations for Mind Gym
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberFSRS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // FSRS-4.5 default weights (optimized for memory training)
  const DEFAULT_WEIGHTS = [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29,
    2.61,
  ];

  // Default parameters
  const DEFAULT_PARAMS = {
    w: DEFAULT_WEIGHTS,
    requestRetention: 0.9,
    maximumInterval: 365,
    easyBonus: 1.3,
    hardInterval: 1.2,
  };

  // Rating enum (FSRS standard)
  const Rating = {
    Again: 1,
    Hard: 2,
    Good: 3,
    Easy: 4,
  };

  // Decay factor for retrievability calculation
  const DECAY = -0.5;

  /**
   * Create a default FSRS card
   * @returns {Object} Default card state
   */
  function createDefaultCard() {
    const now = Date.now();
    return {
      difficulty: 5, // 0-10, higher = harder
      stability: 1, // days
      retrievability: 1, // 0-1, probability of recall
      lastReview: now,
      nextReview: now,
      reps: 0,
      lapses: 0,
    };
  }

  /**
   * Calculate retrievability (probability of recall)
   * Based on the forgetting curve: R(t) = (1 + t/(9*S))^(-1)
   * @param {number} stability - Card stability in days
   * @param {number} elapsedDays - Days since last review
   * @returns {number} Retrievability (0-1)
   */
  function calculateRetrievability(stability, elapsedDays) {
    if (stability <= 0) return 0;
    if (elapsedDays <= 0) return 1;
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
  }

  /**
   * Calculate initial stability for new cards
   * @param {number} rating - User rating (1-4)
   * @param {number[]} w - Weight parameters
   * @returns {number} Initial stability
   */
  function calculateInitialStability(rating, w) {
    return Math.max(0.1, w[rating - 1]);
  }

  /**
   * Calculate initial difficulty for new cards
   * @param {number} rating - User rating (1-4)
   * @param {number[]} w - Weight parameters
   * @returns {number} Initial difficulty (0-10)
   */
  function calculateInitialDifficulty(rating, w) {
    const d = w[4] - (rating - 3) * w[5];
    return Math.max(1, Math.min(10, d));
  }

  /**
   * Calculate next difficulty after review
   * @param {number} currentDifficulty - Current difficulty
   * @param {number} rating - User rating (1-4)
   * @param {number[]} w - Weight parameters
   * @returns {number} New difficulty (0-10)
   */
  function calculateNextDifficulty(currentDifficulty, rating, w) {
    const deltaD =
      w[6] * (rating - 3) + w[7] * Math.sign(rating - 3) * Math.pow(currentDifficulty - w[8], 2);
    const d = currentDifficulty - deltaD;
    return Math.max(1, Math.min(10, d));
  }

  /**
   * Calculate next stability after successful recall
   * @param {number} currentDifficulty - Current difficulty
   * @param {number} currentStability - Current stability
   * @param {number} retrievability - Current retrievability
   * @param {number} rating - User rating (1-4)
   * @param {number[]} w - Weight parameters
   * @returns {number} New stability
   */
  function calculateNextStabilitySuccess(
    currentDifficulty,
    currentStability,
    retrievability,
    rating,
    w
  ) {
    const hardPenalty = rating === Rating.Hard ? w[9] : 1;
    const easyBonus = rating === Rating.Easy ? w[10] : 1;
    // Protect against edge case where retrievability is 1
    const r = Math.max(0.01, Math.min(0.99, retrievability));

    const s =
      currentStability *
      (1 +
        w[11] *
          Math.exp(w[12] * (currentDifficulty - w[13])) *
          (Math.pow(1 - r, -w[14]) - 1) *
          hardPenalty *
          easyBonus);

    return Math.max(0.1, isFinite(s) ? s : currentStability);
  }

  /**
   * Calculate next stability after failure (Again)
   * @param {number} currentDifficulty - Current difficulty
   * @param {number} currentStability - Current stability
   * @param {number} retrievability - Current retrievability
   * @param {number[]} w - Weight parameters
   * @returns {number} New stability
   */
  function calculateNextStabilityFailure(currentDifficulty, currentStability, retrievability, w) {
    // FSRS-4.5 uses w[15] and w[16], not w[17]
    // Protect against edge cases where retrievability is 1 or 0
    const r = Math.max(0.01, Math.min(0.99, retrievability));
    const s =
      w[15] *
      Math.pow(Math.max(0.1, currentDifficulty), -w[16]) *
      (Math.pow(currentStability + 1, w[16]) - 1) *
      Math.exp(w[16] * (1 - r));

    return Math.max(0.1, isFinite(s) ? s : 0.5);
  }

  /**
   * Calculate next review interval
   * @param {number} stability - Card stability
   * @param {number} requestRetention - Target retention rate (default 0.9)
   * @param {number} maximumInterval - Maximum interval in days
   * @returns {number} Interval in days
   */
  function calculateInterval(stability, requestRetention, maximumInterval) {
    const interval = 9 * stability * (1 / requestRetention - 1);
    return Math.max(1, Math.min(maximumInterval, Math.round(interval)));
  }

  /**
   * Process a card review and return updated card state
   * @param {Object} card - Current card state
   * @param {number} rating - User rating (1-4)
   * @param {Object} params - FSRS parameters
   * @returns {Object} Updated card state
   */
  function review(card, rating, params) {
    const p = { ...DEFAULT_PARAMS, ...params };
    const w = p.w;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Calculate elapsed days since last review
    const elapsedDays = card.lastReview > 0 ? (now - card.lastReview) / dayMs : 0;

    // Calculate current retrievability
    const retrievability = calculateRetrievability(card.stability, elapsedDays);

    let newDifficulty, newStability;

    if (card.reps === 0) {
      // New card
      newDifficulty = calculateInitialDifficulty(rating, w);
      newStability = calculateInitialStability(rating, w);
    } else if (rating === Rating.Again) {
      // Failed recall
      newDifficulty = calculateNextDifficulty(card.difficulty, rating, w);
      newStability = calculateNextStabilityFailure(
        card.difficulty,
        card.stability,
        retrievability,
        w
      );
    } else {
      // Successful recall
      newDifficulty = calculateNextDifficulty(card.difficulty, rating, w);
      newStability = calculateNextStabilitySuccess(
        card.difficulty,
        card.stability,
        retrievability,
        rating,
        w
      );
    }

    // Calculate next interval
    const interval = calculateInterval(newStability, p.requestRetention, p.maximumInterval);
    const nextReview = now + interval * dayMs;

    return {
      difficulty: newDifficulty,
      stability: newStability,
      retrievability: rating === Rating.Again ? 0 : retrievability,
      lastReview: now,
      nextReview: nextReview,
      reps: card.reps + 1,
      lapses: rating === Rating.Again ? card.lapses + 1 : card.lapses,
    };
  }

  /**
   * Calculate mastery level for a card (0-100)
   * @param {Object} card - Card state
   * @returns {number} Mastery level (0-100)
   */
  function calculateCardMastery(card) {
    if (!card || card.reps === 0) return 0;

    // Stability score: higher stability = more mastered
    const stabilityScore = Math.min(card.stability / 30, 1);

    // Retrievability score: higher = better
    const retrievalScore = card.retrievability;

    // Progress score: more reviews = more reliable
    const progressScore = Math.min(card.reps / 10, 1);

    // Penalty for lapses (forgetting events)
    const penaltyScore = Math.max(0, 1 - card.lapses * 0.1);

    // Difficulty factor: easier cards are "more mastered" for same stability
    const difficultyFactor = 1 - (card.difficulty - 1) / 18; // 1->1.0, 10->0.5

    return Math.round(
      (stabilityScore * 0.35 + retrievalScore * 0.25 + progressScore * 0.2 + penaltyScore * 0.2) *
        difficultyFactor *
        100
    );
  }

  /**
   * Calculate theme-level mastery summary
   * @param {Object} masteryData - Object mapping card values to card states
   * @returns {Object} Theme mastery summary
   */
  function calculateThemeMastery(masteryData) {
    const cards = Object.values(masteryData);
    if (cards.length === 0) {
      return {
        total: 0,
        mastered: 0,
        learning: 0,
        new: 0,
        averageMastery: 0,
      };
    }

    const masteries = cards.map(c => calculateCardMastery(c));

    return {
      total: cards.length,
      mastered: masteries.filter(m => m >= 80).length,
      learning: masteries.filter(m => m >= 20 && m < 80).length,
      new: masteries.filter(m => m < 20).length,
      averageMastery: Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length),
    };
  }

  /**
   * Infer rating from game performance
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} moves - Number of moves
   * @param {string} difficulty - Game difficulty ('easy', 'medium', 'hard')
   * @param {number} hintsUsed - Number of hints used
   * @param {number} maxCombo - Maximum combo achieved
   * @param {boolean} win - Whether the game was won
   * @returns {number} Rating (1-4)
   */
  function inferRatingFromGamePerformance(elapsed, moves, difficulty, hintsUsed, maxCombo, win) {
    if (!win) return Rating.Again;

    // Expected moves thresholds per difficulty
    const thresholds = {
      easy: { perfect: 8, good: 15 },
      medium: { perfect: 12, good: 22 },
      hard: { perfect: 18, good: 30 },
    };

    const t = thresholds[difficulty] || thresholds.easy;

    // Perfect performance: minimal moves, no hints, good combo
    if (moves <= t.perfect && hintsUsed === 0 && maxCombo >= 3) {
      return Rating.Easy;
    }

    // Good performance: reasonable moves, few hints
    if (moves <= t.good && hintsUsed <= 1) {
      return Rating.Good;
    }

    // Hard performance: completed but struggled
    return Rating.Hard;
  }

  /**
   * Get cards that are due for review
   * @param {Object} masteryData - Object mapping card values to card states
   * @returns {Array} Array of [cardValue, cardState] pairs sorted by mastery
   */
  function getDueCards(masteryData) {
    const now = Date.now();
    const due = Object.entries(masteryData).filter(([_, card]) => card.nextReview <= now);

    // Sort by mastery (lowest first = most needing review)
    due.sort((a, b) => calculateCardMastery(a[1]) - calculateCardMastery(b[1]));

    return due;
  }

  /**
   * Count cards due for review
   * @param {Object} masteryData - Object mapping card values to card states
   * @returns {number} Number of due cards
   */
  function countDueCards(masteryData) {
    const now = Date.now();
    return Object.values(masteryData).filter(card => card.nextReview <= now).length;
  }

  // Public API
  return {
    DEFAULT_PARAMS,
    Rating,
    createDefaultCard,
    calculateRetrievability,
    calculateInterval,
    calculateCardMastery,
    calculateThemeMastery,
    review,
    inferRatingFromGamePerformance,
    getDueCards,
    countDueCards,
  };
});
