import type { GameModule } from '../../core/game';
import { initialStaircase } from '../../core/staircase';
import { START_MS } from './logic';
import { messages } from './messages';
import { SpeedDemo } from './SpeedDemo';
import { SpeedGame } from './SpeedGame';

export const speed: GameModule = {
  id: 'speed',
  role: 'core',
  targetMs: 300_000,
  messages,
  scoreUnit: 'ms',
  scoreDirection: 'lower-better',
  initialState: () => ({
    gameId: 'speed',
    stage: 1,
    totalTrials: 0,
    updatedAt: new Date(0).toISOString(),
    staircase: initialStaircase(START_MS),
    extra: {},
  }),
  Demo: SpeedDemo,
  Game: SpeedGame,
};
