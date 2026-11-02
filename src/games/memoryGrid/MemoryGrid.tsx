import { useEffect, useMemo, useState } from 'react';
import type { DemoProps, GameProps } from '../../core/game';
import type { Language } from '../../core/language';
import { format } from '../../i18n';
import { StepDemo, PRACTICE_TRIALS } from '../shared/StepDemo';
import { E2E, gameDriver, practiceDriver, TrialRound, type TrialSpec } from '../shared/TrialRound';
import { isCorrect, LEVELS, makeTrial, showMs, type MemoryTrial } from './logic';
import { messages } from './messages';

function Grid({ gridSize, lit, onTap, correct }: { gridSize: number; lit: number[]; onTap?: (tile: number) => void; correct?: number[] }) {
  return (
    <div className="tile-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {Array.from({ length: gridSize * gridSize }, (_, tile) =>
        onTap ? (
          <button
            key={tile}
            type="button"
            className={lit.includes(tile) ? 'tile tile-lit' : 'tile'}
            aria-label={String(tile + 1)}
            aria-pressed={lit.includes(tile)}
            data-correct={E2E && correct ? String(correct.includes(tile)) : undefined}
            onClick={() => onTap(tile)}
          />
        ) : (
          <div key={tile} className={lit.includes(tile) ? 'tile tile-lit' : 'tile'} />
        ),
      )}
    </div>
  );
}

function Recall({ language, trial, onDone }: { language: Language; trial: MemoryTrial; onDone(tiles: number[]): void }) {
  const text = messages[language];
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [chosen, setChosen] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('recall'), showMs(trial.tiles.length));
    return () => clearTimeout(timer);
  }, [trial]);

  if (phase === 'show') {
    return (
      <>
        <p className="prompt-text">{text.watch}</p>
        <div className="arena"><Grid gridSize={trial.gridSize} lit={trial.tiles} /></div>
      </>
    );
  }
  const total = trial.tiles.length;
  return (
    <>
      <p className="prompt-text">{text.tapBack}</p>
      <div className="arena">
        <Grid
          gridSize={trial.gridSize}
          lit={chosen}
          correct={trial.tiles}
          onTap={(tile) =>
            setChosen((current) =>
              current.includes(tile) ? current.filter((t) => t !== tile) : current.length < total ? [...current, tile] : current,
            )
          }
        />
      </div>
      <button type="button" className="btn btn-primary btn-done" disabled={chosen.length !== total} onClick={() => onDone(chosen)}>
        {chosen.length === total ? text.done : format(text.chosen, { n: chosen.length, total })}
      </button>
    </>
  );
}

function spec(language: Language): TrialSpec<MemoryTrial, number[]> {
  return {
    makeTrial: (value) => makeTrial(Math.random, value),
    isCorrect,
    windowMs: () => null, // no time limit for tapping back
    render: (trial, answer) => <Recall language={language} trial={trial} onDone={answer} />,
  };
}

export function MemoryGridGame(props: GameProps) {
  const driver = useMemo(() => gameDriver(props, LEVELS), []);
  const trialSpec = useMemo(() => spec(props.language), [props.language]);
  return <TrialRound spec={trialSpec} driver={driver} paused={props.paused} />;
}

export function MemoryGridDemo({ language, onDone }: DemoProps) {
  const text = messages[language];
  const trialSpec = useMemo(() => spec(language), [language]);
  const [round, setRound] = useState(0);
  const example = [1, 6, 11];
  return (
    <StepDemo
      onDone={onDone}
      steps={[
        { text: text.demoSteps[0], visual: <div className="arena"><Grid gridSize={4} lit={example} /></div> },
        { text: text.demoSteps[1], visual: <div className="arena"><Grid gridSize={4} lit={[1, 6]} /></div> },
        { text: text.demoSteps[2], visual: <><div className="arena"><Grid gridSize={4} lit={example} /></div><div className="btn btn-secondary choice-demo-target">{text.done}</div></> },
      ]}
      practice={(finished) => (
        <TrialRound key={round} spec={trialSpec} driver={practiceDriver(LEVELS[0], PRACTICE_TRIALS, () => { setRound(round + 1); finished(); })} paused={false} />
      )}
    />
  );
}
