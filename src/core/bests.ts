import type { GameModule, RoundResult } from './game';

type ScoreInfo = Pick<GameModule, 'id' | 'scoreDirection'>;

// Game ids where a round played today beat every earlier round of that game and stage.
// A first-ever round has nothing to beat, so it isn't called a best.
export function newBests(results: readonly RoundResult[], games: readonly ScoreInfo[], today: string): string[] {
  const found: string[] = [];
  for (const game of games) {
    const rounds = results
      .filter((r) => r.gameId === game.id)
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const best = new Map<number, number>();
    let isNew = false;
    for (const round of rounds) {
      const previous = best.get(round.stage);
      const beats =
        previous !== undefined &&
        (game.scoreDirection === 'lower-better' ? round.score < previous : round.score > previous);
      if (beats && round.localDate === today) isNew = true;
      if (previous === undefined || beats) best.set(round.stage, round.score);
    }
    if (isNew) found.push(game.id);
  }
  return found;
}
