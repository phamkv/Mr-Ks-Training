import { describe, expect, it } from 'vitest';
import { seededRng } from '../core/random';
import * as arrows from './arrows/logic';
import * as memory from './memoryGrid/logic';
import * as switchRule from './switchRule/logic';
import * as tap from './tapOrWait/logic';

describe('arrows', () => {
  it('produces congruent and incongruent trials, and scores the middle arrow only', () => {
    const rng = seededRng(1);
    const trials = Array.from({ length: 200 }, () => arrows.makeTrial(rng));
    expect(trials.some((t) => t.middle === t.flanker)).toBe(true);
    expect(trials.some((t) => t.middle !== t.flanker)).toBe(true);
    expect(arrows.isCorrect({ middle: 'left', flanker: 'right' }, 'left')).toBe(true);
    expect(arrows.isCorrect({ middle: 'left', flanker: 'right' }, 'right')).toBe(false);
    expect(arrows.isCorrect({ middle: 'left', flanker: 'left' }, null)).toBe(false);
  });

  it('runs its answer window from 3000 ms down to 800 ms', () => {
    expect(arrows.LEVELS[0]).toBe(3000);
    expect(arrows.LEVELS.at(-1)).toBe(800);
  });
});

describe('tapOrWait', () => {
  it('is 75% tap trials', () => {
    const rng = seededRng(2);
    const trials = Array.from({ length: 4000 }, () => tap.makeTrial(rng));
    const share = trials.filter((t) => t === 'circle').length / trials.length;
    expect(share).toBeGreaterThan(0.72);
    expect(share).toBeLessThan(0.78);
  });

  it('scores taps and a no-response window', () => {
    expect(tap.isCorrect('circle', 'tap')).toBe(true);
    expect(tap.isCorrect('circle', null)).toBe(false);
    expect(tap.isCorrect('square', null)).toBe(true);
    expect(tap.isCorrect('square', 'tap')).toBe(false);
  });

  it('runs its display window from 2500 ms down to 700 ms', () => {
    expect(tap.LEVELS[0]).toBe(2500);
    expect(tap.LEVELS.at(-1)).toBe(700);
  });
});

describe('switchRule', () => {
  it('answers by the current rule', () => {
    const byShape = { rule: 'shape', shape: 'circle', fill: 'outline' } as const;
    const byFill = { rule: 'fill', shape: 'circle', fill: 'outline' } as const;
    expect(switchRule.isCorrect(byShape, 'circle')).toBe(true);
    expect(switchRule.isCorrect(byShape, 'outline')).toBe(false);
    expect(switchRule.isCorrect(byFill, 'outline')).toBe(true);
    expect(switchRule.isCorrect(byFill, 'circle')).toBe(false);
    expect(switchRule.isCorrect(byFill, null)).toBe(false);
  });

  it('uses both rules, and runs its window from 4000 ms down to 1200 ms', () => {
    const rng = seededRng(3);
    const rules = new Set(Array.from({ length: 100 }, () => switchRule.makeTrial(rng).rule));
    expect(rules.size).toBe(2);
    expect(switchRule.LEVELS[0]).toBe(4000);
    expect(switchRule.LEVELS.at(-1)).toBe(1200);
  });
});

describe('memoryGrid', () => {
  it('runs from 3 tiles on 4x4 to 9 tiles on 5x5, with unique tiles on the grid', () => {
    const rng = seededRng(4);
    expect(memory.LEVELS[0]).toBe(3);
    expect(memory.LEVELS.at(-1)).toBe(9);
    expect(memory.makeTrial(rng, 3).gridSize).toBe(4);
    const hard = memory.makeTrial(rng, 9);
    expect(hard.gridSize).toBe(5);
    expect(new Set(hard.tiles).size).toBe(9);
    expect(Math.max(...hard.tiles)).toBeLessThan(25);
  });

  it('accepts the right tiles in any order, and nothing else', () => {
    const trial = { gridSize: 4, tiles: [1, 6, 11] };
    expect(memory.isCorrect(trial, [11, 1, 6])).toBe(true);
    expect(memory.isCorrect(trial, [1, 6])).toBe(false);
    expect(memory.isCorrect(trial, [1, 6, 12])).toBe(false);
    expect(memory.isCorrect(trial, null)).toBe(false);
  });
});
