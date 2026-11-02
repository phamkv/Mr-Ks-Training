import { describe, expect, it } from 'vitest';
import { seededRng } from './random';
import { initialStaircase, Staircase } from './staircase';

const levels = [500, 400, 320, 250, 200, 160, 125, 100, 80, 65, 50, 34, 17];

describe('Staircase', () => {
  it('moves harder after 3 correct and easier after 1 wrong', () => {
    const s = new Staircase(levels, initialStaircase(320));
    s.record(true); s.record(true);
    expect(s.value).toBe(320);
    s.record(true);
    expect(s.value).toBe(250);
    s.record(false);
    expect(s.value).toBe(320);
  });

  it('survives a JSON round trip and stays within its level bounds', () => {
    let s = new Staircase(levels, initialStaircase(500));
    s.record(false);
    expect(s.value).toBe(500);
    for (let i = 0; i < 100; i++) {
      s.record(true);
      s = new Staircase(levels, JSON.parse(JSON.stringify(s)));
      expect(levels).toContain(s.value);
    }
    expect(s.value).toBe(17);
  });

  it('scores the mean of the last 6 reversals, or the current value with fewer', () => {
    const s = new Staircase(levels, initialStaircase(250));
    expect(s.score()).toBe(250);
    for (let i = 0; i < 8; i++) {
      s.record(true); s.record(true); s.record(true); // harder
      s.record(false); // easier
      if (s.toJSON().reversals.length < 6) expect(s.score()).toBe(s.value);
    }
    const raw = s.toJSON().reversals;
    expect(raw.length).toBeGreaterThanOrEqual(6);
    const last = raw.slice(-6);
    expect(s.score()).toBeCloseTo(last.reduce((a, b) => a + b, 0) / 6);
  });

  it('starts each round with no reversals and no run of correct answers', () => {
    const s = Staircase.forRound(levels, { value: 200, correctRun: 2, direction: 'harder', reversals: [100, 80] });
    expect(s.toJSON()).toEqual({ value: 200, correctRun: 0, direction: 'harder', reversals: [] });
  });

  it('converges to 79.4% correct within 5 points for simulated players of known ability', () => {
    for (const ability of [60, 120, 240]) {
      const rng = seededRng(ability);
      const fine = Array.from({ length: 200 }, (_, i) => 500 - i * 2.4); // dense levels, easiest first
      const s = new Staircase(fine, initialStaircase(500));
      // Logistic in log duration: longer flashes are easier.
      const pCorrect = (ms: number) => 0.02 + 0.96 / (1 + Math.exp(-(Math.log(ms) - Math.log(ability)) * 4));
      let correct = 0;
      let trials = 0;
      for (let i = 0; i < 40_000; i++) {
        const ok = rng() < pCorrect(s.value);
        if (i > 2_000) { trials += 1; if (ok) correct += 1; }
        s.record(ok);
      }
      expect(Math.abs((correct / trials) * 100 - 79.4)).toBeLessThan(5);
    }
  });
});
