import { useRef } from 'react';
import type { GameProps } from '../../core/game';
import { Staircase } from '../../core/staircase';
import type { FlashTiming } from '../../core/timing/flash';
import { nextStage, speedLevels, summarize, type SpeedLevel } from './logic';
import { SpeedRound, type RoundPlan } from './SpeedRound';

export function SpeedGame({ state, targetMs, language, clock, paused, onFinish }: GameProps) {
  const round = useRef({
    trials: 0,
    correct: 0,
    discarded: 0,
    frameMs: 0,
    levels: [] as SpeedLevel[],
    staircase: null as Staircase | null,
    requested: [] as number[],
    actual: [] as number[],
    dropped: 0,
  }).current;

  const plan: RoundPlan = {
    stage: state.stage,
    frameMeasured(frameMs) {
      round.frameMs = frameMs;
      round.levels = speedLevels(frameMs);
      round.staircase = Staircase.forRound(round.levels.map((level) => level.nominal), state.staircase);
    },
    nextFlashMs() {
      return round.levels.find((level) => level.nominal === round.staircase!.value)!.ms;
    },
    trialDiscarded() {
      round.discarded += 1;
    },
    trialFinished(correct: boolean, timing: FlashTiming) {
      round.trials += 1;
      if (correct) round.correct += 1;
      round.requested.push(timing.requestedMs);
      round.actual.push(timing.actualMs);
      if (timing.dropped) round.dropped += 1;
      round.staircase!.record(correct);
      if (clock.elapsed() < targetMs) return true;

      const threshold = round.staircase!.score();
      const stage = nextStage(state.stage, Number(state.extra.lowRounds ?? 0), threshold);
      const staircase = round.staircase!.toJSON();
      onFinish({
        trials: round.trials,
        correct: round.correct,
        stage: state.stage,
        score: threshold,
        meta: {
          frameMs: round.frameMs,
          threshold,
          discarded: round.discarded,
          dropped: round.dropped,
          requested: summarize(round.requested),
          actual: summarize(round.actual),
        },
        nextState: {
          ...state,
          stage: stage.stage,
          totalTrials: state.totalTrials + round.trials,
          updatedAt: new Date().toISOString(),
          staircase: stage.resetTo === null ? staircase : { ...staircase, value: stage.resetTo, direction: null },
          extra: { ...state.extra, lowRounds: stage.lowRounds },
        },
      });
      return false;
    },
  };

  return <SpeedRound plan={plan} paused={paused} language={language} />;
}
