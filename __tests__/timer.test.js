const Timer = require('../src/timer.js');

describe('timer module', () => {
  test('formatTime formats safe mm:ss output', () => {
    expect(Timer.formatTime(0)).toBe('00:00');
    expect(Timer.formatTime(65)).toBe('01:05');
    expect(Timer.formatTime(-10)).toBe('00:00');
  });

  test('resetTimer initializes countdown mode', () => {
    const result = Timer.resetTimer({
      isCountdownMode: () => true,
      getCountdownFor: () => 90,
      currentDifficulty: 'easy',
    });

    expect(result).toEqual({
      elapsed: 0,
      countdownLeft: 90,
      displayText: '01:30',
    });
  });

  test('startTimer uses real elapsed time without drift', () => {
    jest.useFakeTimers();
    let now = 1000;
    const updates = [];
    const onStop = jest.fn();
    const onTimeUp = jest.fn();

    const { timerId } = Timer.startTimer({
      timerId: null,
      elapsed: 0,
      countdownLeft: 0,
      isCountdownMode: () => false,
      getCountdownFor: () => 0,
      currentDifficulty: 'easy',
      onUpdate: value => updates.push(value),
      onStop,
      onTimeUp,
      now: () => now,
      tickMs: 250,
    });

    now = 4100;
    jest.advanceTimersByTime(3250);

    expect(updates.at(-1)).toMatchObject({ elapsed: 3, countdownLeft: 0, displayText: '00:03' });
    expect(onStop).not.toHaveBeenCalled();
    expect(onTimeUp).not.toHaveBeenCalled();

    Timer.stopTimer(timerId);
    jest.useRealTimers();
  });

  test('countdown triggers onTimeUp exactly once', () => {
    jest.useFakeTimers();
    let now = 0;
    const onStop = jest.fn();
    const onTimeUp = jest.fn();
    const updates = [];

    Timer.startTimer({
      timerId: null,
      elapsed: 0,
      countdownLeft: 2,
      isCountdownMode: () => true,
      getCountdownFor: () => 2,
      currentDifficulty: 'easy',
      onUpdate: value => updates.push(value),
      onStop,
      onTimeUp,
      now: () => now,
      tickMs: 250,
    });

    now = 2500;
    jest.advanceTimersByTime(2500);
    jest.advanceTimersByTime(1000);

    expect(updates.at(-1)).toMatchObject({ elapsed: 2, countdownLeft: 0, displayText: '00:00' });
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onTimeUp).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
