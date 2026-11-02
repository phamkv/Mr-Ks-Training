// 3 correct in a row: level + 1 (harder). 1 wrong: level - 1 (easier).
// Levels run easiest to hardest, and state stores the level value.
// Reversal = direction change. score = mean of last 6 reversal values,
// falling back to the current value with fewer than 6.

export interface StaircaseState {
  value: number;
  correctRun: number;
  direction: 'harder' | 'easier' | null;
  reversals: number[];
}

export function initialStaircase(startValue: number): StaircaseState {
  return { value: startValue, correctRun: 0, direction: null, reversals: [] };
}

function nearestIndex(levels: readonly number[], value: number): number {
  let best = 0;
  for (let i = 1; i < levels.length; i++) {
    if (Math.abs(levels[i] - value) < Math.abs(levels[best] - value)) best = i;
  }
  return best;
}

export class Staircase {
  private index: number;
  private correctRun: number;
  private direction: StaircaseState['direction'];
  private reversals: number[];

  constructor(
    private readonly levels: readonly number[],
    state: StaircaseState,
  ) {
    this.index = nearestIndex(levels, state.value);
    this.correctRun = state.correctRun;
    this.direction = state.direction;
    this.reversals = [...state.reversals];
  }

  // A round's score only uses that round's reversals, so each round starts clean.
  static forRound(levels: readonly number[], saved: StaircaseState): Staircase {
    return new Staircase(levels, { ...saved, correctRun: 0, reversals: [] });
  }

  get value(): number {
    return this.levels[this.index];
  }

  record(correct: boolean): void {
    if (correct) {
      this.correctRun += 1;
      if (this.correctRun === 3) {
        this.correctRun = 0;
        this.move('harder', 1);
      }
    } else {
      this.correctRun = 0;
      this.move('easier', -1);
    }
  }

  private move(direction: 'harder' | 'easier', step: number): void {
    if (this.direction && this.direction !== direction) this.reversals.push(this.value);
    this.direction = direction;
    this.index = Math.min(this.levels.length - 1, Math.max(0, this.index + step));
  }

  score(): number {
    if (this.reversals.length < 6) return this.value;
    const last = this.reversals.slice(-6);
    return last.reduce((sum, v) => sum + v, 0) / last.length;
  }

  toJSON(): StaircaseState {
    return {
      value: this.value,
      correctRun: this.correctRun,
      direction: this.direction,
      reversals: [...this.reversals],
    };
  }
}
