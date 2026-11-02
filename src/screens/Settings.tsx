import { useEffect, useState } from 'react';
import { CheckIcon } from '../components/icons';
import { languages } from '../core/language';
import { useT } from '../i18n';
import { db, type Settings as SettingsRow } from '../storage/db';
import { getSettings, updateSettings } from '../storage/store';
import { BackupSection } from './BackupSection';

export function Settings({ onBack, onRestore }: { onBack(): void; onRestore(): void }) {
  const t = useT();
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const [rejected, setRejected] = useState(0);

  useEffect(() => {
    void getSettings().then(setSettings);
    void navigator.storage?.persisted?.().then(setPersistent);
    void db.results.filter((result) => result.syncRejectedAt !== null).count().then(setRejected);
  }, []);

  if (!settings) return <div className="screen" />;

  async function change(update: Partial<SettingsRow>) {
    await updateSettings(update, true);
    setSettings(await getSettings());
  }

  return (
    <div className="screen plain settings">
      <button type="button" className="btn-small settings-back" onClick={onBack}>{t('backToSet')}</button>
      <main className="panel plain-panel">
        <h1 className="panel-title">{t('settings')}</h1>

        <section>
          <h2 className="section-title">{t('language')}</h2>
          <div className="stack" role="radiogroup" aria-label={t('language')}>
            {languages.map((language) => (
              <button
                key={language.id}
                type="button"
                role="radio"
                aria-checked={settings.language === language.id}
                lang={language.id}
                className={settings.language === language.id ? 'option option-selected' : 'option'}
                onClick={() => void change({ language: language.id })}
              >
                {language.name}
                {settings.language === language.id && <CheckIcon size={36} />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">{t('daysPerWeek')}</h2>
          <div className="segments" role="radiogroup" aria-label={t('daysPerWeek')}>
            {[3, 5, 7].map((days) => (
              <button
                key={days}
                type="button"
                role="radio"
                aria-checked={settings.daysPerWeek === days}
                className={settings.daysPerWeek === days ? 'option option-selected' : 'option'}
                onClick={() => void change({ daysPerWeek: days })}
              >
                {days}
              </button>
            ))}
          </div>
          <p className="panel-note">{t('daysPerWeekNote')}</p>
        </section>

        <BackupSection onRestore={onRestore} />

        <section>
          <h2 className="section-title">{t('about')}</h2>
          <dl className="facts">
            <div><dt>{t('version')}</dt><dd>{__APP_VERSION__}</dd></div>
            <div><dt>{t('storageKept')}</dt><dd>{persistent ? t('yes') : t('no')}</dd></div>
            <div>
              <dt>{t('frameInterval')}</dt>
              <dd>{settings.lastFrameMs === null ? t('notMeasured') : `${settings.lastFrameMs.toFixed(1)} ms`}</dd>
            </div>
            {rejected > 0 && <div><dt>{t('rejectedResults')}</dt><dd>{rejected}</dd></div>}
          </dl>
        </section>
      </main>
    </div>
  );
}
