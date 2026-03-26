import { useContext } from 'react';
import { LocaleContext } from '../context/localeContext';

export function useLocale() {
  return useContext(LocaleContext);
}
