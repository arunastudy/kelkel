'use client';

import { useEffect, useState } from 'react';
import FavoriteHeaderButton from '@/app/components/FavoriteHeaderButton';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import CategoriesBar from '@/app/components/CategoriesBar';
import ImageCarousel from '@/app/components/ImageCarousel';
import ProductCard from '@/app/components/ProductCard';
import SearchBar from '@/app/components/SearchBar';
import { Product } from '@/app/types';

export default function MainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { language } = useLanguageContext();
  const [searchValue, setSearchValue] = useState('');
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  useEffect(() => {
    // Загрузка продуктов
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));

    // Загрузка изображений для карусели
    fetch('/api/settings/advertising_pictures')
      .then(res => res.json())
      .then(data => setCarouselImages(data.images || []))
      .catch(err => console.error('Error loading carousel images:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoriesBar />
        <ImageCarousel images={carouselImages} />
        <div className="mt-8 grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </main>
    </div>
  );
}