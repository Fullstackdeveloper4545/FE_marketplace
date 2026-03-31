import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocaleContext } from './localeContext';
import { makeTranslator, UI_LOCALES } from '../locales/uiStrings';

const STORAGE_KEY = 'dm_ui_locale';

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && UI_LOCALES.some((l) => l.code === v)) return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((code) => {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useMemo(() => makeTranslator(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, uiLocales: UI_LOCALES }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
