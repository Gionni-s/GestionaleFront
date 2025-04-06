'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import '../services/i18n';
import { selectLanguageCode } from '../services/store/language';

function Home() {
  const { t, i18n } = useTranslation();
  const languageCode = useSelector(selectLanguageCode);

  useEffect(() => {
    if (languageCode && i18n.language !== languageCode) {
      i18n.changeLanguage(languageCode);
      console.log(`Home component: Language synced to ${languageCode}`);
    }
  }, [languageCode, i18n]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('Welcome to React')}</h1>
      <p>Current language: {i18n.language}</p>
    </div>
  );
}

export default Home;
