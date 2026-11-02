import { describe, expect, it } from 'vitest';
import { localDate, RoundClock } from './round';

describe('RoundClock', () => {
  it("doesn't count paused time", () => {
    let now = 1000;
    const clock = new RoundClock(() => now);
    now = 4000;
    clock.pause();
    now = 90_000;
    expect(clock.elapsed()).toBe(3000);
    clock.resume();
    now = 91_000;
    expect(clock.elapsed()).toBe(4000);
  });

  it('ignores a second pause and a second resume', () => {
    let now = 0;
    const clock = new RoundClock(() => now);
    now = 10;
    clock.pause();
    clock.pause();
    clock.resume();
    now = 20;
    clock.resume();
    now = 30;
    expect(clock.elapsed()).toBe(30);
  });
});

describe('localDate', () => {
  it('uses the local calendar date', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
