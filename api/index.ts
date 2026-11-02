import { neonDb, type Db } from '../server/db.js';
import { handle } from '../server/routes.js';

let db: Db | null = null;

export default {
  fetch(request: Request): Promise<Response> {
    db ??= neonDb(process.env.DATABASE_URL!);
    return handle(request, {
      db,
      maxProfiles: Number(process.env.MAX_PROFILES ?? 3),
      log: (line) => console.log(JSON.stringify(line)),
    });
  },
};
