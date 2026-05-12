/**
 * DailyChallenge - 每日挑战模式
 *
 * 这是一个**深层模块**，封装了每日挑战的逻辑：
 * - 根据日期生成种子
 * - 检查完成状态
 * - 标记完成
 *
 * @module daily
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./keys.js'), require('./utils.js'), require('./storage.js'));
  } else {
    root.RememberDaily = factory(root.RememberKeys, root.RememberUtils, root.RememberStorage);
  }
})(
  typeof self !== 'undefined' ? self : this,
  function (RememberKeys, RememberUtils, RememberStorage) {
    function todayStr() {
      return RememberKeys.todayStr();
    }

    function seedFromDate(dateStr, diff, theme) {
      return RememberUtils.seedFromDate(dateStr, diff, theme);
    }

    function getSeed(diff, theme) {
      return seedFromDate(todayStr(), diff, theme);
    }

    function isDone(diff) {
      return RememberStorage.isDailyDone(todayStr(), diff);
    }

    function markDone(diff) {
      RememberStorage.markDailyDone(todayStr(), diff);
    }

    function getCompletionKey(diff) {
      return `daily_${todayStr()}_${diff}`;
    }

    function getStatus(difficulties) {
      const status = {};
      for (const diff of difficulties) {
        status[diff] = {
          done: isDone(diff),
          seed: getSeed(diff, 'emoji'),
        };
      }
      return status;
    }

    return {
      todayStr,
      seedFromDate,
      getSeed,
      isDone,
      markDone,
      getCompletionKey,
      getStatus,
    };
  }
);
