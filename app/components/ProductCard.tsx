'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, ShoppingCartIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '../contexts/LanguageContext';
import Cookies from 'js-cookie';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  slug: string;
}

export default function ProductCard({ id, name, price, images, slug }: ProductCardProps) {
  const { t } = useLanguageContext();
  const [quantity, setQuantity] = useState(0);

  // Загружаем состояние корзины при монтировании
  useEffect(() => {
    const savedCart = Cookies.get('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setQuantity(cart[id] || 0);
    }
  }, [id]);

  // Обновление количества товара
  const updateQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
      
      // Обновляем корзину в куках
      const savedCart = Cookies.get('cart');
      const cart = savedCart ? JSON.parse(savedCart) : {};
      
      if (newQuantity === 0) {
        delete cart[id];
      } else {
        cart[id] = newQuantity;
      }
      
      Cookies.set('cart', JSON.stringify(cart), { expires: 7 });

      // Сохраняем детали товара
      const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}');
      productDetails[id] = {
        name,
        images,
        price
      };
      localStorage.setItem('productDetails', JSON.stringify(productDetails));

      // Отправляем событие обновления корзины
      window.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: {
          cartData: cart,
          productId: id,
          price
        }
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative h-48 rounded-t-lg overflow-hidden">
          <Image
            src={images[0]?.url || '/images/placeholder.jpg'}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {price.toLocaleString()} {t('currency')}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 flex items-center justify-between">
        {quantity > 0 ? (
          <div className="flex items-center justify-between p-2 rounded-lg gradient-primary text-white w-full">
            <button
              onClick={() => updateQuantity(-1)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('decreaseQuantity')}
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => updateQuantity(1)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('increaseQuantity')}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => updateQuantity(-quantity)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
              aria-label={t('removeFromCart')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => updateQuantity(1)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex-grow mr-2 flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span className="text-sm">{t('addToCart')}</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-primary border border-gray-200 rounded-lg transition-colors duration-200">
              <HeartIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
} 