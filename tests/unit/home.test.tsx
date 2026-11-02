// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RoundResult } from '../../src/core/game';
import { games } from '../../src/core/registry';
import { localDate } from '../../src/core/round';
import { LanguageProvider } from '../../src/i18n';
import { Home } from '../../src/screens/Home';
import { db } from '../../src/storage/db';

// jsdom has no layout, so the band's resize tracking has nothing to observe.
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

function result(date: string, score: number): RoundResult {
  return {
    id: crypto.randomUUID(), gameId: 'speed', startedAt: `${date}T09:00:00.000Z`, durationMs: 300_000, localDate: date,
    trials: 40, correct: 31, stage: 1, score, meta: {}, language: 'en', appVersion: 'test', syncedAt: null, syncRejectedAt: null,
  };
}

const renderHome = () =>
  render(
    <LanguageProvider language="en">
      <Home games={games} finishedIndex={null} onUpdate={null} onStart={vi.fn()} onSettings={vi.fn()} />
    </LanguageProvider>,
  );

beforeEach(async () => {
  await db.delete();
  await db.open();
});
afterEach(cleanup);

describe('Home', () => {
  it('never shows a raw score, even when her last score is worse than before', async () => {
    const today = localDate();
    await db.results.bulkPut([result('2026-01-05', 137), result(today, 412)]);
    renderHome();
    const week = await screen.findByTestId('week');
    expect(week.textContent).toContain('1 of 5 days');
    const text = document.body.textContent ?? '';
    expect(text).not.toContain('412');
    expect(text).not.toContain('137');
    expect(text).not.toContain('New best');
  });

  it('shows "New week" rather than 0 days', async () => {
    renderHome();
    expect((await screen.findByTestId('week')).textContent).toBe('New week');
  });

  it('lists the speed game first and offers one Start button', async () => {
    renderHome();
    await screen.findByTestId('week');
    expect(document.querySelector('.leg')?.textContent).toContain('Speed game');
    expect(screen.getAllByRole('button', { name: /Start/ })).toHaveLength(1);
  });
});
