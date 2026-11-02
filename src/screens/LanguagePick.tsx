import { useState } from 'react';
import { CheckIcon } from '../components/icons';
import { languages, preferredLanguage, type Language } from '../core/language';
import { translate } from '../i18n';

export function LanguagePick({ onChoose }: { onChoose(language: Language): void }) {
  const [selected, setSelected] = useState<Language>(() => preferredLanguage(navigator.language));
  return (
    <div className="screen plain">
      <main className="panel plain-panel">
        <h1 className="panel-title">{translate(selected, 'chooseLanguage')}</h1>
        <div className="stack option-list" role="radiogroup">
          {languages.map((language) => (
            <button
              key={language.id}
              type="button"
              role="radio"
              aria-checked={selected === language.id}
              lang={language.id}
              className={selected === language.id ? 'option option-selected' : 'option'}
              onClick={() => setSelected(language.id)}
            >
              {language.name}
              {selected === language.id && <CheckIcon size={36} />}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary plain-action" onClick={() => onChoose(selected)}>
          {translate(selected, 'continueButton')}
        </button>
      </main>
    </div>
  );
}
