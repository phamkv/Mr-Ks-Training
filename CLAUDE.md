# Mr. K's Training (`pcogni`)

An installable PWA with a daily brain-game set of about 10 minutes, built for one older player on her iPhone, in Vietnamese first. Her child follows progress through a private read-only link. It isn't a public product. Live at https://pcogni.vercel.app.

Vite, React and TypeScript with Dexie (IndexedDB) on the phone. Results save locally first, then back up through one Vercel Function (`api/index.ts`, routes in `server/`) to Neon Postgres.

## Further context

Read these before changing the matching area:

- `PRODUCT.md`: users, principles, accessibility needs, terminology and required honesty in copy. Read before any user-facing change.
- `DESIGN.md`: the design system. `.impeccable/surfaces/src-screens-home-tsx.md` holds the direction contract for the daily loop.
- `docs/agents/plans/2026-11-02-language-friendly-cognitive-game-pwa.md`: scope, game specs, decisions, accounts and progress. Phase 4 (Odd one out, README) is still open, so `src/core/registry.ts` has 5 of the planned 6 games.
- `docs/agents/research/2026-10-26-cognitive-training-apps.md`: background research.

## Test

```sh
npm run typecheck   # also checks de.ts and vi.ts have every key in en.ts
npm test            # Vitest unit tests
npm run test:e2e    # Playwright, about 6 minutes
```

The e2e tests build to `dist-e2e` with `VITE_E2E=1` and start their own servers, so ports 4173 and 4174 must be free. They need `npx playwright install webkit chromium`. There is no ESLint.

## Build

```sh
npm run build       # outputs to dist/
```

## Run

```sh
npm run dev         # app, Vite's default port
npm run dev:api     # API on in-memory PGlite at :4174, needed for backup features
```

Vite proxies `/api` to the local API. `npm run preview` serves the production build with the same proxy and the CSP from `vercel.json`.

## Deploy

Ask the user before deploying or migrating: both affect production and her live data.

Deploy from this machine with the CLI, using the token from the Keychain. The GitHub repo (`origin`, public) only holds the source:

```sh
npm run typecheck && npm test && npm run build
npm run db:migrate   # only if server/schema.sql changed; runs against production Neon
VERCEL_TOKEN=$(security find-generic-password -s vercel-token -w) npx vercel@latest deploy --prod
```

`.env.local` points at the production database. The Vercel project needs `DATABASE_URL`, and `MAX_PROFILES` is optional (default 3). Never print, log or commit the token or connection strings, and pass the token through the environment rather than `--token`.

## Gotchas

- Import with `.js` extensions in `api/` and `server/`, or the deployed function breaks.
- Every supported file in `api/` becomes its own function, so routes go in `server/routes.ts`.
- Keep `server/dbPglite.ts` out of anything `api/index.ts` imports, so the Postgres WASM build isn't bundled.
- `server/schema.sql` only uses `create ... if not exists`, so it's safe to re-run, but editing an existing table there changes nothing in production. Add an explicit `alter table`.
- Update the CSP in `vercel.json` if the app needs a new origin. `vite preview` reads its headers from the same file.
