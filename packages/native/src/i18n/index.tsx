import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { de } from './de';

export type Lang = 'de' | 'en';
export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
];

const LANG_KEY = 'tkd_coach_lang';
// English is the key, so the 'en' dictionary is empty (t() falls back to the key).
const DICTS: Record<Lang, Record<string, string>> = { de, en: {} };

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a UI string. The English text IS the key; unknown keys fall back to themselves. */
  t: (s: string) => string;
}

const Ctx = createContext<I18n>({ lang: 'de', setLang: () => {}, t: s => s });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de'); // default German

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(v => { if (v === 'de' || v === 'en') setLangState(v); }).catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  }, []);

  const t = useCallback((s: string) => DICTS[lang][s] ?? s, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useT(): I18n {
  return useContext(Ctx);
}
