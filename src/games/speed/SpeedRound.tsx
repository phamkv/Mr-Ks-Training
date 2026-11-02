import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CrossIcon } from '../../components/icons';
import type { Language } from '../../core/language';
import { measureFrameInterval, presentFlash, type FlashTiming } from '../../core/timing/flash';
import { useT } from '../../i18n';
import { Field, positionStyle, VehicleIcon } from './Field';
import { isTrialCorrect, isTrialScorable, makeTrial, OUTER_POSITIONS, type SpeedTrial, type Vehicle } from './logic';
import { messages } from './messages';

const FOCUS_MS = 500;
const MASK_MS = 300;
const FEEDBACK_MS = 900;
const ANSWER_LOCK_MS = 300; // ignores the second tap of an accidental double tap
const E2E = Boolean(import.meta.env.VITE_E2E);

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface RoundPlan {
  stage: number;
  frameMeasured?(frameMs: number): void;
  nextFlashMs(frameMs: number): number;
  trialDiscarded?(timing: FlashTiming): void;
  // Returns false when the round should end.
  trialFinished(correct: boolean, timing: FlashTiming): boolean;
}

type Phase = 'wait' | 'focus' | 'flash' | 'centre' | 'outer' | 'feedback';

export function SpeedRound({ plan, paused, language }: { plan: RoundPlan; paused: boolean; language: Language }) {
  const t = useT();
  const text = messages[language];
  const fieldRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('wait');
  const [trial, setTrial] = useState<SpeedTrial | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

  const pausedRef = useRef(paused);
  const interrupted = useRef(false);
  const answerRef = useRef<((value: Vehicle | number) => void) | null>(null);
  const lastAnswerAt = useRef(0);
  const planRef = useRef(plan);
  planRef.current = plan;

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) interrupted.current = true;
  }, [paused]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) interrupted.current = true;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const ask = <T extends Vehicle | number>() =>
      new Promise<T>((resolve) => {
        answerRef.current = (value) => resolve(value as T);
      });

    (async () => {
      const frameMs = await measureFrameInterval();
      if (cancelled) return;
      planRef.current.frameMeasured?.(frameMs);
      while (!cancelled) {
        while (pausedRef.current || document.hidden) {
          await delay(200);
          if (cancelled) return;
        }
        interrupted.current = false;
        const next = makeTrial(Math.random, planRef.current.stage);
        const requestedMs = planRef.current.nextFlashMs(frameMs);
        setTrial(next);
        setPhase('focus');
        await delay(FOCUS_MS);
        if (cancelled) return;
        if (interrupted.current) continue;

        setPhase('flash');
        const field = fieldRef.current!;
        const timing = await presentFlash({
          requestedMs,
          frameMs,
          show: () => { field.dataset.view = 'stim'; },
          hide: () => { field.dataset.view = 'mask'; },
        });
        const hidden = interrupted.current;
        await delay(MASK_MS);
        if (cancelled) return;
        delete field.dataset.view;

        if (!isTrialScorable(requestedMs, timing.actualMs, frameMs, hidden)) {
          planRef.current.trialDiscarded?.(timing);
          continue;
        }

        setPhase('centre');
        const centre = await ask<Vehicle>();
        if (cancelled) return;
        setPhase('outer');
        const outer = await ask<number>();
        if (cancelled) return;

        const correct = isTrialCorrect(next, centre, outer);
        setWasCorrect(correct);
        setPhase('feedback');
        await delay(FEEDBACK_MS);
        if (cancelled) return;
        if (!planRef.current.trialFinished(correct, timing)) return;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function answer(value: Vehicle | number) {
    const now = performance.now();
    if (now - lastAnswerAt.current < ANSWER_LOCK_MS) return;
    lastAnswerAt.current = now;
    answerRef.current?.(value);
    answerRef.current = null;
  }

  const prompt =
    phase === 'centre' ? text.centreQuestion
    : phase === 'outer' ? text.outerQuestion
    : phase === 'feedback' ? (wasCorrect ? t('right') : t('notThisTime'))
    : '';

  return (
    <div className="speed">
      <Field ref={fieldRef} trial={trial} showCross={phase === 'focus'}>
        {phase === 'outer' &&
          Array.from({ length: OUTER_POSITIONS }, (_, position) => (
            <button
              key={position}
              type="button"
              className="spot"
              style={positionStyle(position)}
              aria-label={text.positions[position]}
              data-correct={E2E ? String(trial?.outer === position) : undefined}
              onClick={() => answer(position)}
            />
          ))}
        {phase === 'feedback' && (
          <div className="feedback">{wasCorrect ? <CheckIcon size={96} /> : <CrossIcon size={96} />}</div>
        )}
      </Field>
      <div className="prompt">
        <p className="prompt-text" aria-live="polite">{prompt}</p>
        {phase === 'centre' && (
          <div className="choice-row">
            {(['car', 'truck'] as const).map((vehicle) => (
              <button
                key={vehicle}
                type="button"
                className="choice"
                data-correct={E2E ? String(trial?.centre === vehicle) : undefined}
                onClick={() => answer(vehicle)}
              >
                <VehicleIcon vehicle={vehicle} />
                <span>{text[vehicle]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
