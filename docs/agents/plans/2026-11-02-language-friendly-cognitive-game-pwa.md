---
date: 2026-11-02T15:03:26.543970+00:00
git_commit: "n/a (not a git repository yet)"
branch: "n/a"
topic: "Cognitive game PWA for one older player, in German, English and Vietnamese"
tags: [plan, pwa, ios, vercel, neon, cognitive-games, speed-of-processing, i18n]
status: draft
---

# PLAN: Cognitive game PWA for one older player

Build a small installable web game for the user's mum, played daily on an iPhone 17 Pro Max (newest iOS) and also usable in a normal browser. Each session lasts about 10 minutes: a speed-of-processing game modelled on the ACTIVE trial's task, then 2 rotating games. Progress is saved on the phone, backed up to a free database, and visible to the user through a private read-only link.

The app is free, personal and non-commercial, so it fits the Vercel Hobby plan. It makes no claim to prevent dementia. The ACTIVE result is promising but was not obtained on a phone or at this dose (see decision 1).

Based on `docs/agents/research/2026-10-26-cognitive-training-apps.md`.

## Acceptance Criteria

1. She can install the app on her iPhone's Home Screen and play offline.
2. It also runs in a normal browser, where progress is stored separately unless the recovery code is used.
3. One Start button runs a set of about 10 minutes: the speed game, then 2 rotating games.
4. The pool has 6 games: speed, memory grid, arrows, tap/don't tap, switch rule and Odd one out.
5. Each game adjusts its difficulty to hold her at about 80% correct.
6. She can choose 3, 5 or 7 days a week (default 5), and missed days carry no penalty.
7. Menus and word sets work in German, English and Vietnamese.
8. No game needs typing, and Odd one out doesn't rely on letters or grammar.
9. Results save on the phone first and sync to the backup when she's online, with no duplicates.
10. A recovery code restores her history on a new phone.
11. A private link gives the user a read-only view of trends and speed hours, and it can be replaced.
12. Her screen shows only days played, minutes and personal bests.
13. The app never shows a brain age, a health verdict or comparisons with other people.
14. The app makes no promise to prevent dementia, and the private view says it isn't a health check.
15. A new game can be added as one module plus one registry entry, without changing core code.
16. Normal use stays within the Vercel Hobby and Neon free limits.

## Technical Key Decisions and Tradeoffs

1. **Speed game as the daily core:** it runs first in every set, and every other game is there for variety.
   - Why: in ACTIVE, only speed training with boosters was linked to fewer dementia diagnoses (HR 0.75, 95% CI 0.59–0.95). Without boosters the HR was 1.01, and memory and reasoning training showed no effect. ACTIVE used up to 10 sessions of 60–75 minutes in small groups, plus boosters of up to 4 sessions of 75 minutes at 11 and 35 months.
   - Impact: the speed game is the first thing built. A phone version at 5 minutes a session is untested, and no copy may imply otherwise.
2. **Session and schedule:** about 10 minutes per set (5 speed, 2.5 each for 2 rotating games), with a weekly target of 3, 5 or 7 days and a default of 5.
   - Why: at these targets she reaches 10 speed hours in about 40, 24 or 17 weeks. Rigid streaks can make people quit once they break.
   - Impact: progress is a Monday-to-Sunday count with no streak. Playing past the first 10 hours simply continues, standing in for ACTIVE's boosters, which is also untested.
3. **Frontend:** Vite 8, React 19 and TypeScript as a static PWA using `vite-plugin-pwa`.
   - Why: the app is offline-first and needs no server rendering. `vite-plugin-pwa` 2.0.0 and `@vitejs/plugin-react` 6.2.1 both declare Vite 8 support.
   - Impact: flash timing runs in plain `requestAnimationFrame` code outside React rendering.
4. **On-phone storage:** IndexedDB through Dexie, with results as an append-only log.
   - Why: she can play offline, and unique client-generated IDs make retries safe.
   - Impact: every result has a UUID and a `syncedAt` field from Phase 1, so Phase 3 can back up results saved earlier without a data migration.
5. **Backend:** one Vercel Function, `api/index.ts`, plus Neon Postgres in the user's own Neon organization `phamkv` (`org-snowy-dream-17695077`), created directly with the Neon CLI.
   - Why: Neon free projects aren't paused for inactivity (100 CU-hours, 1 GB). Vercel advises keeping related routes in one function. By estimate, one player uses about 300 function calls a month out of 1M.
   - Impact: route modules live in `server/`, outside `api/`, because every supported file in `api/` becomes its own function. `vercel.json` rewrites must exclude `/api`.
6. **Access without accounts:** the phone generates a 128-bit recovery code and a separate 128-bit view token. The server stores only their SHA-256 hashes.
   - Why: she has nothing to remember, and email links would open in Safari, whose storage is separate from the Home Screen app.
   - Impact: the server cannot show the view link again. Restoring on a new phone creates a new link and ends the old one. No name, email or birth date is ever collected. A profile is registered through its own call after her first finished round, so `/api/sync` can reject every unknown code with `401`.
7. **Abuse limits on a public API:** `MAX_PROFILES` (default 3) caps new profiles, each sync accepts at most 100 results and 256 KB, and each result is schema-validated on its own.
   - Why: a client app can't keep a secret, so anyone who finds the API could otherwise fill the free database.
   - Impact: a new profile beyond the cap gets `403 profile_limit`. The app keeps working locally and shows the backup as not active. An invalid result is rejected individually, so it can't block the ones after it.
8. **Speed game design:** portrait layout with a centre car or truck and an outer car in 1 of 8 positions, followed by a mask and 2 untimed questions.
   - Why: this follows the published UFOV structure. It measures flash length rather than tap speed, so touch latency barely matters.
   - Impact: both answers must be right for a trial to count as correct. Actual displayed duration is recorded for every trial.
9. **Difficulty:** a shared 3-correct-down, 1-wrong-up staircase, converging at about 79.4% correct.
   - Why: this is the research doc's standard rule for about 80% accuracy.
   - Impact: every game supplies an ordered list of level values, easiest first. State stores the level's value, not its position, and maps to the nearest available level at round start, so a change of frame rate can't change her difficulty or go out of bounds. A round's `score` is the mean of its last 6 reversal values, or the current value with fewer than 6, in the game's own unit (ms, tiles or level).
10. **Game modules:** each game implements one `GameModule` interface and is listed in one registry.
    - Why: the user wants to add games later.
    - Impact: each module carries its own strings in all 3 languages. The set generator, storage, progress, sync and private view work from the registry and never name a game. Phase 4 proves this by changing only its own folder, the registry line and the README.
11. **Languages:** German, English and Vietnamese with a small typed `t()` helper and no i18n library for app menus, and per-module strings for games. Odd one out sets are written per language, not translated.
    - Why: the app has few strings, and Vietnamese and German word lengths need separate layout checks.
    - Impact: English is the source of the key types, so a missing translation fails type-checking. Native speakers review the German and Vietnamese before Odd one out ships.
14. **Merging state on restore:** each game's state keeps `totalTrials` and `updatedAt`. The state with the most trials wins, and `updatedAt` breaks ties. Settings use the newest `settingsUpdatedAt`.
    - Why: a single timestamp would let one beginner round on a new phone overwrite months of real progress.
    - Impact: the same rule runs on the server during sync and on the phone during restore, from one shared function.
15. **Time and interrupted rounds:** `durationMs` and round limits count only active time. If the app closes mid-round, that round is discarded and the game restarts; finished rounds are always kept.
    - Why: a locked phone shouldn't inflate minutes or speed hours, and partial staircase data isn't worth the complexity.
    - Impact: the runner pauses its clock on `visibilitychange`, and a restored page resumes the same round if it is still in memory.
12. **Reduced-pressure feedback:** her screens show only days, minutes and new personal bests. Trends exist only in the private view.
    - Why: scores flatten after early learning, and dips would worry her for no good reason. There are no norm data to compare against.
    - Impact: results are stored in full, but her screens read only positive summaries. The private view states that a drop can have ordinary causes and that memory concerns belong with her doctor.
13. **No notifications, analytics or ad SDKs:** none in this version.
    - Why: the user can set an iPhone alert if she wants one. Third-party analytics adds privacy risk with no benefit for one player.
    - Impact: no push setup, no scheduled server job and no third-party scripts.

## Current State

```
pcogni/                    no app code, not a git repository
├── .claude/skills/rpi-*
└── docs/agents/
    ├── research/2026-10-26-cognitive-training-apps.md
    └── plans/
```

Facts checked during planning:

| Area | Fact |
|---|---|
| Vercel Hobby | Personal, non-commercial use only. 1M function calls, 100 GB transfer and 4 CPU-hours a month. Going over generally pauses the feature for up to 30 days, with no charge. |
| Vercel runtime | Node 22, 24 and 26 available, 26 by default. Local Node is 26.13.0. |
| iOS storage | Home Screen and Safari storage are separate. WebKit may grant `navigator.storage.persist()` based on heuristics, with Home Screen use given as an example. Unused sites can still be evicted. |
| iOS animation | `requestAnimationFrame` isn't guaranteed to reach 60 fps, and Low Power Mode caps it at 30 fps. Behaviour on 120 Hz displays is unconfirmed, so the app measures it at runtime. |

### Accounts and access

Vercel and Neon can both be reached from this machine now. Neither contains any app code or tables yet.

| Service | State | How to reach it |
|---|---|---|
| Vercel | Account `phamkv`, no projects yet. Hobby plan. | Token in the macOS Keychain, item `vercel-token`. Use `VERCEL_TOKEN=$(security find-generic-password -s vercel-token -w) npx vercel@latest <command>`. The Vercel CLI isn't installed globally. |
| Neon | Organization `phamkv` (`org-snowy-dream-17695077`), Free plan. Project `pcogni` (`patient-frost-12496160`), branch `main`, region AWS Europe (Frankfurt). | Neon CLI signed in with the user's browser login. `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are in `.env.local`. The project is linked through `.neon`. |

Never print, log or commit the Vercel token or the Neon connection strings. Pass the token through the environment, not the `--token` flag, which can show up in process lists.

## Desired End State

```
 iPhone (Home Screen PWA)                         Vercel Hobby
┌────────────────────────────────────┐           ┌───────────────────────────┐
│ React screens                      │           │ Static files (CDN)        │
│  Home ▶ Set ▶ Game ▶ Round summary │           │                           │
│                                    │  HTTPS    │ api/index.ts (one handler)│
│                                    │           │  POST /api/profiles       │
│                                    │           │  DELETE /api/profiles     │
│ Game modules ─▶ Staircase          │◀─────────▶│  POST /api/sync           │
│      │                             │  on open, │  GET  /api/restore        │
│      ▼                             │  after    │  PUT  /api/view-link      │
│ Dexie (IndexedDB)                  │  rounds,  │  GET  /api/view           │
│  results, settings, gameState,     │  on online│           │               │
│  identity, todaysSet               │           └───────────┼───────────────┘
│                                    │                       ▼
│ Service worker: offline app files  │           ┌───────────────────────────┐
└────────────────────────────────────┘           │ Neon Postgres (Frankfurt) │
                                                 │  profiles, results        │
 User's browser                                  └───────────▲───────────────┘
┌────────────────────────────────────┐                       │
│ /view#<token>  read-only trends    │───GET /api/view───────┘
└────────────────────────────────────┘
```

### Her home screen

```
┌────────────────────────────┐
│  Good morning          ⚙   │
│                            │
│  This week                 │
│  ● ● ● ○ ○                 │
│  3 of 5 days               │
│                            │
│  ┌──────────────────────┐  │
│  │  Start today's set   │  │
│  │  about 10 minutes    │  │
│  └──────────────────────┘  │
│                            │
│  This week: 32 minutes     │
│  New best: Speed game      │
└────────────────────────────┘
```

Once the set is done, the button area reads "Done for today" with a smaller "Play another set" button. Extra sets add minutes but no extra days.

### Speed game trial

```
 Focus         Flash            Cover           Question 1        Question 2
┌─────────┐   ┌─────────┐     ┌─────────┐     ┌─────────┐      ┌─────────┐
│         │   │ ·  ·  · │     │ ▒▒▒▒▒▒▒ │     │ Which   │      │ Where   │
│    +    │ ▶ │ · car · │ ▶   │ ▒▒▒▒▒▒▒ │ ▶   │ was in  │ ▶    │ was the │
│         │   │ car · · │     │ ▒▒▒▒▒▒▒ │     │ centre? │      │ outer   │
│         │   │         │     │         │     │[car]    │      │ car?    │
│         │   │         │     │         │     │[truck]  │      │(8 spots)│
└─────────┘   └─────────┘     └─────────┘     └─────────┘      └─────────┘
  500 ms       500 ms to       300 ms           no time limit     no time limit
               1 frame
```

### Rotating games

```
 Memory grid        Arrows              Tap/don't tap        Switch rule        Odd one out
┌───────────┐      ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌───────────┐
│ ▢ ■ ▢ ▢   │      │           │       │           │       │ Rule: ●/■ │      │ Which one │
│ ▢ ▢ ▢ ■   │      │  ← ← → ←  │       │     ●     │       │           │      │ doesn't   │
│ ■ ▢ ▢ ▢   │      │           │       │           │       │    ◯      │      │ fit?      │
│ ▢ ▢ ■ ▢   │      │ [ ← ] [ → ]│      │  [ TAP ]  │       │ [ ● ] [ ■ ]│     │[Apfel][Birne]
│ Tap them  │      │ Middle    │       │ ● tap     │       │ Answer by │      │[Stuhl][Banane]
│ back      │      │ arrow     │       │ ■ wait    │       │ the rule  │      │           │
└───────────┘      └───────────┘       └───────────┘       └───────────┘      └───────────┘
```

### Settings and backup

```
┌────────────────────────────┐
│ ← Settings                 │
│ Language: Deutsch ▾        │
│ Days a week: 3  [5]  7     │
│                            │
│ Backup                     │
│ Last backup: today, 09:12  │
│ [ Show recovery code ]     │
│ [ Share private link ]     │
│ [ Replace private link ]   │
│ [ Restore from code ]      │
│                            │
│ About                      │
│ Version, storage, display  │
└────────────────────────────┘
```

### Private view

```
┌───────────────────────────────────────────┐
│ Progress                Last sync: today  │
│ Speed training: 6.5 of 10 hours           │
│ Days played: ●●●○○ this week (target 5)   │
│                                           │
│ Speed game: shortest flash (lower = better)
│  ╲__                                      │
│     ╲__╱‾‾                                │
│ Memory grid: tiles remembered             │
│  __╱‾‾╲_                                  │
│ ...                                       │
│                                           │
│ This is not a health check. Scores vary   │
│ with sleep, mood and practice. If you are │
│ worried about her memory, speak to her    │
│ doctor.                                   │
└───────────────────────────────────────────┘
```

## Abstractions and Code Reuse

No existing code to reuse. New abstractions:

- `package.json` - scripts, exact dependency versions, `engines.node: "26.x"`
- `vite.config.ts` - React and `VitePWA` plugins, manifest, `navigateFallbackDenylist: [/^\/api\//]`
- `vercel.json` - rewrite `/((?!api(?:/|$)).*)` to `/index.html`, rewrite `/api/:path*` to `/api/index`, security headers
- `src/core/`
  - `staircase.ts` - `Staircase`: serializable 3-down/1-up over an ordered level list, with reversals and threshold estimate
  - `game.ts` - `GameModule`, `GameProps`, `RoundResult` types
  - `registry.ts` - `games`: the one list of game modules
  - `setGenerator.ts` - `buildSet`: speed first, then 2 least-recently-played rotating games
  - `mergeState.ts` - `mergeGameStates`, `mergeSettings`: shared rules for sync and restore
  - `week.ts` - `weekProgress`: Monday-based days and minutes from results
  - `bests.ts` - `newBests`: personal bests per game and stage
- `src/core/timing/flash.ts` - `measureFrameInterval`, `presentFlash`: rAF-based display and measurement
- `src/storage/db.ts` - Dexie schema: `results`, `settings`, `gameState`, `identity`, `todaysSet`
- `src/i18n/` - `t()`, `en.ts` (source of keys), `de.ts`, `vi.ts`
- `src/games/<id>/` - one folder per game: `index.ts` module, game component, demo, its strings in 3 languages, tests
- `src/games/oddOneOut/words/{de,en,vi}.json` - word sets
- `src/screens/` - `Home`, `SetRunner`, `RoundSummary`, `Settings`, `InstallHelp`, `LanguagePick`, `Restore`, `PrivateView`
- `src/sync/` - `identity.ts` (codes and hashes), `client.ts` (`syncNow`, `restoreFromCode`, `replaceViewLink`)
- `api/index.ts` - the only function: fetch handler that routes to `server/routes.ts`
- `server/`
  - `routes.ts` - sync, restore, view-link and view handlers
  - `db.ts` - `Db` interface with Neon and PGlite adapters
  - `schema.sql` - tables, applied by `npm run db:migrate`
  - `validate.ts` - Zod request schemas, shared types
- `scripts/dev-api.ts` - serves `api/index.ts` locally on PGlite for e2e and development, behind a Vite `/api` proxy
- `tests/e2e/` - Playwright tests

Core types:

```ts
export interface GameModule {
  id: string;
  role: 'core' | 'rotating';
  targetMs: number;            // speed 300_000, others 150_000
  messages: Record<Language, GameMessages>; // title, instructions, score label
  scoreUnit: 'ms' | 'tiles' | 'level';
  scoreDirection: 'lower-better' | 'higher-better';
  initialState(): GameState;
  Demo: ComponentType<{ onDone(): void }>;
  Game: ComponentType<GameProps>;
}

export interface RoundResult {
  id: string;                  // UUID from the phone
  gameId: string;
  startedAt: string;           // ISO
  durationMs: number;          // active time only, excluding pauses
  localDate: string;           // YYYY-MM-DD on her phone
  trials: number;
  correct: number;
  stage: number;
  score: number;               // mean of last 6 reversal values, in scoreUnit
  meta: Record<string, unknown>; // e.g. frameMs, requested and actual flash stats
  language: Language;
  appVersion: string;
  syncedAt: string | null;
  syncRejectedAt: string | null; // kept locally, not retried
}
```

## Logging & Observability

Vercel Hobby keeps runtime logs for 1 hour, so logs are only for live debugging. The API writes one JSON line per request and never logs tokens, codes or payloads:

```json
{"route":"sync","status":200,"results":3,"inserted":2,"duplicates":1,"ms":42}
{"route":"sync","status":403,"error":"profile_limit","ms":7}
```

The app has no remote logging. Settings > About shows the app version, last backup, whether storage is persistent and the measured frame interval. The private view shows the last sync time.

## Implementation

### Phase 1: Speed game on her phone

Dependencies: None

Deliver an installed, offline, multi-language app with the speed game saving results locally. She can start playing from here, and those results will be backed up in Phase 3.

**Tasks**:
- [ ] Run `git init` and confirm `.gitignore` (created by `neon init`) covers `node_modules`, `dist`, `.vercel`, `.env*` and `.neon`, adding any that are missing, before anything is committed
- [ ] Create `package.json` with exact versions of Vite, React, TypeScript, `vite-plugin-pwa`, Dexie, Vitest and Playwright, plus `engines.node: "26.x"` and the scripts `dev`, `build`, `typecheck`, `test` and `test:e2e`
- [ ] Pin a lower TypeScript version if TypeScript 7 fails with any dependency, and record the reason in Implementation Notes
- [ ] Create `vite.config.ts` with a manifest (`display: standalone`, `orientation: portrait`, `start_url: /`, icons including `apple-touch-icon`) and precaching of all app files
- [ ] Use the plugin's prompt-style update flow so a new version only applies from the home screen, never during a game
- [ ] Create `vercel.json` with the SPA rewrite and headers: `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Robots-Tag: noindex`, and a same-origin `Content-Security-Policy`
- [ ] Add `src/styles` tokens: body text at least 20 px, tap targets at least 60 px, high contrast, `touch-action: manipulation`, safe-area insets, system font stack (which must render Vietnamese diacritics), and disabled text selection during games
- [ ] Add `src/i18n` with `t()` and German, English and Vietnamese strings, plus `LanguagePick` on first launch, preselected from `navigator.language`
- [ ] Add `src/storage/db.ts` with the Dexie schema and request `navigator.storage.persist()` on first launch
- [ ] Add `InstallHelp`: in a browser tab on iOS, show illustrated Add to Home Screen steps and explain that progress stays separate, with a "Continue in browser" option
- [ ] Add `src/core/staircase.ts`
  ```ts
  // 3 correct in a row: level + 1 (harder). 1 wrong: level - 1 (easier).
  // Levels run easiest to hardest, and state stores the level value.
  // Reversal = direction change. score = mean of last 6 reversal values,
  // falling back to the current value with fewer than 6.
  ```
- [ ] Add `measureFrameInterval` to `src/core/timing/flash.ts`: median rAF delta over 30 frames at round start
- [ ] Add `presentFlash` to `src/core/timing/flash.ts`: show a preloaded stimulus on one rAF, hide it on the first frame where elapsed time is at least requested minus half a frame, and return the actual duration and frame count
- [ ] Add `src/games/speed` with the `GameModule` interface, using levels 500, 400, 320, 250, 200, 160, 125, 100, 80, 65, 50, 34 and 17 ms, rounded at runtime to whole measured frames, with duplicates removed. At round start, map the saved flash length to the nearest available level
- [ ] Implement the speed trial as focus 500 ms, flash, mask 300 ms, centre question and outer position question, with both answers required for a correct trial and a clear ✓ or ✗ shape as feedback
- [ ] Implement stages: stage 1 has no distractors. Stage 2 adds triangles around the outer positions and starts after 2 consecutive rounds with a threshold of 80 ms or less, resetting to 250 ms
- [ ] Discard and do not score a trial if its actual duration differs from the request by more than 1 frame, or if the page was hidden. Pause the round clock on `visibilitychange`, and count only active time toward the 5 minutes and `durationMs`. A round closed before it finishes is discarded
- [ ] Record `frameMs`, threshold, and requested and actual duration statistics in `meta`
- [ ] Add the first-time animated demo and 3 practice trials at a 1000 ms flash, plus a "Show me again" control
- [ ] Add a landscape notice asking her to turn the phone upright, because iOS may not enforce the manifest orientation
- [ ] Add a basic `Home` and `RoundSummary` to start, finish and save a speed round, ending the round after the current trial once 5 minutes have passed
- [ ] Add a `Settings` screen with language and an About section showing the app version, whether storage is persistent and the last measured frame interval
- [ ] Add a build-only `VITE_E2E` flag that shortens rounds and exposes the correct answer through a data attribute
- [ ] Deploy to Vercel Hobby with the user's account using the Keychain token described under Accounts and access and the default `*.vercel.app` domain

**Automated Verification**:
- [ ] `npm run typecheck` passes, including that `de.ts` and `vi.ts` have every key in `en.ts`
- [ ] `npm test`: simulated players with known ability converge to 79.4% correct within ±5 percentage points over many trials
- [ ] `npm test`: `Staircase` state survives a JSON round trip and stays within its level bounds
- [ ] `npm test`: with fake frame timings, `presentFlash` returns correct actual durations at 60 Hz, 120 Hz and 30 Hz, and flags a dropped frame
- [ ] `npm test`: speed levels are rounded to distinct whole frames at each frame rate
- [ ] `npm test`: a saved 34 ms flash maps to the nearest available level at 30 Hz and returns to the same value at 60 Hz, staying in bounds
- [ ] `npm test`: pause time isn't counted in `durationMs`, and a round closed early saves no result
- [ ] `npm test`: a trial with one right and one wrong answer counts as wrong
- [ ] `npm test`: a test scans the i18n files for the forbidden words `dementia`, `Demenz`, `sa sút trí tuệ`, `brain age`, `Gehirnalter`, `clinically proven` and `klinisch`
- [ ] `npm run build` passes, and a test reads the generated manifest for standalone display and icons
- [ ] `npm run test:e2e` on a Playwright iPhone WebKit profile: choosing a language and finishing a speed round saves a result that survives a reload
- [ ] `npm run test:e2e` on Chromium: after one online load, the app starts and completes a round with the network off

**Manual Verification**:
- [ ] Add the deployed app to the Home Screen on the iPhone 17 Pro Max and confirm it opens full screen
- [ ] Turn on Airplane Mode, open the app and complete a speed round
- [ ] Open Settings > About after a round, record the measured frame interval in Implementation Notes, then repeat with Low Power Mode on
- [ ] Confirm the flash is visibly brief but readable at the longest levels and the outer car positions fit in portrait
- [ ] Have her try the demo and practice round, and confirm she understands what to do without help

### Phase 2: The daily set

Dependencies: Phase 1

Turn the single game into the daily routine with all 4 wordless rotating games and her progress screens.

**Tasks**:
- [ ] Add `src/core/registry.ts` and move the speed game into it
- [ ] Add `src/core/setGenerator.ts`: speed first, then the 2 rotating games played least recently, with ties broken by a seed from the date. Saved in `todaysSet`, keyed by date and set number, so reopening resumes the stored set and "Play another set" starts the next number
- [ ] Add `src/screens/SetRunner`: run the games in order from the stored set, keep progress after each round and resume at the first unfinished game on the same day
- [ ] Add `src/games/memoryGrid`: show a lit pattern, then tap it back with no time limit. Levels run from 3 tiles on a 4×4 grid up to 9 tiles on a 5×5 grid. `scoreUnit` is tiles, higher is better
- [ ] Add `src/games/arrows`: tap the direction of the middle arrow among flankers, with congruent and incongruent trials. Levels shorten the answer window from 3000 ms to 800 ms. `scoreUnit` is ms, lower is better
- [ ] Add `src/games/tapOrWait`: tap on circles and wait on squares, 75% tap trials. Levels shorten the display window from 2500 ms to 700 ms. `scoreUnit` is ms, lower is better
- [ ] Add `src/games/switchRule`: a cue shows which rule applies, shape or filled/outline, and she answers by that rule. Levels shorten the answer window from 4000 ms to 1200 ms. `scoreUnit` is ms, lower is better
- [ ] Use shapes and fill patterns, never colour alone, in all games, and give each game a demo and practice round
- [ ] Add `src/core/week.ts`: Monday-based days played, total minutes and target progress, using `localDate`. A day counts once its first round finishes
- [ ] Add `src/core/bests.ts`: new personal bests by game and stage, honouring `scoreDirection`
- [ ] Complete `Home` with the weekly dots, Start button, "Done for today", "Play another set", this week's minutes and new bests. Show extra days beyond the target as a plain count
- [ ] Complete `RoundSummary` so it shows only positive items: time played and any new best. Never show a falling score
- [ ] Add the "Days a week" setting (3, 5 or 7, default 5)
- [ ] Respect `prefers-reduced-motion` in demos and transitions, while keeping the speed flash itself unchanged

**Automated Verification**:
- [ ] `npm test`: the generator always puts speed first, picks 2 different rotating games and picks the least recently played
- [ ] `npm test`: reopening after playing a round returns the stored set unchanged, "Play another set" gets a new set number, and a game added to the registry enters the rotation with no generator change
- [ ] `npm test`: `score` follows its definition for fixtures with more and fewer than 6 reversals
- [ ] `npm test`: `weekProgress` handles the Monday reset, a daylight-saving change, extra sets on one day and each of the 3, 5 and 7 targets
- [ ] `npm test`: `newBests` handles both score directions and treats speed stages separately
- [ ] `npm test`: each game's scoring logic is covered with a seeded generator, including a no-response window in `tapOrWait`
- [ ] `npm test`: home and summary rendering output never includes a raw score drop when the fixture's last score is worse than before
- [ ] `npm run typecheck` and `npm run build` pass
- [ ] `npm run test:e2e` on the iPhone profile: a full set runs across 3 games, the week dot fills, and reopening mid-set resumes at the next game
- [ ] `npm run test:e2e`: all interactive controls on home and in each game measure at least 60×60 CSS px
- [ ] `npm run test:e2e`: switching among the 3 languages on each screen causes no horizontal overflow at the iPhone profile width

**Manual Verification**:
- [ ] Have her play a full set on her iPhone and confirm it takes about 10 minutes and all instructions make sense
- [ ] Confirm the German and Vietnamese menu text reads naturally to a native speaker
- [ ] Confirm the tap targets are comfortable for her and the text is readable without glasses, or with her usual ones
- [ ] Interrupt a set by locking the phone, return and confirm it resumes without losing finished rounds

### Phase 3: Backup and your view

Dependencies: Phase 2

Back up results to Neon, make restoring possible and provide the private read-only view.

**Tasks**:
- [ ] Add the connection string from `.env.local` to the Vercel project as `DATABASE_URL` with `vercel env add`, without printing it
- [ ] Add `server/schema.sql` and `npm run db:migrate`
  ```sql
  create table if not exists profiles (
    id uuid primary key default gen_random_uuid(),
    owner_hash bytea unique not null,
    view_hash bytea unique not null,
    settings jsonb not null default '{}',
    game_state jsonb not null default '{}',
    settings_updated_at timestamptz,
    last_sync_at timestamptz,
    created_at timestamptz not null default now()
  );
  create table if not exists results (
    profile_id uuid not null references profiles(id) on delete cascade,
    id uuid not null,
    game_id text not null,
    started_at timestamptz not null,
    local_date date not null,
    duration_ms integer not null,
    score real not null,
    stage smallint not null,
    trials integer not null,
    correct integer not null,
    meta jsonb not null default '{}',
    language text not null,
    app_version text not null,
    primary key (profile_id, id)
  );
  create index if not exists results_profile_time on results (profile_id, started_at);
  ```
- [ ] Add `server/db.ts` with a small `Db` interface, a `@neondatabase/serverless` adapter and a PGlite adapter for tests
- [ ] Add `server/validate.ts` with Zod schemas, a 100-result batch limit and a 256 KB body limit
- [ ] Add `POST /api/profiles` to `server/routes.ts`: owner bearer plus `viewHash`. Creates the profile subject to `MAX_PROFILES`, and returns `200` if that owner already exists
- [ ] Add `DELETE /api/profiles` to `server/routes.ts`: owner bearer. Removes that profile and its results
- [ ] Add `POST /api/sync` to `server/routes.ts`: owner bearer, with `401` for an unknown code. Validates each result on its own, inserts valid ones with `on conflict do nothing`, and returns `acceptedIds` and `rejectedIds`. Merges settings and game state with `src/core/mergeState.ts`. Compares the sent `viewHash` with the stored one and returns `viewLinkCurrent`
- [ ] Add `GET /api/restore?after=<cursor>` to `server/routes.ts`: owner bearer, read-only. Returns settings, game state and up to 500 results per page
- [ ] Add `PUT /api/view-link` to `server/routes.ts`: owner bearer. Replaces `view_hash`
- [ ] Add `GET /api/view` to `server/routes.ts`: view bearer, read-only. Returns aggregated trends, days per week, speed hours and last sync, labelled from the stored game IDs
- [ ] Set `Cache-Control: no-store` on all API responses
- [ ] Add `src/core/mergeState.ts` with the game state and settings rules from decision 14
- [ ] Add `api/index.ts` as a single fetch handler that calls `server/routes.ts`, with the `/api/:path*` rewrite in `vercel.json`
- [ ] Add `scripts/dev-api.ts` and a Vite proxy so `npm run dev` and e2e tests reach the API on PGlite
- [ ] Apply `server/schema.sql` to production by running `npm run db:migrate` with `DATABASE_URL_UNPOOLED` from `.env.local`
- [ ] Add `src/sync/identity.ts`: create the recovery code and view token with `crypto.getRandomValues`, display the code in groups of 4 base32 characters, and hash with `crypto.subtle`. Existing Phase 1 and 2 installs create these on first launch after updating
- [ ] Register the profile with `POST /api/profiles` after her first finished round, not on launch, and retry until it succeeds. Results stay unsynced until then
- [ ] Add `src/sync/client.ts`: `syncNow` on app open, after each round and on the `online` event, in batches of up to 100 oldest-first, with backoff retries while the app is open. Do not rely on background sync
- [ ] Mark `rejectedIds` with `syncRejectedAt` so they stop being sent, and show the count in About
- [ ] On `viewLinkCurrent: false`, show in Settings that this phone's link was replaced elsewhere, and offer to replace it
- [ ] Add the Backup section in Settings: last backup, Show recovery code, Share private link with `navigator.share` and a copy fallback, and Replace private link with a confirmation
- [ ] Add `Restore`: enter the recovery code once, tolerating spaces and case, confirm when local data exists, read all pages, and merge results by ID and state with `mergeState.ts`. Change nothing locally until every page has arrived
- [ ] After a successful restore: adopt the restored identity, clear `syncedAt` on results not in the backup so they upload to it, and delete the phone's previous profile with its old code if it had registered one
- [ ] After a successful restore, create a new view token and call `PUT /api/view-link`. Save the token only after a success, retry on later syncs if it fails, and explain that the old private link stops working
- [ ] Add `PrivateView` at `/view#<token>`: read the token from the URL fragment, send it as a bearer header, and show the charts as small inline SVG with text labels, plus the not-a-health-check notice
- [ ] Do not let the private view read or write the player's local data, and do not show install prompts on that route
- [ ] Translate all new strings, with the private view following the browser's language among the 3 supported languages

**Automated Verification**:
- [ ] `npm test` (PGlite): sending the same batch twice inserts each result once
- [ ] `npm test`: `/api/sync` with an unknown code gets `401` and creates no profile, and registering profile `MAX_PROFILES + 1` gets `403 profile_limit`
- [ ] `npm test`: repeating `POST /api/profiles` with the same owner returns `200` and creates no second profile
- [ ] `npm test`: an oversize or malformed body gets `413` or `400` and writes nothing, while one invalid result in a valid batch appears in `rejectedIds` and the rest are stored
- [ ] `npm test`: the client stops resending rejected results and continues with later ones
- [ ] `npm test`: `GET /api/restore` changes no data, however many times it runs
- [ ] `npm test`: restore after local play uploads those results to the restored profile, removes the old profile and frees its `MAX_PROFILES` slot
- [ ] `npm test`: an interrupted restore leaves local data and the old view link untouched
- [ ] `npm test`: `viewLinkCurrent` is false after the link is replaced from another device
- [ ] `npm test`: the view token cannot call `sync`, `restore` or `view-link`
- [ ] `npm test`: after replacing the link, the old view token gets `401` and the new one works
- [ ] `npm test`: older `settingsUpdatedAt` values don't overwrite newer settings
- [ ] `npm test`: per game, a state with fewer `totalTrials` doesn't overwrite one with more, even if it is newer
- [ ] `npm test`: `/api/restore` pagination returns every result exactly once across pages
- [ ] `npm test`: the database stores only hashes, and API log lines contain no codes or tokens
- [ ] `npm test`: sync client failure leaves results unsynced, and the next run sends them
- [ ] `npm test`: speed hours and weekly summaries from `/api/view` match known fixtures
- [ ] `npm run typecheck` and `npm run build` pass
- [ ] `npm run test:e2e` with a local API: play a round, confirm its backup, clear browser storage, restore with the code and confirm history returns
- [ ] `npm run test:e2e`: `/view#<token>` shows trends and the notice, and contains no control that changes data
- [ ] `npm test`: evaluating the rewrite pattern from `vercel.json` confirms `/api/...` paths aren't sent to the SPA, and the PWA config denies `/api/` navigation fallback

**Manual Verification**:
- [ ] On the deployed app, play one round on the iPhone in Airplane Mode, turn the network back on, open the app and confirm "Last backup" updates
- [ ] Open the shared private link on another device and confirm its numbers match the phone
- [ ] Save the recovery code and private link somewhere safe, then replace the link and confirm the old one stops working
- [ ] Test restoring with the code in another browser profile, confirm history appears and old link access ends, and share the new link
- [ ] Confirm the Neon and Vercel dashboards show usage far below the free limits after a week of play

### Phase 4: Odd one out

Dependencies: Phase 3

Add the word game as a new module, proving that new games can be added without changing core code.

**Tasks**:
- [ ] Add `src/games/oddOneOut/words/{de,en,vi}.json`, with at least 30 sets in each of 5 tiers per language, each holding exactly 4 words, the odd word's index, a tier and a short reason for reviewers
  ```json
  { "id": "de-001", "tier": 1, "words": ["Apfel", "Birne", "Stuhl", "Banane"], "odd": 2, "reason": "Stuhl ist kein Obst", "reviewed": false }
  ```
- [ ] Write the tiers to get harder through closer categories: tier 1 broad (fruit vs furniture), up to tier 5 subtle (for example, a shared property rather than a shared category). Avoid sets that depend on spelling, rhyme, letters or grammar
- [ ] Write each language's sets for that language, with familiar everyday items, not as direct translations
- [ ] Add `src/games/oddOneOut/index.ts` and its game: staircase levels combine tier and an answer window from 15 s down to 6 s, with `scoreUnit` as level, higher is better. Avoid repeating sets used in recent rounds, recycling the least recently seen once exhausted
- [ ] Add its demo and its strings in all 3 languages inside its folder
- [ ] Fit long German words through automatic size reduction with a safe hyphenation point, never below the 20 px minimum, and keep Vietnamese diacritics unclipped
- [ ] Add the module to `src/core/registry.ts`
- [ ] Give the drafted German and Vietnamese sets and the app's reviewed copy to the user or a family member, apply corrections, and set `reviewed: true`
- [ ] Add the "How to add a game" section to a new `README.md`, along with setup, deployment and environment variable notes

**Automated Verification**:
- [ ] `npm test`: each language's file passes validation: 4 unique words, a valid odd index, no duplicate sets, at least 30 sets per tier
- [ ] `npm test`: a release check fails if any German or Vietnamese set has `reviewed: false`
- [ ] `npm test`: staircase moves up and down tiers correctly, and sets don't repeat until the pool is exhausted
- [ ] `npm test`: a stub game in a test registry runs through the set generator, storage, summaries, sync and private view without any game-specific code
- [ ] `git diff --name-only` against the last commit before Phase 4 lists only `src/games/oddOneOut/`, `src/core/registry.ts` and `README.md`
- [ ] `npm test`: the forbidden-word scan also covers every game's strings and word sets
- [ ] `npm run test:e2e`: the longest word in each language fits its button at the iPhone profile width with no overflow or clipped diacritics
- [ ] `npm run typecheck` and `npm run build` pass, and the production bundle stays fully available offline

**Manual Verification**:
- [ ] A native speaker plays German and Vietnamese rounds and confirms every set feels natural and fair
- [ ] She plays several rounds and confirms the difficulty feels challenging but not discouraging
- [ ] After one week of real use, confirm all 5 rotating games have appeared and none is being skipped through confusion

## Implementation Notes

During implementation, document user feedback, problems, and decisions here.

- Her age, eyesight and hand comfort weren't specified, so the plan uses harder-case defaults: large text and targets, slow first levels and guided practice.
- Out of scope for this version: push notifications, syncing live between several devices, account login, app-store release, and an in-app "delete my backup" button (data can be removed through the Neon dashboard).
- `@typescript-eslint` currently declares TypeScript below 6.1, so no ESLint is planned. Type-checking and tests provide the static checks.

## References

Research:
- `docs/agents/research/2026-10-26-cognitive-training-apps.md`

Evidence:
- [ACTIVE 20-year paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC12884427/) ([Europe PMC full text](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC12884427/fullTextXML))
- [UFOV task structure (PMC5651014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5651014)
- [Lancet Commission 2024 summary](https://www.irishtimes.com/health/2024/08/01/far-more-dementia-cases-could-be-avoided-or-delayed-than-previously-thought-study-finds)
- [US POINTER results](https://alz.org/us-pointer/study-results)

Platform:
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Vercel Functions quickstart](https://vercel.com/docs/functions/quickstart)
- [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel guide to deployment 404s](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)
- [Neon pricing](https://neon.com/pricing)
- [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [WebKit bug 215745: Low Power Mode animation cap](https://bugs.webkit.org/show_bug.cgi?id=215745)
- [vite-plugin-pwa guide](https://vite-pwa-org.netlify.app/guide/)
