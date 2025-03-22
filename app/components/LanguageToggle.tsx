'use client';

import { useLanguageContext } from '../contexts/LanguageContext';
import { LanguageIcon } from '@heroicons/react/24/outline';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageContext();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleLanguage}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          language === 'ru'
            ? 'bg-primary text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <LanguageIcon className="h-5 w-5" />
        <span className="font-medium">
          {language === 'ru' ? 'RU' : 'KG'}
        </span>
      </button>
    </div>
  );
} 