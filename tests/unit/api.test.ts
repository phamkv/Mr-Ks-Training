import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import type { Db } from '../../server/db';
import { pgliteDb } from '../../server/dbPglite';
import { handle } from '../../server/routes';

let db: Db;
let logs: Record<string, unknown>[];
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const OWNER = 'A'.repeat(26);
const VIEW = 'B'.repeat(26);

function call(method: string, path: string, token: string | null, body?: unknown, maxProfiles = 3) {
  const request = new Request(`http://local${path}`, {
    method,
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return handle(request, { db, maxProfiles, log: (line) => logs.push(line) });
}

const result = (over: Record<string, unknown> = {}) => ({
  id: randomUUID(), gameId: 'speed', startedAt: '2026-11-02T09:00:00.000Z', durationMs: 300_000, localDate: '2026-11-02',
  trials: 40, correct: 32, stage: 1, score: 120, meta: { frameMs: 16.7 }, language: 'vi', appVersion: '0.1.0', ...over,
});

const register = (owner = OWNER, view = VIEW) => call('POST', '/api/profiles', owner, { viewHash: hash(view) });
const syncBody = (results: unknown[], over: Record<string, unknown> = {}) => ({ viewHash: hash(VIEW), results, ...over });

beforeEach(async () => {
  db = await pgliteDb();
  logs = [];
});

describe('profiles', () => {
  it('repeating POST with the same owner returns 200 and creates no second profile', async () => {
    expect((await register()).status).toBe(201);
    expect((await register()).status).toBe(200);
    expect(await db.query('select id from profiles')).toHaveLength(1);
  });

  it('gets 403 profile_limit past MAX_PROFILES', async () => {
    for (const owner of ['A', 'B', 'C']) expect((await register(owner.repeat(26), `${owner}V`.repeat(13))).status).toBe(201);
    const response = await register('D'.repeat(26), 'DV'.repeat(13));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'profile_limit' });
  });

  it('DELETE removes the profile with its results and frees its slot', async () => {
    await register();
    await call('POST', '/api/sync', OWNER, syncBody([result()]));
    expect((await call('DELETE', '/api/profiles', OWNER)).status).toBe(200);
    expect(await db.query('select id from results')).toHaveLength(0);
    expect(await db.query('select id from profiles')).toHaveLength(0);
  });
});

describe('sync', () => {
  beforeEach(async () => {
    await register();
  });

  it('inserts each result once when the same batch is sent twice', async () => {
    const batch = [result(), result()];
    for (let i = 0; i < 2; i++) {
      const response = await call('POST', '/api/sync', OWNER, syncBody(batch));
      expect(response.status).toBe(200);
      expect((await response.json()).acceptedIds).toEqual(batch.map((r) => r.id));
    }
    expect(await db.query('select id from results')).toHaveLength(2);
    expect(logs.at(-1)).toMatchObject({ route: 'sync', results: 2, inserted: 0, duplicates: 2 });
  });

  it('gets 401 with an unknown code and creates no profile', async () => {
    expect((await call('POST', '/api/sync', 'Z'.repeat(26), syncBody([result()]))).status).toBe(401);
    expect(await db.query('select id from profiles')).toHaveLength(1);
  });

  it('gets 413 or 400 for an oversize or malformed body, and writes nothing', async () => {
    const big = result({ meta: { filler: 'x'.repeat(300_000) } });
    expect((await call('POST', '/api/sync', OWNER, syncBody([big]))).status).toBe(413);
    expect((await call('POST', '/api/sync', OWNER, 'not json')).status).toBe(400);
    expect((await call('POST', '/api/sync', OWNER, { results: 'nope' })).status).toBe(400);
    const tooMany = Array.from({ length: 101 }, () => result());
    expect((await call('POST', '/api/sync', OWNER, syncBody(tooMany))).status).toBe(400);
    expect(await db.query('select id from results')).toHaveLength(0);
  });

  it('lists one invalid result in rejectedIds and stores the rest', async () => {
    const good = result();
    const bad = result({ score: 'high' });
    const body = await (await call('POST', '/api/sync', OWNER, syncBody([bad, good]))).json();
    expect(body.rejectedIds).toEqual([bad.id]);
    expect(body.acceptedIds).toEqual([good.id]);
    expect(await db.query('select id from results')).toHaveLength(1);
  });

  it('keeps newer settings over older ones', async () => {
    const newer = { language: 'vi', daysPerWeek: 7, settingsUpdatedAt: '2026-11-02T10:00:00.000Z' };
    const older = { language: 'de', daysPerWeek: 3, settingsUpdatedAt: '2026-11-01T10:00:00.000Z' };
    await call('POST', '/api/sync', OWNER, syncBody([], { settings: newer }));
    const body = await (await call('POST', '/api/sync', OWNER, syncBody([], { settings: older }))).json();
    expect(body.settings).toEqual(newer);
  });

  it('per game, keeps the state with more trials even if the other is newer', async () => {
    const months = { gameId: 'speed', totalTrials: 5000, updatedAt: '2026-01-01T00:00:00.000Z' };
    const beginner = { gameId: 'speed', totalTrials: 10, updatedAt: '2026-11-01T00:00:00.000Z' };
    await call('POST', '/api/sync', OWNER, syncBody([], { gameState: { speed: months } }));
    const body = await (await call('POST', '/api/sync', OWNER, syncBody([], { gameState: { speed: beginner } }))).json();
    expect(body.gameState.speed.totalTrials).toBe(5000);
  });

  it('reports viewLinkCurrent false after the link is replaced elsewhere', async () => {
    expect((await (await call('POST', '/api/sync', OWNER, syncBody([]))).json()).viewLinkCurrent).toBe(true);
    await call('PUT', '/api/view-link', OWNER, { viewHash: hash('C'.repeat(26)) });
    expect((await (await call('POST', '/api/sync', OWNER, syncBody([]))).json()).viewLinkCurrent).toBe(false);
  });
});

describe('restore', () => {
  beforeEach(async () => {
    await register();
  });

  it('returns every result exactly once across pages, and changes no data', async () => {
    const all = Array.from({ length: 1100 }, () => result());
    for (let i = 0; i < all.length; i += 100) await call('POST', '/api/sync', OWNER, syncBody(all.slice(i, i + 100)));
    const before = JSON.stringify(await db.query('select * from profiles'));

    const seen: string[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const page: { results: { id: string; startedAt: string; localDate: string }[]; nextCursor: string | null } =
        await (await call('GET', `/api/restore${cursor ? `?after=${cursor}` : ''}`, OWNER)).json();
      seen.push(...page.results.map((r) => r.id));
      cursor = page.nextCursor;
      pages += 1;
      expect(page.results[0].startedAt).toBe('2026-11-02T09:00:00.000Z');
      expect(page.results[0].localDate).toBe('2026-11-02');
    } while (cursor);
    expect(pages).toBe(3);
    expect(seen).toHaveLength(1100);
    expect(new Set(seen).size).toBe(1100);
    expect(JSON.stringify(await db.query('select * from profiles'))).toBe(before);
  });
});

describe('view token', () => {
  beforeEach(async () => {
    await register();
  });

  it('cannot call sync, restore or view-link', async () => {
    expect((await call('POST', '/api/sync', VIEW, syncBody([]))).status).toBe(401);
    expect((await call('GET', '/api/restore', VIEW)).status).toBe(401);
    expect((await call('PUT', '/api/view-link', VIEW, { viewHash: hash('C'.repeat(26)) })).status).toBe(401);
    expect((await call('GET', '/api/view', OWNER)).status).toBe(401);
    expect((await call('GET', '/api/view', VIEW)).status).toBe(200);
  });

  it('stops working once replaced, and the new one works', async () => {
    const next = 'C'.repeat(26);
    await call('PUT', '/api/view-link', OWNER, { viewHash: hash(next) });
    expect((await call('GET', '/api/view', VIEW)).status).toBe(401);
    expect((await call('GET', '/api/view', next)).status).toBe(200);
  });

  it('returns speed hours and weekly summaries that match known fixtures', async () => {
    await call('POST', '/api/sync', OWNER, syncBody([
      result({ localDate: '2026-11-02', durationMs: 1_800_000, score: 200 }),
      result({ localDate: '2026-11-03', durationMs: 1_800_000, score: 100 }),
      result({ localDate: '2026-11-03', durationMs: 600_000, gameId: 'arrows', score: 1500 }),
      result({ localDate: '2026-11-09', durationMs: 300_000, score: 90 }),
    ], { settings: { language: 'vi', daysPerWeek: 3, settingsUpdatedAt: '2026-11-01T00:00:00.000Z' } }));
    const data = await (await call('GET', '/api/view', VIEW)).json();
    expect(data.daysPerWeek).toBe(3);
    expect(data.lastSyncAt).toBeTruthy();
    expect(data.totals.find((t: { gameId: string }) => t.gameId === 'speed').totalMs).toBe(3_900_000);
    expect(data.weeks).toEqual([
      { weekStart: '2026-11-02', days: 2, minutes: 70 },
      { weekStart: '2026-11-09', days: 1, minutes: 5 },
    ]);
    expect(data.trends.filter((t: { gameId: string }) => t.gameId === 'speed').map((t: { score: number }) => t.score)).toEqual([200, 100, 90]);
  });
});

describe('privacy', () => {
  it('stores only hashes, and logs contain no codes or tokens', async () => {
    await register();
    await call('POST', '/api/sync', OWNER, syncBody([result()]));
    await call('GET', '/api/view', VIEW);
    const [row] = await db.query<Record<string, unknown>>(`select encode(owner_hash, 'hex') as owner, encode(view_hash, 'hex') as view from profiles`);
    expect(row.owner).toBe(hash(OWNER));
    expect(row.view).toBe(hash(VIEW));
    const dump = JSON.stringify(await db.query('select * from profiles'));
    expect(dump).not.toContain(OWNER);
    const logged = JSON.stringify(logs);
    expect(logged).not.toContain(OWNER);
    expect(logged).not.toContain(VIEW);
    expect(logged).not.toContain(hash(OWNER));
    expect(logs.length).toBeGreaterThan(0);
  });

  it('sets no-store on every response', async () => {
    for (const response of [await register(), await call('GET', '/api/view', 'nope'), await call('GET', '/api/none', null)]) {
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
  });
});
