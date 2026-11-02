import type { Rng } from '../../core/random';

export const LEVELS = [3000, 2600, 2200, 1900, 1600, 1400, 1200, 1000, 900, 800];
export type Direction = 'left' | 'right';

export interface ArrowsTrial {
  middle: Direction;
  flanker: Direction;
}

export function makeTrial(rng: Rng): ArrowsTrial {
  const middle: Direction = rng() < 0.5 ? 'left' : 'right';
  const congruent = rng() < 0.5;
  return { middle, flanker: congruent ? middle : middle === 'left' ? 'right' : 'left' };
}

export function isCorrect(trial: ArrowsTrial, answer: Direction | null): boolean {
  return answer === trial.middle;
}
