import type { Rng } from '../../core/random';

export const LEVELS = [4000, 3500, 3000, 2600, 2200, 1900, 1600, 1400, 1200];
export type Rule = 'shape' | 'fill';
export type Shape = 'circle' | 'square';
export type Fill = 'filled' | 'outline';
export type SwitchAnswer = Shape | Fill;

export interface SwitchTrial {
  rule: Rule;
  shape: Shape;
  fill: Fill;
}

export function makeTrial(rng: Rng): SwitchTrial {
  return {
    rule: rng() < 0.5 ? 'shape' : 'fill',
    shape: rng() < 0.5 ? 'circle' : 'square',
    fill: rng() < 0.5 ? 'filled' : 'outline',
  };
}

export function correctAnswer(trial: SwitchTrial): SwitchAnswer {
  return trial.rule === 'shape' ? trial.shape : trial.fill;
}

export function isCorrect(trial: SwitchTrial, answer: SwitchAnswer | null): boolean {
  return answer === correctAnswer(trial);
}
