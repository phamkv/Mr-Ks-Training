import Dexie, { type EntityTable } from 'dexie';
import type { GameState, RoundResult } from '../core/game';
import type { Language } from '../core/language';
import type { TodaysSet } from '../core/setGenerator';

export interface Settings {
  id: 'app';
  language: Language | null;
  daysPerWeek: number;
  settingsUpdatedAt: string | null;
  seenDemos: string[];
  installHelpDone: boolean;
  lastFrameMs: number | null;
}

export interface Identity {
  id: 'me';
  recoveryCode: string;
  viewToken: string | null; // null only while a restore's new link is still being set
  pendingViewToken: string | null;
  orphanCode: string | null; // a replaced profile's code, until the server has removed it
  registered: boolean;
  backupInactive: boolean;
  viewLinkReplacedElsewhere: boolean;
  lastBackupAt: string | null;
}

export const db = new Dexie('pcogni') as Dexie & {
  results: EntityTable<RoundResult, 'id'>;
  settings: EntityTable<Settings, 'id'>;
  gameState: EntityTable<GameState, 'gameId'>;
  identity: EntityTable<Identity, 'id'>;
  todaysSet: Dexie.Table<TodaysSet, [string, number]>;
};

db.version(1).stores({
  results: 'id, gameId, localDate, startedAt, syncedAt',
  settings: 'id',
  gameState: 'gameId',
  identity: 'id',
  todaysSet: '[date+setNumber], date',
});

export const defaultSettings: Settings = {
  id: 'app',
  language: null,
  daysPerWeek: 5,
  settingsUpdatedAt: null,
  seenDemos: [],
  installHelpDone: false,
  lastFrameMs: null,
};
