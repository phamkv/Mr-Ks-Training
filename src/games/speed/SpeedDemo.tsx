import { useMemo, useState } from 'react';
import type { DemoProps } from '../../core/game';
import { useT } from '../../i18n';
import { PRACTICE_TRIALS, PracticeMessage } from '../shared/StepDemo';
import { Field, positionStyle, VehicleIcon } from './Field';
import { OUTER_POSITIONS, PRACTICE_FLASH_MS, type SpeedTrial } from './logic';
import { messages } from './messages';
import { SpeedRound, type RoundPlan } from './SpeedRound';

const example: SpeedTrial = { centre: 'truck', outer: 1, distractors: [] };

type View = { kind: 'step'; index: number } | { kind: 'practiceIntro' } | { kind: 'practice' } | { kind: 'practiceDone' };

export function SpeedDemo({ language, onDone }: DemoProps) {
  const t = useT();
  const text = messages[language];
  const [view, setView] = useState<View>({ kind: 'step', index: 0 });

  const plan = useMemo<RoundPlan>(() => {
    let done = 0;
    return {
      stage: 1,
      nextFlashMs: () => PRACTICE_FLASH_MS,
      trialFinished() {
        done += 1;
        if (done < PRACTICE_TRIALS) return true;
        setView({ kind: 'practiceDone' });
        return false;
      },
    };
  }, []);

  if (view.kind === 'practice') return <SpeedRound plan={plan} paused={false} language={language} />;

  if (view.kind === 'practiceIntro' || view.kind === 'practiceDone') {
    return (
      <PracticeMessage
        stage={view.kind === 'practiceIntro' ? 'intro' : 'done'}
        onStart={() => setView({ kind: 'practice' })}
        onDone={onDone}
        onAgain={() => setView({ kind: 'step', index: 0 })}
      />
    );
  }

  const step = view.index;
  const isLast = step === text.demoSteps.length - 1;
  return (
    <div className="speed demo">
      <Field trial={step === 1 || step === 2 ? example : null} showCross={step === 0} view={step === 1 ? 'stim-demo' : step === 2 ? 'mask' : undefined}>
        {step === 4 &&
          Array.from({ length: OUTER_POSITIONS }, (_, position) => (
            <div key={position} className={position === example.outer ? 'spot spot-demo-target' : 'spot'} style={positionStyle(position)} />
          ))}
      </Field>
      <div className="prompt">
        <p className="prompt-text">{text.demoSteps[step]}</p>
        {step === 3 && (
          <div className="choice-row" aria-hidden="true">
            {(['car', 'truck'] as const).map((vehicle) => (
              <div key={vehicle} className={vehicle === example.centre ? 'choice choice-demo-target' : 'choice'}>
                <VehicleIcon vehicle={vehicle} />
                <span>{text[vehicle]}</span>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary demo-next"
          onClick={() => setView(isLast ? { kind: 'practiceIntro' } : { kind: 'step', index: step + 1 })}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
