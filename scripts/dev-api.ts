// Serves the API locally on PGlite, for `npm run dev` and the end-to-end tests.
import { createServer } from 'node:http';
import { pgliteDb } from '../server/dbPglite.js';
import { handle } from '../server/routes.js';

const db = await pgliteDb();
const port = Number(process.env.API_PORT ?? 4174);

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = Buffer.concat(chunks);
  const request = new Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
  const response = await handle(request, { db, maxProfiles: 50, log: () => {} });
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}).listen(port, () => console.log(`API on PGlite at http://localhost:${port}`));
