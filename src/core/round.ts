import type { Language } from './language';
import type { RoundOutcome, RoundResult } from './game';

// Counts active time only, so a locked phone doesn't inflate minutes or speed hours.
export class RoundClock {
  readonly startedAt: Date;
  private accumulated = 0;
  private runningSince: number | null;

  constructor(private readonly now: () => number = () => performance.now(), startedAt = new Date()) {
    this.startedAt = startedAt;
    this.runningSince = now();
  }

  pause(): void {
    if (this.runningSince === null) return;
    this.accumulated += this.now() - this.runningSince;
    this.runningSince = null;
  }

  resume(): void {
    if (this.runningSince === null) this.runningSince = this.now();
  }

  elapsed(): number {
    return this.accumulated + (this.runningSince === null ? 0 : this.now() - this.runningSince);
  }
}

export function localDate(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function buildResult(
  gameId: string,
  outcome: RoundOutcome,
  clock: RoundClock,
  language: Language,
  appVersion: string,
): RoundResult {
  return {
    id: crypto.randomUUID(),
    gameId,
    startedAt: clock.startedAt.toISOString(),
    durationMs: Math.round(clock.elapsed()),
    localDate: localDate(clock.startedAt),
    trials: outcome.trials,
    correct: outcome.correct,
    stage: outcome.stage,
    score: outcome.score,
    meta: outcome.meta,
    language,
    appVersion,
    syncedAt: null,
    syncRejectedAt: null,
  };
}
