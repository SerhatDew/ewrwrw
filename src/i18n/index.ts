import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { format as formatDate } from 'date-fns';
import tr from 'date-fns/locale/tr';
import enUS from 'date-fns/locale/en-US';
import de from 'date-fns/locale/de';
import fr from 'date-fns/locale/fr';

const locales = { tr, en: enUS, de, fr };

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['tr', 'en', 'de', 'fr'],
    debug: false,
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          const locale = locales[lng as keyof typeof locales] || locales.en;
          return formatDate(value, format || 'PP', { locale });
        }
        return value;
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      reloadInterval: false,
      customHeaders: {
        'Cache-Control': 'no-cache',
      },
    },
  });

export default i18n;