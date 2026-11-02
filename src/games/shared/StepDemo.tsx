import { useState, type ReactNode } from 'react';
import { useT } from '../../i18n';

export const PRACTICE_TRIALS = 3;

export function PracticeMessage({ stage, onStart, onDone, onAgain }: {
  stage: 'intro' | 'done';
  onStart(): void;
  onDone(): void;
  onAgain(): void;
}) {
  const t = useT();
  const isIntro = stage === 'intro';
  return (
    <div className="message-screen">
      <div>
        <h1 className="panel-title">{isIntro ? t('practiceTitle') : t('practiceDoneTitle')}</h1>
        <p className="panel-text">{isIntro ? t('practiceBody', { n: PRACTICE_TRIALS }) : t('practiceDoneBody')}</p>
      </div>
      <div className="stack">
        {isIntro ? (
          <button type="button" className="btn btn-primary" onClick={onStart}>{t('startPractice')}</button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={onDone}>{t('startGame')}</button>
            <button type="button" className="btn btn-secondary" onClick={onAgain}>{t('showAgain')}</button>
          </>
        )}
      </div>
    </div>
  );
}

// Each game explains itself in steps she moves through herself, then practises 3 slow turns.
export function StepDemo({ steps, practice, onDone }: {
  steps: { text: string; visual: ReactNode }[];
  practice(finished: () => void): ReactNode;
  onDone(): void;
}) {
  const t = useT();
  const [view, setView] = useState<number | 'intro' | 'practice' | 'done'>(0);

  if (view === 'practice') return <>{practice(() => setView('done'))}</>;
  if (view === 'intro' || view === 'done') {
    return <PracticeMessage stage={view} onStart={() => setView('practice')} onDone={onDone} onAgain={() => setView(0)} />;
  }
  const step = steps[view];
  return (
    <div className="trial demo">
      <div className="trial-body" aria-hidden="true">{step.visual}</div>
      <div className="prompt">
        <p className="prompt-text">{step.text}</p>
        <button
          type="button"
          className="btn btn-primary demo-next"
          onClick={() => setView(view === steps.length - 1 ? 'intro' : view + 1)}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
