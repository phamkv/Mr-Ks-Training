import type { GameModule, GameState, RoundResult } from '../core/game';
import { buildSet, type TodaysSet } from '../core/setGenerator';
import { db, defaultSettings, type Settings } from './db';

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('app')) ?? defaultSettings;
}

export async function updateSettings(change: Partial<Settings>, synced = false): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const current = await getSettings();
    await db.settings.put({
      ...current,
      ...change,
      settingsUpdatedAt: synced ? new Date().toISOString() : current.settingsUpdatedAt,
    });
  });
}

export async function latestSet(date: string): Promise<TodaysSet | undefined> {
  const sets = await db.todaysSet.where('date').equals(date).toArray();
  return sets.sort((a, b) => b.setNumber - a.setNumber)[0];
}

// Reopening returns the stored set unchanged, so she always comes back to the same pass.
export async function ensureTodaysSet(games: readonly GameModule[], date: string): Promise<TodaysSet> {
  return db.transaction('rw', db.todaysSet, db.results, async () => {
    const existing = await latestSet(date);
    if (existing) return existing;
    const set = buildSet(games, await db.results.toArray(), date, 1);
    await db.todaysSet.put(set);
    return set;
  });
}

export async function startAnotherSet(games: readonly GameModule[], date: string): Promise<TodaysSet> {
  return db.transaction('rw', db.todaysSet, db.results, async () => {
    const current = await latestSet(date);
    const set = buildSet(games, await db.results.toArray(), date, (current?.setNumber ?? 0) + 1);
    await db.todaysSet.put(set);
    return set;
  });
}

export async function getGameState(game: GameModule): Promise<GameState> {
  return (await db.gameState.get(game.id)) ?? game.initialState();
}

// A finished round is saved in one step: the result, the game's difficulty and the row on the pass.
export async function saveFinishedRound(result: RoundResult, state: GameState, set: TodaysSet): Promise<void> {
  await db.transaction('rw', db.results, db.gameState, db.todaysSet, async () => {
    await db.results.put(result);
    await db.gameState.put(state);
    const stored = await db.todaysSet.get([set.date, set.setNumber]);
    if (stored && !stored.completedIds.includes(result.gameId)) {
      await db.todaysSet.put({ ...stored, completedIds: [...stored.completedIds, result.gameId] });
    }
  });
}
