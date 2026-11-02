// Applies server/schema.sql. Reads DATABASE_URL_UNPOOLED from the environment and never prints it.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error('DATABASE_URL_UNPOOLED is not set');
const sql = neon(url);
const statements = readFileSync('server/schema.sql', 'utf8').split(';').map((s) => s.trim()).filter(Boolean);
for (const statement of statements) await sql.query(statement);
console.log(`Applied ${statements.length} statements.`);
