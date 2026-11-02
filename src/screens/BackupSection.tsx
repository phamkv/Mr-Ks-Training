import { useEffect, useState } from 'react';
import { localeOf } from '../core/language';
import { useLanguage, useT } from '../i18n';
import type { Identity } from '../storage/db';
import { replaceViewLink } from '../sync/client';
import { displayCode, ensureIdentity, privateLink } from '../sync/identity';

export function BackupSection({ onRestore }: { onRestore(): void }) {
  const t = useT();
  const language = useLanguage();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void ensureIdentity().then(setIdentity);
  }, []);

  if (!identity) return null;

  async function share() {
    if (!identity!.viewToken) {
      setMessage(t('linkPending'));
      return;
    }
    const url = privateLink(identity!.viewToken);
    if (navigator.share) {
      await navigator.share({ url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url);
    setMessage(t('linkCopied'));
  }

  async function replace() {
    try {
      await replaceViewLink();
      setIdentity(await ensureIdentity());
      setMessage(t('linkReplaced'));
    } catch {
      setMessage(t('needsConnection'));
    }
    setConfirming(false);
  }

  const when = identity.lastBackupAt
    ? new Intl.DateTimeFormat(localeOf(language), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(identity.lastBackupAt))
    : null;

  return (
    <section>
      <h2 className="section-title">{t('backup')}</h2>
      <div className="stack">
        <p className="panel-note" data-testid="last-backup">{identity.backupInactive ? t('backupInactive') : when ? t('lastBackup', { when }) : t('notBackedUp')}</p>
        {identity.viewLinkReplacedElsewhere && <p className="note-ok">{t('linkElsewhere')}</p>}

        {showCode ? (
          <>
            <p className="code-box" data-testid="recovery-code">{displayCode(identity.recoveryCode)}</p>
            <p className="panel-note">{t('codeNote')}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCode(false)}>{t('hideCode')}</button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => setShowCode(true)}>{t('showCode')}</button>
        )}

        <button type="button" className="btn btn-secondary" onClick={() => void share()}>{t('shareLink')}</button>
        <p className="panel-note">{t('shareLinkNote')}</p>

        {confirming ? (
          <div className="stack" role="alertdialog" aria-labelledby="replace-title">
            <h3 className="section-title" id="replace-title">{t('replaceTitle')}</h3>
            <p className="panel-text">{t('replaceBody')}</p>
            <button type="button" className="btn btn-primary" onClick={() => setConfirming(false)}>{t('keepLink')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => void replace()}>{t('replaceConfirm')}</button>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => { setMessage(null); setConfirming(true); }}>{t('replaceLink')}</button>
        )}
        {message && <p className="note-ok" role="status">{message}</p>}

        <button type="button" className="btn btn-secondary" onClick={onRestore}>{t('restoreFromCode')}</button>
      </div>
    </section>
  );
}
