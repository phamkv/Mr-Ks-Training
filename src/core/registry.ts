import { arrows } from '../games/arrows';
import { memoryGrid } from '../games/memoryGrid';
import { speed } from '../games/speed';
import { switchRule } from '../games/switchRule';
import { tapOrWait } from '../games/tapOrWait';
import type { GameModule } from './game';

// The one list of games. A new game is one module plus one line here.
export const games: GameModule[] = [speed, memoryGrid, arrows, tapOrWait, switchRule];

export function gameById(id: string): GameModule | undefined {
  return games.find((game) => game.id === id);
}
