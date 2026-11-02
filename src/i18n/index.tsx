import { createContext, useContext, type ReactNode } from 'react';
import type { Language } from '../core/language';
import { de } from './de';
import { en, type MessageKey, type Messages } from './en';
import { vi } from './vi';

export const catalogs: Record<Language, Messages> = { en, de, vi };

type Params = Record<string, string | number>;

export function format(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

export function translate(language: Language, key: MessageKey, params?: Params): string {
  return format(catalogs[language][key], params);
}

const LanguageContext = createContext<Language>('vi');

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

export function useT() {
  const language = useLanguage();
  return (key: MessageKey, params?: Params) => translate(language, key, params);
}
