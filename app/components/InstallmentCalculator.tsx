'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import { IoInformationCircle } from 'react-icons/io5';

interface InstallmentOption {
  months: string;
  percent: number;
}

interface InstallmentCalculatorProps {
  price: number;
}

export default function InstallmentCalculator({ price }: InstallmentCalculatorProps) {
  const { t } = useLanguageContext();
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<InstallmentOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | undefined>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowTooltip(false);
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTooltipClick = () => {
    setShowTooltip(true);
    
    // Clear existing timer if any
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }

    // Set new timer
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 15000);
  };

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/settings/installment');
        const data = await response.json();
        
        console.log('Raw installment data:', data); // Логируем сырые данные

        if (!data.installments || !Array.isArray(data.installments)) {
          throw new Error('Invalid installment data format');
        }

        // Преобразуем месяцы в числа для правильной сортировки
        const sortedInstallments = [...data.installments].sort((a, b) => {
          const monthsA = parseInt(a.months);
          const monthsB = parseInt(b.months);
          return monthsA - monthsB;
        });

        console.log('Sorted installments:', sortedInstallments); // Логируем отсортированные данные
        
        setInstallments(sortedInstallments);
      } catch (error) {
        console.error('Error fetching installments:', error);
        setError(error instanceof Error ? error.message : 'Failed to load installment options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstallments();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    console.error('Installment calculator error:', error);
    return null;
  }

  if (installments.length === 0) {
    return null;
  }

  const handleOptionClick = (option: InstallmentOption) => {
    console.log('Selected option:', option); // Логируем выбранную опцию
    if (selectedOption?.months === option.months) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  };

  const calculateInstallment = () => {
    if (!selectedOption) return null;

    const months = parseInt(selectedOption.months);
    if (isNaN(months)) {
      console.error('Invalid months value:', selectedOption.months);
      return null;
    }

    const totalAmount = price * (1 + selectedOption.percent / 100);
    const monthlyPayment = totalAmount / months;
    const markup = totalAmount - price;

    return {
      totalAmount,
      monthlyPayment,
      markup,
      months
    };
  };

  const calculations = calculateInstallment();

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('installmentCalculator')}</h3>
        <div className="relative" ref={tooltipRef}>
          <button
            onClick={handleTooltipClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Информация о рассрочке"
          >
            <IoInformationCircle size={24} />
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-8 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-gray-600 z-10">
              Цены в рассрочку могут отличаться и меняться в зависимости от условий банка.
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {installments.map((option) => (
          <button
            key={option.months}
            onClick={() => handleOptionClick(option)}
            className={`p-3 rounded-lg text-sm font-medium transition-colors
              ${selectedOption?.months === option.months
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {parseInt(option.months)} {t('months')}
          </button>
        ))}
      </div>

      {selectedOption && calculations && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{t('originalPrice')}</span>
            <span className="font-medium">{price.toLocaleString('ru-RU')} {t('currency')}</span>
          </div>
          
          <div className="flex justify-between text-gray-900 font-medium">
            <span>{t('totalAmount')}</span>
            <span>{Math.round(calculations.totalAmount).toLocaleString('ru-RU')} {t('currency')}</span>
          </div>
          
          <div className="flex justify-between text-primary font-medium pt-2 border-t">
            <span>{t('monthlyPayment')}</span>
            <span>{calculations.monthlyPayment.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} {t('currency')}</span>
          </div>
        </div>
      )}
    </div>
  );
}