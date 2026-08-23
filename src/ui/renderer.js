/**
 * UIRenderer - UI 渲染抽象层
 *
 * 这是一个**深层模块**，封装了所有 DOM 渲染操作：
 * - 调用者只需调用 renderFlip(card) 等方法
 * - 不需关心具体的 DOM 操作细节
 * - 支持测试时注入 mock 实现
 *
 * @module ui/renderer
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberUIRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * 创建 UI 渲染器实例
   * @param {Object} config - 配置
   * @param {Object} config.elements - DOM 元素引用
   * @param {Object} config.settings - 设置引用（用于获取主题、音效等）
   * @param {Object} config.i18n - 国际化函数
   */
  function createRenderer(config = {}) {
    const elements = config.elements || {};
    const getSettings = config.getSettings || (() => ({}));
    const i18n = config.i18n || (() => ({}));
    const currentLang = config.currentLang || (() => 'en');

    // ========== 卡片渲染 ==========

    function renderCard(item, index) {
      const settings = getSettings();
      const theme = settings.cardFace || 'emoji';
      const accent = settings.accent || 'indigo';
      const { frontBg, frontText } = getFrontClasses(accent);

      const btn = document.createElement('button');
      btn.className =
        'relative card w-full aspect-square rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500';
      btn.dataset.value = item.v;
      btn.dataset.index = String(index);
      btn.setAttribute(
        'aria-label',
        `${getCardLabel(item.v, theme)} · ${i18n().cardUnflipped || '未翻开'}`
      );
      btn.setAttribute('aria-pressed', 'false');

      const inner = document.createElement('div');
      inner.className = 'card-inner relative w-full h-full';

      const front = document.createElement('div');
      front.className = `card-face card-front rounded-xl ${frontBg} ${frontText} text-2xl sm:text-3xl`;
      front.textContent = '?';

      const back = document.createElement('div');
      back.className = 'card-face card-back rounded-xl bg-white text-3xl sm:text-4xl';
      if (item.type === 'color' || item.type === 'colors') {
        back.style.backgroundColor = item.color || item.v;
        back.textContent = '';
      } else {
        back.textContent = item.v;
      }

      inner.appendChild(front);
      inner.appendChild(back);
      btn.appendChild(inner);

      return btn;
    }

    function renderFlip(cardEl, value, theme) {
      cardEl.classList.add('flipped');
      cardEl.setAttribute('aria-pressed', 'true');
      cardEl.setAttribute(
        'aria-label',
        `${getCardLabel(value, theme)} · ${currentLang() === 'zh' ? '已翻开' : 'revealed'}`
      );
    }

    function renderFlipBack(cardEl, value, theme) {
      cardEl.classList.remove('flipped');
      cardEl.setAttribute('aria-pressed', 'false');
      cardEl.setAttribute('aria-label', `${getCardLabel(value, theme)}`);
    }

    function renderMatch(card1El, card2El, accent, theme) {
      const ringClass = getRingClass(accent);
      card1El.classList.add('pointer-events-none', 'ring-2', ringClass, 'match-pulse');
      card2El.classList.add('pointer-events-none', 'ring-2', ringClass, 'match-pulse');
      card1El.setAttribute(
        'aria-label',
        `${getCardLabel(card1El.dataset.value, theme)} · ${currentLang() === 'zh' ? '已配对' : 'matched'}`
      );
      card2El.setAttribute(
        'aria-label',
        `${getCardLabel(card2El.dataset.value, theme)} · ${currentLang() === 'zh' ? '已配对' : 'matched'}`
      );
    }

    // ========== 状态显示 ==========

    function renderMoves(count) {
      if (elements.movesEl) {
        elements.movesEl.textContent = String(count);
      }
    }

    function renderTime(formatted) {
      if (elements.timeEl) {
        elements.timeEl.textContent = formatted;
      }
    }

    function renderProgress(matched, total) {
      if (elements.pairsLeftEl) {
        elements.pairsLeftEl.textContent = String(Math.max(0, total - matched));
      }
      if (elements.progressBarEl) {
        const pct = total > 0 ? Math.min(100, Math.round((matched / total) * 100)) : 0;
        elements.progressBarEl.style.width = pct + '%';
      }
    }

    function renderHint(count) {
      if (elements.hintLeftEl) {
        elements.hintLeftEl.textContent = String(count);
      }
    }

    function renderCombo(count) {
      if (elements.comboToastEl) {
        elements.comboToastEl.textContent = `${i18n().comboLabel} ×${count}`;
        elements.comboToastEl.classList.remove('hidden');
        setTimeout(() => elements.comboToastEl.classList.add('hidden'), 900);
      }
    }

    function renderBest(best) {
      if (!elements.bestEl) return;
      const t = i18n();
      if (best) {
        elements.bestEl.textContent = `${formatTime(best.time)} · ${best.moves}${t.bestSteps}`;
      } else {
        elements.bestEl.textContent = '—';
      }
    }

    function renderRating(stars) {
      if (!elements.ratingStarsEl) return;
      const filled = '⭐'.repeat(stars);
      const empty = '☆'.repeat(5 - stars);
      elements.ratingStarsEl.textContent = filled + empty;
      elements.ratingStarsEl.setAttribute('aria-label', `${stars} 星`);
    }

    function renderControls(state) {
      const t = i18n();
      if (elements.pauseBtn) {
        elements.pauseBtn.textContent = state.paused ? t.resume : t.pause;
      }
      if (elements.pauseOverlay) {
        if (state.paused) {
          elements.pauseOverlay.classList.remove('hidden');
          elements.pauseOverlay.classList.add('flex');
        } else {
          elements.pauseOverlay.classList.add('hidden');
          elements.pauseOverlay.classList.remove('flex');
        }
      }
      renderHint(state.hintsLeft);
    }

    function renderLeaderboard(entries, t, formatTimeFn) {
      if (!elements.leaderboardList) return;
      if (!entries.length) {
        elements.leaderboardList.innerHTML = `<li class="text-slate-500">${t.leaderboardEmpty}</li>`;
        return;
      }
      const html = entries
        .map((e, i) => {
          const d = new Date(e.at || Date.now());
          const dateStr = `${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          return `<li>${i + 1}. ${formatTimeFn(e.time)} · ${e.moves} ${t.stepsFmt} <span class="text-slate-400">• ${dateStr}</span></li>`;
        })
        .join('');
      elements.leaderboardList.innerHTML = html;
    }

    function renderAchievements(store, defs, t, formatTimeFn) {
      if (!elements.achievementsList) return;
      const html = defs
        .map(def => {
          const hit = !!store[def.id];
          const when = hit ? formatTimeFn(store[def.id].at) : '';
          const title = t[def.titleKey] || def.titleKey;
          const desc = t[def.descKey] || def.descKey;
          return `<li class="flex items-center justify-between ${hit ? 'text-emerald-600' : 'text-slate-500'}"><span>${hit ? '✅' : '⬜️'} ${escapeHtml(title)} <span class="text-xs text-slate-400">${escapeHtml(desc)}</span></span>${when ? `<span class="text-xs text-slate-400">${escapeHtml(when)}</span>` : ''}</li>`;
        })
        .join('');
      elements.achievementsList.innerHTML = html;
    }

    function renderStats(stats, summary, t) {
      if (!elements.statsListEl) return;
      elements.statsListEl.innerHTML = [
        `<li>${t.statsTotalGames}：<span class="font-semibold">${stats.games}</span></li>`,
        `<li>${t.statsWins}：<span class="font-semibold">${stats.wins}</span>（${t.statsWinRate} ${summary.winRate}）</li>`,
        `<li>${t.statsAvgTime}：<span class="font-semibold">${summary.avgTime}</span></li>`,
        `<li>${t.statsAvgMoves}：<span class="font-semibold">${summary.avgMoves}</span></li>`,
        `<li>${t.statsAvgHints}：<span class="font-semibold">${summary.avgHints}</span></li>`,
        `<li>${t.statsAvgCombo}：<span class="font-semibold">${summary.avgCombo}</span>，${t.statsHistoryBest}：<span class="font-semibold">${stats.bestCombo || 0}</span></li>`,
        `<li>${t.statsRecallLabel}（${stats.recallAttempts || 0} ${t.statsTimes}）${t.statsPrecision}：<span class="font-semibold">${summary.avgPrecision}</span> · ${t.statsRecall}：<span class="font-semibold">${summary.avgRecall}</span></li>`,
        `<li>${t.statsNbackLabel}（${stats.nbackAttempts || 0} ${t.statsTimes}）${t.statsAvgAcc}：<span class="font-semibold">${summary.avgNBackAcc}</span> · ${t.statsAvgRt}：<span class="font-semibold">${summary.avgNBackRt}</span></li>`,
      ].join('');
    }

    // ========== 模态框 ==========

    function showModal(modalEl) {
      if (!modalEl) return;
      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');
      modalEl.setAttribute('aria-hidden', 'false');
    }

    function hideModal(modalEl) {
      if (!modalEl) return;
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
      modalEl.setAttribute('aria-hidden', 'true');
    }

    // ========== 通知 ==========

    let toastTimeout = null;
    function showToast(message, duration = 2000) {
      if (!elements.toastEl) return;
      elements.toastEl.textContent = message;
      elements.toastEl.classList.remove('hidden');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => elements.toastEl.classList.add('hidden'), duration);
    }

    // ========== 主题/样式 ==========

    function applyTheme(theme) {
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
      document.documentElement.classList.toggle('dark', !!isDark);
    }

    function applyMotionPreference(motion) {
      const prefReduce =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const reduced = motion === 'off' || (motion === 'auto' && prefReduce);
      document.body.classList.toggle('no-anim', reduced);
    }

    function applyAccent(accent) {
      const allProgress = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500'];
      const allFrontBg = ['bg-indigo-100', 'bg-emerald-100', 'bg-rose-100'];
      const allFrontText = ['text-indigo-700', 'text-emerald-700', 'text-rose-700'];
      const allRings = ['ring-indigo-400', 'ring-emerald-400', 'ring-rose-400'];

      const progressClass = getProgressClass(accent);
      if (elements.progressBarEl) {
        elements.progressBarEl.classList.remove(...allProgress);
        elements.progressBarEl.classList.add(progressClass);
      }

      document.querySelectorAll('.card-front').forEach(el => {
        el.classList.remove(...allFrontBg, ...allFrontText);
        const { frontBg, frontText } = getFrontClasses(accent);
        el.classList.add(frontBg, frontText);
      });

      document.querySelectorAll('.card.pointer-events-none').forEach(el => {
        el.classList.remove(...allRings);
        el.classList.add(getRingClass(accent));
      });
    }

    // ========== 辅助函数 ==========

    function getCardLabel(value, theme) {
      const themeLabels = {
        emoji: currentLang() === 'zh' ? '表情卡片' : 'emoji',
        numbers: currentLang() === 'zh' ? '数字卡片' : 'number',
        letters: currentLang() === 'zh' ? '字母卡片' : 'letter',
        shapes: currentLang() === 'zh' ? '形状卡片' : 'shape',
        colors: currentLang() === 'zh' ? '颜色卡片' : 'color',
      };
      const label = themeLabels[theme] || themeLabels.emoji;
      return `${label} ${value}`;
    }

    function getRingClass(accent) {
      const rings = {
        indigo: 'ring-indigo-400',
        emerald: 'ring-emerald-400',
        rose: 'ring-rose-400',
      };
      return rings[accent] || rings.indigo;
    }

    function getProgressClass(accent) {
      const progress = {
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
      };
      return progress[accent] || progress.indigo;
    }

    function getFrontClasses(accent) {
      const fronts = {
        indigo: { frontBg: 'bg-indigo-100', frontText: 'text-indigo-700' },
        emerald: { frontBg: 'bg-emerald-100', frontText: 'text-emerald-700' },
        rose: { frontBg: 'bg-rose-100', frontText: 'text-rose-700' },
      };
      return fronts[accent] || fronts.indigo;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function formatTime(s) {
      const min = Math.floor(s / 60);
      const sec = s % 60;
      return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    // ========== 公共接口 ==========

    return {
      // 卡片渲染
      renderCard,
      renderFlip,
      renderFlipBack,
      renderMatch,

      // 状态显示
      renderMoves,
      renderTime,
      renderProgress,
      renderHint,
      renderCombo,
      renderBest,
      renderRating,
      renderControls,
      renderLeaderboard,
      renderAchievements,
      renderStats,

      // 模态框
      showModal,
      hideModal,

      // 通知
      showToast,

      // 主题/样式
      applyTheme,
      applyMotionPreference,
      applyAccent,
    };
  }

  return {
    create: createRenderer,
  };
});
