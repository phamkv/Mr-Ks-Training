import type { Rng } from '../../core/random';

export const LEVELS = [3, 4, 5, 6, 7, 8, 9]; // tiles to remember, easiest first

export interface MemoryTrial {
  gridSize: number;
  tiles: number[];
}

export function gridSizeFor(tiles: number): number {
  return tiles <= 5 ? 4 : 5;
}

export function makeTrial(rng: Rng, tiles: number): MemoryTrial {
  const gridSize = gridSizeFor(tiles);
  const all = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { gridSize, tiles: all.slice(0, tiles).sort((a, b) => a - b) };
}

export function isCorrect(trial: MemoryTrial, answer: number[] | null): boolean {
  if (!answer || answer.length !== trial.tiles.length) return false;
  return [...answer].sort((a, b) => a - b).every((tile, i) => tile === trial.tiles[i]);
}

export function showMs(tiles: number): number {
  return 1000 + tiles * 300;
}
