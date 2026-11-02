import { useState } from 'react';
import { useT } from '../i18n';
import { db } from '../storage/db';
import { requestSync, RestoreError, restoreFromCode } from '../sync/client';
import { normalizeCode } from '../sync/identity';

type Step = 'enter' | 'confirm' | 'working' | 'done';

export function Restore({ onBack }: { onBack(): void }) {
  const t = useT();
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('enter');
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setStep('working');
    setError(null);
    try {
      await restoreFromCode(code);
      requestSync();
      setStep('done');
    } catch (failure) {
      setError(failure instanceof RestoreError && failure.reason === 'not_found' ? t('restoreNotFound') : t('restoreFailed'));
      setStep('enter');
    }
  }

  async function next() {
    if ((await db.results.count()) > 0) setStep('confirm');
    else await run();
  }

  return (
    <div className="screen plain settings">
      <button type="button" className="btn-small settings-back" onClick={onBack}>{t('backToSettings')}</button>
      <main className="panel plain-panel">
        {step === 'done' ? (
          <>
            <h1 className="panel-title">{t('restoreTitle')}</h1>
            <p className="panel-text" role="status">{t('restoreDone')}</p>
            <button type="button" className="btn btn-primary" onClick={onBack}>{t('backToSettings')}</button>
          </>
        ) : step === 'confirm' ? (
          <div role="alertdialog" aria-labelledby="restore-confirm" className="stack">
            <h1 className="panel-title" id="restore-confirm">{t('restoreConfirmTitle')}</h1>
            <p className="panel-text">{t('restoreConfirmBody')}</p>
            <button type="button" className="btn btn-secondary" onClick={() => void run()}>{t('restoreConfirm')}</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep('enter')}>{t('restoreCancel')}</button>
          </div>
        ) : (
          <>
            <h1 className="panel-title">{t('restoreTitle')}</h1>
            <p className="panel-text">{t('restoreBody')}</p>
            <div>
              <label className="field-label" htmlFor="recovery-code">{t('restoreLabel')}</label>
              <input
                id="recovery-code"
                className="text-input"
                value={code}
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            {error && <p className="note-ok" role="alert">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              disabled={normalizeCode(code).length !== 26 || step === 'working'}
              onClick={() => void next()}
            >
              {t('restoreNext')}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
