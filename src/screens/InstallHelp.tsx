import { useT } from '../i18n';

function ShareSymbol() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 30V6M15 14l9-9 9 9M14 20h-4v22h28V20h-4" />
    </svg>
  );
}

function AddSymbol() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="8" />
      <path d="M24 15v18M15 24h18" />
    </svg>
  );
}

function AppSymbol() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="5" y="5" width="38" height="38" rx="9" fill="var(--surround)" />
      <rect x="13" y="11" width="22" height="26" rx="3" fill="var(--paper)" />
      <rect x="13" y="16" width="22" height="6" fill="var(--amber)" />
    </svg>
  );
}

export function InstallHelp({ onContinue }: { onContinue(): void }) {
  const t = useT();
  const steps = [
    { symbol: <ShareSymbol />, text: t('installStep1') },
    { symbol: <AddSymbol />, text: t('installStep2') },
    { symbol: <AppSymbol />, text: t('installStep3') },
  ];
  return (
    <div className="screen plain">
      <main className="panel plain-panel">
        <h1 className="panel-title">{t('installTitle')}</h1>
        <ol className="install-steps">
          {steps.map((step, index) => (
            <li key={index}>
              <span className="install-symbol">{step.symbol}</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
        <p className="panel-text">{t('installNote')}</p>
        <button type="button" className="btn btn-primary plain-action" onClick={onContinue}>{t('continueInBrowser')}</button>
      </main>
    </div>
  );
}
