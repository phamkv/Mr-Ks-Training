export type Raf = (callback: (time: number) => void) => unknown;

export interface FlashTiming {
  requestedMs: number;
  actualMs: number;
  frames: number;
  dropped: boolean;
}

// Median rAF delta over 30 frames. Safari doesn't guarantee 60 fps, and Low Power Mode caps at 30.
export function measureFrameInterval(raf: Raf = requestAnimationFrame, samples = 30): Promise<number> {
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last: number | null = null;
    const tick = (time: number) => {
      if (last !== null) deltas.push(time - last);
      last = time;
      if (deltas.length < samples) {
        raf(tick);
        return;
      }
      deltas.sort((a, b) => a - b);
      resolve(deltas[Math.floor(deltas.length / 2)]);
    };
    raf(tick);
  });
}

// Shows on one frame and hides on the first frame at least (requested - half a frame) later.
export function presentFlash(options: {
  requestedMs: number;
  frameMs: number;
  show(): void;
  hide(): void;
  raf?: Raf;
}): Promise<FlashTiming> {
  const { requestedMs, frameMs, show, hide, raf = requestAnimationFrame } = options;
  return new Promise((resolve) => {
    raf((start) => {
      show();
      let last = start;
      let frames = 0;
      let dropped = false;
      const tick = (time: number) => {
        frames += 1;
        if (time - last > frameMs * 1.5) dropped = true;
        last = time;
        if (time - start >= requestedMs - frameMs / 2) {
          hide();
          resolve({ requestedMs, actualMs: time - start, frames, dropped });
        } else {
          raf(tick);
        }
      };
      raf(tick);
    });
  });
}
