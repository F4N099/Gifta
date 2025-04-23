import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it';

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      it,
    },
    lng: 'it', // Force Italian
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;