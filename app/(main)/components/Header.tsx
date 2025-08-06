'use client';

import { useState } from 'react';
import FavoriteHeaderButton from '@/app/components/FavoriteHeaderButton';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import SearchBar from '@/app/components/SearchBar';
import CategoriesBar from '@/app/components/CategoriesBar';

export default function Header() {
  const { language } = useLanguageContext();
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ru' ? 'Главная' : 'Башкы бет'}
          </h1>
          <div className="flex items-center space-x-4">
            <FavoriteHeaderButton />
            <LanguageToggle />
          </div>
        </div>
        <div className="mt-4">
          <SearchBar 
            value={searchValue}
            onChange={setSearchValue}
            placeholder={language === 'ru' ? 'Поиск товаров...' : 'Товарларды издөө...'}
          />
        </div>
        <div className="mt-4">
          <CategoriesBar />
        </div>
      </div>
    </header>
  );
}