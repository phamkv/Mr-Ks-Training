import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogs } from '../../src/i18n';

const FORBIDDEN = ['dementia', 'Demenz', 'sa sút trí tuệ', 'brain age', 'Gehirnalter', 'clinically proven', 'klinisch'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.test\./.test(name) ? [] : [path];
  });
}

describe('copy', () => {
  it('has every English key in German and Vietnamese', () => {
    const keys = Object.keys(catalogs.en).sort();
    expect(Object.keys(catalogs.de).sort()).toEqual(keys);
    expect(Object.keys(catalogs.vi).sort()).toEqual(keys);
  });

  it('keeps the same placeholders across languages', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const [key, text] of Object.entries(catalogs.en)) {
      expect(placeholders(catalogs.de[key as keyof typeof catalogs.de]), key).toEqual(placeholders(text));
      expect(placeholders(catalogs.vi[key as keyof typeof catalogs.vi]), key).toEqual(placeholders(text));
    }
  });

  it('contains no forbidden health claims in app or game strings', () => {
    const sources = [...files('src/i18n'), ...files('src/games')];
    expect(sources.length).toBeGreaterThan(3);
    for (const file of sources) {
      const text = readFileSync(file, 'utf8').toLowerCase();
      for (const word of FORBIDDEN) expect(text.includes(word.toLowerCase()), `${word} in ${file}`).toBe(false);
    }
  });
});
