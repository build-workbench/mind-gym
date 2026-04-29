/**
 * Shared utility functions for Mind Gym modules
 * @module RememberShared
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RememberShared = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * Check if a value is a plain object (not null, not array)
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a plain object
   */
  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Clamp an integer to a range, with fallback for invalid values
   * @param {*} value - Value to clamp
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {number} fallback - Fallback value if input is invalid
   * @returns {number} Clamped integer or fallback
   */
  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  /**
   * Clamp a number to a range, with fallback for invalid values
   * @param {*} value - Value to clamp
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @param {number} fallback - Fallback value if input is invalid
   * @returns {number} Clamped number or fallback
   */
  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  return {
    isPlainObject,
    clampInt,
    clampNumber,
  };
});
