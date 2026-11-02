import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckIcon, CrossIcon } from '../../components/icons';
import type { GameProps } from '../../core/game';
import { Staircase } from '../../core/staircase';
import { useT } from '../../i18n';

const FEEDBACK_MS = 800;
const GAP_MS = 350;
const ANSWER_LOCK_MS = 250; // ignores the second tap of an accidental double tap
export const E2E = Boolean(import.meta.env.VITE_E2E);

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface TrialSpec<Trial, Answer> {
  makeTrial(value: number): Trial;
  isCorrect(trial: Trial, answer: Answer | null): boolean; // null means she didn't answer in time
  windowMs(value: number, trial: Trial): number | null; // null means no time limit
  render(trial: Trial, answer: (value: Answer) => void, value: number): ReactNode;
}

export interface Driver {
  value(): number;
  // Returns false when the round should end.
  record(correct: boolean): boolean;
}

export function gameDriver(props: GameProps, levels: readonly number[]): Driver {
  const staircase = Staircase.forRound(levels, props.state.staircase);
  let trials = 0;
  let correctCount = 0;
  return {
    value: () => staircase.value,
    record(correct) {
      trials += 1;
      if (correct) correctCount += 1;
      staircase.record(correct);
      if (props.clock.elapsed() < props.targetMs) return true;
      props.onFinish({
        trials,
        correct: correctCount,
        stage: props.state.stage,
        score: staircase.score(),
        meta: {},
        nextState: {
          ...props.state,
          totalTrials: props.state.totalTrials + trials,
          updatedAt: new Date().toISOString(),
          staircase: staircase.toJSON(),
        },
      });
      return false;
    },
  };
}

export function practiceDriver(value: number, count: number, onDone: () => void): Driver {
  let done = 0;
  return {
    value: () => value,
    record() {
      done += 1;
      if (done < count) return true;
      onDone();
      return false;
    },
  };
}

// Runs answer-then-feedback trials until the driver says stop. A trial cut short by the leave
// screen or a locked phone isn't scored, and a new one starts on return.
export function TrialRound<Trial, Answer>({ spec, driver, paused, prompt }: {
  spec: TrialSpec<Trial, Answer>;
  driver: Driver;
  paused: boolean;
  prompt?: (trial: Trial) => string;
}) {
  const t = useT();
  const [current, setCurrent] = useState<{ key: number; trial: Trial; value: number } | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const pausedRef = useRef(paused);
  const settle = useRef<((outcome: { answer: Answer | null } | 'interrupted') => void) | null>(null);
  const lastAnswerAt = useRef(0);
  const specRef = useRef(spec);
  specRef.current = spec;

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) settle.current?.('interrupted');
  }, [paused]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) settle.current?.('interrupted');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let key = 0; !cancelled; key++) {
        while (pausedRef.current || document.hidden) {
          await delay(200);
          if (cancelled) return;
        }
        const value = driver.value();
        const trial = specRef.current.makeTrial(value);
        setFeedback(null);
        setCurrent({ key, trial, value });
        const windowMs = specRef.current.windowMs(value, trial);
        const outcome = await new Promise<{ answer: Answer | null } | 'interrupted'>((resolve) => {
          const timer = windowMs === null ? null : setTimeout(() => resolve({ answer: null }), windowMs);
          settle.current = (result) => {
            if (timer !== null) clearTimeout(timer);
            resolve(result);
          };
        });
        settle.current = null;
        if (cancelled) return;
        setCurrent(null);
        if (outcome === 'interrupted') continue;

        const correct = specRef.current.isCorrect(trial, outcome.answer);
        setFeedback(correct);
        await delay(FEEDBACK_MS);
        if (cancelled) return;
        if (!driver.record(correct)) return;
        setFeedback(null);
        await delay(GAP_MS);
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driver]);

  function answer(value: Answer) {
    const now = performance.now();
    if (now - lastAnswerAt.current < ANSWER_LOCK_MS) return;
    lastAnswerAt.current = now;
    settle.current?.({ answer: value });
  }

  return (
    <div className="trial">
      <p className="prompt-text" aria-live="polite">
        {feedback !== null ? (feedback ? t('right') : t('notThisTime')) : current && prompt ? prompt(current.trial) : ''}
      </p>
      {feedback !== null ? (
        <div className="trial-feedback">{feedback ? <CheckIcon size={96} /> : <CrossIcon size={96} />}</div>
      ) : current ? (
        <div className="trial-body" key={current.key}>{spec.render(current.trial, answer, current.value)}</div>
      ) : null}
    </div>
  );
}
