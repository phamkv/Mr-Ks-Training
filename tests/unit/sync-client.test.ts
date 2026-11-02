import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../../server/db';
import { pgliteDb } from '../../server/dbPglite';
import { handle } from '../../server/routes';
import type { RoundResult } from '../../src/core/game';
import { db as local } from '../../src/storage/db';
import { replaceViewLink, RestoreError, restoreFromCode, syncNow } from '../../src/sync/client';
import { displayCode, ensureIdentity, normalizeCode, randomToken, sha256Hex } from '../../src/sync/identity';

let server: Db;
let down = false;

const f: typeof fetch = async (input, init) => {
  if (down) throw new TypeError('network down');
  return handle(new Request(`http://local${input}`, init), { db: server, maxProfiles: 3, log: () => {} });
};

function round(over: Partial<RoundResult> = {}): RoundResult {
  return {
    id: crypto.randomUUID(), gameId: 'speed', startedAt: new Date().toISOString(), durationMs: 300_000, localDate: '2026-11-02',
    trials: 40, correct: 32, stage: 1, score: 120, meta: {}, language: 'vi', appVersion: '0.1.0', syncedAt: null, syncRejectedAt: null, ...over,
  };
}

async function resetPhone() {
  await local.delete();
  await local.open();
}

beforeEach(async () => {
  server = await pgliteDb();
  down = false;
  await resetPhone();
});

describe('identity', () => {
  it('makes a 128-bit code that survives grouping, spaces and lower case', async () => {
    const code = randomToken();
    expect(code).toMatch(/^[A-Z2-7]{26}$/);
    const typed = displayCode(code).toLowerCase();
    expect(typed).toContain(' ');
    expect(normalizeCode(typed)).toBe(code);
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('syncNow', () => {
  it('registers only after her first finished round', async () => {
    await syncNow(f);
    expect(await server.query('select id from profiles')).toHaveLength(0);
    await local.results.put(round());
    await syncNow(f);
    expect(await server.query('select id from profiles')).toHaveLength(1);
    expect((await ensureIdentity()).registered).toBe(true);
  });

  it('marks results synced and sends in batches, oldest first', async () => {
    await local.results.bulkPut(Array.from({ length: 230 }, (_, i) => round({ startedAt: new Date(2026, 0, 1, 0, i).toISOString() })));
    await syncNow(f);
    expect(await server.query('select id from results')).toHaveLength(230);
    expect(await local.results.filter((r) => r.syncedAt === null).count()).toBe(0);
    expect((await ensureIdentity()).lastBackupAt).toBeTruthy();
  });

  it('leaves results unsynced after a failure, and the next run sends them', async () => {
    await local.results.put(round());
    down = true;
    await expect(syncNow(f)).rejects.toThrow();
    expect(await local.results.filter((r) => r.syncedAt === null).count()).toBe(1);
    down = false;
    await syncNow(f);
    expect(await local.results.filter((r) => r.syncedAt === null).count()).toBe(0);
    expect(await server.query('select id from results')).toHaveLength(1);
  });

  it('stops resending rejected results and continues with later ones', async () => {
    const bad = round({ score: Number.NaN, startedAt: '2026-01-01T00:00:00.000Z' });
    const good = round({ startedAt: '2026-01-02T00:00:00.000Z' });
    await local.results.bulkPut([bad, good]);
    await syncNow(f);
    expect((await local.results.get(bad.id))?.syncRejectedAt).toBeTruthy();
    expect((await local.results.get(good.id))?.syncedAt).toBeTruthy();
    const later = round();
    await local.results.put(later);
    await syncNow(f);
    expect((await local.results.get(later.id))?.syncedAt).toBeTruthy();
    expect(await server.query('select id from results')).toHaveLength(2);
  });

  it('flags backup as inactive when the profile cap is reached, and keeps results locally', async () => {
    for (const owner of ['A', 'B', 'C']) {
      await f('/api/profiles', { method: 'POST', headers: { authorization: `Bearer ${owner.repeat(26)}` }, body: JSON.stringify({ viewHash: await sha256Hex(owner) }) });
    }
    await local.results.put(round());
    await syncNow(f);
    expect((await ensureIdentity()).backupInactive).toBe(true);
    expect(await local.results.count()).toBe(1);
  });

  it('notices when the link was replaced on another device', async () => {
    await local.results.put(round());
    await syncNow(f);
    const { recoveryCode } = await ensureIdentity();
    await f('/api/view-link', { method: 'PUT', headers: { authorization: `Bearer ${recoveryCode}` }, body: JSON.stringify({ viewHash: await sha256Hex('other') }) });
    await syncNow(f);
    expect((await ensureIdentity()).viewLinkReplacedElsewhere).toBe(true);
  });
});

describe('restoreFromCode', () => {
  async function backedUpPhone(rounds = 2) {
    await local.results.bulkPut(Array.from({ length: rounds }, () => round()));
    await local.gameState.put({ gameId: 'speed', stage: 1, totalTrials: 80, updatedAt: '2026-11-01T00:00:00.000Z', staircase: { value: 125, correctRun: 0, direction: null, reversals: [] }, extra: {} });
    await syncNow(f);
    return ensureIdentity();
  }

  it('restores history on a new phone, tolerating spaces and case, with a new link', async () => {
    const old = await backedUpPhone();
    await resetPhone();
    await restoreFromCode(displayCode(old.recoveryCode).toLowerCase(), f);
    expect(await local.results.count()).toBe(2);
    expect((await local.gameState.get('speed'))?.totalTrials).toBe(80);
    const now = await ensureIdentity();
    expect(now.recoveryCode).toBe(old.recoveryCode);
    expect(now.viewToken).not.toBe(old.viewToken);
    expect((await f('/api/view', { headers: { authorization: `Bearer ${old.viewToken}` } })).status).toBe(401);
    expect((await f('/api/view', { headers: { authorization: `Bearer ${now.viewToken}` } })).status).toBe(200);
  });

  it('uploads results played before the restore, removes the old profile and frees its slot', async () => {
    const old = await backedUpPhone();
    await resetPhone();
    const played = round();
    await local.results.put(played);
    await syncNow(f); // this phone has its own profile now
    expect(await server.query('select id from profiles')).toHaveLength(2);

    await restoreFromCode(old.recoveryCode, f);
    expect(await server.query('select id from profiles')).toHaveLength(1);
    expect(await server.query('select id from results')).toHaveLength(3);
    expect(await local.results.count()).toBe(3);
    expect(await local.results.filter((r) => r.syncedAt === null).count()).toBe(0);
  });

  it('leaves local data and the old link untouched when interrupted partway', async () => {
    const old = await backedUpPhone(600); // more than one page
    await resetPhone();
    const played = round();
    await local.results.put(played);
    const before = await ensureIdentity();

    let calls = 0;
    const failing: typeof fetch = async (input, init) => {
      calls += 1;
      if (calls === 2) throw new TypeError('network down');
      return f(input, init);
    };
    await expect(restoreFromCode(old.recoveryCode, failing)).rejects.toBeInstanceOf(RestoreError);
    expect(await local.results.count()).toBe(1);
    expect((await ensureIdentity()).recoveryCode).toBe(before.recoveryCode);
    expect((await f('/api/view', { headers: { authorization: `Bearer ${old.viewToken}` } })).status).toBe(200);
  });

  it('reports an unknown code without changing anything', async () => {
    await local.results.put(round());
    await expect(restoreFromCode(randomToken(), f)).rejects.toMatchObject({ reason: 'not_found' });
    expect(await local.results.count()).toBe(1);
  });
});

describe('replaceViewLink', () => {
  it('ends the old link and keeps it if the network fails', async () => {
    await local.results.put(round());
    await syncNow(f);
    const before = await ensureIdentity();
    down = true;
    await expect(replaceViewLink(f)).rejects.toThrow();
    expect((await ensureIdentity()).viewToken).toBe(before.viewToken);
    down = false;
    await replaceViewLink(f);
    const after = await ensureIdentity();
    expect(after.viewToken).not.toBe(before.viewToken);
    expect((await f('/api/view', { headers: { authorization: `Bearer ${before.viewToken}` } })).status).toBe(401);
  });
});
