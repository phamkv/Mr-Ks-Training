import { describe, expect, it } from 'vitest';
import type { GameState } from './game';
import { mergeGameStates, mergeSettings } from './mergeState';

const state = (totalTrials: number, updatedAt: string) => ({ gameId: 'speed', totalTrials, updatedAt }) as GameState;

describe('mergeGameStates', () => {
  it("doesn't let a newer state with fewer trials overwrite one with more", () => {
    const months = state(5000, '2026-01-01T00:00:00Z');
    const beginner = state(10, '2026-11-01T00:00:00Z');
    expect(mergeGameStates({ speed: months }, { speed: beginner }).speed).toBe(months);
    expect(mergeGameStates({ speed: beginner }, { speed: months }).speed).toBe(months);
  });

  it('breaks ties with updatedAt and keeps games only one side has', () => {
    const older = state(10, '2026-01-01T00:00:00Z');
    const newer = state(10, '2026-02-01T00:00:00Z');
    expect(mergeGameStates({ speed: older }, { speed: newer }).speed).toBe(newer);
    expect(Object.keys(mergeGameStates({ a: older }, { b: newer })).sort()).toEqual(['a', 'b']);
  });
});

describe('mergeSettings', () => {
  it("doesn't let older settings overwrite newer ones", () => {
    const older = { language: 'de', daysPerWeek: 3, settingsUpdatedAt: '2026-01-01T00:00:00Z' };
    const newer = { language: 'vi', daysPerWeek: 7, settingsUpdatedAt: '2026-02-01T00:00:00Z' };
    expect(mergeSettings(older, newer)).toBe(newer);
    expect(mergeSettings(newer, older)).toBe(newer);
  });
});
