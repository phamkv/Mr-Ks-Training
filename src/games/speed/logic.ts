import { pick, type Rng } from '../../core/random';

export const BASE_LEVELS = [500, 400, 320, 250, 200, 160, 125, 100, 80, 65, 50, 34, 17] as const;
export const START_MS = 500;
export const STAGE_2_THRESHOLD_MS = 80;
export const STAGE_2_RESET_MS = 250;
export const PRACTICE_FLASH_MS = 1000;
export const OUTER_POSITIONS = 8;

export interface SpeedLevel {
  nominal: number; // what the staircase stores, independent of frame rate
  frames: number;
  ms: number; // what the screen can actually show
}

export function speedLevels(frameMs: number): SpeedLevel[] {
  const levels: SpeedLevel[] = [];
  for (const nominal of BASE_LEVELS) {
    const frames = Math.max(1, Math.round(nominal / frameMs));
    if (levels.some((level) => level.frames === frames)) continue;
    levels.push({ nominal, frames, ms: frames * frameMs });
  }
  return levels;
}

export type Vehicle = 'car' | 'truck';

export interface SpeedTrial {
  centre: Vehicle;
  outer: number;
  distractors: number[];
}

export function makeTrial(rng: Rng, stage: number): SpeedTrial {
  const outer = Math.floor(rng() * OUTER_POSITIONS);
  const others = Array.from({ length: OUTER_POSITIONS }, (_, i) => i).filter((i) => i !== outer);
  return {
    centre: pick(['car', 'truck'] as const, rng),
    outer,
    distractors: stage >= 2 ? others : [],
  };
}

export function isTrialCorrect(trial: SpeedTrial, centreAnswer: Vehicle, outerAnswer: number): boolean {
  return trial.centre === centreAnswer && trial.outer === outerAnswer;
}

// Browsers coarsen frame timestamps to about 1 ms, so a difference of exactly one frame can read slightly over.
const TIMESTAMP_TOLERANCE_MS = 1;

export function isTrialScorable(requestedMs: number, actualMs: number, frameMs: number, pageHidden: boolean): boolean {
  return !pageHidden && Math.abs(actualMs - requestedMs) <= frameMs + TIMESTAMP_TOLERANCE_MS;
}

export interface StageProgress {
  stage: number;
  lowRounds: number;
  resetTo: number | null;
}

// Stage 2 starts after 2 consecutive rounds with a threshold of 80 ms or less.
export function nextStage(stage: number, lowRounds: number, threshold: number): StageProgress {
  if (stage >= 2) return { stage, lowRounds: 0, resetTo: null };
  const low = threshold <= STAGE_2_THRESHOLD_MS ? lowRounds + 1 : 0;
  if (low >= 2) return { stage: 2, lowRounds: 0, resetTo: STAGE_2_RESET_MS };
  return { stage, lowRounds: low, resetTo: null };
}

export function summarize(values: number[]): { mean: number; min: number; max: number } | null {
  if (values.length === 0) return null;
  return {
    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
