import { useContext } from 'react';
import { LocaleContext } from '../context/localeContext';

export function useLocale() {
  const ctx = useContext(LocaleContext);
  return {
    locale: ctx.locale,
    setLocale: ctx.setLocale,
    t: ctx.t || ((k) => k),
    uiLocales: ctx.uiLocales || [],
  };
}
