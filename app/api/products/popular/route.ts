import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Получаем все доступные товары
    const allProducts = await prisma.product.findMany({
      where: {
        isAvailable: true
      },
      include: {
        images: true,
        category: true
      }
    });

    // Группируем товары по категориям
    const productsByCategory: { [key: string]: any[] } = {};
    allProducts.forEach(product => {
      const categoryId = product.categoryId;
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = [];
      }
      productsByCategory[categoryId].push(product);
    });

    // Выбираем случайные товары из каждой категории
    const randomProducts: any[] = [];
    const categoryIds = Object.keys(productsByCategory);
    const maxProductsPerCategory = Math.max(1, Math.floor(50 / categoryIds.length));
    
    for (const categoryId of categoryIds) {
      const products = productsByCategory[categoryId];
      // Перемешиваем товары в категории
      const shuffledProducts = products.sort(() => Math.random() - 0.5);
      // Берем до maxProductsPerCategory товаров из каждой категории
      const selectedFromCategory = shuffledProducts.slice(0, maxProductsPerCategory);
      randomProducts.push(...selectedFromCategory);
    }

    // Если у нас меньше 50 товаров, добираем случайными из всех оставшихся
    if (randomProducts.length < 50) {
      const remainingProducts = allProducts.filter(p => 
        !randomProducts.some(rp => rp.id === p.id)
      );
      const shuffledRemaining = remainingProducts.sort(() => Math.random() - 0.5);
      const needed = Math.min(50 - randomProducts.length, shuffledRemaining.length);
      randomProducts.push(...shuffledRemaining.slice(0, needed));
    }

    // Финальное перемешивание всех выбранных товаров
    const finalProducts = randomProducts.sort(() => Math.random() - 0.5).slice(0, 50);

    return NextResponse.json(finalProducts);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении популярных товаров' },
      { status: 500 }
    );
  }
}