const Modes = require('../src/modes.js');

describe('mode helpers', () => {
  test('buildRecallItems creates up to six truth items and fills distractors', () => {
    const truthValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const poolValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const { items, correctSet } = Modes.buildRecallItems({
      truthValues,
      poolValues,
      shuffle: () => {},
    });

    expect(correctSet.size).toBe(6);
    expect(items).toHaveLength(9);
    expect(items.filter((item) => item.correct)).toHaveLength(6);
    expect(items.filter((item) => !item.correct)).toHaveLength(3);
  });

  test('scoreRecall returns precision and recall', () => {
    const result = Modes.scoreRecall(new Set(['A', 'B', 'C']), new Set(['A', 'C', 'X']));
    expect(result).toEqual({
      tp: 2,
      fp: 1,
      fn: 1,
      precision: 2 / 3,
      recall: 2 / 3,
    });
  });

  test('createNBackConfig clamps values', () => {
    expect(Modes.createNBackConfig({ N: 9, length: 1, speed: 100 })).toEqual({
      N: 3,
      length: 6,
      speed: 500,
    });
  });

  test('summarizeNBackResult computes accuracy and average RT', () => {
    expect(
      Modes.summarizeNBackResult({
        targets: 4,
        hits: 3,
        falseAlarms: 1,
        length: 20,
        rtSum: 900,
        rtCount: 3,
      }),
    ).toEqual({
      accuracy: 0.75,
      avgRt: 300,
      rtSum: 900,
      rtCount: 3,
    });
  });
});
