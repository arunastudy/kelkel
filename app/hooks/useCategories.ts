import { useState, useEffect } from 'react';
import { Category } from '@/app/types/index';

interface CategoriesResponse {
  categories: Category[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useCategories(
  search: string = '',
  page: number = 1,
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          page: page.toString(),
          sortBy,
          sortOrder
        });

        const response = await fetch(`/api/categories?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
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

    fetchCategories();
  }, [search, page, sortBy, sortOrder]);

  return { data, isLoading, error };
} 