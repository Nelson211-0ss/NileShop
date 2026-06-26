import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, ar } from './locales';

const savedLocale = localStorage.getItem('nileshop_locale') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('nileshop_locale', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

document.documentElement.lang = savedLocale;
document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';

export default i18n;
