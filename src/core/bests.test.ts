import { describe, expect, it } from 'vitest';
import { newBests } from './bests';
import type { RoundResult } from './game';

const round = (gameId: string, localDate: string, score: number, stage = 1) =>
  ({ gameId, localDate, score, stage, startedAt: `${localDate}T09:00:00Z` }) as RoundResult;

const speed = { id: 'speed', scoreDirection: 'lower-better' as const };
const memory = { id: 'memory', scoreDirection: 'higher-better' as const };

describe('newBests', () => {
  it('honours lower-better scores', () => {
    const results = [round('speed', '2026-11-01', 200), round('speed', '2026-11-02', 150)];
    expect(newBests(results, [speed], '2026-11-02')).toEqual(['speed']);
    expect(newBests([round('speed', '2026-11-01', 150), round('speed', '2026-11-02', 200)], [speed], '2026-11-02')).toEqual([]);
  });

  it('honours higher-better scores', () => {
    const results = [round('memory', '2026-11-01', 4), round('memory', '2026-11-02', 5)];
    expect(newBests(results, [memory], '2026-11-02')).toEqual(['memory']);
  });

  it('treats speed stages separately', () => {
    const results = [round('speed', '2026-11-01', 60, 1), round('speed', '2026-11-02', 200, 2), round('speed', '2026-11-02', 150, 2)];
    expect(newBests(results, [speed], '2026-11-02')).toEqual(['speed']);
    expect(newBests([round('speed', '2026-11-01', 60, 1), round('speed', '2026-11-02', 200, 2)], [speed], '2026-11-02')).toEqual([]);
  });

  it("doesn't call a first-ever round a best, or a best from another day new", () => {
    expect(newBests([round('speed', '2026-11-02', 200)], [speed], '2026-11-02')).toEqual([]);
    expect(newBests([round('speed', '2026-11-01', 200), round('speed', '2026-11-02', 100)], [speed], '2026-11-03')).toEqual([]);
  });
});
