import type { Rng } from '../../core/random';

export const LEVELS = [2500, 2200, 1900, 1600, 1400, 1200, 1000, 850, 700];
export const TAP_SHARE = 0.75;
export type Shape = 'circle' | 'square';
export type TapAnswer = 'tap';

export function makeTrial(rng: Rng): Shape {
  return rng() < TAP_SHARE ? 'circle' : 'square';
}

// Tap on circles and wait on squares, so no response in the window is right only for a square.
export function isCorrect(shape: Shape, answer: TapAnswer | null): boolean {
  return shape === 'circle' ? answer === 'tap' : answer === null;
}
