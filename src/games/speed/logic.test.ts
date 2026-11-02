import { describe, expect, it } from 'vitest';
import { seededRng } from '../../core/random';
import { Staircase, initialStaircase } from '../../core/staircase';
import { isTrialCorrect, isTrialScorable, makeTrial, nextStage, speedLevels } from './logic';

describe('speedLevels', () => {
  it.each([60, 120, 30])('rounds to distinct whole frames at %d Hz', (hz) => {
    const frameMs = 1000 / hz;
    const levels = speedLevels(frameMs);
    const frames = levels.map((level) => level.frames);
    expect(new Set(frames).size).toBe(frames.length);
    for (const level of levels) {
      expect(Number.isInteger(level.frames)).toBe(true);
      expect(level.frames).toBeGreaterThanOrEqual(1);
      expect(level.ms).toBeCloseTo(level.frames * frameMs);
    }
    // Longest flash first, shortest last.
    expect([...frames].sort((a, b) => b - a)).toEqual(frames);
  });

  it('keeps a saved 34 ms flash through a frame-rate change without going out of bounds', () => {
    const nominal = (hz: number) => speedLevels(1000 / hz).map((level) => level.nominal);
    const saved = initialStaircase(34);
    const at30 = Staircase.forRound(nominal(30), saved);
    expect(nominal(30)).toContain(at30.value);
    expect(at30.value).toBe(34);
    const at60 = Staircase.forRound(nominal(60), at30.toJSON());
    expect(at60.value).toBe(34);
  });

  it('maps a 17 ms flash to the nearest level that 30 Hz can show', () => {
    const levels = speedLevels(1000 / 30).map((level) => level.nominal);
    expect(levels).not.toContain(17);
    expect(Staircase.forRound(levels, initialStaircase(17)).value).toBe(34);
  });
});

describe('trial scoring', () => {
  const trial = { centre: 'truck' as const, outer: 3, distractors: [] };

  it('needs both answers right', () => {
    expect(isTrialCorrect(trial, 'truck', 3)).toBe(true);
    expect(isTrialCorrect(trial, 'car', 3)).toBe(false);
    expect(isTrialCorrect(trial, 'truck', 4)).toBe(false);
    expect(isTrialCorrect(trial, 'car', 4)).toBe(false);
  });

  it('discards a trial off by more than one frame, or when the page was hidden', () => {
    const frame = 1000 / 60;
    expect(isTrialScorable(100, 100, frame, false)).toBe(true);
    expect(isTrialScorable(100, 100 + frame, frame, false)).toBe(true);
    expect(isTrialScorable(100, 100 + 2 * frame, frame, false)).toBe(false);
    expect(isTrialScorable(100, 100, frame, true)).toBe(false);
  });
});

describe('makeTrial', () => {
  it('has no distractors at stage 1 and fills the other positions at stage 2', () => {
    const rng = seededRng(7);
    expect(makeTrial(rng, 1).distractors).toEqual([]);
    const staged = makeTrial(rng, 2);
    expect(staged.distractors).toHaveLength(7);
    expect(staged.distractors).not.toContain(staged.outer);
  });
});

describe('nextStage', () => {
  it('starts stage 2 at 250 ms after 2 consecutive rounds at 80 ms or less', () => {
    const first = nextStage(1, 0, 80);
    expect(first).toEqual({ stage: 1, lowRounds: 1, resetTo: null });
    expect(nextStage(1, first.lowRounds, 65)).toEqual({ stage: 2, lowRounds: 0, resetTo: 250 });
  });

  it('resets the count after a round above the threshold', () => {
    expect(nextStage(1, 1, 100)).toEqual({ stage: 1, lowRounds: 0, resetTo: null });
  });
});
