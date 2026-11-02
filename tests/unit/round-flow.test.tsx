// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameModule, GameProps } from '../../src/core/game';
import { initialStaircase } from '../../src/core/staircase';
import { LanguageProvider } from '../../src/i18n';
import { SetRunner } from '../../src/screens/SetRunner';
import { db } from '../../src/storage/db';
import { ensureTodaysSet, updateSettings } from '../../src/storage/store';

let finishRound: GameProps['onFinish'];
const stub: GameModule = {
  id: 'stub',
  role: 'core',
  targetMs: 1000,
  messages: {
    en: { title: 'Stub game', instructions: 'Do it', scoreLabel: 'x' },
    de: { title: 'Stub game', instructions: 'Do it', scoreLabel: 'x' },
    vi: { title: 'Stub game', instructions: 'Do it', scoreLabel: 'x' },
  },
  scoreUnit: 'level',
  scoreDirection: 'higher-better',
  initialState: () => ({ gameId: 'stub', stage: 1, totalTrials: 0, updatedAt: new Date(0).toISOString(), staircase: initialStaircase(1), extra: {} }),
  Demo: () => null,
  Game: (props: GameProps) => {
    finishRound = props.onFinish;
    return <p>playing</p>;
  },
};

async function renderRunner(onBack = vi.fn()) {
  await updateSettings({ seenDemos: ['stub'] });
  const set = await ensureTodaysSet([stub], '2026-11-02');
  render(<LanguageProvider language="en"><SetRunner games={[stub]} set={set} onBack={onBack} /></LanguageProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Start the game' }));
  await screen.findByText('playing');
  return { onBack, set };
}

beforeEach(async () => {
  await db.delete();
  await db.open();
});
afterEach(cleanup);

describe('leaving a round', () => {
  it('saves nothing when she leaves, and explains that first', async () => {
    const { onBack } = await renderRunner();
    fireEvent.click(screen.getByRole('button', { name: 'Leave this game' }));
    expect(screen.getByRole('alertdialog').textContent).toContain("won't be saved");
    fireEvent.click(screen.getByRole('button', { name: "Leave and go back to today's set" }));
    expect(onBack).toHaveBeenCalledWith(null);
    expect(await db.results.count()).toBe(0);
    expect((await db.todaysSet.toArray())[0].completedIds).toEqual([]);
  });

  it('returns to the game with "Keep playing"', async () => {
    const { onBack } = await renderRunner();
    fireEvent.click(screen.getByRole('button', { name: 'Leave this game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onBack).not.toHaveBeenCalled();
  });
});

describe('finishing a round', () => {
  it('saves the result, the game state and the row on the pass together', async () => {
    const { onBack } = await renderRunner();
    await act(async () => {
      finishRound({
        trials: 10,
        correct: 8,
        stage: 1,
        score: 3,
        meta: {},
        nextState: { ...stub.initialState(), totalTrials: 10 },
      });
    });
    await waitFor(() => expect(onBack).toHaveBeenCalledWith(0));
    const [result] = await db.results.toArray();
    expect(result).toMatchObject({ gameId: 'stub', trials: 10, syncedAt: null, syncRejectedAt: null, language: 'en' });
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
    expect((await db.gameState.get('stub'))?.totalTrials).toBe(10);
    expect((await db.todaysSet.toArray())[0].completedIds).toEqual(['stub']);
  });
});
