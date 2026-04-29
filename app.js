const __GLOBAL__ =
  typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this;
const __RememberKeys__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/keys.js')
    : __GLOBAL__.RememberKeys;
const __RememberUtils__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/utils.js')
    : __GLOBAL__.RememberUtils;
const __RememberStats__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/stats.js')
    : __GLOBAL__.RememberStats;
const __RememberAchievements__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/achievements.js')
    : __GLOBAL__.RememberAchievements;
const __RememberModes__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/modes.js')
    : __GLOBAL__.RememberModes;
const __RememberImportExport__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/import-export.js')
    : __GLOBAL__.RememberImportExport;
const __RememberStorage__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/storage.js')
    : __GLOBAL__.RememberStorage;
const __RememberI18n__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/i18n.js')
    : __GLOBAL__.RememberI18n;
const __RememberEffects__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/effects.js')
    : __GLOBAL__.RememberEffects;
const __RememberPools__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/pools.js')
    : __GLOBAL__.RememberPools;
const __RememberTimer__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/timer.js')
    : __GLOBAL__.RememberTimer;
const __RememberConfetti__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/confetti.js')
    : __GLOBAL__.RememberConfetti;
const __RememberUIEvents__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/ui-events.js')
    : __GLOBAL__.RememberUIEvents;
const __RememberUI__ =
  typeof module !== 'undefined' && module.exports ? require('./src/ui.js') : __GLOBAL__.RememberUI;
const __RememberFSRS__ =
  typeof module !== 'undefined' && module.exports
    ? require('./src/fsrs.js')
    : __GLOBAL__.RememberFSRS;
const MODAL_FOCUS_PREV = new WeakMap();
const THEMES = ['emoji', 'numbers', 'letters', 'shapes', 'colors'];
const DIFFS = ['easy', 'medium', 'hard'];
const CARD_LABELS = {
  emoji: 'emoji',
  numbers: 'number',
  letters: 'letter',
  shapes: 'shape',
  colors: 'color',
};
const CARD_LABELS_ZH = {
  emoji: '表情卡片',
  numbers: '数字卡片',
  letters: '字母卡片',
  shapes: '形状卡片',
  colors: '颜色卡片',
};
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Focus trap state
let activeFocusTrap = null;

function getAllFocusable(el) {
  if (!el) return [];
  return Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    node => !node.disabled && node.offsetParent !== null && node.getAttribute('tabindex') !== '-1'
  );
}

function createFocusTrap(el) {
  const handler = e => {
    if (e.key !== 'Tab') return;
    const focusable = getAllFocusable(el);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  el.addEventListener('keydown', handler);
  return handler;
}

function activateFocusTrap(el) {
  if (activeFocusTrap) {
    deactivateFocusTrap(activeFocusTrap.el, activeFocusTrap.handler);
  }
  const handler = createFocusTrap(el);
  activeFocusTrap = { el, handler };
  return handler;
}

function deactivateFocusTrap(el, handler) {
  if (el && handler) {
    el.removeEventListener('keydown', handler);
  }
  if (activeFocusTrap && activeFocusTrap.el === el) {
    activeFocusTrap = null;
  }
}

const DEFAULT_SETTINGS = {
  sound: true,
  vibrate: true,
  previewSeconds: 1,
  accent: 'indigo',
  theme: 'auto',
  motion: 'auto',
  volume: 0.5,
  soundPack: 'clear',
  cardFace: 'emoji',
  gameMode: 'classic',
  countdown: { easy: 90, medium: 150, hard: 240 },
  language: 'auto',
  adaptive: false,
  spaced: false,
};
const achievementsDef = __RememberAchievements__.achievementsDef;
const NORMALIZE_SETTINGS = __RememberImportExport__.normalizeSettings;
const NORMALIZE_IMPORT = __RememberImportExport__.normalizeImportData;
const NORMALIZE_LEADERBOARD = __RememberImportExport__.normalizeLeaderboard;
const NORMALIZE_BEST = __RememberImportExport__.normalizeBestEntry;
const NORMALIZE_ADAPTIVE = __RememberImportExport__.normalizeAdaptive;
const COLLECT_EXPORT = __RememberImportExport__.collectExportData;
const BUILD_RECALL_ITEMS = __RememberModes__.buildRecallItems;
const SCORE_RECALL = __RememberModes__.scoreRecall;
const CREATE_NBACK_CONFIG = __RememberModes__.createNBackConfig;
const SUMMARIZE_NBACK = __RememberModes__.summarizeNBackResult;
const NORMALIZE_STATS = __RememberStats__.normalizeStats;
const RECORD_GAME_STARTED = __RememberStats__.recordGameStarted;
const RECORD_GAME_WON = __RememberStats__.recordGameWon;
const RECORD_RECALL = __RememberStats__.recordRecallAttempt;
const RECORD_NBACK = __RememberStats__.recordNBackAttempt;
const BUILD_STATS_SUMMARY = __RememberStats__.buildStatsSummary;
const GET_RATING = __RememberStats__.getRating;
const NORMALIZE_ACHIEVEMENTS = __RememberAchievements__.normalizeAchievements;
const CHECK_ACHIEVEMENTS = __RememberAchievements__.checkAchievementsOnWin;
const TIMER_POLL_MS = 250;

// Adaptive rating constants
const ELO_K_FACTOR = 12;
const RATING_BRONZE = 920;
const RATING_SILVER = 1080;

// Timing constants
const COMBO_WINDOW_MS = 5000;
const MISMATCH_FLIP_BACK_MS = 700;
const HINT_DURATION_MS = 800;
const TOAST_DURATION_MS = 2000;

function getActiveElement() {
  return typeof document !== 'undefined' ? document.activeElement : null;
}

function getFocusable(el) {
  return el
    ? Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).find(node => !node.disabled)
    : null;
}

function focusElement(el) {
  if (el && typeof el.focus === 'function') el.focus();
}

function queueFocus(fn) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
  else setTimeout(fn, 0);
}

function cardLabelForTheme(theme) {
  return currentLang() === 'zh'
    ? CARD_LABELS_ZH[theme] || CARD_LABELS_ZH.emoji
    : CARD_LABELS[theme] || CARD_LABELS.emoji;
}

function rememberModalFocus(el) {
  if (el) MODAL_FOCUS_PREV.set(el, getActiveElement());
}

function restoreModalFocus(el) {
  const prev = el ? MODAL_FOCUS_PREV.get(el) : null;
  focusElement(prev);
}

function focusModal(el) {
  queueFocus(() => focusElement(getFocusable(el) || el));
}

function openModalWithFocus(el) {
  if (!el) return;
  rememberModalFocus(el);
  showModal(el);
  activateFocusTrap(el);
  focusModal(el);
}

function closeModalWithFocusRestore(el) {
  if (!el) return;
  if (activeFocusTrap && activeFocusTrap.el === el) {
    deactivateFocusTrap(el, activeFocusTrap.handler);
  }
  hideModal(el);
  restoreModalFocus(el);
}

function getNow() {
  return Date.now();
}

function buildExportPayload() {
  return COLLECT_EXPORT({
    settings,
    bests: { easy: loadBest('easy'), medium: loadBest('medium'), hard: loadBest('hard') },
    leaderboards: {
      easy: loadLeaderboard('easy'),
      medium: loadLeaderboard('medium'),
      hard: loadLeaderboard('hard'),
    },
    achievements: loadAchievements(),
    stats: loadStats(),
    adaptive: loadAdaptive(),
    spaced: {
      emoji: loadSpaced('emoji'),
      numbers: loadSpaced('numbers'),
      letters: loadSpaced('letters'),
      shapes: loadSpaced('shapes'),
      colors: loadSpaced('colors'),
    },
    mastery: {
      emoji: loadMastery('emoji'),
      numbers: loadMastery('numbers'),
      letters: loadMastery('letters'),
      shapes: loadMastery('shapes'),
      colors: loadMastery('colors'),
    },
  });
}

function getCardA11yLabel(theme, value) {
  return `${cardLabelForTheme(theme)} ${value}`;
}

function normalizeImportedData(obj) {
  return NORMALIZE_IMPORT(obj, DEFAULT_SETTINGS);
}

function normalizeStats(stats) {
  return NORMALIZE_STATS(stats);
}

function normalizeAchievements(store) {
  return NORMALIZE_ACHIEVEMENTS(store);
}

function normalizeLeaderboard(entries) {
  return NORMALIZE_LEADERBOARD(entries);
}

function normalizeBestEntry(entry) {
  return NORMALIZE_BEST(entry);
}

function normalizeAdaptive(adaptive) {
  return NORMALIZE_ADAPTIVE(adaptive);
}

function recordGameStarted(stats) {
  return RECORD_GAME_STARTED(stats);
}

function recordGameWon(stats, payload) {
  return RECORD_GAME_WON(stats, payload);
}

function recordRecallAttempt(stats, payload) {
  return RECORD_RECALL(stats, payload);
}

function recordNBackAttempt(stats, payload) {
  return RECORD_NBACK(stats, payload);
}

function checkAchievements(store, payload) {
  return CHECK_ACHIEVEMENTS(store, payload);
}

function buildRecallItems(params) {
  return BUILD_RECALL_ITEMS(params);
}

function scoreRecall(correctSet, selectedValues) {
  return SCORE_RECALL(correctSet, selectedValues);
}

function createNBackConfig(raw) {
  return CREATE_NBACK_CONFIG(raw);
}

function summarizeNBackResult(payload) {
  return SUMMARIZE_NBACK(payload);
}

function buildStatsSummary(stats) {
  return BUILD_STATS_SUMMARY(stats, formatTime);
}

function getRating(elapsedSec, movesCount, diffKey, usedHints, comboMax = 0) {
  return GET_RATING(elapsedSec, movesCount, diffKey, usedHints, comboMax);
}

function isKnownTheme(theme) {
  return THEMES.includes(theme);
}

function resolveBoardTheme() {
  return isKnownTheme(settings.cardFace) ? settings.cardFace : 'emoji';
}

function parseSelectedRecallValues(container) {
  return new Set(
    Array.from(container.querySelectorAll('input[type="checkbox"][data-value]'))
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.getAttribute('data-value'))
  );
}

function applyImportedSnapshot(normalized) {
  saveSettings(normalized.settings);
  for (const diff of DIFFS) {
    const best = normalizeBestEntry(normalized.bests[diff]);
    if (best) saveBest(diff, best);
    saveLeaderboard(diff, normalizeLeaderboard(normalized.leaderboards[diff] || []));
  }
  saveAchievements(normalizeAchievements(normalized.achievements));
  saveStats(normalizeStats(normalized.stats));
  saveAdaptive(normalizeAdaptive(normalized.adaptive));
  for (const theme of THEMES) {
    saveSpaced(theme, normalized.spaced[theme] || {});
    saveMastery(theme, normalized.mastery[theme] || {});
  }
}

function afterImportApplied() {
  settings = loadSettings();
  applyAccentToDOM();
  applyTheme();
  applyMotionPreference();
  updateBestUI();
  updateLeaderboardUI();
  updateStatsUI();
  updateAchievementsUI();
  initGame(difficultyEl.value);
}

function updateTimerState(value) {
  elapsed = value.elapsed;
  countdownLeft = value.countdownLeft;
  if (timeEl) timeEl.textContent = value.displayText;
}

function formatAchievementTime(at) {
  const d = new Date(at);
  return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getBackupFilename() {
  return 'memory-match-backup.json';
}

function persistImportedData(normalized) {
  applyImportedSnapshot(normalized);
  afterImportApplied();
}

function stopNBackTimer() {
  if (nbackTimer) {
    clearInterval(nbackTimer);
    nbackTimer = null;
  }
}

function handleModalBackdrop(e, modal, onClose) {
  if (e.target !== modal) return;
  if (typeof onClose === 'function') onClose();
}

function getSelectedRecallValues(container) {
  return parseSelectedRecallValues(container);
}

function openModalForElement(el) {
  openModalWithFocus(el);
}

function closeModalForElement(el) {
  closeModalWithFocusRestore(el);
}

function applyImportedData(normalized) {
  persistImportedData(normalized);
}

function loadAdaptive() {
  return __RememberStorage__.loadAdaptive();
}

function getAdaptiveAssist(diff) {
  const validDiffs = Object.keys(HINT_LIMITS);
  if (!validDiffs.includes(diff)) diff = 'easy'; // 默认回退到 easy
  const baseHints = HINT_LIMITS[diff] || 0;
  const r = loadAdaptive().rating || 1000;
  let preview = Number(settings.previewSeconds ?? 0);
  let hint = baseHints;
  if (!settings.adaptive) return { previewSec: preview, hintLimit: hint };
  if (r < 940) {
    preview = Math.max(preview, 2);
    hint = Math.min(5, baseHints + 1);
  } else if (r < 1040) {
    preview = Math.max(preview, 1);
  } else if (r < 1140) {
    preview = Math.min(preview, 1);
  } else {
    preview = 0;
    hint = Math.max(0, baseHints - 1);
  }
  return { previewSec: preview, hintLimit: hint };
}
function saveAdaptive(a) {
  __RememberStorage__.saveAdaptive(a);
}
function expectedStarsFor(diff) {
  return diff === 'easy' ? 4 : diff === 'medium' ? 3.5 : 3;
}
function updateAdaptiveOnEnd(win, stars, diff) {
  if (!settings.adaptive) return;
  const a = loadAdaptive();
  const exp = expectedStarsFor(diff);
  const perf = win ? stars : 1.5; // 失败视作较差表现
  const k = ELO_K_FACTOR;
  a.rating = Math.max(600, Math.min(1600, Math.round(a.rating + k * (perf - exp))));
  a.lastDiff = diff;
  saveAdaptive(a);
}
function decideDifficulty() {
  const a = loadAdaptive();
  const r = a.rating || 1000;
  // 简易分段，可根据需求再细化
  if (r < RATING_BRONZE) return 'easy';
  if (r < RATING_SILVER) return 'medium';
  return 'hard';
}

function loadSpaced(theme) {
  return __RememberStorage__.loadSpaced(theme);
}
function saveSpaced(theme, data) {
  __RememberStorage__.saveSpaced(theme, data);
}

function loadMastery(theme) {
  return __RememberStorage__.loadMastery(theme);
}
function saveMastery(theme, data) {
  __RememberStorage__.saveMastery(theme, data);
}

// FSRS-based mastery update (replaces applySpacedAfterWin)
function updateMasteryAfterGame(theme, matchedCards, performance) {
  if (!settings.spaced) return;

  const mastery = loadMastery(theme);
  const rating = __RememberFSRS__.inferRatingFromGamePerformance(
    performance.elapsed,
    performance.moves,
    performance.difficulty,
    performance.hintsUsed,
    performance.maxCombo,
    performance.win
  );

  // Update mastery for each matched card
  for (const cardValue of matchedCards) {
    const card = mastery[cardValue] || __RememberFSRS__.createDefaultCard();
    const updated = __RememberFSRS__.review(card, rating);
    mastery[cardValue] = updated;
  }

  saveMastery(theme, mastery);
}

// FSRS-based card selection (replaces pickWithSpaced)
function pickWithFSRS(theme, pool, pairs) {
  const mastery = loadMastery(theme);
  const now = Date.now();

  // Categorize cards: due for review vs not due
  const due = [];
  const notDue = [];

  for (const card of pool) {
    const m = mastery[card.v];
    if (!m || m.nextReview <= now) {
      due.push(card);
    } else {
      notDue.push(card);
    }
  }

  // Sort due cards by mastery (lowest = most needing review)
  due.sort((a, b) => {
    const ma = __RememberFSRS__.calculateCardMastery(mastery[a.v] || {});
    const mb = __RememberFSRS__.calculateCardMastery(mastery[b.v] || {});
    return ma - mb;
  });

  // Selection: 60% due cards, 40% random from remaining
  const dueCount = Math.min(Math.floor(pairs * 0.6), due.length);
  const picks = due.slice(0, dueCount);

  const remaining = [...due.slice(dueCount), ...notDue];
  shuffle(remaining);
  picks.push(...remaining.slice(0, pairs - picks.length));

  return picks;
}

// Count cards due for review
function countDueForReview(theme) {
  const mastery = loadMastery(theme);
  return __RememberFSRS__.countDueCards(mastery);
}

// Get theme mastery summary
function getThemeMasterySummary(theme) {
  const mastery = loadMastery(theme);
  return __RememberFSRS__.calculateThemeMastery(mastery);
}

// Migration: convert old spaced weights to mastery format
function migrateSpacedToMastery(theme) {
  const oldWeights = loadSpaced(theme);
  if (Object.keys(oldWeights).length === 0) return false;

  const mastery = loadMastery(theme);
  const now = Date.now();

  for (const [value, weight] of Object.entries(oldWeights)) {
    if (weight > 0 && !mastery[value]) {
      // High weight = high difficulty = low stability
      mastery[value] = {
        difficulty: Math.min(10, 5 + weight * 0.5),
        stability: Math.max(0.5, 7 - weight),
        retrievability: Math.max(0.3, 1 - weight * 0.1),
        lastReview: now,
        nextReview: now, // Immediately due for review
        reps: 1,
        lapses: Math.floor(weight / 2),
      };
    }
  }

  saveMastery(theme, mastery);
  return true;
}
const difficulties = {
  easy: { rows: 4, cols: 4, pairs: 8 },
  medium: { rows: 4, cols: 5, pairs: 10 },
  hard: { rows: 6, cols: 6, pairs: 18 },
};
const emojiPool =
  __RememberPools__ && __RememberPools__.emojiPool ? __RememberPools__.emojiPool : [];

let gridEl,
  movesEl,
  timeEl,
  bestEl,
  difficultyEl,
  newGameBtn,
  winModal,
  winStatsEl,
  playAgainBtn,
  closeModalBtn;
let ratingStarsEl;
let comboToastEl;
let pauseBtn, hintBtn, hintLeftEl, settingsBtn, pauseOverlay, resumeBtn;
let settingsModal, settingSound, settingVibrate, settingPreview, settingsCancel, settingsSave;
let shareBtn, leaderboardList, pairsLeftEl, progressBarEl, settingAccent, confettiCanvas;
let settingTheme, settingMotion, settingVolume, settingVolumeValue, settingSoundPack;
let settingLanguage;
let settingAdaptive, settingSpaced;
let settingGameMode,
  settingCountdownEasy,
  settingCountdownMedium,
  settingCountdownHard,
  countdownConfigEl;
let settingCardFace,
  achievementsModal,
  achievementsBtn,
  achievementsClose,
  achievementsList,
  achievementsNew;
let exportBtn, importBtn, importFile, toastEl;
let nbackBtn,
  nbackModal,
  nbackStimEl,
  nbackNSelect,
  nbackSpeedSelect,
  nbackLenSelect,
  nbackStartBtn,
  nbackCloseBtn;
let recallModal, recallChoicesEl, recallSkipBtn, recallSubmitBtn;
let dailyModal, dailyBtn, dailyCloseBtn, dailyStartBtn, dailyInfoEl;
let loseModal, failRetryBtn, failCloseBtn;
let statsModal, statsBtn, statsClose, statsListEl, resetDataBtn;
let guideBtn,
  guideModal,
  guideCloseBtn,
  guideNoShow,
  guideBasicsList,
  guideAdvancedList,
  guideShortcutsList,
  guideNoShowLabel,
  guideOpenHintEl;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let elapsed = 0;
let countdownLeft = 0;
let timeUp = false;
let timerId = null;
let started = false;
let currentDifficulty = 'easy';
const HINT_LIMITS = { easy: 3, medium: 2, hard: 1 };
const GUIDE_KEY = 'memory_match_onboarding_v1';
let paused = false;
let hintsLeft = 0;
let isPreviewing = false;
let hintsUsed = 0;
let settings = { ...DEFAULT_SETTINGS };
let dailyActive = false;
let dailySeed = 0;
let comboCount = 0;
let maxComboThisGame = 0;
let lastMatchAt = 0;
let seenCountMap = new Map();
let lastGameValues = [];
let recallCorrectSet = new Set();
// N-back state
let nbackRunning = false;
let nbackTimer = null;
let nbackSeq = [];
let nbackIdx = 0;
let nbackStepStart = 0;
let nbackResponded = false;
let nbackTargets = 0;
let nbackHits = 0;
let nbackMisses = 0;
let nbackFalseAlarms = 0;
let nbackRtSum = 0;
let nbackRtCount = 0;

function formatTime(s) {
  return __RememberTimer__.formatTime(s);
}

function beep(f, dur, type = 'sine', vol = 0.05) {
  __RememberEffects__.beep(f, dur, type, vol);
}

function sfx(type) {
  __RememberEffects__.sfx(type, settings);
}

function vibrateMs(ms) {
  __RememberEffects__.vibrateMs(ms, settings);
}

const ACCENTS = {
  indigo: {
    frontBg: 'bg-indigo-100',
    frontText: 'text-indigo-700',
    progressBg: 'bg-indigo-500',
    ring: 'ring-indigo-400',
  },
  emerald: {
    frontBg: 'bg-emerald-100',
    frontText: 'text-emerald-700',
    progressBg: 'bg-emerald-500',
    ring: 'ring-emerald-400',
  },
  rose: {
    frontBg: 'bg-rose-100',
    frontText: 'text-rose-700',
    progressBg: 'bg-rose-500',
    ring: 'ring-rose-400',
  },
};

function escapeHtml(str) {
  return __RememberUtils__.escapeHtml(str);
}

function logLifecycle(event, detail = {}) {
  try {
    console.info(`[Remember] ${event}`, detail);
  } catch (_) {
    // eslint-disable-line no-empty
  }
}

function logError(event, detail = {}) {
  try {
    console.error(`[Remember] ${event}`, detail);
  } catch (_) {
    // eslint-disable-line no-empty
  }
}

function showModal(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
  el.setAttribute('aria-hidden', 'false');
}

function hideModal(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('flex');
  el.setAttribute('aria-hidden', 'true');
}
function getAccent() {
  const a = settings.accent || 'indigo';
  return ACCENTS[a] || ACCENTS.indigo;
}

function removeClasses(el, list) {
  list.forEach(c => el.classList.remove(c));
}

function applyAccentToDOM() {
  const allProgress = [
    ACCENTS.indigo.progressBg,
    ACCENTS.emerald.progressBg,
    ACCENTS.rose.progressBg,
  ];
  if (progressBarEl) {
    removeClasses(progressBarEl, allProgress);
    progressBarEl.classList.add(getAccent().progressBg);
  }
  const allFrontBg = [ACCENTS.indigo.frontBg, ACCENTS.emerald.frontBg, ACCENTS.rose.frontBg];
  const allFrontText = [
    ACCENTS.indigo.frontText,
    ACCENTS.emerald.frontText,
    ACCENTS.rose.frontText,
  ];
  const allRings = [ACCENTS.indigo.ring, ACCENTS.emerald.ring, ACCENTS.rose.ring];
  document.querySelectorAll('.card-front').forEach(el => {
    removeClasses(el, [...allFrontBg, ...allFrontText]);
    el.classList.add(getAccent().frontBg, getAccent().frontText);
  });
  document.querySelectorAll('.card.pointer-events-none').forEach(el => {
    removeClasses(el, allRings);
    el.classList.add(getAccent().ring);
  });
}

function updateProgressUI() {
  const need = difficulties[currentDifficulty].pairs;
  const done = matchedPairs;
  if (pairsLeftEl) pairsLeftEl.textContent = String(Math.max(0, need - done));
  const pct = need > 0 ? Math.min(100, Math.round((done / need) * 100)) : 0;
  if (progressBarEl) progressBarEl.style.width = pct + '%';
}

function applyTheme() {
  const theme = settings.theme || 'auto';
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  document.documentElement.classList.toggle('dark', !!isDark);
}

function isReducedMotion() {
  const prefReduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (settings.motion === 'on') return false; // 用户选择开启动画
  if (settings.motion === 'off') return true; // 用户选择关闭动画
  return !!prefReduce;
}

function applyMotionPreference() {
  document.body.classList.toggle('no-anim', isReducedMotion());
}

function resizeConfettiCanvas() {
  __RememberConfetti__.resizeConfettiCanvas(confettiCanvas);
}

function runConfetti(duration = 1400) {
  __RememberConfetti__.runConfetti(confettiCanvas, isReducedMotion, duration);
}

function adaptiveKey() {
  return __RememberKeys__.adaptiveKey();
}
function todayStr() {
  return __RememberKeys__.todayStr();
}

function seedFromDate(dateStr, diff, theme) {
  // Simple hash: sum char codes with multipliers
  return __RememberUtils__.seedFromDate(dateStr, diff, theme);
}
function mulberry32(a) {
  return __RememberUtils__.mulberry32(a);
}
function seededShuffle(arr, rng) {
  return __RememberUtils__.seededShuffle(arr, rng);
}

function isCountdownMode() {
  return (settings.gameMode || 'classic') === 'countdown';
}
function getCountdownFor(diff) {
  const c = settings.countdown || DEFAULT_SETTINGS.countdown;
  const n = Math.max(
    10,
    Math.min(999, parseInt((c && c[diff]) || DEFAULT_SETTINGS.countdown[diff]))
  );
  return n;
}

function loadStats() {
  return __RememberStorage__.loadStats();
}
function saveStats(s) {
  __RememberStorage__.saveStats(normalizeStats(s));
}
function updateStatsOnNewGame() {
  saveStats(recordGameStarted(loadStats()));
}
function updateStatsOnWin() {
  saveStats(
    recordGameWon(loadStats(), {
      elapsed,
      moves,
      hintsUsed,
      maxCombo: maxComboThisGame,
    })
  );
}
function updateStatsUI() {
  if (!statsListEl) return;
  const s = loadStats();
  const summary = buildStatsSummary(s);
  const t = i18n();
  statsListEl.innerHTML = [
    `<li>${t.statsTotalGames}：<span class="font-semibold">${s.games}</span></li>`,
    `<li>${t.statsWins}：<span class="font-semibold">${s.wins}</span>（${t.statsWinRate} ${summary.winRate}）</li>`,
    `<li>${t.statsAvgTime}：<span class="font-semibold">${summary.avgTime}</span></li>`,
    `<li>${t.statsAvgMoves}：<span class="font-semibold">${summary.avgMoves}</span></li>`,
    `<li>${t.statsAvgHints}：<span class="font-semibold">${summary.avgHints}</span></li>`,
    `<li>${t.statsAvgCombo}：<span class="font-semibold">${summary.avgCombo}</span>，${t.statsHistoryBest}：<span class="font-semibold">${s.bestCombo || 0}</span></li>`,
    `<li>${t.statsRecallLabel}（${s.recallAttempts || 0} ${t.statsTimes}）${t.statsPrecision}：<span class="font-semibold">${summary.avgPrecision}</span> · ${t.statsRecall}：<span class="font-semibold">${summary.avgRecall}</span></li>`,
    `<li>${t.statsNbackLabel}（${s.nbackAttempts || 0} ${t.statsTimes}）${t.statsAvgAcc}：<span class="font-semibold">${summary.avgNBackAcc}</span> · ${t.statsAvgRt}：<span class="font-semibold">${summary.avgNBackRt}</span></li>`,
  ].join('');
}
function openStats() {
  updateStatsUI();
  openModalWithFocus(statsModal);
}
function closeStats() {
  closeModalWithFocusRestore(statsModal);
}

function renderRating(stars) {
  if (!ratingStarsEl) return;
  const filled = '⭐'.repeat(stars);
  const empty = '☆'.repeat(5 - stars);
  ratingStarsEl.textContent = filled + empty;
  ratingStarsEl.setAttribute('aria-label', `${stars} 星`);
}

function loadSettings() {
  return __RememberStorage__.loadSettings(DEFAULT_SETTINGS);
}

function saveSettings(s) {
  __RememberStorage__.saveSettings(s);
}

function applySettingsToUI() {
  if (!settingsModal) return;
  settingSound.checked = !!settings.sound;
  settingVibrate.checked = !!settings.vibrate;
  settingPreview.value = String(settings.previewSeconds ?? 0);
  if (settingAccent) settingAccent.value = String(settings.accent || 'indigo');
  if (settingTheme) settingTheme.value = String(settings.theme || 'auto');
  if (settingMotion) settingMotion.value = String(settings.motion || 'auto');
  if (settingVolume) settingVolume.value = String(Math.round((settings.volume ?? 0.5) * 100));
  if (settingVolumeValue) settingVolumeValue.textContent = `${settingVolume.value}%`;
  if (settingSoundPack) settingSoundPack.value = String(settings.soundPack || 'clear');
  if (settingCardFace) settingCardFace.value = String(settings.cardFace || 'emoji');
  if (settingGameMode) settingGameMode.value = String(settings.gameMode || 'classic');
  if (settingCountdownEasy)
    settingCountdownEasy.value = String(
      (settings.countdown && settings.countdown.easy) || DEFAULT_SETTINGS.countdown.easy
    );
  if (settingCountdownMedium)
    settingCountdownMedium.value = String(
      (settings.countdown && settings.countdown.medium) || DEFAULT_SETTINGS.countdown.medium
    );
  if (settingCountdownHard)
    settingCountdownHard.value = String(
      (settings.countdown && settings.countdown.hard) || DEFAULT_SETTINGS.countdown.hard
    );
  if (countdownConfigEl) countdownConfigEl.classList.toggle('hidden', !isCountdownMode());
  if (settingLanguage) settingLanguage.value = String(settings.language || 'auto');
  if (settingAdaptive) settingAdaptive.checked = !!settings.adaptive;
  if (settingSpaced) settingSpaced.checked = !!settings.spaced;
}

function loadLeaderboard(k) {
  return __RememberStorage__.loadLeaderboard(k);
}

function saveLeaderboard(k, arr) {
  __RememberStorage__.saveLeaderboard(k, arr);
}

function updateLeaderboardUI() {
  if (!leaderboardList) return;
  const list = loadLeaderboard(currentDifficulty);
  const t = i18n();
  if (!list.length) {
    leaderboardList.innerHTML = `<li class="text-slate-500">${t.leaderboardEmpty}</li>`;
    return;
  }
  const html = list
    .map((e, i) => {
      const d = new Date(e.at || Date.now());
      const dateStr = `${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return `<li>${i + 1}. ${formatTime(e.time)} · ${e.moves} ${t.stepsFmt} <span class="text-slate-400">• ${dateStr}</span></li>`;
    })
    .join('');
  leaderboardList.innerHTML = html;
}

function updateHintUI() {
  if (!hintBtn || !hintLeftEl) return;
  hintLeftEl.textContent = String(hintsLeft);
  hintBtn.disabled = hintsLeft <= 0 || paused || isPreviewing;
}

function updateControlsUI() {
  const t = i18n();
  if (pauseBtn) pauseBtn.textContent = paused ? t.resume : t.pause;
  if (pauseOverlay) {
    if (paused) {
      pauseOverlay.classList.remove('hidden');
      pauseOverlay.classList.add('flex');
    } else {
      pauseOverlay.classList.add('hidden');
      pauseOverlay.classList.remove('flex');
    }
  }
  updateHintUI();
}

function togglePause() {
  if (paused) resumeGame();
  else pauseGame();
}

function pauseGame() {
  if (paused) return;
  paused = true;
  stopTimer();
  lockBoard = true;
  updateControlsUI();
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  if (started) startTimer();
  lockBoard = false;
  updateControlsUI();
}

function shuffle(arr) {
  return __RememberUtils__.shuffle(arr);
}

function loadBest(k) {
  return __RememberStorage__.loadBest(k);
}

function saveBest(k, data) {
  __RememberStorage__.saveBest(k, data);
}

function updateBestUI() {
  const b = loadBest(currentDifficulty);
  if (!b) {
    bestEl.textContent = '—';
  } else {
    const t = i18n();
    bestEl.textContent = `${formatTime(b.time)} · ${b.moves}${t.bestSteps}`;
  }
}

function stopTimer() {
  timerId = __RememberTimer__.stopTimer(timerId);
}

function resetTimer() {
  stopTimer();
  const res = __RememberTimer__.resetTimer({
    isCountdownMode,
    getCountdownFor,
    currentDifficulty,
  });
  elapsed = res.elapsed;
  countdownLeft = res.countdownLeft;
  if (timeEl) timeEl.textContent = res.displayText;
}

function startTimer() {
  const res = __RememberTimer__.startTimer({
    timerId,
    elapsed,
    countdownLeft,
    isCountdownMode,
    getCountdownFor,
    currentDifficulty,
    onUpdate: updateTimerState,
    onStop: () => {
      timerId = null;
    },
    onTimeUp,
    now: getNow,
    tickMs: getTimerPollMs(),
  });
  timerId = res.timerId;
  elapsed = res.elapsed;
  countdownLeft = res.countdownLeft;
}

function setGridColumns(cols) {
  gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
}

function makeCard(item) {
  const btn = document.createElement('button');
  btn.className =
    'relative card w-full aspect-square rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500';
  btn.dataset.value = item.v;
  btn.dataset.id = item.id;
  btn.setAttribute('aria-label', getCardA11yLabel(resolveBoardTheme(), item.v));
  btn.setAttribute('aria-pressed', 'false');

  const inner = document.createElement('div');
  inner.className = 'card-inner relative w-full h-full';

  const front = document.createElement('div');
  const ac = getAccent();
  front.className = `card-face card-front rounded-xl ${ac.frontBg} ${ac.frontText} text-2xl sm:text-3xl`;
  front.textContent = '?';

  const back = document.createElement('div');
  back.className = 'card-face card-back rounded-xl bg-white text-3xl sm:text-4xl';
  if (item.type === 'color') {
    back.style.backgroundColor = item.color;
    back.textContent = '';
  } else {
    back.textContent = item.v;
  }

  inner.appendChild(front);
  inner.appendChild(back);
  btn.appendChild(inner);

  btn.addEventListener('click', () => onFlip(btn));
  return btn;
}

function resetBoardState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function onFlip(cardEl) {
  if (paused || isPreviewing) return;
  if (lockBoard) return;
  if (cardEl.classList.contains('flipped')) return;
  if (!started) {
    started = true;
    startTimer();
  }
  cardEl.classList.add('flipped');
  cardEl.setAttribute('aria-pressed', 'true');
  cardEl.setAttribute(
    'aria-label',
    `${getCardA11yLabel(resolveBoardTheme(), cardEl.dataset.value)} · ${currentLang() === 'zh' ? '已翻开' : 'revealed'}`
  );
  sfx('flip');
  if (!firstCard) {
    firstCard = cardEl;
    return;
  }
  if (cardEl === firstCard) return;
  secondCard = cardEl;
  moves += 1;
  movesEl.textContent = String(moves);
  lockBoard = true;
  // 记录曝光
  const v1 = firstCard.dataset.value;
  const v2 = secondCard.dataset.value;
  seenCountMap.set(v1, (seenCountMap.get(v1) || 0) + 1);
  seenCountMap.set(v2, (seenCountMap.get(v2) || 0) + 1);
  const match = v1 === v2;
  if (match) {
    firstCard.classList.add('pointer-events-none', 'ring-2', getAccent().ring, 'match-pulse');
    secondCard.classList.add('pointer-events-none', 'ring-2', getAccent().ring, 'match-pulse');
    firstCard.setAttribute(
      'aria-label',
      `${getCardA11yLabel(resolveBoardTheme(), firstCard.dataset.value)} · ${currentLang() === 'zh' ? '已配对' : 'matched'}`
    );
    secondCard.setAttribute(
      'aria-label',
      `${getCardA11yLabel(resolveBoardTheme(), secondCard.dataset.value)} · ${currentLang() === 'zh' ? '已配对' : 'matched'}`
    );
    matchedPairs += 1;
    sfx('match');
    vibrateMs(40);
    // combo logic
    const now = performance.now();
    if (now - lastMatchAt <= COMBO_WINDOW_MS) comboCount += 1;
    else comboCount = 1;
    lastMatchAt = now;
    if (comboCount >= 2) {
      maxComboThisGame = Math.max(maxComboThisGame, comboCount);
      showCombo(comboCount);
      if (settings.sound) beep(1400, 0.08, 'sine', Math.max(0.03, (settings.volume || 0.5) * 0.08));
    }
    resetBoardState();
    const need = difficulties[currentDifficulty].pairs;
    updateProgressUI();
    if (matchedPairs === need) onWin();
  } else {
    sfx('mismatch');
    vibrateMs(20);
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.setAttribute('aria-pressed', 'false');
      secondCard.setAttribute('aria-pressed', 'false');
      firstCard.setAttribute(
        'aria-label',
        getCardA11yLabel(resolveBoardTheme(), firstCard.dataset.value)
      );
      secondCard.setAttribute(
        'aria-label',
        getCardA11yLabel(resolveBoardTheme(), secondCard.dataset.value)
      );
      resetBoardState();
    }, MISMATCH_FLIP_BACK_MS);
    comboCount = 0;
  }
}

function clearGrid() {
  gridEl.innerHTML = '';
}

function initGame(diffKey) {
  if (settings.adaptive) {
    const d = decideDifficulty();
    if (difficultyEl && difficultyEl.value !== d) {
      difficultyEl.value = d;
    }
    currentDifficulty = d;
  } else {
    currentDifficulty = diffKey;
  }
  const cfg = difficulties[currentDifficulty];
  clearGrid();
  setGridColumns(cfg.cols);
  const deck = createDeck(cfg.pairs);
  deck.forEach((item, idx) => {
    const el = makeCard(item);
    el.dataset.index = String(idx);
    gridEl.appendChild(el);
  });
  lastGameValues = Array.from(new Set(deck.map(d => d.v)));
  moves = 0;
  matchedPairs = 0;
  started = false;
  resetBoardState();
  resetTimer();
  movesEl.textContent = '0';
  updateBestUI();
  const assist = getAdaptiveAssist(currentDifficulty);
  logLifecycle('init_game', {
    difficulty: currentDifficulty,
    adaptive: !!settings.adaptive,
    previewSeconds: assist.previewSec,
    hintLimit: assist.hintLimit,
  });
  hintsLeft = assist.hintLimit || 0;
  hintsUsed = 0;
  paused = false;
  isPreviewing = false;
  timeUp = false;
  seenCountMap = new Map();
  comboCount = 0;
  maxComboThisGame = 0;
  lastMatchAt = 0;
  updateControlsUI();
  updateLeaderboardUI();
  updateProgressUI();
  applyAccentToDOM();
  updateStatsOnNewGame();
  closeModalWithFocusRestore(winModal);
  const prevSec = Math.max(0, Number(assist.previewSec || 0));
  if (prevSec > 0) {
    isPreviewing = true;
    lockBoard = true;
    const cards = Array.from(gridEl.querySelectorAll('.card'));
    cards.forEach(c => c.classList.add('flipped'));
    setTimeout(() => {
      cards.forEach(c => c.classList.remove('flipped'));
      isPreviewing = false;
      lockBoard = false;
      updateControlsUI();
    }, prevSec * 1000);
  }
}

function onWin() {
  stopTimer();
  const prev = loadBest(currentDifficulty);
  const curr = { time: elapsed, moves };
  let better = false;
  if (!prev) better = true;
  else if (curr.time < prev.time) better = true;
  else if (curr.time === prev.time && curr.moves < prev.moves) better = true;
  if (better) saveBest(currentDifficulty, curr);
  updateBestUI();
  const t = i18n();
  winStatsEl.textContent = `${t.timeFmt} ${formatTime(elapsed)} · ${moves} ${t.stepsFmt}`;
  const stars = getRating(elapsed, moves, currentDifficulty, hintsUsed, maxComboThisGame);
  logLifecycle('game_win', {
    difficulty: currentDifficulty,
    elapsed,
    moves,
    stars,
    hintsUsed,
    maxCombo: maxComboThisGame,
  });
  renderRating(stars);
  openModalWithFocus(winModal);
  sfx('win');
  vibrateMs(120);
  updateStatsOnWin();
  updateAdaptiveOnEnd(
    true,
    getRating(elapsed, moves, currentDifficulty, hintsUsed, maxComboThisGame),
    currentDifficulty
  );
  // FSRS mastery update - use all exposed cards from seenCountMap
  const matchedCards = Array.from(seenCountMap.keys());
  updateMasteryAfterGame(settings.cardFace || 'emoji', matchedCards, {
    elapsed,
    moves,
    difficulty: currentDifficulty,
    hintsUsed,
    maxCombo: maxComboThisGame,
    win: true,
  });
  const arr = loadLeaderboard(currentDifficulty);
  const updated = [...arr, { time: elapsed, moves, at: Date.now() }]
    .sort((a, b) => a.time - b.time || a.moves - b.moves)
    .slice(0, 3);
  saveLeaderboard(currentDifficulty, updated);
  updateLeaderboardUI();
  runConfetti();
  const unlocked = checkAchievementsOnWin();
  if (unlocked.length) showToast(`${t.toastUnlockAchievement} ×${unlocked.length}`);
  updateAchievementsUI();
  openRecallTest();
  // Daily complete
  if (dailyActive) {
    __RememberStorage__.markDailyDone(todayStr(), currentDifficulty);
    showToast(t.toastDailyDone);
  }
}

function onTimeUp() {
  if (timeUp) return;
  timeUp = true;
  lockBoard = true;
  paused = true;
  logLifecycle('time_up', { difficulty: currentDifficulty, elapsed, moves });
  openModalWithFocus(loseModal);
  sfx('mismatch');
  vibrateMs(100);
  updateAdaptiveOnEnd(false, 0, currentDifficulty);
}

function closeModal() {
  closeModalWithFocusRestore(winModal);
}

function shouldAutoShowGuide() {
  return __RememberStorage__.shouldAutoShowGuide(GUIDE_KEY);
}

function markGuideSeen() {
  __RememberStorage__.markGuideSeen(GUIDE_KEY);
}

function openGuideModal(isAuto) {
  if (!guideModal) return;
  if (guideNoShow) guideNoShow.checked = false;
  openModalWithFocus(guideModal);
  if (isAuto) {
    markGuideSeen();
  }
}

function closeGuideModal() {
  if (!guideModal) return;
  if (guideNoShow && guideNoShow.checked) {
    __RememberStorage__.hideGuide(GUIDE_KEY);
  }
  closeModalWithFocusRestore(guideModal);
}

function maybeShowGuideOnFirstVisit() {
  if (shouldAutoShowGuide()) openGuideModal(true);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const ui = __RememberUI__.bind(document);
    ({
      gridEl,
      movesEl,
      timeEl,
      bestEl,
      difficultyEl,
      newGameBtn,
      winModal,
      winStatsEl,
      playAgainBtn,
      closeModalBtn,
      ratingStarsEl,
      comboToastEl,
      loseModal,
      failRetryBtn,
      failCloseBtn,
      pauseBtn,
      hintBtn,
      hintLeftEl,
      settingsBtn,
      pauseOverlay,
      resumeBtn,
      settingsModal,
      settingSound,
      settingVibrate,
      settingPreview,
      settingAccent,
      settingCardFace,
      settingTheme,
      settingMotion,
      settingVolume,
      settingVolumeValue,
      settingSoundPack,
      settingLanguage,
      settingAdaptive,
      settingSpaced,
      settingGameMode,
      settingCountdownEasy,
      settingCountdownMedium,
      settingCountdownHard,
      countdownConfigEl,
      settingsCancel,
      settingsSave,
      shareBtn,
      leaderboardList,
      pairsLeftEl,
      progressBarEl,
      confettiCanvas,
      dailyModal,
      dailyBtn,
      dailyCloseBtn,
      dailyStartBtn,
      dailyInfoEl,
      achievementsModal,
      achievementsBtn,
      achievementsClose,
      achievementsList,
      achievementsNew,
      exportBtn,
      importBtn,
      importFile,
      toastEl,
      statsModal,
      statsBtn,
      statsClose,
      statsListEl,
      resetDataBtn,
      recallModal,
      recallChoicesEl,
      recallSkipBtn,
      recallSubmitBtn,
      nbackBtn,
      nbackModal,
      nbackStimEl,
      nbackNSelect,
      nbackSpeedSelect,
      nbackLenSelect,
      nbackStartBtn,
      nbackCloseBtn,
      guideBtn,
      guideModal,
      guideCloseBtn,
      guideNoShow,
      guideBasicsList,
      guideAdvancedList,
      guideShortcutsList,
      guideNoShowLabel,
      guideOpenHintEl,
    } = ui);

    const events = {
      onDifficultyChange: () => initGame(difficultyEl.value),
      onNewGame: () => initGame(difficultyEl.value),
      onPlayAgain: () => {
        closeModal();
        initGame(difficultyEl.value);
      },
      onCloseModal: closeModal,
      onPause: togglePause,
      onResume: resumeGame,
      onFailRetry: () => {
        closeModalWithFocusRestore(loseModal);
        initGame(difficultyEl.value);
      },
      onFailClose: () => {
        closeModalWithFocusRestore(loseModal);
      },
      onHint: useHint,
      onOpenSettings: () => {
        applySettingsToUI();
        openModalWithFocus(settingsModal);
      },
      onGuideOpen: () => openGuideModal(false),
      onGuideClose: () => closeGuideModal(),
      onGuideModalBackdrop: e => {
        if (e.target === guideModal) closeGuideModal();
      },
      onSettingsCancel: () => {
        closeModalWithFocusRestore(settingsModal);
      },
      onSettingsSave: () => {
        const prevCardFace = settings.cardFace;
        settings.sound = !!settingSound.checked;
        settings.vibrate = !!settingVibrate.checked;
        settings.previewSeconds = Math.max(0, Math.min(5, parseInt(settingPreview.value || '0')));
        settings.accent = (settingAccent && settingAccent.value) || 'indigo';
        settings.theme = (settingTheme && settingTheme.value) || 'auto';
        settings.motion = (settingMotion && settingMotion.value) || 'auto';
        settings.volume = Math.max(
          0,
          Math.min(
            1,
            Number(settingVolume && settingVolume.value ? settingVolume.value / 100 : 0.5)
          )
        );
        settings.soundPack = (settingSoundPack && settingSoundPack.value) || 'clear';
        settings.cardFace = (settingCardFace && settingCardFace.value) || 'emoji';
        settings.gameMode = (settingGameMode && settingGameMode.value) || 'classic';
        settings.countdown = {
          easy: Math.max(
            10,
            Math.min(
              999,
              parseInt(
                (settingCountdownEasy && settingCountdownEasy.value) ||
                  DEFAULT_SETTINGS.countdown.easy
              )
            )
          ),
          medium: Math.max(
            10,
            Math.min(
              999,
              parseInt(
                (settingCountdownMedium && settingCountdownMedium.value) ||
                  DEFAULT_SETTINGS.countdown.medium
              )
            )
          ),
          hard: Math.max(
            10,
            Math.min(
              999,
              parseInt(
                (settingCountdownHard && settingCountdownHard.value) ||
                  DEFAULT_SETTINGS.countdown.hard
              )
            )
          ),
        };
        settings.language = (settingLanguage && settingLanguage.value) || 'auto';
        settings.adaptive = !!(settingAdaptive && settingAdaptive.checked);
        settings.spaced = !!(settingSpaced && settingSpaced.checked);
        saveSettings(settings);
        applyAccentToDOM();
        applyTheme();
        applyMotionPreference();
        if (countdownConfigEl) countdownConfigEl.classList.toggle('hidden', !isCountdownMode());
        closeModalWithFocusRestore(settingsModal);
        applyLanguage();
        initGame(difficultyEl.value);
      },
      onGameModeChange: () => {
        if (countdownConfigEl)
          countdownConfigEl.classList.toggle('hidden', !(settingGameMode.value === 'countdown'));
      },
      onVolumeInput: () => {
        if (settingVolumeValue) settingVolumeValue.textContent = `${settingVolume.value}%`;
      },
      onShare: async () => {
        const t = i18n();
        const text = `${t.shareText} | ${t.difficulty} ${difficultyEl.options[difficultyEl.selectedIndex].text} | ${t.timeFmt} ${formatTime(elapsed)} | ${t.movesLabel} ${moves}`;
        try {
          if (navigator.share) await navigator.share({ title: t.shareTitle, text });
          else if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            alert(t.toastCopied);
          } else {
            alert(text);
          }
        } catch (_) {
          /* ignore */
        }
      },
      onAchievementsOpen: () => {
        openAchievements();
      },
      onAchievementsClose: () => {
        closeModalWithFocusRestore(achievementsModal);
        if (achievementsNew) achievementsNew.classList.add('hidden');
      },
      onDailyOpen: () => {
        if (dailyInfoEl) {
          const t = i18n();
          const date = todayStr();
          const status = __RememberStorage__.isDailyDone(date, difficultyEl.value)
            ? t.completed
            : t.notCompleted;
          dailyInfoEl.textContent = `${t.today} ${date} · ${t.difficulty}：${difficultyEl.options[difficultyEl.selectedIndex].text} · ${t.status}：${status}`;
        }
        openModalWithFocus(dailyModal);
      },
      onDailyClose: () => {
        closeModalWithFocusRestore(dailyModal);
      },
      onDailyStart: () => {
        dailyActive = true;
        dailySeed = seedFromDate(todayStr(), difficultyEl.value, settings.cardFace || 'emoji');
        closeModalWithFocusRestore(dailyModal);
        showToast(i18n().toastDailyStarted);
        initGame(difficultyEl.value);
      },
      onStatsOpen: openStats,
      onStatsClose: closeStats,
      onNbackOpen: () => {
        openModalWithFocus(nbackModal);
      },
      onNbackClose: () => {
        if (nbackRunning) stopNBack();
        closeModalWithFocusRestore(nbackModal);
      },
      onNbackToggle: () => {
        if (nbackRunning) stopNBack();
        else startNBack();
      },
      onResetData: () => {
        if (!confirm(i18n().resetConfirm)) return;
        const keys = __RememberStorage__.listAllKeys();
        __RememberStorage__.removeKeysByPrefix(keys, 'memory_match_');
        location.reload();
      },
      onExport: exportData,
      onImportClick: () => {
        if (importFile) importFile.click();
      },
      onImportFileChange: async () => {
        const f = importFile && importFile.files && importFile.files[0];
        if (!f) return;
        try {
          const text = await f.text();
          const obj = JSON.parse(text);
          importDataFromObj(obj);
          showToast(i18n().toastImportOk);
        } catch (_) {
          showToast(i18n().toastImportFail);
        } finally {
          if (importFile) importFile.value = '';
        }
      },
      onRecallSkip: () => {
        closeModalWithFocusRestore(recallModal);
      },
      onRecallSubmit: submitRecallTest,
      onKeyDown: handleKeyDown,
    };

    __RememberUIEvents__.bind(ui, events, document);

    settings = loadSettings();
    applyAccentToDOM();
    applyTheme();
    applyMotionPreference();
    updateProgressUI();
    updateStatsUI();
    applyLanguage();
    maybeShowGuideOnFirstVisit();
    window.addEventListener('resize', resizeConfettiCanvas);
    const mqlDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mqlDark && mqlDark.addEventListener)
      mqlDark.addEventListener('change', () => {
        if ((settings.theme || 'auto') === 'auto') applyTheme();
      });
    const mqlReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mqlReduce && mqlReduce.addEventListener)
      mqlReduce.addEventListener('change', () => {
        if ((settings.motion || 'auto') === 'auto') applyMotionPreference();
      });

    initGame(currentDifficulty);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadAdaptive,
    getAdaptiveAssist,
    saveAdaptive,
    updateAdaptiveOnEnd,
    decideDifficulty,
    shouldAutoShowGuide,
    markGuideSeen,
    adaptiveKey,
    DEFAULT_SETTINGS,
    // FSRS-related exports
    loadMastery,
    saveMastery,
    buildExportPayload,
    applyImportedSnapshot,
    updateMasteryAfterGame,
    pickWithFSRS,
    countDueForReview,
    getThemeMasterySummary,
    migrateSpacedToMastery,
    __setSettings(partial) {
      if (!partial || typeof partial !== 'object') return;
      Object.assign(settings, partial);
    },
    __getSettings() {
      return { ...settings };
    },
  };
}

function startNBack() {
  if (!nbackModal || !nbackStimEl) return;
  const config = createNBackConfig({
    N: nbackNSelect.value || '2',
    length: nbackLenSelect.value || '20',
    speed: nbackSpeedSelect.value || '900',
  });
  // 边界检查：确保 emojiPool 不为空
  if (!Array.isArray(emojiPool) || emojiPool.length === 0) {
    console.error('startNBack: emojiPool is empty or invalid');
    return;
  }
  const pool = emojiPool.slice();
  nbackSeq = Array.from(
    { length: config.length },
    () => pool[Math.floor(Math.random() * pool.length)]
  );
  nbackIdx = -1;
  nbackTargets = 0;
  nbackHits = 0;
  nbackMisses = 0;
  nbackFalseAlarms = 0;
  nbackRtSum = 0;
  nbackRtCount = 0;
  nbackRunning = true;
  if (nbackStartBtn) nbackStartBtn.textContent = i18n().nbackStop;
  tickNBack(config.N, config.speed);
}

function stopNBack() {
  nbackRunning = false;
  stopNBackTimer();
  if (nbackStartBtn) nbackStartBtn.textContent = i18n().nbackStart;
}

function tickNBack(N, speed) {
  stopNBackTimer();
  const period = speed;
  nbackTimer = setInterval(() => {
    // 统计上一拍漏报
    if (nbackIdx >= N) {
      const targetPrev = nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N];
      if (targetPrev && !nbackResponded) nbackMisses++;
    }
    // 前进到下一拍
    nbackIdx += 1;
    if (nbackIdx >= nbackSeq.length) {
      finishNBack();
      return;
    }
    const stim = nbackSeq[nbackIdx];
    if (nbackStimEl) nbackStimEl.textContent = stim;
    nbackResponded = false;
    nbackStepStart = performance.now();
    if (nbackIdx >= N && nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N]) nbackTargets++;
  }, period);
}

function onNBackKey() {
  if (!nbackRunning) return;
  if (nbackResponded) return;
  nbackResponded = true;
  const rt = Math.max(0, Math.round(performance.now() - nbackStepStart));
  const N = Math.max(1, parseInt(nbackNSelect.value || '2'));
  const isTarget = nbackIdx >= N && nbackSeq[nbackIdx] === nbackSeq[nbackIdx - N];
  if (isTarget) {
    nbackHits++;
    nbackRtSum += rt;
    nbackRtCount++;
    sfx('match');
  } else {
    nbackFalseAlarms++;
    sfx('mismatch');
  }
}

function finishNBack() {
  stopNBack();
  const summary = summarizeNBackResult({
    targets: nbackTargets,
    hits: nbackHits,
    falseAlarms: nbackFalseAlarms,
    length: nbackSeq.length,
    rtSum: nbackRtSum,
    rtCount: nbackRtCount,
  });
  saveStats(
    recordNBackAttempt(loadStats(), {
      accuracy: summary.accuracy,
      rtSum: summary.rtSum,
      rtCount: summary.rtCount,
    })
  );
  updateStatsUI();
  const t = i18n();
  showToast(
    `${t.nbackResult} · ${t.nbackAccuracy} ${Math.round(summary.accuracy * 100)}%${summary.rtCount > 0 ? ` · ${t.nbackAvgRt} ${summary.avgRt}ms` : ''}`
  );
}

function openRecallTest() {
  if (!recallModal || !recallChoicesEl) return;
  const theme = resolveBoardTheme();
  const { items, correctSet } = buildRecallItems({
    truthValues: lastGameValues,
    poolValues: getPoolForTheme(theme).map(item => item.v),
    shuffle,
  });
  recallCorrectSet = correctSet;
  recallChoicesEl.innerHTML = items
    .map((item, index) => {
      const value = String(item.v);
      const safeValue = escapeHtml(value);
      const safeAttr = escapeHtml(value);
      const label = escapeHtml(getCardA11yLabel(theme, value));
      if (theme === 'colors') {
        return `<label class="flex items-center gap-2 border rounded-md p-2" aria-label="${label}"><input type="checkbox" data-value="${safeAttr}" class="h-4 w-4"/><span class="inline-block w-6 h-6 rounded border border-slate-300" style="background:${safeValue}"></span><span class="sr-only">${label}</span><span class="text-xs text-slate-500">${index + 1}</span></label>`;
      }
      return `<label class="flex items-center gap-2 border rounded-md p-2" aria-label="${label}"><input type="checkbox" data-value="${safeAttr}" class="h-4 w-4"/><span class="text-xl">${safeValue}</span></label>`;
    })
    .join('');
  openModalWithFocus(recallModal);
}
function submitRecallTest() {
  if (!recallModal || !recallChoicesEl) return;
  const result = scoreRecall(recallCorrectSet, getSelectedRecallValues(recallChoicesEl));
  saveStats(
    recordRecallAttempt(loadStats(), {
      precision: result.precision,
      recall: result.recall,
    })
  );
  updateStatsUI();
  const t = i18n();
  showToast(
    `${t.recallResult} · ${t.statsPrecision} ${Math.round(result.precision * 100)}% · ${t.statsRecall} ${Math.round(result.recall * 100)}%`
  );
  closeModalWithFocusRestore(recallModal);
}

function currentLang() {
  const pref = settings.language || 'auto';
  const nav = (
    typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage || 'en' : 'en'
  ).toLowerCase();
  return __RememberI18n__.currentLang(pref, nav);
}

function i18n() {
  return __RememberI18n__.i18n(currentLang());
}

// Mapping: element id → i18n key (where id differs from key, use [id, key])
const I18N_TEXT_MAP = [
  'pageTitle',
  'pageSubtitle',
  'difficultyLabel',
  'difficultyEasy',
  'difficultyMedium',
  'difficultyHard',
  'timeLabel',
  'movesLabel',
  'bestLabel',
  'leaderboardTitle',
  'winTitle',
  'loseTitle',
  'loseDesc',
  'statsTitle',
  'achievementsTitle',
  'dailyTitle',
  'settingsTitle',
  'recallTitle',
  'recallDesc',
  'recallSkip',
  'recallSubmit',
  'nbackTitle',
  'nbackNLabel',
  'nbackSpeedLabel',
  'nbackLenLabel',
  'nbackHint',
  'guideTitle',
  'guideIntro',
  'guideBasicsTitle',
  'guideAdvancedTitle',
  'guideShortcutsTitle',
  'accentIndigo',
  'accentEmerald',
  'accentRose',
  'themeAuto',
  'themeLight',
  'themeDark',
  'motionAuto',
  'motionOn',
  'motionOff',
  'soundPackClear',
  'soundPackElectro',
  'soundPackSoft',
  'languageAuto',
  'languageZh',
  'languageEn',
  'gameModeClassic',
  'gameModeCountdown',
  'cardFaceEmoji',
  'cardFaceNumbers',
  'cardFaceLetters',
  'cardFaceShapes',
  'cardFaceColors',
  'backupLabel',
  // [elementId, i18nKey] pairs for labels where the id has a "Label" suffix
  ['settingSoundLabel', 'settingSound'],
  ['settingVibrateLabel', 'settingVibrate'],
  ['settingPreviewLabel', 'settingPreview'],
  ['settingAccentLabel', 'settingAccent'],
  ['settingThemeLabel', 'settingTheme'],
  ['settingMotionLabel', 'settingMotion'],
  ['settingVolumeLabel', 'settingVolume'],
  ['settingSoundPackLabel', 'settingSoundPack'],
  ['settingAdaptiveLabel', 'settingAdaptive'],
  ['settingSpacedLabel', 'settingSpaced'],
  ['settingLanguageLabel', 'settingLanguage'],
  ['settingGameModeLabel', 'settingGameMode'],
  ['countdownEasyLabel', 'countdownEasy'],
  ['countdownMediumLabel', 'countdownMedium'],
  ['countdownHardLabel', 'countdownHard'],
  ['settingCardFaceLabel', 'settingCardFace'],
  ['guideNoShowLabel', 'guideNoShow'],
  ['guideOpenHint', 'guideOpenHint'],
];

function applyLanguage() {
  const t = i18n();
  // Batch: set textContent for all mapped elements
  for (const entry of I18N_TEXT_MAP) {
    const id = Array.isArray(entry) ? entry[0] : entry;
    const key = Array.isArray(entry) ? entry[1] : entry;
    const el = document.getElementById(id);
    if (el) el.textContent = t[key] || '';
  }
  // Buttons that are already bound as module-level variables
  const btnMap = [
    [nbackStartBtn, 'nbackStart'],
    [nbackCloseBtn, 'nbackClose'],
    [newGameBtn, 'newGame'],
    [settingsBtn, 'settings'],
    [achievementsBtn, 'achievements'],
    [statsBtn, 'stats'],
    [dailyBtn, 'daily'],
    [playAgainBtn, 'playAgain'],
    [shareBtn, 'share'],
    [closeModalBtn, 'back'],
    [resumeBtn, 'resume'],
    [failRetryBtn, 'retry'],
    [failCloseBtn, 'back'],
    [achievementsClose, 'close'],
    [statsClose, 'close'],
    [dailyCloseBtn, 'close'],
    [dailyStartBtn, 'dailyStart'],
    [guideCloseBtn, 'guideClose'],
  ];
  for (const [el, key] of btnMap) {
    if (el) el.textContent = t[key] || '';
  }
  // Elements with fallback keys
  const fbMap = [
    ['settingsCancel', 'settingsCancel', 'close'],
    ['settingsSave', 'settingsSave', 'save'],
  ];
  for (const [id, key, fb] of fbMap) {
    const el = document.getElementById(id);
    if (el) el.textContent = t[key] || t[fb] || '';
  }
  // Special: nbackBtn, exportBtn, importBtn, resetData, guideBtn
  const idKeyMap = [
    ['nbackBtn', 'nback'],
    ['exportBtn', 'export'],
    ['importBtn', 'import'],
    ['resetData', 'resetData'],
    ['guideBtn', 'guide'],
  ];
  for (const [id, key] of idKeyMap) {
    const el = document.getElementById(id);
    if (el) el.textContent = t[key] || '';
  }
  // Guide lists (innerHTML)
  if (guideBasicsList)
    guideBasicsList.innerHTML = (t.guideBasics || [])
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join('');
  if (guideAdvancedList)
    guideAdvancedList.innerHTML = (t.guideAdvanced || [])
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join('');
  if (guideShortcutsList)
    guideShortcutsList.innerHTML = (t.guideShortcuts || [])
      .map(
        sc =>
          `<li class="flex items-center gap-2"><span class="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">${escapeHtml(sc.key)}</span><span>${escapeHtml(sc.desc)}</span></li>`
      )
      .join('');
  // Hint button with remaining span
  if (hintBtn) {
    hintBtn.innerHTML = `${escapeHtml(t.hint)} <span id="hintLeft" class="ml-1">${hintsLeft}</span>`;
    hintLeftEl = document.getElementById('hintLeft');
  }
  updateControlsUI();
}

function useHint() {
  if (paused || isPreviewing) return;
  if (lockBoard) return;
  if (hintsLeft <= 0) return;
  if (firstCard || secondCard) return;
  const cards = Array.from(gridEl.querySelectorAll('.card')).filter(
    c => !c.classList.contains('pointer-events-none') && !c.classList.contains('flipped')
  );
  if (cards.length < 2) return;
  const map = new Map();
  for (const c of cards) {
    const v = c.dataset.value;
    if (!map.has(v)) map.set(v, []);
    map.get(v).push(c);
  }
  const candidates = Array.from(map.values()).filter(list => list.length >= 2);
  if (!candidates.length) return;
  const pair = candidates[Math.floor(Math.random() * candidates.length)].slice(0, 2);
  lockBoard = true;
  pair[0].classList.add('flipped');
  pair[1].classList.add('flipped');
  sfx('flip');
  vibrateMs(10);
  setTimeout(() => {
    if (!pair[0].classList.contains('pointer-events-none')) pair[0].classList.remove('flipped');
    if (!pair[1].classList.contains('pointer-events-none')) pair[1].classList.remove('flipped');
    lockBoard = false;
  }, HINT_DURATION_MS);
  hintsLeft -= 1;
  hintsUsed += 1;
  updateHintUI();
}

function handleKeyDown(e) {
  const key = e.key;
  if (guideModal && guideModal.classList.contains('flex')) {
    if (key === 'Escape') {
      e.preventDefault();
      closeGuideModal();
    }
    return;
  }
  if (nbackRunning && (key === 'j' || key === 'J')) {
    e.preventDefault();
    onNBackKey();
    return;
  }
  if (key === 'p' || key === 'P') {
    e.preventDefault();
    togglePause();
    return;
  }
  if (key === 'h' || key === 'H') {
    e.preventDefault();
    useHint();
    return;
  }
  if (key === 'n' || key === 'N') {
    e.preventDefault();
    initGame(difficultyEl.value);
    return;
  }
  const cards = Array.from(gridEl.querySelectorAll('.card'));
  if (!cards.length) return;
  const cols = difficulties[currentDifficulty].cols;
  let idx =
    document.activeElement && document.activeElement.dataset && document.activeElement.dataset.index
      ? parseInt(document.activeElement.dataset.index)
      : 0;
  if (key === 'ArrowLeft') {
    e.preventDefault();
    idx = Math.max(0, idx - 1);
    cards[idx]?.focus();
  } else if (key === 'ArrowRight') {
    e.preventDefault();
    idx = Math.min(cards.length - 1, idx + 1);
    cards[idx]?.focus();
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    idx = Math.max(0, idx - cols);
    cards[idx]?.focus();
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    idx = Math.min(cards.length - 1, idx + cols);
    cards[idx]?.focus();
  } else if (key === 'Enter' || key === ' ') {
    if (document.activeElement && document.activeElement.classList.contains('card')) {
      e.preventDefault();
      onFlip(document.activeElement);
    }
  }
}

function getPoolForTheme(theme) {
  return __RememberPools__.getPoolForTheme(theme);
}

function buildDeckItems(picks) {
  const deck = [];
  picks.forEach((item, i) => {
    deck.push({ v: item.v, id: `${item.v}-${i}-a`, type: item.type, color: item.color });
    deck.push({ v: item.v, id: `${item.v}-${i}-b`, type: item.type, color: item.color });
  });
  return deck;
}

function createDeck(pairs) {
  const theme = settings.cardFace || 'emoji';
  let pool = getPoolForTheme(theme);
  // 边界检查：pool 无效时回退到 emoji
  if (!Array.isArray(pool) || pool.length === 0) {
    console.warn('createDeck: pool invalid for theme:', theme, ', falling back to emoji');
    pool = getPoolForTheme('emoji');
  }
  // 确保 pairs 有效
  if (typeof pairs !== 'number' || pairs < 1) {
    pairs = 8;
  }
  pairs = Math.min(pairs, pool.length);
  if (dailyActive) {
    const rng = mulberry32(dailySeed);
    const poolCopy = pool.slice();
    seededShuffle(poolCopy, rng);
    return seededShuffle(buildDeckItems(poolCopy.slice(0, pairs)), rng);
  }
  let picks;
  if (settings.spaced) {
    picks = pickWithFSRS(theme, pool, pairs);
  } else {
    shuffle(pool);
    picks = pool.slice(0, pairs);
  }
  return shuffle(buildDeckItems(picks));
}

function loadAchievements() {
  return __RememberStorage__.loadAchievements();
}
function saveAchievements(obj) {
  __RememberStorage__.saveAchievements(obj);
}

function checkAchievementsOnWin() {
  const result = checkAchievements(loadAchievements(), {
    currentDifficulty,
    elapsed,
    hintsUsed,
    moves,
    pairs: difficulties[currentDifficulty].pairs,
  });
  if (result.newly.length) saveAchievements(result.store);
  return result.newly;
}

function updateAchievementsUI() {
  if (!achievementsList) return;
  const store = loadAchievements();
  const t = i18n();
  const html = achievementsDef
    .map(def => {
      const hit = !!store[def.id];
      const when = hit ? formatAchievementTime(store[def.id].at) : '';
      const title = t[def.titleKey] || def.titleKey;
      const desc = t[def.descKey] || def.descKey;
      return `<li class="flex items-center justify-between ${hit ? 'text-emerald-600' : 'text-slate-500'}"><span>${hit ? '✅' : '⬜️'} ${escapeHtml(title)} <span class="text-xs text-slate-400">${escapeHtml(desc)}</span></span>${when ? `<span class="text-xs text-slate-400">${escapeHtml(when)}</span>` : ''}</li>`;
    })
    .join('');
  achievementsList.innerHTML = html;
}

function openAchievements(newIds) {
  updateAchievementsUI();
  openModalWithFocus(achievementsModal);
  if (achievementsNew) {
    if (newIds && newIds.length) {
      const t = i18n();
      achievementsNew.textContent = (t.achNewUnlock || '').replace('{n}', newIds.length);
      achievementsNew.classList.remove('hidden');
    } else achievementsNew.classList.add('hidden');
  }
}

function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.add('hidden'), TOAST_DURATION_MS);
}

function showCombo(n) {
  if (!comboToastEl) return;
  comboToastEl.textContent = `${i18n().comboLabel} ×${n}`;
  comboToastEl.classList.remove('hidden');
  clearTimeout(showCombo._t);
  showCombo._t = setTimeout(() => comboToastEl.classList.add('hidden'), 900);
}

function collectExportData() {
  return buildExportPayload();
}

function exportData() {
  const data = collectExportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = getBackupFilename();
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

function importDataFromObj(obj) {
  try {
    const normalized = normalizeImportedData(obj);
    applyImportedData(normalized);
    logLifecycle('import_data_applied', {
      version: normalized.version,
      bestCount: Object.keys(normalized.bests || {}).length,
      leaderboardCount: Object.keys(normalized.leaderboards || {}).length,
    });
  } catch (e) {
    logError('import_data_failed', { message: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}
