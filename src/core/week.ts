import type { RoundResult } from './game';

export interface WeekProgress {
  daysPlayed: number;
  target: number;
  minutes: number;
  isNewWeek: boolean;
}

// Works on the calendar date strings, so a daylight-saving change can't move a day across weeks.
export function mondayOf(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const sinceMonday = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - sinceMonday);
  return utc.toISOString().slice(0, 10);
}

export function weekProgress(results: readonly RoundResult[], target: number, today: string): WeekProgress {
  const monday = mondayOf(today);
  const thisWeek = results.filter((r) => mondayOf(r.localDate) === monday);
  const days = new Set(thisWeek.map((r) => r.localDate));
  const totalMs = thisWeek.reduce((sum, r) => sum + r.durationMs, 0);
  return {
    daysPlayed: days.size,
    target,
    minutes: Math.round(totalMs / 60_000),
    isNewWeek: thisWeek.length === 0,
  };
}
