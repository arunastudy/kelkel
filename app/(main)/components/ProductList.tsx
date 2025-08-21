'use client';

import ProductCard from '@/app/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  slug: string;
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      {products.map((product) => (
        <ProductCard 
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}