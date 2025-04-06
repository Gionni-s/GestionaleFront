import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { persistor, store } from '../store';

const resources = {
  en: {
    translation: {
      'Welcome to React': 'Welcome to React and react-i18next',
    },
  },
  it: {
    translation: {
      'Welcome to React': 'Benvenuti su react',
    },
  },
};

const getInitialLanguage = () => {
  const state = store.getState();
  console.log(123);
  console.log(state.language.code);
  return state.language?.code || 'en';
};

const initialized = false;

const initializeI18n = () => {
  if (initialized) return;
  const state = store.getState();
  const lang = state.language.code || 'en';

  i18n.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState();
  if (bootstrapped) {
    initializeI18n();
  }
});

export const changeLanguage = async (langCode: string) => {
  return i18n.changeLanguage(langCode);
};

export default i18n;
