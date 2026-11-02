import type { GameModule } from '../../core/game';
import { initialStaircase } from '../../core/staircase';
import { ArrowsDemo, ArrowsGame } from './Arrows';
import { LEVELS } from './logic';
import { messages } from './messages';

export const arrows: GameModule = {
  id: 'arrows',
  role: 'rotating',
  targetMs: 150_000,
  messages,
  scoreUnit: 'ms',
  scoreDirection: 'lower-better',
  initialState: () => ({ gameId: 'arrows', stage: 1, totalTrials: 0, updatedAt: new Date(0).toISOString(), staircase: initialStaircase(LEVELS[0]), extra: {} }),
  Demo: ArrowsDemo,
  Game: ArrowsGame,
};
