import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import type { Db } from './db.js';

// Kept apart from db.ts so the deployed function never bundles the Postgres WASM build.
export async function pgliteDb(): Promise<Db> {
  const client = new PGlite();
  await client.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await client.query<T>(text, params)).rows;
    },
  };
}
