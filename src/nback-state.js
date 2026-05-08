/**
 * NBackState - N-back 模式状态管理
 *
 * 这是一个**深层模块**，封装了 N-back 任务的完整生命周期：
 * - 调用者只需调用 start(config)
 * - 不需关心定时器、序列生成、目标检测、RT 计算
 *
 * @module nback-state
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./modes.js'), require('./shared.js'));
  } else {
    root.RememberNBack = factory(root.RememberModes, root.RememberShared);
  }
})(typeof self !== 'undefined' ? self : this, function (RememberModes, RememberShared) {
  const { createNBackConfig, summarizeNBackResult } = RememberModes;
  const { clampInt } = RememberShared;

  class NBackState {
    constructor(config = {}) {
      this._onComplete = config.onComplete || null;
      this._onProgress = config.onProgress || null;
      this._onStimulus = config.onStimulus || null;
      this._getPool = config.getPool || (() => []);

      this._running = false;
      this._timer = null;
      this._seq = [];
      this._idx = -1;
      this._stepStart = 0;

      this._config = {
        N: 2,
        length: 20,
        speed: 900,
      };

      this._responded = false;
      this._targets = 0;
      this._hits = 0;
      this._misses = 0;
      this._falseAlarms = 0;
      this._rtSum = 0;
      this._rtCount = 0;
    }

    start(rawConfig) {
      if (this._running) {
        return false;
      }

      this._config = createNBackConfig(rawConfig);

      const pool = this._getPool();
      if (!Array.isArray(pool) || pool.length === 0) {
        console.error('NBackState: pool is empty or invalid');
        return false;
      }

      this._seq = Array.from(
        { length: this._config.length },
        () => pool[Math.floor(Math.random() * pool.length)]
      );

      this._idx = -1;
      this._targets = 0;
      this._hits = 0;
      this._misses = 0;
      this._falseAlarms = 0;
      this._rtSum = 0;
      this._rtCount = 0;
      this._responded = false;
      this._running = true;

      this._tick();

      return true;
    }

    stop() {
      if (!this._running) {
        return;
      }

      this._running = false;

      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }

    respond() {
      if (!this._running) {
        return;
      }

      if (this._responded) {
        return;
      }

      this._responded = true;

      const rt = Math.max(0, Math.round(performance.now() - this._stepStart));
      const N = this._config.N;
      const isTarget = this._idx >= N && this._seq[this._idx] === this._seq[this._idx - N];

      if (isTarget) {
        this._hits += 1;
        this._rtSum += rt;
        this._rtCount += 1;
      } else {
        this._falseAlarms += 1;
      }
    }

    getState() {
      const N = this._config.N;
      const progress = {
        current: Math.max(0, this._idx),
        total: this._config.length,
      };

      const stats = {
        targets: this._targets,
        hits: this._hits,
        misses: this._misses,
        falseAlarms: this._falseAlarms,
        accuracy: this._targets > 0 ? this._hits / this._targets : 0,
        avgRt: this._rtCount > 0 ? Math.round(this._rtSum / this._rtCount) : 0,
      };

      return {
        running: this._running,
        config: { ...this._config },
        progress,
        stats,
        currentStimulus:
          this._idx >= 0 && this._idx < this._seq.length ? this._seq[this._idx] : null,
      };
    }

    reset() {
      this.stop();

      this._seq = [];
      this._idx = -1;
      this._stepStart = 0;
      this._responded = false;
      this._targets = 0;
      this._hits = 0;
      this._misses = 0;
      this._falseAlarms = 0;
      this._rtSum = 0;
      this._rtCount = 0;
    }

    _tick() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }

      const period = this._config.speed;

      this._timer = setInterval(() => {
        this._checkMissedTarget();

        this._idx += 1;

        if (this._idx >= this._seq.length) {
          this._finish();
          return;
        }

        const stim = this._seq[this._idx];
        this._responded = false;
        this._stepStart = performance.now();

        const N = this._config.N;
        if (this._idx >= N && this._seq[this._idx] === this._seq[this._idx - N]) {
          this._targets += 1;
        }

        if (this._onStimulus) {
          this._onStimulus(stim, this._idx);
        }

        if (this._onProgress) {
          this._onProgress({
            current: this._idx,
            total: this._config.length,
          });
        }
      }, period);
    }

    _checkMissedTarget() {
      const N = this._config.N;
      if (this._idx >= N) {
        const targetPrev = this._seq[this._idx] === this._seq[this._idx - N];
        if (targetPrev && !this._responded) {
          this._misses += 1;
        }
      }
    }

    _finish() {
      this.stop();

      const summary = summarizeNBackResult({
        targets: this._targets,
        hits: this._hits,
        falseAlarms: this._falseAlarms,
        length: this._seq.length,
        rtSum: this._rtSum,
        rtCount: this._rtCount,
      });

      if (this._onComplete) {
        this._onComplete(summary);
      }
    }
  }

  return NBackState;
});
