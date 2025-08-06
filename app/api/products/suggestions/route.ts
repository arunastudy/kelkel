import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      }
    });

    // Форматируем результаты в формат подсказок
    const suggestions = products.map(product => ({
      text: product.name,
      category: product.category?.name || null,
      id: product.id
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении подсказок', suggestions: [] },
      { status: 500 }
    );
  }
}