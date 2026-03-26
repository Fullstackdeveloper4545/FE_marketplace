import { useMemo, useState } from 'react';
import { LocaleContext } from './localeContext';

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('pt');
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
