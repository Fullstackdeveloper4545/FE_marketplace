import { createContext } from 'react';

export const LocaleContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  uiLocales: [],
});
