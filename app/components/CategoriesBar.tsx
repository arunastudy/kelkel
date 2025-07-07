'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguageContext } from '../contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { language } = useLanguageContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center h-12 space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide py-2 sm:py-0">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog/${category.slug}`}
            className="flex-shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 
                     border border-gray-200 rounded-full hover:bg-gray-50 
                     hover:border-gray-300 transition-colors whitespace-nowrap
                     bg-transparent"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
} 