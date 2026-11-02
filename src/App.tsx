import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Language } from './core/language';
import { games } from './core/registry';
import type { TodaysSet } from './core/setGenerator';
import { LanguageProvider, translate } from './i18n';
import { Home } from './screens/Home';
import { InstallHelp } from './screens/InstallHelp';
import { LanguagePick } from './screens/LanguagePick';
import { Restore } from './screens/Restore';
import { SetRunner } from './screens/SetRunner';
import { Settings } from './screens/Settings';
import { getSettings, updateSettings } from './storage/store';
import { startAutoSync } from './sync/client';

type Screen = { kind: 'home'; finishedIndex: number | null } | { kind: 'set'; set: TodaysSet } | { kind: 'settings' } | { kind: 'restore' };

function shouldShowInstallHelp(): boolean {
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isIos && !standalone;
}

export function App() {
  // Registered here rather than on the pass, so the app is available offline from the first launch.
  const { needRefresh: [updateReady], updateServiceWorker } = useRegisterSW();
  const settings = useLiveQuery(getSettings);
  useEffect(() => startAutoSync(), []);
  const [screen, setScreen] = useState<Screen>({ kind: 'home', finishedIndex: null });
  const backToHome = useCallback((finishedIndex: number | null) => setScreen({ kind: 'home', finishedIndex }), []);

  if (!settings) return <div className="screen" />;

  if (!settings.language) {
    return (
      <LanguagePick
        onChoose={(language: Language) => {
          void navigator.storage?.persist?.();
          void updateSettings({ language }, true);
        }}
      />
    );
  }

  const language = settings.language;
  document.documentElement.lang = language;

  return (
    <LanguageProvider language={language}>
      {!settings.installHelpDone && shouldShowInstallHelp() ? (
        <InstallHelp onContinue={() => void updateSettings({ installHelpDone: true })} />
      ) : screen.kind === 'set' ? (
        <SetRunner games={games} set={screen.set} onBack={backToHome} />
      ) : screen.kind === 'settings' ? (
        <Settings onBack={() => backToHome(null)} onRestore={() => setScreen({ kind: 'restore' })} />
      ) : screen.kind === 'restore' ? (
        <Restore onBack={() => setScreen({ kind: 'settings' })} />
      ) : (
        <Home
          games={games}
          finishedIndex={screen.finishedIndex}
          onUpdate={updateReady || (import.meta.env.VITE_E2E && window.location.search.includes('e2eUpdate')) ? () => void updateServiceWorker(true) : null}
          onStart={(set) => setScreen({ kind: 'set', set })}
          onSettings={() => setScreen({ kind: 'settings' })}
        />
      )}
      <div className="turn-upright"><p>{translate(language, 'turnUpright')}</p></div>
    </LanguageProvider>
  );
}
