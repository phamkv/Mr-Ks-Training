import type { GameModule, RoundResult } from './game';
import { hashString, seededRng } from './random';

export interface TodaysSet {
  date: string;
  setNumber: number;
  gameIds: string[];
  completedIds: string[];
}

type GameInfo = Pick<GameModule, 'id' | 'role'>;

const ROTATING_PER_SET = 2;

// The speed game first, then the 2 rotating games played least recently.
export function buildSet(
  games: readonly GameInfo[],
  results: readonly RoundResult[],
  date: string,
  setNumber: number,
): TodaysSet {
  const lastPlayed = new Map<string, string>();
  for (const result of results) {
    const seen = lastPlayed.get(result.gameId);
    if (!seen || result.startedAt > seen) lastPlayed.set(result.gameId, result.startedAt);
  }
  const rng = seededRng(hashString(`${date}#${setNumber}`));
  const rotating = games
    .filter((game) => game.role === 'rotating')
    .map((game) => ({ id: game.id, last: lastPlayed.get(game.id) ?? '', tie: rng() }))
    .sort((a, b) => a.last.localeCompare(b.last) || a.tie - b.tie)
    .slice(0, ROTATING_PER_SET)
    .map((game) => game.id);
  const core = games.filter((game) => game.role === 'core').map((game) => game.id);
  return { date, setNumber, gameIds: [...core, ...rotating], completedIds: [] };
}

export function nextGameId(set: TodaysSet): string | null {
  return set.gameIds.find((id) => !set.completedIds.includes(id)) ?? null;
}
