import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: {
          select: {
            url: true
          }
        }
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching cart products:', error);
    return NextResponse.json({ error: 'Failed to fetch cart products' }, { status: 500 });
  }
}