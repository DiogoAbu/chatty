import { useTranslation as useTranslationI18n } from 'react-i18next';

export default function useTranslation(ns?: string | string[] | undefined) {
  return useTranslationI18n(ns, { useSuspense: false });
}
