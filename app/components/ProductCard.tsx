'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '../contexts/LanguageContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  slug: string;
}

export default function ProductCard({ id, name, price, images, slug }: ProductCardProps) {
  const { t } = useLanguageContext();
  
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
                {price.toLocaleString()} c
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 flex items-center justify-between">
        <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex-grow mr-2">
          {t('addToCart')}
        </button>
        <button className="p-2 text-gray-400 hover:text-primary border border-gray-200 rounded-lg transition-colors duration-200">
          <HeartIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 