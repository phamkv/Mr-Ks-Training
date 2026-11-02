import type { ComponentType } from 'react';
import type { Language } from './language';
import type { RoundClock } from './round';
import type { StaircaseState } from './staircase';

export interface GameMessages {
  title: string;
  instructions: string;
  scoreLabel: string;
}

export interface GameState {
  gameId: string;
  stage: number;
  totalTrials: number;
  updatedAt: string;
  staircase: StaircaseState;
  extra: Record<string, unknown>;
}

export interface RoundOutcome {
  trials: number;
  correct: number;
  stage: number;
  score: number;
  meta: Record<string, unknown>;
  nextState: GameState;
}

export interface GameProps {
  state: GameState;
  targetMs: number;
  language: Language;
  clock: RoundClock;
  paused: boolean; // true while the leave screen is open
  onFinish(outcome: RoundOutcome): void;
}

export interface DemoProps {
  language: Language;
  onDone(): void;
}

export interface GameModule {
  id: string;
  role: 'core' | 'rotating';
  targetMs: number; // speed 300_000, others 150_000
  messages: Record<Language, GameMessages>;
  scoreUnit: 'ms' | 'tiles' | 'level';
  scoreDirection: 'lower-better' | 'higher-better';
  initialState(): GameState;
  Demo: ComponentType<DemoProps>;
  Game: ComponentType<GameProps>;
}

export interface RoundResult {
  id: string; // UUID from the phone
  gameId: string;
  startedAt: string; // ISO
  durationMs: number; // active time only, excluding pauses
  localDate: string; // YYYY-MM-DD on her phone
  trials: number;
  correct: number;
  stage: number;
  score: number; // mean of last 6 reversal values, in scoreUnit
  meta: Record<string, unknown>; // e.g. frameMs, requested and actual flash stats
  language: Language;
  appVersion: string;
  syncedAt: string | null;
  syncRejectedAt: string | null; // kept locally, not retried
}
