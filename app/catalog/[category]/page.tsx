'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCartIcon, XMarkIcon, MinusIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SearchBar from '@/app/components/SearchBar';
import Pagination from '@/app/components/Pagination';
import SortSelect from '@/app/components/SortSelect';
import Filters from '@/app/components/Filters';
import { useProducts } from '@/app/hooks/useProducts';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import Cookies from 'js-cookie';
import { TranslationKey } from '@/app/i18n/types';

const DEFAULT_PRODUCT_IMAGE = '/images/product-default.jpg';

// Компонент для просмотра галереи изображений товара
function ProductGallery({ images, name, price, t }: { images: any[], name: string, price: number, t: (key: TranslationKey) => string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
      <img
        src={images[currentIndex]?.url || DEFAULT_PRODUCT_IMAGE}
        alt={name}
        className="object-cover object-center group-hover:scale-105 transition-transform duration-300 w-full h-full"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-colors duration-300 shadow-lg border border-white/20 z-10"
            aria-label={t('previousImage')}
          >
            <ChevronLeftIcon className="h-5 w-5 drop-shadow-md" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-colors duration-300 shadow-lg border border-white/20 z-10"
            aria-label={t('nextImage')}
          >
            <ChevronRightIcon className="h-5 w-5 drop-shadow-md" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-md ${
                  idx === currentIndex 
                    ? 'bg-primary scale-110' 
                    : 'bg-white/70 hover:bg-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                role="button"
                aria-label={`${t('image')} ${idx + 1} ${t('of')} ${images.length}`}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
        <div className="flex items-center justify-end">
          <div className="text-white font-bold text-xl drop-shadow-md">
            {price.toLocaleString('ru-RU')} {t('currency')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name-asc');
  const [sortField, sortOrder] = sort.split('-') as [string, 'asc' | 'desc'];
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const { t } = useLanguageContext();

  const sortOptions = [
    { value: 'name-asc', label: t('sortNameAZ') },
    { value: 'name-desc', label: t('sortNameZA') },
    { value: 'price-asc', label: t('priceLowToHigh') },
    { value: 'price-desc', label: t('priceHighToLow') }
  ];

  const filterGroups = [
    {
      id: 'price_range',
      name: t('priceRange'),
      options: [
        { value: 'under_50000', label: t('priceUnder50') },
        { value: '50000_100000', label: t('price50to100') },
        { value: 'over_100000', label: t('priceOver100') }
      ]
    }
  ];

  useEffect(() => {
    const savedCart = Cookies.get('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      Cookies.set('cart', JSON.stringify(cart), { expires: 7 });
    } else {
      Cookies.remove('cart');
    }
  }, [cart]);

  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useProducts(
    params.category,
    search,
    page,
    sortField,
    sortOrder,
    selectedFilters
  );

  const updateQuantity = (productId: string, delta: number, price: number, product: any) => {
    setCart(prev => {
      const newCart = { ...prev };
      const newQuantity = (prev[productId] || 0) + delta;
      
      if (newQuantity <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQuantity;
      }

      // Сохраняем детали товара
      const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}');
      productDetails[productId] = {
        name: product.name,
        description: product.description,
        images: product.images,
      };
      localStorage.setItem('productDetails', JSON.stringify(productDetails));

      // Вызываем событие обновления корзины с ценой товара
      window.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: {
          cartData: newCart,
          productId,
          price
        }
      }));
      
      return newCart;
    });
  };

  const removeFromCart = (productId: string, price: number, product: any) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];

      // Вызываем событие обновления корзины с ценой товара
      window.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: {
          cartData: newCart,
          productId,
          price
        }
      }));

      return newCart;
    });
  };

  // Фильтруем товары, чтобы показывать только доступные (isAvailable: true)
  const filteredProducts = productsData?.products.filter(product => product.isAvailable) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Баннер категории */}
      <div className="relative gradient-primary text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold capitalize">
              {productsData?.products[0]?.category?.name || t('loading')}
            </h1>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Сайдбар с фильтрами */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters')}</h2>
              <Filters
                groups={filterGroups}
                selectedFilters={selectedFilters}
                onChange={(groupId, values) => {
                  setSelectedFilters(prev => ({
                    ...prev,
                    [groupId]: values
                  }));
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            {/* Панель управления */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
              <div className="w-full sm:w-96">
                <SearchBar
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  placeholder={t('searchProducts')}
                />
              </div>
              <div className="w-full sm:w-64">
                <SortSelect
                  value={sort}
                  onChange={setSort}
                  options={sortOptions}
                />
              </div>
            </div>

            {productsError && (
              <div className="text-center py-12 text-red-600">
                {t('error')}
              </div>
            )}

            {isProductsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Сетка товаров */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative">
                      <ProductGallery 
                        images={product.images || []} 
                        name={product.name}
                        price={product.price}
                        t={t}
                      />
                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-gray-600">{product.description}</p>
                        {cart[product.id] ? (
                          <div className="flex items-center justify-between p-2 rounded-lg gradient-primary text-white">
                            <button
                              onClick={() => updateQuantity(product.id.toString(), -1, product.price, product)}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors"
                              aria-label={t('decreaseQuantity')}
                            >
                              <MinusIcon className="h-5 w-5" />
                            </button>
                            <span className="font-medium">{cart[product.id]}</span>
                            <button
                              onClick={() => updateQuantity(product.id.toString(), 1, product.price, product)}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors"
                              aria-label={t('increaseQuantity')}
                            >
                              <PlusIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(product.id.toString(), product.price, product)}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
                              aria-label={t('removeFromCart')}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateQuantity(product.id.toString(), 1, product.price, product)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg gradient-primary gradient-hover text-white transition-all duration-300 shadow-md hover:shadow-xl"
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>{t('addToCart')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Пагинация */}
                {productsData && productsData.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={productsData.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 