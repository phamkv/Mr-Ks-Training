import { useState } from 'react';
import { useT } from '../i18n';

// Only ever rendered on the pass, so a new version can't apply during a game. A small button keeps
// the pass from needing to scroll, and the next screen explains what updating does.
export function UpdatePrompt({ onUpdate }: { onUpdate(): void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-small" onClick={() => setOpen(true)}>{t('updateButton')}</button>
      {open && (
        <div className="screen update-screen" role="alertdialog" aria-labelledby="update-title">
          <div className="panel leave-panel">
            <h1 className="panel-title" id="update-title">{t('updateTitle')}</h1>
            <p className="panel-text">{t('updateReady')}</p>
            <div className="stack leave-actions">
              <button type="button" className="btn btn-primary btn-large" onClick={onUpdate}>{t('updateNow')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>{t('updateLater')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
