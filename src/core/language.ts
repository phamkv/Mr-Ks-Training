export type Language = 'en' | 'de' | 'vi';

export const languages: { id: Language; name: string; locale: string }[] = [
  { id: 'vi', name: 'Tiếng Việt', locale: 'vi-VN' },
  { id: 'de', name: 'Deutsch', locale: 'de-DE' },
  { id: 'en', name: 'English', locale: 'en-GB' },
];

export function localeOf(language: Language): string {
  return languages.find((l) => l.id === language)!.locale;
}

export function preferredLanguage(navigatorLanguage: string | undefined): Language {
  const code = navigatorLanguage?.slice(0, 2).toLowerCase();
  return code === 'de' || code === 'en' || code === 'vi' ? code : 'vi';
}
