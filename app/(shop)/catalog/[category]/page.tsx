'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/app/components/ProductCard';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import Pagination from '@/app/components/Pagination';
import SortSelect from '@/app/components/SortSelect';
import CategoryProductSearchBar from '@/app/components/CategoryProductSearchBar';

import { Product } from '@/app/types';

interface Category {
  id: string;
  name: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name-asc');
  const { t } = useLanguageContext();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(t('error'));
      }
    };

    fetchCategory();
  }, [categoryId, t]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const [field, order] = sort.split('-');
        const searchParams = new URLSearchParams({
          page: page.toString(),
          categoryId,
          sortBy: field,
          sortOrder: order,
          ...(search && { search }),
        });

        const response = await fetch(`/api/products?${searchParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(t('error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, page, sort, search, t]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{category?.name || t('catalog')}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
            >
              {t('tryAgainLater')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{category?.name || t('catalog')}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="w-full sm:w-96">
            <CategoryProductSearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder={t('searchProducts')}
            />
          </div>
          <div className="w-full sm:w-64">
            <SortSelect
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              options={[
                { value: 'name-asc', label: t('sortNameAZ') },
                { value: 'name-desc', label: t('sortNameZA') },
                { value: 'price-asc', label: t('priceLowToHigh') },
                { value: 'price-desc', label: t('priceHighToLow') },
                { value: 'createdAt-desc', label: t('newest') }
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t('noResults')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
