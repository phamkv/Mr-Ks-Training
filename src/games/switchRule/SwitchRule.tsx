import { useMemo, useState } from 'react';
import type { DemoProps, GameProps } from '../../core/game';
import type { Language } from '../../core/language';
import { StepDemo, PRACTICE_TRIALS } from '../shared/StepDemo';
import { E2E, gameDriver, practiceDriver, TrialRound, type TrialSpec } from '../shared/TrialRound';
import { correctAnswer, isCorrect, LEVELS, makeTrial, type Fill, type Rule, type Shape, type SwitchAnswer, type SwitchTrial } from './logic';
import { messages } from './messages';

function Mark({ shape, fill, size = 170 }: { shape: Shape; fill: Fill; size?: number }) {
  const paint = fill === 'filled' ? { fill: 'currentColor', stroke: 'currentColor' } : { fill: 'none', stroke: 'currentColor' };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" strokeWidth="10" aria-hidden="true" {...paint}>
      {shape === 'circle' ? <circle cx="50" cy="50" r="42" /> : <rect x="9" y="9" width="82" height="82" />}
    </svg>
  );
}

const OPTIONS: Record<Rule, { id: SwitchAnswer; shape: Shape; fill: Fill }[]> = {
  shape: [
    { id: 'circle', shape: 'circle', fill: 'filled' },
    { id: 'square', shape: 'square', fill: 'filled' },
  ],
  fill: [
    { id: 'filled', shape: 'square', fill: 'filled' },
    { id: 'outline', shape: 'square', fill: 'outline' },
  ],
};

function Answers({ language, rule, trial, answer, highlight }: { language: Language; rule: Rule; trial?: SwitchTrial; answer?: (a: SwitchAnswer) => void; highlight?: SwitchAnswer }) {
  const text = messages[language];
  return (
    <div className="choice-row">
      {OPTIONS[rule].map((option) =>
        answer ? (
          <button key={option.id} type="button" className="choice" data-correct={E2E && trial ? String(correctAnswer(trial) === option.id) : undefined} onClick={() => answer(option.id)}>
            <Mark shape={option.shape} fill={option.fill} size={56} />
            <span>{text[option.id]}</span>
          </button>
        ) : (
          <div key={option.id} className={highlight === option.id ? 'choice choice-demo-target' : 'choice'}>
            <Mark shape={option.shape} fill={option.fill} size={56} />
            <span>{text[option.id]}</span>
          </div>
        ),
      )}
    </div>
  );
}

function spec(language: Language): TrialSpec<SwitchTrial, SwitchAnswer> {
  return {
    makeTrial: () => makeTrial(Math.random),
    isCorrect,
    windowMs: (value) => value,
    render: (trial, answer) => (
      <>
        <div className="arena"><Mark shape={trial.shape} fill={trial.fill} /></div>
        <Answers language={language} rule={trial.rule} trial={trial} answer={answer} />
      </>
    ),
  };
}

const ruleText = (language: Language, rule: Rule) => (rule === 'shape' ? messages[language].ruleShape : messages[language].ruleFill);

export function SwitchRuleGame(props: GameProps) {
  const driver = useMemo(() => gameDriver(props, LEVELS), []);
  const trialSpec = useMemo(() => spec(props.language), [props.language]);
  return <TrialRound spec={trialSpec} driver={driver} paused={props.paused} prompt={(trial) => ruleText(props.language, trial.rule)} />;
}

export function SwitchRuleDemo({ language, onDone }: DemoProps) {
  const text = messages[language];
  const trialSpec = useMemo(() => spec(language), [language]);
  const [round, setRound] = useState(0);
  return (
    <StepDemo
      onDone={onDone}
      steps={[
        { text: text.demoSteps[0], visual: <div className="arena"><Mark shape="circle" fill="outline" /></div> },
        { text: text.demoSteps[1], visual: <><div className="arena"><Mark shape="circle" fill="outline" /></div><Answers language={language} rule="shape" highlight="circle" /></> },
        { text: text.demoSteps[2], visual: <><div className="arena"><Mark shape="circle" fill="outline" /></div><Answers language={language} rule="fill" highlight="outline" /></> },
      ]}
      practice={(finished) => (
        <TrialRound key={round} spec={trialSpec} driver={practiceDriver(LEVELS[0] * 2, PRACTICE_TRIALS, () => { setRound(round + 1); finished(); })} paused={false} prompt={(trial) => ruleText(language, trial.rule)} />
      )}
    />
  );
}
