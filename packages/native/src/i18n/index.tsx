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

// Module-level mirror of the active language so non-React code (pure utils like
// format.ts) can translate too. Kept in sync by the provider below.
let currentLang: Lang = 'de';
/** Translate outside React (utils/services). The English text IS the key. */
export function translate(s: string): string {
  return DICTS[currentLang][s] ?? s;
}

/** Best-effort device language (Hermes Intl). German device → 'de', otherwise 'en'. */
function deviceLang(): Lang {
  try {
    const loc = (Intl as { DateTimeFormat?: () => { resolvedOptions: () => { locale: string } } })
      .DateTimeFormat?.().resolvedOptions().locale ?? '';
    return loc.toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'de';
  }
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a UI string. The English text IS the key; unknown keys fall back to themselves. */
  t: (s: string) => string;
}

const Ctx = createContext<I18n>({ lang: 'de', setLang: () => {}, t: s => s });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceLang); // default from device locale
  currentLang = lang; // keep the module-level mirror in sync for translate()

  useEffect(() => {
    // A previously saved choice overrides the device default.
    AsyncStorage.getItem(LANG_KEY).then(v => { if (v === 'de' || v === 'en') setLangState(v); }).catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    currentLang = l;
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  }, []);

  const t = useCallback((s: string) => DICTS[lang][s] ?? s, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useT(): I18n {
  return useContext(Ctx);
}
