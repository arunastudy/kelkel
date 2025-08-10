'use client';

import React from 'react';
import Link from 'next/link';
import { useCategoryTags } from '../hooks/useCategoryTags';

export default function CategoryTags() {
  const { categories, isLoading } = useCategoryTags();

  if (isLoading || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative w-full">
          <div className="py-2 sm:py-2 overflow-x-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-1.5 sm:gap-2 pb-1" style={{ minWidth: 'max-content' }}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog/${category.id}`}
                  className="flex-shrink-0 px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-[#f85125]/10 hover:text-[#f85125] hover:border-[#f85125] transition-all duration-200 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
