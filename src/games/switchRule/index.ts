import type { GameModule } from '../../core/game';
import { initialStaircase } from '../../core/staircase';
import { LEVELS } from './logic';
import { messages } from './messages';
import { SwitchRuleDemo, SwitchRuleGame } from './SwitchRule';

export const switchRule: GameModule = {
  id: 'switchRule',
  role: 'rotating',
  targetMs: 150_000,
  messages,
  scoreUnit: 'ms',
  scoreDirection: 'lower-better',
  initialState: () => ({ gameId: 'switchRule', stage: 1, totalTrials: 0, updatedAt: new Date(0).toISOString(), staircase: initialStaircase(LEVELS[0]), extra: {} }),
  Demo: SwitchRuleDemo,
  Game: SwitchRuleGame,
};
