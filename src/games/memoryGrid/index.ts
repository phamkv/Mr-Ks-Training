import type { GameModule } from '../../core/game';
import { initialStaircase } from '../../core/staircase';
import { LEVELS } from './logic';
import { MemoryGridDemo, MemoryGridGame } from './MemoryGrid';
import { messages } from './messages';

export const memoryGrid: GameModule = {
  id: 'memoryGrid',
  role: 'rotating',
  targetMs: 150_000,
  messages,
  scoreUnit: 'tiles',
  scoreDirection: 'higher-better',
  initialState: () => ({ gameId: 'memoryGrid', stage: 1, totalTrials: 0, updatedAt: new Date(0).toISOString(), staircase: initialStaircase(LEVELS[0]), extra: {} }),
  Demo: MemoryGridDemo,
  Game: MemoryGridGame,
};
