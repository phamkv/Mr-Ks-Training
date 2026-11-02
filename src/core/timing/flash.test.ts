import { describe, expect, it } from 'vitest';
import { measureFrameInterval, presentFlash, type Raf } from './flash';

function fakeRaf(frameMs: number, dropAtFrame?: number): Raf {
  let time = 1000;
  let frame = 0;
  return (callback) => {
    frame += 1;
    time += frame === dropAtFrame ? frameMs * 3 : frameMs;
    queueMicrotask(() => callback(time));
    return frame;
  };
}

async function flash(requestedMs: number, frameMs: number, dropAtFrame?: number) {
  const events: string[] = [];
  const timing = await presentFlash({
    requestedMs,
    frameMs,
    show: () => events.push('show'),
    hide: () => events.push('hide'),
    raf: fakeRaf(frameMs, dropAtFrame),
  });
  expect(events).toEqual(['show', 'hide']);
  return timing;
}

describe('presentFlash', () => {
  it.each([
    ['60 Hz', 1000 / 60],
    ['120 Hz', 1000 / 120],
    ['30 Hz', 1000 / 30],
  ])('returns the actual duration at %s', async (_, frameMs) => {
    const requested = frameMs * 6;
    const timing = await flash(requested, frameMs);
    expect(timing.frames).toBe(6);
    expect(timing.actualMs).toBeCloseTo(requested, 5);
    expect(timing.dropped).toBe(false);
  });

  it('shows a one-frame flash for one frame', async () => {
    const timing = await flash(1000 / 60, 1000 / 60);
    expect(timing.frames).toBe(1);
  });

  it('flags a dropped frame and reports the longer duration', async () => {
    const frameMs = 1000 / 60;
    const timing = await flash(frameMs * 6, frameMs, 3);
    expect(timing.dropped).toBe(true);
    expect(timing.actualMs).toBeGreaterThan(frameMs * 6);
  });
});

describe('measureFrameInterval', () => {
  it('returns the median, ignoring one long frame', async () => {
    expect(await measureFrameInterval(fakeRaf(1000 / 120, 10))).toBeCloseTo(1000 / 120, 5);
  });
});
