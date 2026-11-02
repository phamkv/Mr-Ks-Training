import { describe, expect, it } from 'vitest';
import type { RoundResult } from './game';
import { mondayOf, weekProgress } from './week';

const round = (localDate: string, durationMs = 60_000) => ({ localDate, durationMs }) as RoundResult;

describe('weekProgress', () => {
  it('counts days from Monday to Sunday and resets on Monday', () => {
    const results = [round('2026-11-01'), round('2026-11-02'), round('2026-11-08')];
    expect(weekProgress(results, 5, '2026-11-08').daysPlayed).toBe(2);
    expect(weekProgress(results, 5, '2026-11-09')).toMatchObject({ daysPlayed: 0, minutes: 0, isNewWeek: true });
    expect(weekProgress(results, 5, '2026-11-01').daysPlayed).toBe(1);
  });

  it('counts extra sets on one day as minutes, not days', () => {
    const results = [round('2026-11-03', 300_000), round('2026-11-03', 150_000), round('2026-11-03', 150_000)];
    expect(weekProgress(results, 5, '2026-11-03')).toMatchObject({ daysPlayed: 1, minutes: 10 });
  });

  it('is unaffected by a daylight-saving change', () => {
    // Germany's clocks went back on 25 October 2026, which is the Sunday of this week.
    expect(mondayOf('2026-10-25')).toBe('2026-10-19');
    expect(mondayOf('2026-10-26')).toBe('2026-10-26');
    const results = [round('2026-10-24'), round('2026-10-25')];
    expect(weekProgress(results, 5, '2026-10-25').daysPlayed).toBe(2);
    expect(weekProgress(results, 5, '2026-10-26').daysPlayed).toBe(0);
  });

  it.each([3, 5, 7])('reports the target of %d days, and can go past it', (target) => {
    const week = ['02', '03', '04', '05', '06', '07', '08'].slice(0, Math.min(7, target + 1));
    const results = week.map((day) => round(`2026-11-${day}`));
    const progress = weekProgress(results, target, '2026-11-08');
    expect(progress.target).toBe(target);
    expect(progress.daysPlayed).toBe(week.length);
  });
});
