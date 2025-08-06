import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: 'installment' }
    });

    if (!settings) {
      return NextResponse.json({ installments: [] });
    }

    const installments = JSON.parse(settings.value);
    
    return new NextResponse(JSON.stringify({ installments }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching installment settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installment settings' },
      { status: 500 }
    );
  }
}