import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe.runIf(existsSync('dist/manifest.webmanifest'))('built manifest', () => {
  const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));

  it('opens standalone in portrait under the right name', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
    expect(manifest.start_url).toBe('/');
    expect(manifest.name).toBe("Mr. K's Training");
  });

  it('has icons that exist, and an apple-touch-icon link', () => {
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    for (const icon of manifest.icons) expect(existsSync(`dist/${icon.src}`)).toBe(true);
    expect(readFileSync('dist/index.html', 'utf8')).toContain('apple-touch-icon');
    expect(existsSync('dist/apple-touch-icon.png')).toBe(true);
  });

  it("doesn't ship the end-to-end test hooks", () => {
    const sw = readFileSync('dist/sw.js', 'utf8');
    expect(sw).toContain('index.html');
    const bundle = sw.match(/assets\/index-[\w-]+\.js/)![0];
    expect(readFileSync(`dist/${bundle}`, 'utf8')).not.toContain('VITE_E2E');
  });
});
