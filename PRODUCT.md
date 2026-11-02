# Product

<!-- impeccable:product-schema 1 -->

**Name:** Mr. K's Training

## Platform

web

An installable PWA. Her iPhone 17 Pro Max on the newest iOS, launched from the Home Screen, is the main device. It also runs in a normal browser.

## Stack

Vite 8, React 19 and TypeScript as a static PWA using `vite-plugin-pwa`. Dexie over IndexedDB stores data on the phone. One Vercel Function on the Hobby plan and Neon Postgres (Frankfurt) handle backup. Confirmed by the user on 2026-11-02, as specified in `docs/agents/plans/2026-11-02-language-friendly-cognitive-game-pwa.md`.

## Users

**Primary: one player, the user's mum.** She plays daily on her own iPhone, in Vietnamese. She needs larger text, her hands are less steady so she can mistap, and she isn't a digital native, so she can't be expected to know app conventions. Her job is to finish a short daily set without help, and without feeling tested. Getting lost is the most likely reason she would stop.

**Secondary: her child, who built and maintains the app.** They follow her progress through a private read-only link in their own browser. That view is the only place trends appear.

There are no other users. The app is not meant for public release.

## Product Purpose

A personal daily brain-game habit for one older person. One Start button runs a set of about 10 minutes: a speed-of-processing game modelled on the ACTIVE trial's task, then 2 rotating games.

Success means she keeps playing week after week, understands each game without help, and finds the difficulty challenging but not discouraging. Her child can see that she is playing, and the app stays free to run.

## Positioning

Built for one person rather than a market. It has no paywall, leagues, streaks, age-group comparisons or brain-age score, which are the retention and monetisation mechanics of commercial apps such as Lumosity and Elevate. It has one player's real needs, her own language, and a daily core chosen from the training arm with the strongest trial signal. It makes no claim that this will protect her.

## Operating Context

- **Setup:** her child installs the app and sets it up with her, so the first screen she faces alone is the daily home screen.
- **Rhythm:** she chooses a target of 3, 5 or 7 days a week (default 5), counted Monday to Sunday. Missed days carry no penalty. Extra sets add minutes but no extra days.
- **Offline:** she can play without a connection. Results save on the phone first and sync when she is online.
- **Interruptions:** locking the phone pauses active time. If the app closes mid-round, that round is discarded and the game restarts. Finished rounds are always kept.
- **Updates:** a new version only applies from the home screen, never during a game.
- **Recovery:** a recovery code restores her history on a new phone. Home Screen and Safari storage are separate on iOS, so email links and browser hand-offs don't work for her.

## Capabilities and Constraints

**Capabilities**
- 6 games: speed (always first), memory grid, arrows, tap/don't tap, switch rule and Odd one out.
- Each game adapts to hold her at about 80% correct, using a shared 3-down, 1-up staircase.
- Each game has a demo and a practice round.
- Her screens show only days played, minutes and new personal bests.
- The private view shows speed hours and trends. Its link can be replaced.
- A new game is one module plus one registry entry, with no core changes.

**Constraints**
- No game needs typing. Odd one out doesn't rely on letters or grammar.
- No accounts, and no name, email or birth date is ever collected.
- No notifications, analytics, ad SDKs or third-party scripts.
- Normal use must stay within the Vercel Hobby and Neon free limits. Vercel Hobby also requires personal, non-commercial use.
- Flash timing measures display duration rather than tap speed, because frame rate on iOS varies. Low Power Mode caps it at 30 fps.

**Out of scope for this version:** push notifications, live sync between devices, login, app-store release, and an in-app "delete my backup" button.

**Terminology:** a *set* is the daily session of 3 games. A *round* is one play of a game. *Speed hours* is cumulative time in the speed game. The *recovery code* restores her history. The *private link* opens the *private view*.

**Undecided**
- Her age, which wasn't provided.
- Who does the native-speaker Vietnamese and German review. The plan says the user or a family member.

## Brand Commitments

**Required honesty in all copy**
- Never promise to prevent dementia or imply a health benefit.
- Never show a brain age, a health verdict or a comparison with other people.
- Never imply the phone version reproduces the ACTIVE result. It is untested at this format and dose.
- The private view must say it is not a health check, that scores vary for ordinary reasons, and that memory concerns belong with her doctor.

**Languages:** Vietnamese is her daily language and gets tested and reviewed first. German and English also ship in full. Odd one out sets are written per language rather than translated. Native speakers review German and Vietnamese before release.

**Name:** Mr. K's Training is the product and Home Screen name. `pcogni` remains the repository and Neon project name. No logo or other brand assets exist yet.

## Evidence on Hand

- `docs/agents/research/2026-10-26-cognitive-training-apps.md`: market, design and regulatory research.
- `docs/agents/plans/2026-11-02-language-friendly-cognitive-game-pwa.md`: full scope, acceptance criteria and game specifications.
- ACTIVE trial, as cited in the plan: only speed training with boosters was linked to fewer dementia diagnoses (HR 0.75, 95% CI 0.59–0.95). Without boosters the HR was 1.01, and memory and reasoning training showed no effect. The trial used group sessions of 60–75 minutes, not a phone.

**Absent, and must not be fabricated:** norm data, efficacy results for this app, testimonials and user numbers. She hasn't played it yet, because no app code exists.

## Product Principles

1. **She never needs help.** Every step explains itself and has a clear way back. If she can't finish a set alone, the design has failed, however good the game is.
2. **Nothing makes her feel worse.** No streaks, penalties or visible dips. Her screens only report what she has done and what she has beaten.
3. **Honest about what this is.** It's a promising habit with unproven benefit, and no wording may suggest more.
4. **The speed game comes first.** It is the reason the app exists. Everything else is there for variety and has to earn its place.
5. **Her data stays with the family.** Phone first, the minimum collected, and nothing shared with third parties.

## Accessibility & Inclusion

These are known needs for her rather than precautions:

- **Larger text:** body text of at least 20 px. Long German words shrink only down to that minimum, using a safe hyphenation point.
- **Less steady hands:** tap targets of at least 60 px. Spacing, undo paths and answer handling must forgive mistaps, so a slip doesn't read as a wrong answer wherever that can be avoided.
- **Not a digital native:** illustrated Add to Home Screen steps, one obvious next action per screen, guided practice before scoring, and slow first levels. Controls look like buttons and carry words, never an icon alone. Nothing depends on swipes, long presses or hidden menus.
- **Clear consequences:** any button that loses progress or changes something lasting says in plain words what will happen, what stays safe, and offers an equally clear way to back out.
- **Vietnamese:** diacritics must render and never clip, including at large sizes.
- **Colour:** games use shapes and fill patterns, never colour alone.
