import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

describe('routing', () => {
  it('sends /api paths to the function and everything else to the app', () => {
    const spa = vercel.rewrites.find((rewrite: { destination: string }) => rewrite.destination === '/index.html');
    const pattern = new RegExp(`^${spa.source}$`);
    for (const path of ['/api', '/api/', '/api/sync', '/api/view']) expect(pattern.test(path), path).toBe(false);
    for (const path of ['/', '/view', '/apis', '/application']) expect(pattern.test(path), path).toBe(true);
    expect(vercel.rewrites.some((rewrite: { source: string; destination: string }) => rewrite.source === '/api/:path*' && rewrite.destination === '/api/index')).toBe(true);
  });

  it('denies /api navigation in the PWA fallback', () => {
    expect(readFileSync('vite.config.ts', 'utf8')).toContain('navigateFallbackDenylist: [/^\\/api\\//]');
  });
});
