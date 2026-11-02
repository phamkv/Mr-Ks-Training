import type { GameState, RoundResult } from '../core/game';
import { mergeGameStates, mergeSettings } from '../core/mergeState';
import { db, type Identity } from '../storage/db';
import { getSettings } from '../storage/store';
import { ensureIdentity, normalizeCode, randomToken, sha256Hex } from './identity';

const BATCH = 100;
type Fetch = typeof fetch;

function request(f: Fetch, method: string, path: string, token: string, body?: unknown) {
  return f(path, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function patchIdentity(change: Partial<Identity>): Promise<Identity> {
  const current = await ensureIdentity();
  const next = { ...current, ...change };
  await db.identity.put(next);
  return next;
}

// Work left over from a restore or a replaced link, retried on every sync until it succeeds.
async function flushPending(f: Fetch, identity: Identity): Promise<Identity> {
  let current = identity;
  if (current.pendingViewToken) {
    const response = await request(f, 'PUT', '/api/view-link', current.recoveryCode, { viewHash: await sha256Hex(current.pendingViewToken) });
    if (!response.ok) throw new Error(`view-link ${response.status}`);
    current = await patchIdentity({ viewToken: current.pendingViewToken, pendingViewToken: null, viewLinkReplacedElsewhere: false });
  }
  if (current.orphanCode) {
    const response = await request(f, 'DELETE', '/api/profiles', current.orphanCode);
    if (!response.ok && response.status !== 401) throw new Error(`delete ${response.status}`);
    current = await patchIdentity({ orphanCode: null });
  }
  return current;
}

export async function syncNow(f: Fetch = fetch): Promise<void> {
  let identity = await ensureIdentity();
  const unsent = () => db.results.filter((r) => r.syncedAt === null && r.syncRejectedAt === null).toArray();
  if ((await db.results.count()) === 0) return; // a profile is registered after her first finished round

  if (!identity.registered) {
    const response = await request(f, 'POST', '/api/profiles', identity.recoveryCode, { viewHash: await sha256Hex(identity.viewToken ?? randomToken()) });
    if (response.status === 403) {
      await patchIdentity({ backupInactive: true });
      return;
    }
    if (!response.ok) throw new Error(`profiles ${response.status}`);
    identity = await patchIdentity({ registered: true, backupInactive: false });
  }
  identity = await flushPending(f, identity);

  for (;;) {
    const pending = (await unsent()).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).slice(0, BATCH);
    const settings = await getSettings();
    const states = await db.gameState.toArray();
    const response = await request(f, 'POST', '/api/sync', identity.recoveryCode, {
      viewHash: identity.viewToken && !identity.pendingViewToken ? await sha256Hex(identity.viewToken) : null,
      results: pending,
      settings: { language: settings.language, daysPerWeek: settings.daysPerWeek, settingsUpdatedAt: settings.settingsUpdatedAt },
      gameState: Object.fromEntries(states.map((state) => [state.gameId, state])),
    });
    if (response.status === 401) {
      await patchIdentity({ registered: false });
      throw new Error('sync 401');
    }
    if (!response.ok) throw new Error(`sync ${response.status}`);
    const body = (await response.json()) as { acceptedIds: string[]; rejectedIds: string[]; viewLinkCurrent: boolean };
    const now = new Date().toISOString();
    await db.transaction('rw', db.results, async () => {
      await db.results.where('id').anyOf(body.acceptedIds).modify({ syncedAt: now });
      await db.results.where('id').anyOf(body.rejectedIds).modify({ syncRejectedAt: now });
    });
    identity = await patchIdentity({ lastBackupAt: now, viewLinkReplacedElsewhere: !body.viewLinkCurrent });
    const handled = body.acceptedIds.length + body.rejectedIds.length;
    if (pending.length < BATCH || handled === 0) return;
  }
}

export async function replaceViewLink(f: Fetch = fetch): Promise<void> {
  const identity = await ensureIdentity();
  const token = randomToken();
  const response = await request(f, 'PUT', '/api/view-link', identity.recoveryCode, { viewHash: await sha256Hex(token) });
  if (!response.ok) throw new Error(`view-link ${response.status}`);
  await patchIdentity({ viewToken: token, pendingViewToken: null, viewLinkReplacedElsewhere: false });
}

export class RestoreError extends Error {
  constructor(readonly reason: 'not_found' | 'failed') {
    super(reason);
  }
}

interface RestorePage {
  settings: { language: string | null; daysPerWeek: number; settingsUpdatedAt: string | null };
  gameState: Record<string, GameState>;
  results: Omit<RoundResult, 'syncedAt' | 'syncRejectedAt'>[];
  nextCursor: string | null;
}

export async function restoreFromCode(input: string, f: Fetch = fetch): Promise<void> {
  const code = normalizeCode(input);
  let first: RestorePage | null = null;
  const remote: RestorePage['results'] = [];
  let cursor: string | null = null;
  // Nothing changes locally until every page has arrived.
  do {
    let response: Response;
    try {
      response = await request(f, 'GET', `/api/restore${cursor ? `?after=${cursor}` : ''}`, code);
    } catch {
      throw new RestoreError('failed');
    }
    if (response.status === 401) throw new RestoreError('not_found');
    if (!response.ok) throw new RestoreError('failed');
    const page = (await response.json()) as RestorePage;
    first ??= page;
    remote.push(...page.results);
    cursor = page.nextCursor;
  } while (cursor);

  const previous = await ensureIdentity();
  const now = new Date().toISOString();
  const backupIds = new Set(remote.map((result) => result.id));

  await db.transaction('rw', [db.results, db.gameState, db.settings, db.identity], async () => {
    const local = await db.results.toArray();
    const localIds = new Set(local.map((result) => result.id));
    await db.results.bulkPut(
      remote.filter((result) => !localIds.has(result.id)).map((result) => ({ ...result, syncedAt: now, syncRejectedAt: null })),
    );
    // Results played here but missing from the backup upload to it on the next sync.
    await db.results.bulkPut(local.map((result) => ({ ...result, syncedAt: backupIds.has(result.id) ? now : null, syncRejectedAt: null })));

    const states = Object.fromEntries((await db.gameState.toArray()).map((state) => [state.gameId, state]));
    await db.gameState.bulkPut(Object.values(mergeGameStates(states, first!.gameState)));

    const settings = await getSettings();
    if (first!.settings.settingsUpdatedAt) {
      const merged = mergeSettings(
        { language: settings.language as string | null, daysPerWeek: settings.daysPerWeek, settingsUpdatedAt: settings.settingsUpdatedAt },
        first!.settings,
      );
      await db.settings.put({
        ...settings,
        language: merged.language as typeof settings.language,
        daysPerWeek: merged.daysPerWeek,
        settingsUpdatedAt: merged.settingsUpdatedAt,
        seenDemos: [...new Set([...settings.seenDemos, ...remote.map((result) => result.gameId)])],
      });
    }
    await db.identity.put({
      ...previous,
      recoveryCode: code,
      viewToken: null,
      pendingViewToken: randomToken(),
      orphanCode: previous.registered && previous.recoveryCode !== code ? previous.recoveryCode : previous.orphanCode,
      registered: true,
      backupInactive: false,
      viewLinkReplacedElsewhere: false,
    });
  });

  // Local data is safe from here. Anything that fails below retries on later syncs.
  await syncNow(f).catch(() => requestSync());
}

let running = false;
let again = false;
let attempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

export function requestSync(): void {
  if (running) {
    again = true;
    return;
  }
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  running = true;
  syncNow()
    .then(() => {
      attempt = 0;
    })
    .catch(() => {
      attempt += 1;
      retryTimer = setTimeout(requestSync, Math.min(30_000 * 2 ** (attempt - 1), 600_000));
    })
    .finally(() => {
      running = false;
      if (again) {
        again = false;
        requestSync();
      }
    });
}

// Syncs on open, on reconnecting and after rounds, and doesn't rely on background sync.
export function startAutoSync(): () => void {
  void ensureIdentity();
  requestSync();
  window.addEventListener('online', requestSync);
  return () => {
    window.removeEventListener('online', requestSync);
    if (retryTimer) clearTimeout(retryTimer);
  };
}
