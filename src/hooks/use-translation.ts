import { useTranslation as useTranslationI18n, UseTranslationResponse } from 'react-i18next';

export default function useTranslation(ns?: string | string[] | undefined): UseTranslationResponse {
  return useTranslationI18n(ns, { useSuspense: false });
}
