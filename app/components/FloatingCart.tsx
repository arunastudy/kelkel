'use client';

import { useEffect, useState } from 'react';
import { ShoppingCartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useLanguageContext } from '@/app/contexts/LanguageContext';

interface CartData {
  [key: string]: number;
}

interface CartInfo {
  count: number;
  sum: number;
}

export default function FloatingCart() {
  const [cartInfo, setCartInfo] = useState<CartInfo>({ count: 0, sum: 0 });
  const pathname = usePathname();
  const isCartPage = pathname === '/cart';
  const { t } = useLanguageContext();

  const calculateCartInfo = (cartData: CartData, prices: Record<string, number>) => {
    const count = Object.values(cartData).reduce((acc, quantity) => acc + quantity, 0);
    const sum = Object.entries(cartData).reduce((acc, [id, quantity]) => {
      return acc + (prices[id] || 0) * quantity;
    }, 0);
    return { count, sum };
  };

  useEffect(() => {
    const updateCartInfo = () => {
      const cart = Cookies.get('cart');
      if (cart) {
        try {
          const cartData = JSON.parse(cart) as CartData;
          const prices = JSON.parse(localStorage.getItem('cartPrices') || '{}');
          const info = calculateCartInfo(cartData, prices);
          console.log('Cart updated:', info); // Добавляем лог для отладки
          setCartInfo(info);
        } catch (error) {
          console.error('Error calculating cart info:', error);
          setCartInfo({ count: 0, sum: 0 });
        }
      } else {
        setCartInfo({ count: 0, sum: 0 });
      }
    };

    // Обновляем при монтировании
    updateCartInfo();

    // Подписываемся на событие обновления корзины
    const handleCartUpdate = () => {
      console.log('Cart update event received'); // Добавляем лог для отладки
      updateCartInfo();
    };

    // Обновляем при изменении видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateCartInfo();
      }
    };

    // Добавляем слушатели событий
    window.addEventListener('cartUpdate', handleCartUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Периодически проверяем состояние корзины
    const interval = setInterval(updateCartInfo, 1000);

    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  if (cartInfo.count === 0 && !isCartPage) {
    return null;
  }

  if (isCartPage) {
    return (
      <Link 
        href="/catalog"
        className="fixed bottom-8 right-8 z-50 flex items-center space-x-4 bg-white rounded-2xl shadow-lg px-6 py-4 hover:shadow-xl transition-all duration-300 hover:scale-105 gradient-primary text-white"
      >
        <div className="flex items-center space-x-3">
          <ShoppingBagIcon className="h-6 w-6" />
          <span className="font-medium">{t('catalog')}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href="/cart"
      className="fixed bottom-8 right-8 z-50 flex items-center space-x-4 bg-white rounded-2xl shadow-lg px-6 py-4 hover:shadow-xl transition-all duration-300 hover:scale-105 gradient-primary text-white"
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <ShoppingCartIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartInfo.count}
          </span>
        </div>
        <span className="font-medium">{t('cart')}</span>
      </div>
      <div className="pl-3 border-l border-white/20 font-medium">
        {cartInfo.sum.toLocaleString('ru-RU')} {t('currency')}
      </div>
    </Link>
  );
} 