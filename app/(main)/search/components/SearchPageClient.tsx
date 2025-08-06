'use client';

import { useState, useEffect } from 'react';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import ProductCard from '@/app/components/ProductCard';
import type { Product } from '@/app/types';

interface SearchPageClientProps {
  initialQuery: string;
}

export default function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguageContext();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!initialQuery.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(initialQuery)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialQuery, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('loading')}
        </button>
      </div>
    );
  }

  if (!initialQuery.trim()) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('enterSearchQuery')}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noResults')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t('searchResults')}: "{initialQuery}"
      </h1>
      <p className="text-gray-600 mb-6">
        {t('foundProducts', { count: products.length })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}