import { useState, useEffect } from 'react';
import { Product } from '@/app/types';

interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useProducts(
  categoryId: string = '',
  search: string = '',
  page: number = 1,
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
  filters: Record<string, any> = {}
) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          categoryId,
          search,
          page: page.toString(),
          sortBy,
          sortOrder,
          filters: JSON.stringify(filters)
        });

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, search, page, sortBy, sortOrder, filters]);

  return { data, isLoading, error };
} 