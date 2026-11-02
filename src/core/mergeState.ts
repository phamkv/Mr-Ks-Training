import type { GameState } from './game';

// Most trials wins, because a single timestamp would let one beginner round on a new
// phone overwrite months of real progress. updatedAt breaks ties.
export function mergeGameState(a: GameState | undefined, b: GameState | undefined): GameState | undefined {
  if (!a) return b;
  if (!b) return a;
  if (a.totalTrials !== b.totalTrials) return a.totalTrials > b.totalTrials ? a : b;
  return a.updatedAt >= b.updatedAt ? a : b;
}

export function mergeGameStates(
  a: Record<string, GameState>,
  b: Record<string, GameState>,
): Record<string, GameState> {
  const merged: Record<string, GameState> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    merged[id] = mergeGameState(a[id], b[id])!;
  }
  return merged;
}

export interface SyncedSettings {
  language: string | null;
  daysPerWeek: number;
  settingsUpdatedAt: string | null;
}

export function mergeSettings<T extends SyncedSettings>(a: T, b: T): T {
  if (!a.settingsUpdatedAt) return b;
  if (!b.settingsUpdatedAt) return a;
  return a.settingsUpdatedAt >= b.settingsUpdatedAt ? a : b;
}
