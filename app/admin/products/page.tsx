'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { generateSlug } from '@/app/utils/helpers';
import { v2 as cloudinary } from 'cloudinary';
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

// Добавляем интерфейс для параметров фильтрации
interface FilterParams {
  search: string;
  categoryId: string;
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'name' | 'price' | 'category';
  sortOrder: 'asc' | 'desc';
  page: number;
  perPage: number;
}

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Функция для удаления изображения из Cloudinary через API
async function deleteImage(url: string) {
  try {
    const response = await fetch(`/api/admin/cloudinary?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении изображения');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
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
    perPage: 10
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
      const response = await fetch('/api/admin/categories?all=true'); // Запрашиваем все категории
      if (!response.ok) {
        throw new Error('Ошибка при загрузке категорий');
      }
      const data = await response.json();
      
      // Правильно обрабатываем ответ от API
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

  const uploadImages = async (name: string) => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const { imageUrl } = await response.json();
        uploadedUrls.push(imageUrl);
      }
    }
    
    return uploadedUrls;
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
        // Удаляем файл изображения
        await deleteImage(imageToDelete.url);
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
        // Изображение по умолчанию будет добавлено автоматически на сервере
        // Обновляем UI, чтобы показать пользователю, что будет использовано изображение по умолчанию
        const defaultImage: ProductImage = {
          id: 'default-temp',
          url: '/images/product-default.jpg'
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
        
        const response = await fetch('/api/admin/upload', {
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
      // Преобразуем строку в число для цены
      setNewProduct(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'isAvailable') {
      // Обрабатываем чекбокс
      setNewProduct(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'categoryId') {
      // Обрабатываем выбор категории
      setNewProduct(prev => ({
        ...prev,
        [name]: value || ''
      }));
    } else {
      // Обрабатываем остальные поля
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Добавляем функции для управления фильтрами
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

  // Функция для обрезки длинного текста
  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Товары
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowImportExport(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Импорт/Экспорт
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить товар
            </button>
          </div>
        </div>

        {/* Панель фильтров */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-5 rounded-xl mb-6 shadow-xl shadow-black/20 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Поиск */}
            <div>
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  ref={searchInputRef}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-700/70 border border-gray-600/50 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-300"
                />
                <button
                  onClick={applySearch}
                  className="px-4 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-r-lg transition-all duration-300 flex items-center"
                >
                  <span className="mr-2">Найти</span>
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Фильтр по категории */}
            <div>
              <select
                value={filters.categoryId}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-300 appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-right-4 bg-center-y max-h-60"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              >
                <option value="">Все категории</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по наличию */}
            <div>
              <select
                value={filters.availability}
                onChange={(e) => handleAvailabilityFilter(e.target.value as FilterParams['availability'])}
                className="w-full px-4 py-2.5 bg-gray-700/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-300 appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-right-4 bg-center-y"
              >
                <option value="all">Все товары</option>
                <option value="available">В наличии</option>
                <option value="unavailable">Нет в наличии</option>
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSort(e.target.value as FilterParams['sortBy'])}
                className="w-full px-4 py-2.5 bg-gray-700/70 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-300 appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-right-4 bg-center-y"
              >
                <option value="name">По названию</option>
                <option value="price">По цене</option>
                <option value="category">По категории</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-3 rounded-lg mb-6 shadow-lg animate-pulse">
            {error}
          </div>
        )}

        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl shadow-black/20 border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-700/50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200"
                  onClick={() => handleSort('name')}
                >
                  Название {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200"
                  onClick={() => handleSort('category')}
                >
                  Категория {filters.sortBy === 'category' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200"
                  onClick={() => handleSort('price')}
                >
                  Цена {filters.sortBy === 'price' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Изображения</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                    <p className="mt-4 text-gray-400">Загрузка товаров...</p>
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="group hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-medium cursor-pointer" onClick={() => handleEditProduct(product)}>
                      <span title={product.name}>{truncateText(product.name)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 cursor-pointer" onClick={() => handleEditProduct(product)}>
                      {product.category?.name || 'Без категории'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary cursor-pointer" onClick={() => handleEditProduct(product)}>
                      {product.price.toLocaleString('ru-RU')} сом
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleEditProduct(product)}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {product.isAvailable ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleEditProduct(product)}>
                      <div className="flex -space-x-3">
                        {(product.images || []).slice(0, 3).map((image, index) => (
                          <img
                            key={image.id || index}
                            src={image.url}
                            alt=""
                            className="w-10 h-10 rounded-full ring-2 ring-gray-800 object-cover shadow-md hover:scale-110 transition-transform duration-200 z-[1] hover:z-10"
                          />
                        ))}
                        {(product.images || []).length > 3 && (
                          <div className="w-10 h-10 rounded-full ring-2 ring-gray-800 bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 shadow-md z-[1]">
                            +{(product.images || []).length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2 opacity-100">
                        <button 
                          className="text-gray-400 hover:text-primary p-2 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {error ? (
                      <div className="flex flex-col items-center">
                        <p className="mb-4">{error}</p>
                        <button 
                          onClick={fetchProducts}
                          className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 text-white"
                        >
                          Попробовать снова
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <p className="text-xl mb-2">Товары не найдены</p>
                        <p className="text-gray-500 mb-4">Попробуйте изменить параметры поиска или добавьте новый товар</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalProducts > filters.perPage && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Показано {(filters.page - 1) * filters.perPage + 1} - {Math.min(filters.page * filters.perPage, totalProducts)} из {totalProducts}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200 shadow-lg shadow-black/20"
              >
                Назад
              </button>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Страница:</span>
                <input
                  type="text"
                  value={currentPage}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  className="w-16 px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-primary/70 transition-all duration-200"
                  aria-label="Номер страницы"
                />
                <span className="text-gray-400 ml-2">из {Math.ceil(totalProducts / filters.perPage)}</span>
              </div>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page * filters.perPage >= totalProducts}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200 shadow-lg shadow-black/20"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl my-8 mx-4 relative overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-700/50 animate-scaleIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Название
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  name="name"
                  className="w-full px-4 py-3 bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-primary/70 outline-none transition-all duration-200 border border-gray-600/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Описание
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={handleInputChange}
                  name="description"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-primary/70 outline-none transition-all duration-200 border border-gray-600/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Цена
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  name="price"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-primary/70 outline-none transition-all duration-200 border border-gray-600/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Категория
                </label>
                <select
                  name="categoryId"
                  value={newProduct.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-primary/70 outline-none transition-all duration-200 border border-gray-600/50 appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-right-4 bg-center-y"
                >
                  <option value="">Выберите категорию</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Изображения
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="w-full px-4 py-3 bg-gray-700/70 rounded-lg text-white border border-gray-600/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newProduct.isAvailable}
                  onChange={handleInputChange}
                  name="isAvailable"
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-600 rounded transition-all duration-200"
                />
                <label className="ml-2 block text-sm text-gray-300">
                  В наличии
                </label>
              </div>

              {/* Текущие изображения */}
              {editingProduct && (editingProduct.images || editingProduct.productImages).length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Текущие изображения
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(editingProduct.images || editingProduct.productImages).map((image) => (
                      <div key={image.id} className="relative group overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id.toString());
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-lg"
                        >
                          <XMarkIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors duration-200 border border-gray-600 hover:border-gray-500 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      Сохранение...
                    </span>
                  ) : (
                    editingProduct ? 'Сохранить' : 'Создать'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportExport && (
        <ImportExportModal
          onClose={() => {
            setShowImportExport(false);
            fetchProducts();
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 