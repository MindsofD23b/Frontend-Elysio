import { getLocales } from 'expo-localization'; 
import { I18n } from 'i18n-js'

import en from './locales/en.json'
import de from './locales/de.json'

const i18n = new I18n({
    en,
    de,
});

i18n.locale = getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;


