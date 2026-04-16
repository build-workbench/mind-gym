const Utils = require('../src/utils.js');

describe('shuffle', () => {
  test('returns the same array reference', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = Utils.shuffle(arr);
    expect(result).toBe(arr);
  });

  test('preserves all elements after shuffling', () => {
    const arr = [1, 2, 3, 4, 5];
    Utils.shuffle(arr);
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles empty array', () => {
    const arr = [];
    const result = Utils.shuffle(arr);
    expect(result).toEqual([]);
  });

  test('handles single element array', () => {
    const arr = [42];
    const result = Utils.shuffle(arr);
    expect(result).toEqual([42]);
  });

  test('handles two element array', () => {
    const arr = [1, 2];
    Utils.shuffle(arr);
    expect(arr.length).toBe(2);
    expect(arr.includes(1)).toBe(true);
    expect(arr.includes(2)).toBe(true);
  });

  test('shuffles array randomly (statistical test)', () => {
    // Run shuffle many times and check that elements change positions
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let differentPositions = 0;

    for (let i = 0; i < 100; i++) {
      const arr = [...original];
      Utils.shuffle(arr);
      for (let j = 0; j < arr.length; j++) {
        if (arr[j] !== original[j]) {
          differentPositions++;
        }
      }
    }

    // With 100 shuffles of 10 elements, we expect significant position changes
    expect(differentPositions).toBeGreaterThan(500);
  });

  test('shuffles string array', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    Utils.shuffle(arr);
    expect(arr.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  test('shuffles object array', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    Utils.shuffle(arr);
    const ids = arr.map(item => item.id).sort();
    expect(ids).toEqual([1, 2, 3]);
  });
});

describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    expect(Utils.escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('escapes less than sign', () => {
    expect(Utils.escapeHtml('a < b')).toBe('a &lt; b');
  });

  test('escapes greater than sign', () => {
    expect(Utils.escapeHtml('a > b')).toBe('a &gt; b');
  });

  test('escapes double quotes', () => {
    expect(Utils.escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  test('escapes single quotes', () => {
    expect(Utils.escapeHtml("it's")).toBe('it&#39;s');
  });

  test('escapes all special characters together', () => {
    const input = '<script>alert("xss")&\'</script>';
    const expected = '&lt;script&gt;alert(&quot;xss&quot;)&amp;&#39;&lt;/script&gt;';
    expect(Utils.escapeHtml(input)).toBe(expected);
  });

  test('returns string unchanged if no special characters', () => {
    expect(Utils.escapeHtml('hello world')).toBe('hello world');
  });

  test('handles empty string', () => {
    expect(Utils.escapeHtml('')).toBe('');
  });

  test('converts non-string to string', () => {
    expect(Utils.escapeHtml(123)).toBe('123');
    expect(Utils.escapeHtml(null)).toBe('null');
    expect(Utils.escapeHtml(undefined)).toBe('undefined');
    expect(Utils.escapeHtml(true)).toBe('true');
  });

  test('handles unicode characters', () => {
    expect(Utils.escapeHtml('你好世界')).toBe('你好世界');
    expect(Utils.escapeHtml('🎉')).toBe('🎉');
  });
});

describe('seedFromDate', () => {
  test('returns a number', () => {
    const seed = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    expect(typeof seed).toBe('number');
  });

  test('returns consistent seed for same inputs', () => {
    const seed1 = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    const seed2 = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    expect(seed1).toBe(seed2);
  });

  test('returns different seeds for different dates', () => {
    const seed1 = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    const seed2 = Utils.seedFromDate('2026-04-17', 'easy', 'emoji');
    expect(seed1).not.toBe(seed2);
  });

  test('returns different seeds for different difficulties', () => {
    const seedEasy = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    const seedHard = Utils.seedFromDate('2026-04-16', 'hard', 'emoji');
    expect(seedEasy).not.toBe(seedHard);
  });

  test('returns different seeds for different themes', () => {
    const seedEmoji = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    const seedNumber = Utils.seedFromDate('2026-04-16', 'easy', 'number');
    expect(seedEmoji).not.toBe(seedNumber);
  });

  test('returns unsigned 32-bit integer', () => {
    const seed = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(4294967295);
  });

  test('handles various date formats', () => {
    const seed1 = Utils.seedFromDate('2026-01-01', 'easy', 'emoji');
    const seed2 = Utils.seedFromDate('2026-12-31', 'easy', 'emoji');
    expect(seed1).not.toBe(seed2);
  });

  test('handles empty strings', () => {
    const seed = Utils.seedFromDate('', '', '');
    expect(typeof seed).toBe('number');
  });
});

describe('mulberry32', () => {
  test('returns a function', () => {
    const rng = Utils.mulberry32(12345);
    expect(typeof rng).toBe('function');
  });

  test('returns numbers between 0 and 1', () => {
    const rng = Utils.mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('produces consistent sequence for same seed', () => {
    const rng1 = Utils.mulberry32(12345);
    const rng2 = Utils.mulberry32(12345);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).toEqual(seq2);
  });

  test('produces different sequences for different seeds', () => {
    const rng1 = Utils.mulberry32(12345);
    const rng2 = Utils.mulberry32(67890);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).not.toEqual(seq2);
  });

  test('generates different values on each call', () => {
    const rng = Utils.mulberry32(12345);
    const values = new Set();

    for (let i = 0; i < 100; i++) {
      values.add(rng());
    }

    // With a good PRNG, 100 values should all be different
    expect(values.size).toBe(100);
  });

  test('handles seed of 0', () => {
    const rng = Utils.mulberry32(0);
    expect(rng()).toBeGreaterThanOrEqual(0);
    expect(rng()).toBeLessThan(1);
  });

  test('handles large seeds', () => {
    const rng = Utils.mulberry32(4294967295);
    expect(rng()).toBeGreaterThanOrEqual(0);
    expect(rng()).toBeLessThan(1);
  });

  test('has approximately uniform distribution', () => {
    const rng = Utils.mulberry32(12345);
    const buckets = [0, 0, 0, 0, 0];

    for (let i = 0; i < 10000; i++) {
      const value = rng();
      const bucket = Math.floor(value * 5);
      buckets[bucket]++;
    }

    // Each bucket should have roughly 2000 values (±500 tolerance)
    buckets.forEach(count => {
      expect(count).toBeGreaterThan(1500);
      expect(count).toBeLessThan(2500);
    });
  });
});

describe('seededShuffle', () => {
  test('returns the same array reference', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng = Utils.mulberry32(12345);
    const result = Utils.seededShuffle(arr, rng);
    expect(result).toBe(arr);
  });

  test('preserves all elements after shuffling', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng = Utils.mulberry32(12345);
    Utils.seededShuffle(arr, rng);
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('produces deterministic results with same RNG', () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 2, 3, 4, 5];
    const rng1 = Utils.mulberry32(12345);
    const rng2 = Utils.mulberry32(12345);

    Utils.seededShuffle(arr1, rng1);
    Utils.seededShuffle(arr2, rng2);

    expect(arr1).toEqual(arr2);
  });

  test('handles empty array', () => {
    const arr = [];
    const rng = Utils.mulberry32(12345);
    const result = Utils.seededShuffle(arr, rng);
    expect(result).toEqual([]);
  });

  test('handles single element array', () => {
    const arr = [42];
    const rng = Utils.mulberry32(12345);
    const result = Utils.seededShuffle(arr, rng);
    expect(result).toEqual([42]);
  });
});

describe('integration: seedFromDate + mulberry32 + seededShuffle', () => {
  test('produces consistent shuffle for same date/diff/theme', () => {
    const seed = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');

    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng1 = Utils.mulberry32(seed);
    Utils.seededShuffle(arr1, rng1);

    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng2 = Utils.mulberry32(seed);
    Utils.seededShuffle(arr2, rng2);

    expect(arr1).toEqual(arr2);
  });

  test('produces different shuffle for different dates', () => {
    const seed1 = Utils.seedFromDate('2026-04-16', 'easy', 'emoji');
    const seed2 = Utils.seedFromDate('2026-04-17', 'easy', 'emoji');

    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];

    Utils.seededShuffle(arr1, Utils.mulberry32(seed1));
    Utils.seededShuffle(arr2, Utils.mulberry32(seed2));

    expect(arr1).not.toEqual(arr2);
  });
});
