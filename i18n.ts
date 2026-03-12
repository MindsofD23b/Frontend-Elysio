import { getLocales } from 'expo-localization'; 
import { I18n } from 'i18n-js'
 // all language files made by claud ai 
import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json';
import es from './locales/es.json';
const i18n = new I18n({
    en,
    de,
    fr,
    es
});

i18n.locale = getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;


