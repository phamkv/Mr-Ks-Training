import { z } from 'zod';

export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_BATCH = 100;

export const resultSchema = z.object({
  id: z.uuid(),
  gameId: z.string().min(1).max(64),
  startedAt: z.iso.datetime({ offset: true }),
  durationMs: z.number().int().min(0).max(86_400_000),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  trials: z.number().int().min(0),
  correct: z.number().int().min(0),
  stage: z.number().int().min(0).max(100),
  score: z.number().finite(),
  meta: z.record(z.string(), z.unknown()),
  language: z.enum(['en', 'de', 'vi']),
  appVersion: z.string().min(1).max(32),
});
export type ResultBody = z.infer<typeof resultSchema>;

const gameStateSchema = z.looseObject({
  gameId: z.string(),
  totalTrials: z.number().int().min(0),
  updatedAt: z.string(),
});

const settingsSchema = z.object({
  language: z.enum(['en', 'de', 'vi']).nullable(),
  daysPerWeek: z.number().int().min(1).max(7),
  settingsUpdatedAt: z.string().nullable(),
});

const hashSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const profileBody = z.object({ viewHash: hashSchema });
export const viewLinkBody = z.object({ viewHash: hashSchema });

// Results are checked one at a time, so an invalid one can't block the ones after it.
export const syncBody = z.object({
  viewHash: hashSchema.nullable(),
  results: z.array(z.unknown()).max(MAX_BATCH),
  settings: settingsSchema.optional(),
  gameState: z.record(z.string(), gameStateSchema).optional(),
});
