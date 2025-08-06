'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { generateSlug } from '@/app/utils/helpers';
import ImportExportModal from '@/app/components/ImportExportModal';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: any[];
}

interface ProductImage {
  id: string | number;
  url: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: ProductImage[];
  productImages?: ProductImage[];
}

interface NewProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
}

interface FilterParams {
  search: string;
  categoryId: string;
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'name' | 'price' | 'category';
  sortOrder: 'asc' | 'desc';
  page: number;
  perPage: number;
}

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    isAvailable: true,
    categoryId: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>('');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    categoryId: '',
    availability: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    perPage: 100
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState<string>('1');
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const searchParams = new URLSearchParams({
        search: filters.search,
        categoryId: filters.categoryId,
        availability: filters.availability,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page.toString(),
        perPage: filters.perPage.toString()
      });

      const response = await fetch(`/api/admin/products?${searchParams}`, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalProducts(data.total);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке товаров');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?all=true');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке категорий');
      }
      const data = await response.json();
      const categoriesData = Array.isArray(data) ? data : (data.categories || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      setError('Ошибка при загрузке категорий');
      setCategories([]);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      slug: '',
      description: '',
      price: 0,
      isAvailable: true,
      categoryId: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteImage = async (imageId: string | number) => {
    if (!editingProduct) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/products/${editingProduct.id}/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении изображения');
      }
      
      // Получаем URL изображения из текущего состояния
      const imageToDelete = editingProduct.images.find(img => img.id === imageId);
      if (imageToDelete) {
        // Удаляем файл изображения через API
        await fetch(`/api/admin/cloudinary/delete?url=${encodeURIComponent(imageToDelete.url)}`, {
          method: 'DELETE',
        });
      }
      
      // Обновляем список изображений в редактируемом продукте
      const updatedImages = (editingProduct.images || editingProduct.productImages || [])
        .filter(img => img.id !== imageId);
      
      setEditingProduct({
        ...editingProduct,
        images: updatedImages,
        productImages: updatedImages
      });
      
      // Если удалили все изображения, показываем сообщение о добавлении изображения по умолчанию
      if (updatedImages.length === 0 && selectedFiles.length === 0) {
        const defaultImage: ProductImage = {
          id: 'default-temp',
          url: '/images/product-default.png'
        };
        
        setEditingProduct({
          ...editingProduct,
          images: [defaultImage],
          productImages: [defaultImage]
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при удалении изображения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Сначала загружаем изображения
      const uploadedImageUrls = [];
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', newProduct.name);
        
        const response = await fetch('/api/admin/cloudinary/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке изображения');
        }
        
        const data = await response.json();
        uploadedImageUrls.push(data.imageUrl);
      }
      
      // Затем создаем или обновляем продукт
      const productFormData = new FormData();
      productFormData.append('name', newProduct.name);
      productFormData.append('slug', newProduct.slug || generateSlug(newProduct.name));
      productFormData.append('description', newProduct.description || '');
      productFormData.append('price', newProduct.price.toString());
      productFormData.append('categoryId', newProduct.categoryId);
      productFormData.append('isAvailable', newProduct.isAvailable.toString());
      
      // Добавляем URL загруженных изображений
      uploadedImageUrls.forEach(url => {
        productFormData.append('imageUrls', url);
      });
      
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: productFormData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при сохранении товара');
      }

      const savedProduct = await response.json();
      
      // Обновляем список продуктов
      setProducts(prevProducts => {
        if (editingProduct) {
          return prevProducts.map(p => 
            p.id === savedProduct.id ? savedProduct : p
          );
        } else {
          return [savedProduct, ...prevProducts];
        }
      });

      // Сбрасываем форму
      setNewProduct({
        name: '',
        slug: '',
        description: '',
        price: 0,
        isAvailable: true,
        categoryId: ''
      });
      setSelectedFiles([]);
      setIsModalOpen(false);
      
      // Обновляем список продуктов
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при сохранении товара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
        } else {
          const error = await response.json();
          alert(error.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'price') {
      setNewProduct(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'isAvailable') {
      setNewProduct(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'categoryId') {
      setNewProduct(prev => ({
        ...prev,
        [name]: value || ''
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const applySearch = () => {
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch();
    }
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId, page: 1 }));
  };

  const handleAvailabilityFilter = (availability: FilterParams['availability']) => {
    setFilters(prev => ({ ...prev, availability, page: 1 }));
  };

  const handleSort = (sortBy: FilterParams['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    setCurrentPage(page.toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const page = parseInt(currentPage);
      if (!isNaN(page) && page > 0 && page <= Math.ceil(totalProducts / filters.perPage)) {
        handlePageChange(page);
      } else {
        setCurrentPage(filters.page.toString());
      }
    }
  };

  useEffect(() => {
    setCurrentPage(filters.page.toString());
  }, [filters.page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-8">
      {/* ... остальной JSX без изменений ... */}
    </div>
  );
}