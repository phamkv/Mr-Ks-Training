import { useMemo, useState } from 'react';
import type { DemoProps, GameProps } from '../../core/game';
import type { Language } from '../../core/language';
import { StepDemo, PRACTICE_TRIALS } from '../shared/StepDemo';
import { E2E, gameDriver, practiceDriver, TrialRound, type TrialSpec } from '../shared/TrialRound';
import { isCorrect, LEVELS, makeTrial, type Shape, type TapAnswer } from './logic';
import { messages } from './messages';

function ShapeMark({ shape, size = 180 }: { shape: Shape; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      {shape === 'circle' ? <circle cx="50" cy="50" r="46" /> : <rect x="6" y="6" width="88" height="88" />}
    </svg>
  );
}

function Rules({ language }: { language: Language }) {
  const text = messages[language];
  return (
    <div className="rule-row">
      <span><ShapeMark shape="circle" size={28} />{text.ruleCircle}</span>
      <span><ShapeMark shape="square" size={28} />{text.ruleSquare}</span>
    </div>
  );
}

function TapButton({ language, onTap, shape, highlight }: { language: Language; onTap?: () => void; shape?: Shape; highlight?: boolean }) {
  const label = messages[language].tap;
  if (!onTap) return <div className={highlight ? 'btn btn-secondary btn-tap choice-demo-target' : 'btn btn-secondary btn-tap'}>{label}</div>;
  return (
    <button type="button" className="btn btn-primary btn-tap" data-correct={E2E ? String(shape === 'circle') : undefined} onClick={onTap}>{label}</button>
  );
}

function spec(language: Language): TrialSpec<Shape, TapAnswer> {
  return {
    makeTrial: () => makeTrial(Math.random),
    isCorrect,
    windowMs: (value) => value,
    render: (shape, answer) => (
      <>
        <Rules language={language} />
        <div className="arena"><ShapeMark shape={shape} /></div>
        <TapButton language={language} shape={shape} onTap={() => answer('tap')} />
      </>
    ),
  };
}

export function TapOrWaitGame(props: GameProps) {
  const driver = useMemo(() => gameDriver(props, LEVELS), []);
  const trialSpec = useMemo(() => spec(props.language), [props.language]);
  return <TrialRound spec={trialSpec} driver={driver} paused={props.paused} />;
}

export function TapOrWaitDemo({ language, onDone }: DemoProps) {
  const text = messages[language];
  const trialSpec = useMemo(() => spec(language), [language]);
  const [round, setRound] = useState(0);
  return (
    <StepDemo
      onDone={onDone}
      steps={[
        { text: text.demoSteps[0], visual: <><Rules language={language} /><div className="arena"><ShapeMark shape="circle" /></div></> },
        { text: text.demoSteps[1], visual: <><Rules language={language} /><div className="arena"><ShapeMark shape="circle" /></div><TapButton language={language} highlight /></> },
        { text: text.demoSteps[2], visual: <><Rules language={language} /><div className="arena"><ShapeMark shape="square" /></div><TapButton language={language} /></> },
      ]}
      practice={(finished) => (
        <TrialRound key={round} spec={{ ...trialSpec, windowMs: () => LEVELS[0] * 1.6 }} driver={practiceDriver(LEVELS[0], PRACTICE_TRIALS, () => { setRound(round + 1); finished(); })} paused={false} />
      )}
    />
  );
}
