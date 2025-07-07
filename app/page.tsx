'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  ChevronDownIcon, 
  XMarkIcon,
  PhoneIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  CubeIcon,
  HeartIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDateRangeIcon } from '@heroicons/react/24/solid';
import { useLanguageContext } from './contexts/LanguageContext';
import { LanguageToggle } from './components/LanguageToggle';
import CategoriesBar from './components/CategoriesBar';

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { t } = useLanguageContext();

  // Закрываем меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Обработчик для клавиши Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchFocused(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const faqs: FAQItem[] = [
    {
      question: t('faqQuestion1'),
      answer: t('faqAnswer1')
    },
    {
      question: t('faqQuestion2'),
      answer: t('faqAnswer2')
    },
    {
      question: t('faqQuestion3'),
      answer: t('faqAnswer3')
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <nav 
        className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-100"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.search-container')) {
            setIsSearchFocused(false);
          }
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Логотип */}
            <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
                <Image
                  src="/images/logo.svg"
                  alt="АПАКАЙ"
                  width={40}
                  height={40}
                className="w-auto h-6 sm:h-8"
                />
              </Link>

            {/* Правая часть (поиск и навигация) */}
            <div className="flex items-center gap-2 sm:gap-8 flex-1 justify-end">
              {/* Поисковая строка */}
              <div className="max-w-xl w-full hidden sm:block">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder={t('search')}
                    className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-[0_0_0_2px_var(--gradient-start)] transition-all duration-200 bg-white relative z-50 text-sm"
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  <button className="absolute right-2 sm:right-3 text-gray-400 hover:text-primary z-50">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
            </div>

              {/* Навигация */}
              <div className="flex items-center space-x-1 sm:space-x-6">
              <LanguageToggle />
                
                {/* Каталог - скрыть на мобильных */}
                <Link 
                  href="/catalog" 
                  className="hidden sm:flex items-center space-x-1 transition-colors hover:text-primary"
                >
                  <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm font-medium">{t('catalog')}</span>
                </Link>

                {/* Избранное - скрыть на мобильных */}
                <Link 
                  href="/favorites" 
                  className="hidden sm:flex items-center space-x-1 transition-colors hover:text-primary"
                >
                  <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm font-medium">{t('favorites')}</span>
              </Link>

                {/* Корзина - показывать всегда */}
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-1 transition-colors hover:text-primary p-1 sm:p-0"
                >
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline text-sm font-medium">{t('cart')}</span>
              </Link>

            {/* Кнопка мобильного меню */}
              <button 
                onClick={toggleMobileMenu}
                  className="sm:hidden p-1 rounded-lg hover:bg-gray-100"
                aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
              >
                {isMobileMenuOpen ? (
                    <XMarkIcon className="h-5 w-5" />
                ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              </div>
            </div>
          </div>

          {/* Мобильная поисковая строка */}
          <div className="sm:hidden py-2">
            <div className="flex items-center gap-2">
              <div className="relative search-container flex-1">
                <input
                  type="text"
                  placeholder={t('search')}
                  className="w-full h-9 pl-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-primary focus:shadow-[0_0_0_2px_var(--gradient-start)] transition-all duration-200 bg-white relative z-50 text-sm"
                  onFocus={() => setIsSearchFocused(true)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary z-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <Link 
                href="/catalog"
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Категории */}
      <div className="bg-white border-b border-gray-100">
        <CategoriesBar />
      </div>

      {/* Мобильное меню */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-50 transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileMenu}
      >
        <div 
          className={`
            fixed right-0 top-0 h-full w-[280px] max-w-[85vw] bg-white transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">{t('menu')}</span>
                <button 
                  onClick={closeMobileMenu}
                  className="p-1 rounded-lg hover:bg-gray-100"
                  aria-label={t('closeMenu')}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="mb-6">
                  <LanguageToggle />
                </div>
                <Link 
                  href="/catalog" 
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <ShoppingBagIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{t('catalog')}</span>
                </Link>
                <Link 
                  href="/favorites" 
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <HeartIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{t('favorites')}</span>
                </Link>
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCartIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">{t('cart')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Главный баннер */}
      <div className="relative gradient-primary text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg animate-fade-in">
            {t('welcome')}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {t('shopDescription')}
          </p>
          <Link href="/catalog" className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-bounce">
            {t('startShopping')}
          </Link>
        </div>
        {/* Декоративные элементы */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      {/* О нас */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
            {t('aboutUs')}
            <div className="absolute w-24 h-1 bg-primary bottom-0 left-1/2 transform -translate-x-1/2 mt-4"></div>
          </h2>
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            <div className="text-center mb-16 relative">
              <div className="absolute -left-6 -top-6 w-12 h-12 text-5xl text-primary opacity-20">"</div>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed px-4 md:px-8 lg:px-16 font-medium">
                {t('aboutUsText')}
                <br className="my-4" />
                {t('aboutUsDescription')}
              </p>
              <div className="absolute -right-6 -bottom-6 w-12 h-12 text-5xl text-primary opacity-20 rotate-180">"</div>
            </div>
            
            <div className="w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
                {t('ourAdvantages')}
                <div className="absolute w-24 h-1 gradient-primary bottom-0 left-1/2 transform -translate-x-1/2 mt-4"></div>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-8 text-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <TruckIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('fastDelivery')}</h3>
                        <p className="text-white/90">{t('fastDeliveryDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-8 text-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <ShieldCheckIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('qualityGuarantee')}</h3>
                        <p className="text-white/90">{t('qualityGuaranteeDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-8 text-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <CubeIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('wideRange')}</h3>
                        <p className="text-white/90">{t('wideRangeDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-8 text-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                        <HeartIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('affordablePrices')}</h3>
                        <p className="text-white/90">{t('affordablePricesDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как купить */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
            {t('howToBuy')}
            <div className="absolute w-24 h-1 gradient-primary bottom-0 left-1/2 transform -translate-x-1/2 mt-4"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <ShoppingBagIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">01</div>
                    <h3 className="text-xl font-semibold mb-3">{t('step1')}</h3>
                    <p className="text-white/90">{t('step1Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <ClipboardDocumentIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">02</div>
                    <h3 className="text-xl font-semibold mb-3">{t('step2')}</h3>
                    <p className="text-white/90">{t('step2Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <TruckIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">03</div>
                    <h3 className="text-xl font-semibold mb-3">{t('step3')}</h3>
                    <p className="text-white/90">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Отзывы клиентов */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
            {t('customerReviews')}
            <div className="absolute w-24 h-1 gradient-primary bottom-0 left-1/2 transform -translate-x-1/2 mt-4"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30">
                    <Image
                      src="https://randomuser.me/api/portraits/women/83.jpg"
                      alt="Айжан Б."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Айжан Бекмырзаева</h3>
                    <p className="text-white/80">{t('regularCustomer')}</p>
                  </div>
                </div>
                <p className="text-white/90 italic mb-4">{t('review1')}</p>
                <div className="flex text-yellow-300">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30">
                    <Image
                      src="https://randomuser.me/api/portraits/men/6.jpg"
                      alt="Эрлан С."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Эрлан Садыков</h3>
                    <p className="text-white/80">{t('newCustomer')}</p>
                  </div>
                </div>
                <p className="text-white/90 italic mb-4">{t('review2')}</p>
                <div className="flex text-yellow-300">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-8 text-white">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30">
                    <Image
                      src="https://randomuser.me/api/portraits/women/40.jpg"
                      alt="Гулзат Т."
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Гулзат Турусбекова</h3>
                    <p className="text-white/80">{t('regularCustomer')}</p>
                  </div>
                </div>
                <p className="text-white/90 italic mb-4">{t('review3')}</p>
                <div className="flex text-yellow-300">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Частые вопросы */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
            {t('faq')}
            <div className="absolute w-24 h-1 gradient-primary bottom-0 left-1/2 transform -translate-x-1/2 mt-4"></div>
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 gradient-primary rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative overflow-hidden rounded-2xl">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center text-white"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-lg font-semibold">{faq.question}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform duration-300 ${
                        openFAQ === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openFAQ === index ? 'max-h-40 py-4' : 'max-h-0'
                    }`}
                  >
                    <p className="text-white/90">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src="/images/logo.svg"
                  alt="APAKAI"
                  width={40}
                  height={40}
                  className="w-auto h-8"
                />
                <span className="text-2xl font-bold gradient-text">
                  АПАКАЙ
                </span>
              </div>
              <p className="text-gray-400">{t('storeDescription')}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">{t('contacts')}</h3>
              <div className="space-y-3">
                <p className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <PhoneIcon className="h-5 w-5" />
                  <a href="tel:+996755183699" className="hover:underline">
                    +996755183699
                  </a>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">{t('workingHours')}</h3>
              <div className="space-y-3">
                <p className="text-gray-400 flex items-center space-x-2">
                  <CalendarDateRangeIcon className="h-5 w-5" />
                  <span>{t('workingDays')}</span>
                </p>
                <p className="text-gray-400 flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>9:00-21:00</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 