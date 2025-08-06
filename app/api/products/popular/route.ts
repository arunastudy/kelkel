import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        images: true,
        category: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении популярных товаров' },
      { status: 500 }
    );
  }
}