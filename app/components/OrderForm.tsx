'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface OrderFormProps {
  cartItems: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalSum: number;
  onClose: () => void;
}

export default function OrderForm({ cartItems, totalSum, onClose }: OrderFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'whatsapp',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { t, language } = useLanguageContext();
  const router = useRouter();

  const sendToTelegram = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          language // Добавляем язык интерфейса
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('orderError'));
      }

      return true;
    } catch (error) {
      console.error('Ошибка отправки заказа:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Подготавливаем данные о товарах
      const items = cartItems.map(item => {
        return {
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          id: item.product.id
        };
      });



      // Отправляем заказ
      await sendToTelegram({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        contactType: formData.contactType,
        items,
        totalSum
      });

      // Очищаем корзину
      Cookies.remove('cart');
      localStorage.removeItem('cartPrices');
      localStorage.removeItem('productDetails');

      // Вызываем событие обновления корзины
      window.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: {
          cartData: {},
        }
      }));

      onClose();
      // Перенаправляем на страницу корзины и перезагружаем её
      router.push('/cart');
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      setError(err instanceof Error ? err.message : t('orderError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Затемнение фона */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Модальное окно */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('checkout')}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={t('close')}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus:border-primary focus:ring-primary transition-all duration-300"
                  placeholder={t('enterFullName')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactType" className="block text-sm font-semibold text-gray-700">
                  {t('contactType')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus-within:border-primary transition-all duration-300">
                    <input
                      type="radio"
                      name="contactType"
                      value="whatsapp"
                      checked={formData.contactType === 'whatsapp'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`flex items-center justify-center text-sm font-medium ${formData.contactType === 'whatsapp' ? 'text-primary' : 'text-gray-700'}`}>
                      WhatsApp
                    </span>
                    {formData.contactType === 'whatsapp' && (
                      <span className="absolute inset-0 border-2 border-primary rounded-xl"></span>
                    )}
                  </label>
                  <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm focus-within:border-primary transition-all duration-300">
                    <input
                      type="radio"
                      name="contactType"
                      value="call"
                      checked={formData.contactType === 'call'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`flex items-center justify-center text-sm font-medium ${formData.contactType === 'call' ? 'text-primary' : 'text-gray-700'}`}>
                      {t('call')}
                    </span>
                    {formData.contactType === 'call' && (
                      <span className="absolute inset-0 border-2 border-primary rounded-xl"></span>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus:border-primary focus:ring-primary transition-all duration-300"
                  placeholder={t('enterPhone')}
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="text-xl font-bold text-gray-900 flex items-center justify-between">
                  <span>{t('total')}:</span>
                  <span className="gradient-text">{totalSum.toLocaleString('ru-RU')} {t('currency')}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl gradient-primary px-6 py-4 text-white text-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? t('processing') : t('placeOrder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 