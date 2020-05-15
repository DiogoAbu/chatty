import { initReactI18next } from 'react-i18next';
import * as rnLocalize from 'react-native-localize';
import i18n from 'i18next';
import moment from 'moment-timezone';

import locales from './locales';

const fallback = {
  languageTag: 'en',
};

const { languageTag } = rnLocalize.findBestAvailableLanguage(Object.keys(locales)) || fallback;

moment.locale(languageTag);
moment.tz.setDefault(rnLocalize.getTimeZone());

i18n.use(initReactI18next).init({
  initImmediate: true,
  interpolation: {
    escapeValue: false,
  },
  keySeparator: false,
  lng: languageTag,
  resources: locales,
});

export default i18n;
