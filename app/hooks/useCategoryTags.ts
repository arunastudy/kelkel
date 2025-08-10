'use client';

import { useEffect, useState } from 'react';
import { useCategories } from './useCategories';

export function useCategoryTags() {
  const { data, isLoading, error } = useCategories('', 1, 'name', 'asc', 100); // Увеличиваем лимит до 100 категорий
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (data?.categories) {
      setCategories(data.categories.map(cat => ({
        id: cat.id,
        name: cat.name
      })));
    }
  }, [data]);

  return { categories, isLoading, error };
}
