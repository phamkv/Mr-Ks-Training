import { db, type Identity } from '../storage/db';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// 128 random bits as 26 base32 characters. The server only ever stores a hash of these.
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z2-7]/g, '');
}

export function displayCode(code: string): string {
  return code.match(/.{1,4}/g)?.join(' ') ?? '';
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function ensureIdentity(): Promise<Identity> {
  return db.transaction('rw', db.identity, async () => {
    const existing = await db.identity.get('me');
    if (existing) return existing;
    const created: Identity = {
      id: 'me',
      recoveryCode: randomToken(),
      viewToken: randomToken(),
      pendingViewToken: null,
      orphanCode: null,
      registered: false,
      backupInactive: false,
      viewLinkReplacedElsewhere: false,
      lastBackupAt: null,
    };
    await db.identity.put(created);
    return created;
  });
}

export function privateLink(token: string): string {
  return `${window.location.origin}/view#${token}`;
}
