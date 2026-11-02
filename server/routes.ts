import { createHash } from 'node:crypto';
import { mergeGameStates, mergeSettings, type SyncedSettings } from '../src/core/mergeState.js';
import type { GameState } from '../src/core/game.js';
import type { Db } from './db.js';
import { MAX_BODY_BYTES, profileBody, resultSchema, syncBody, viewLinkBody, type ResultBody } from './validate.js';

export interface Deps {
  db: Db;
  maxProfiles: number;
  log(line: Record<string, unknown>): void;
}

const RESTORE_PAGE = 500;
const TOKEN = /^[A-Za-z0-9]{20,64}$/;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

const sha256Hex = (text: string) => createHash('sha256').update(text).digest('hex');

function bearer(request: Request): string | null {
  const match = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '');
  return match && TOKEN.test(match[1]) ? match[1] : null;
}

class HttpError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
  }
}

async function readJson(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, 'too_large');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw new HttpError(413, 'too_large');
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'bad_json');
  }
}

function parse<T>(schema: { safeParse(data: unknown): { success: true; data: T } | { success: false } }, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'invalid');
  return parsed.data;
}

interface ProfileRow {
  id: string;
  view_hash: string;
  settings: SyncedSettings;
  game_state: Record<string, GameState>;
  settings_updated_at: string | null;
  last_sync_at: string | null;
}

async function ownerProfile(db: Db, request: Request): Promise<ProfileRow> {
  const token = bearer(request);
  if (!token) throw new HttpError(401, 'unauthorized');
  const [profile] = await db.query<ProfileRow>(
    `select id, encode(view_hash, 'hex') as view_hash, settings, game_state, settings_updated_at, last_sync_at
     from profiles where owner_hash = decode($1, 'hex')`,
    [sha256Hex(token)],
  );
  if (!profile) throw new HttpError(401, 'unauthorized');
  return profile;
}

async function createProfile(request: Request, deps: Deps, info: Record<string, unknown>) {
  const token = bearer(request);
  if (!token) throw new HttpError(401, 'unauthorized');
  const { viewHash } = parse(profileBody, await readJson(request));
  const ownerHash = sha256Hex(token);
  const [existing] = await deps.db.query(`select id from profiles where owner_hash = decode($1, 'hex')`, [ownerHash]);
  if (existing) return json(200, { created: false });
  const [{ count }] = await deps.db.query<{ count: string | number }>(`select count(*) as count from profiles`);
  if (Number(count) >= deps.maxProfiles) throw new HttpError(403, 'profile_limit');
  await deps.db.query(`insert into profiles (owner_hash, view_hash) values (decode($1, 'hex'), decode($2, 'hex'))`, [ownerHash, viewHash]);
  info.created = true;
  return json(201, { created: true });
}

async function deleteProfile(request: Request, deps: Deps) {
  const profile = await ownerProfile(deps.db, request);
  await deps.db.query(`delete from profiles where id = $1`, [profile.id]);
  return json(200, { deleted: true });
}

async function sync(request: Request, deps: Deps, info: Record<string, unknown>) {
  const profile = await ownerProfile(deps.db, request);
  const body = parse(syncBody, await readJson(request));

  const valid: ResultBody[] = [];
  const rejectedIds: string[] = [];
  for (const candidate of body.results) {
    const parsed = resultSchema.safeParse(candidate);
    if (parsed.success) valid.push(parsed.data);
    else {
      const id = (candidate as { id?: unknown } | null)?.id;
      if (typeof id === 'string') rejectedIds.push(id);
    }
  }

  let inserted = 0;
  if (valid.length > 0) {
    const rows = await deps.db.query(
      `insert into results (profile_id, id, game_id, started_at, local_date, duration_ms, score, stage, trials, correct, meta, language, app_version)
       select $1::uuid, r."id", r."gameId", r."startedAt", r."localDate", r."durationMs", r."score", r."stage", r."trials", r."correct", r."meta", r."language", r."appVersion"
       from jsonb_to_recordset($2::jsonb) as r("id" uuid, "gameId" text, "startedAt" timestamptz, "localDate" date, "durationMs" integer, "score" real, "stage" smallint, "trials" integer, "correct" integer, "meta" jsonb, "language" text, "appVersion" text)
       on conflict (profile_id, id) do nothing
       returning id`,
      [profile.id, JSON.stringify(valid)],
    );
    inserted = rows.length;
  }

  const settings = body.settings ? mergeSettings(profile.settings, body.settings) : profile.settings;
  const gameState = body.gameState
    ? mergeGameStates(profile.game_state, body.gameState as unknown as Record<string, GameState>)
    : profile.game_state;
  await deps.db.query(
    `update profiles set settings = $2::jsonb, game_state = $3::jsonb, settings_updated_at = $4, last_sync_at = now() where id = $1`,
    [profile.id, JSON.stringify(settings), JSON.stringify(gameState), settings.settingsUpdatedAt ?? null],
  );

  info.results = body.results.length;
  info.inserted = inserted;
  info.duplicates = valid.length - inserted;
  return json(200, {
    acceptedIds: valid.map((result) => result.id),
    rejectedIds,
    viewLinkCurrent: body.viewHash === null || body.viewHash === profile.view_hash,
    settings,
    gameState,
  });
}

async function restore(request: Request, deps: Deps, url: URL) {
  const profile = await ownerProfile(deps.db, request);
  const after = url.searchParams.get('after');
  const rows = await deps.db.query<Record<string, unknown>>(
    `select id, game_id as "gameId", to_char(started_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "startedAt",
            to_char(local_date, 'YYYY-MM-DD') as "localDate", duration_ms as "durationMs", score, stage, trials, correct, meta, language, app_version as "appVersion"
     from results where profile_id = $1 and ($2::uuid is null or id > $2::uuid)
     order by id limit $3`,
    [profile.id, after, RESTORE_PAGE],
  );
  return json(200, {
    settings: profile.settings,
    gameState: profile.game_state,
    results: rows,
    nextCursor: rows.length === RESTORE_PAGE ? rows[rows.length - 1].id : null,
  });
}

async function replaceViewLink(request: Request, deps: Deps) {
  const profile = await ownerProfile(deps.db, request);
  const { viewHash } = parse(viewLinkBody, await readJson(request));
  await deps.db.query(`update profiles set view_hash = decode($2, 'hex') where id = $1`, [profile.id, viewHash]);
  return json(200, { replaced: true });
}

async function view(request: Request, deps: Deps) {
  const token = bearer(request);
  if (!token) throw new HttpError(401, 'unauthorized');
  const [profile] = await deps.db.query<ProfileRow>(
    `select id, settings, last_sync_at from profiles where view_hash = decode($1, 'hex')`,
    [sha256Hex(token)],
  );
  if (!profile) throw new HttpError(401, 'unauthorized');
  const trends = await deps.db.query<{ gameId: string; date: string; stage: number; score: number; rounds: number }>(
    `select game_id as "gameId", to_char(local_date, 'YYYY-MM-DD') as date, stage, avg(score)::float8 as score, count(*)::int as rounds
     from results where profile_id = $1 group by game_id, local_date, stage order by local_date`,
    [profile.id],
  );
  const totals = await deps.db.query<{ gameId: string; totalMs: number }>(
    `select game_id as "gameId", sum(duration_ms)::float8 as "totalMs" from results where profile_id = $1 group by game_id`,
    [profile.id],
  );
  const weeks = await deps.db.query<{ weekStart: string; days: number; minutes: number }>(
    `select to_char(date_trunc('week', local_date::timestamp), 'YYYY-MM-DD') as "weekStart",
            count(distinct local_date)::int as days, round(sum(duration_ms) / 60000.0)::int as minutes
     from results where profile_id = $1 group by 1 order by 1`,
    [profile.id],
  );
  return json(200, {
    lastSyncAt: profile.last_sync_at,
    daysPerWeek: profile.settings?.daysPerWeek ?? 5,
    totals,
    weeks,
    trends,
  });
}

// One entry point for every route: Vercel advises keeping related routes in one function.
export async function handle(request: Request, deps: Deps): Promise<Response> {
  const started = Date.now();
  const url = new URL(request.url);
  const route = `${request.method} ${url.pathname}`;
  const info: Record<string, unknown> = { route: url.pathname.replace('/api/', '') };
  let response: Response;
  try {
    switch (route) {
      case 'POST /api/profiles': response = await createProfile(request, deps, info); break;
      case 'DELETE /api/profiles': response = await deleteProfile(request, deps); break;
      case 'POST /api/sync': response = await sync(request, deps, info); break;
      case 'GET /api/restore': response = await restore(request, deps, url); break;
      case 'PUT /api/view-link': response = await replaceViewLink(request, deps); break;
      case 'GET /api/view': response = await view(request, deps); break;
      default: response = json(404, { error: 'not_found' });
    }
  } catch (error) {
    if (error instanceof HttpError) {
      info.error = error.code;
      response = json(error.status, { error: error.code });
    } else {
      info.error = 'server_error';
      response = json(500, { error: 'server_error' });
    }
  }
  deps.log({ ...info, status: response.status, ms: Date.now() - started });
  return response;
}
