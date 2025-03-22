'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { translations } from '../i18n/translations';
import { TranslationKey } from '../i18n/types';

type Language = 'ru' | 'ky';

const LANGUAGE_COOKIE_NAME = 'preferred_language';

export const useLanguage = (initialLanguage: Language = 'ru') => {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = Cookies.get(LANGUAGE_COOKIE_NAME) as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'ky')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ru' ? 'ky' : 'ru';
    setLanguage(newLanguage);
    if (isClient) {
      Cookies.set(LANGUAGE_COOKIE_NAME, newLanguage, { expires: 365 }); // Сохраняем на год
    }
  };

  const t = (key: TranslationKey): string => {
    try {
      return translations[language][key] || translations.ru[key] || key;
    } catch {
      return translations.ru[key] || key;
    }
  };

  return { language, toggleLanguage, t };
}; 