import { useMemo, useState } from 'react';
import type { DemoProps, GameProps } from '../../core/game';
import type { Language } from '../../core/language';
import { StepDemo, PRACTICE_TRIALS } from '../shared/StepDemo';
import { E2E, gameDriver, practiceDriver, TrialRound, type TrialSpec } from '../shared/TrialRound';
import { isCorrect, LEVELS, makeTrial, type ArrowsTrial, type Direction } from './logic';
import { messages } from './messages';

function Arrow({ direction, size = 60 }: { direction: Direction; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M46 24 28 7v10H3v14h25v10z" />
    </svg>
  );
}

function Row({ trial }: { trial: ArrowsTrial }) {
  return (
    <div className="arrow-row">
      {[0, 1, 2, 3, 4].map((i) => <Arrow key={i} direction={i === 2 ? trial.middle : trial.flanker} />)}
    </div>
  );
}

function Answers({ language, trial, answer, highlight }: { language: Language; trial?: ArrowsTrial; answer?: (d: Direction) => void; highlight?: Direction }) {
  return (
    <div className="choice-row">
      {(['left', 'right'] as const).map((direction) =>
        answer ? (
          <button key={direction} type="button" className="choice" data-correct={E2E && trial ? String(trial.middle === direction) : undefined} onClick={() => answer(direction)}>
            <Arrow direction={direction} size={72} />
            <span>{messages[language][direction]}</span>
          </button>
        ) : (
          <div key={direction} className={highlight === direction ? 'choice choice-demo-target' : 'choice'}>
            <Arrow direction={direction} size={72} />
            <span>{messages[language][direction]}</span>
          </div>
        ),
      )}
    </div>
  );
}

function spec(language: Language): TrialSpec<ArrowsTrial, Direction> {
  return {
    makeTrial: () => makeTrial(Math.random),
    isCorrect,
    windowMs: (value) => value,
    render: (trial, answer) => (
      <>
        <div className="arena"><Row trial={trial} /></div>
        <Answers language={language} trial={trial} answer={answer} />
      </>
    ),
  };
}

export function ArrowsGame(props: GameProps) {
  const driver = useMemo(() => gameDriver(props, LEVELS), []);
  const trialSpec = useMemo(() => spec(props.language), [props.language]);
  return <TrialRound spec={trialSpec} driver={driver} paused={props.paused} prompt={() => messages[props.language].question} />;
}

export function ArrowsDemo({ language, onDone }: DemoProps) {
  const text = messages[language];
  const trialSpec = useMemo(() => spec(language), [language]);
  const same: ArrowsTrial = { middle: 'right', flanker: 'right' };
  const opposite: ArrowsTrial = { middle: 'right', flanker: 'left' };
  const [round, setRound] = useState(0);
  return (
    <StepDemo
      onDone={onDone}
      steps={[
        { text: text.demoSteps[0], visual: <div className="arena"><Row trial={same} /></div> },
        { text: text.demoSteps[1], visual: <div className="arena"><Row trial={opposite} /></div> },
        { text: text.demoSteps[2], visual: <><div className="arena"><Row trial={opposite} /></div><Answers language={language} highlight="right" /></> },
      ]}
      practice={(finished) => (
        <TrialRound
          key={round}
          spec={trialSpec}
          driver={practiceDriver(LEVELS[0] * 2, PRACTICE_TRIALS, () => { setRound(round + 1); finished(); })}
          paused={false}
          prompt={() => text.question}
        />
      )}
    />
  );
}
