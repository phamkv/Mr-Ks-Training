import { describe, expect, it } from 'vitest';
import type { RoundResult } from './game';
import { buildSet, nextGameId } from './setGenerator';

const games = [
  { id: 'speed', role: 'core' as const },
  { id: 'a', role: 'rotating' as const },
  { id: 'b', role: 'rotating' as const },
  { id: 'c', role: 'rotating' as const },
  { id: 'd', role: 'rotating' as const },
];

const played = (gameId: string, startedAt: string) => ({ gameId, startedAt }) as RoundResult;

describe('buildSet', () => {
  it('always puts speed first and picks 2 different rotating games', () => {
    for (let day = 1; day <= 28; day++) {
      const set = buildSet(games, [], `2026-11-${String(day).padStart(2, '0')}`, 1);
      expect(set.gameIds[0]).toBe('speed');
      expect(set.gameIds).toHaveLength(3);
      expect(new Set(set.gameIds).size).toBe(3);
    }
  });

  it('picks the least recently played', () => {
    const results = [
      played('a', '2026-11-01T09:00:00Z'),
      played('b', '2026-11-02T09:00:00Z'),
      played('c', '2026-10-01T09:00:00Z'),
      played('d', '2026-10-02T09:00:00Z'),
    ];
    expect(buildSet(games, results, '2026-11-03', 1).gameIds).toEqual(['speed', 'c', 'd']);
  });

  it('gives a never-played game priority, so a new registry entry enters the rotation', () => {
    const results = games.slice(1).map((game) => played(game.id, '2026-11-01T09:00:00Z'));
    const withNew = [...games, { id: 'brandNew', role: 'rotating' as const }];
    expect(buildSet(withNew, results, '2026-11-03', 1).gameIds).toContain('brandNew');
  });

  it('breaks ties the same way for the same date and set number', () => {
    expect(buildSet(games, [], '2026-11-03', 1)).toEqual(buildSet(games, [], '2026-11-03', 1));
  });
});

describe('nextGameId', () => {
  it('returns the first unfinished game, then null', () => {
    const set = { date: 'x', setNumber: 1, gameIds: ['speed', 'a', 'b'], completedIds: ['speed'] };
    expect(nextGameId(set)).toBe('a');
    expect(nextGameId({ ...set, completedIds: ['speed', 'a', 'b'] })).toBeNull();
  });
});
