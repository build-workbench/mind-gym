(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberTimer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULT_TICK_MS = 250;

  function formatTime(s) {
    const safe = Math.max(0, Math.floor(Number(s) || 0));
    const m = Math.floor(safe / 60).toString().padStart(2, '0');
    const r = (safe % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  }

  function stopTimer(timerId) {
    if (timerId) clearInterval(timerId);
    return null;
  }

  function resetTimer(params) {
    const isCd = !!params.isCountdownMode();
    const elapsed = 0;
    const countdownLeft = isCd ? params.getCountdownFor(params.currentDifficulty) : 0;
    const display = isCd ? countdownLeft : elapsed;
    return { elapsed, countdownLeft, displayText: formatTime(display) };
  }

  function startTimer(params) {
    if (params.timerId) {
      return { timerId: params.timerId, elapsed: params.elapsed, countdownLeft: params.countdownLeft };
    }

    const now = typeof params.now === 'function' ? params.now : Date.now;
    const baseElapsed = Math.max(0, Math.floor(Number(params.elapsed) || 0));
    const baseCountdown = Math.max(0, Math.floor(Number(params.countdownLeft) || 0));
    const isCountdown = !!params.isCountdownMode();
    const tickMs = Math.max(50, Math.floor(Number(params.tickMs) || DEFAULT_TICK_MS));
    const startedAt = now();
    let lastElapsed = baseElapsed;
    let lastCountdownLeft = baseCountdown;
    let finished = false;

    const emit = () => {
      const elapsedDelta = Math.max(0, Math.floor((now() - startedAt) / 1000));
      const elapsed = baseElapsed + elapsedDelta;
      const countdownLeft = isCountdown ? Math.max(0, baseCountdown - elapsedDelta) : baseCountdown;
      const displayText = formatTime(isCountdown ? countdownLeft : elapsed);

      if (elapsed !== lastElapsed || countdownLeft !== lastCountdownLeft) {
        lastElapsed = elapsed;
        lastCountdownLeft = countdownLeft;
        params.onUpdate({ elapsed, countdownLeft, displayText });
      }

      if (isCountdown && countdownLeft <= 0 && !finished) {
        finished = true;
        clearInterval(id);
        params.onStop();
        params.onTimeUp();
      }
    };

    const id = setInterval(emit, tickMs);
    emit();

    return { timerId: id, elapsed: baseElapsed, countdownLeft: baseCountdown };
  }

  return {
    formatTime,
    stopTimer,
    resetTimer,
    startTimer,
  };
});
