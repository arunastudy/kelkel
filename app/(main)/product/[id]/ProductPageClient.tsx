'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import { ShoppingCartIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FavoriteButton from '@/app/components/FavoriteButton';
import InstallmentCalculator from '@/app/components/InstallmentCalculator';
import Cookies from 'js-cookie';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: {
    url: string;
  }[];
}

interface ProductPageClientProps {
  initialProduct: Product | null;
}

export default function ProductPageClient({ initialProduct }: ProductPageClientProps) {
  const { t } = useLanguageContext();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);

  // Загружаем состояние корзины при монтировании
  useEffect(() => {
    if (initialProduct) {
      const savedCart = Cookies.get('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        setQuantity(cart[initialProduct.id] || 0);
      }
    }
  }, [initialProduct]);

  const updateCart = (delta: number) => {
    if (!initialProduct) return;

    const newQuantity = quantity + delta;
    
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
      
      // Обновляем корзину в куках
      const savedCart = Cookies.get('cart');
      const cart = savedCart ? JSON.parse(savedCart) : {};
      
      if (newQuantity === 0) {
        delete cart[initialProduct.id];
      } else {
        cart[initialProduct.id] = newQuantity;
      }
      
      Cookies.set('cart', JSON.stringify(cart), { expires: 7 });

      // Сохраняем детали товара
      const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}');
      if (newQuantity > 0) {
        productDetails[initialProduct.id] = {
          name: initialProduct.name,
          images: initialProduct.images,
          price: initialProduct.price
        };
      } else {
        delete productDetails[initialProduct.id];
      }
      localStorage.setItem('productDetails', JSON.stringify(productDetails));

      // Отправляем событие обновления корзины
      window.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: {
          cartData: cart,
          productId: initialProduct.id,
          price: initialProduct.price
        }
      }));
    }
  };

  if (!initialProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('productNotFound')}</h1>
        <p className="text-gray-600">{t('productNotFoundDescription')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Галерея изображений */}
        <div className="flex gap-4">
          {/* Вертикальный список миниатюр */}
          <div className="flex flex-col gap-4 w-24">
            {initialProduct.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all
                  ${index === selectedImageIndex 
                    ? 'border-primary' 
                    : 'border-transparent hover:border-gray-300'
                  }`}
              >
                <Image
                  src={image.url}
                  alt={`${initialProduct.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>

          {/* Большое изображение */}
          <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
            {initialProduct.images[selectedImageIndex] && (
              <Image
                src={initialProduct.images[selectedImageIndex].url}
                alt={initialProduct.name}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            )}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">{initialProduct.name}</h1>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>{initialProduct.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium text-gray-900">
                {initialProduct.price.toLocaleString('ru-RU')} {t('currency')}
              </span>
            </div>

            <div className="flex items-center w-full max-w-md">
              {quantity > 0 ? (
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-between p-2 h-10 rounded-lg gradient-primary text-white flex-grow mr-2">
                    <button
                      onClick={() => updateCart(-1)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      aria-label={t('decreaseQuantity')}
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="font-medium">{quantity}</span>
                    <button
                      onClick={() => updateCart(1)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      aria-label={t('increaseQuantity')}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => updateCart(-quantity)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
                      aria-label={t('removeFromCart')}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="w-10 flex-shrink-0">
                    <FavoriteButton productId={initialProduct.id} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <button 
                    onClick={() => updateCart(1)}
                    className="bg-primary text-white h-10 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex-grow mr-2 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span className="text-sm">{t('addToCart')}</span>
                  </button>
                  <div className="w-10 flex-shrink-0">
                    <FavoriteButton productId={initialProduct.id} />
                  </div>
                </div>
              )}
            </div>

            {/* Калькулятор рассрочки */}
            <InstallmentCalculator price={initialProduct.price} />
          </div>
        </div>
      </div>
    </div>
  );
}