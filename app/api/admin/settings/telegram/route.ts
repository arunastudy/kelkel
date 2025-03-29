import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'telegram_id' }
    });

    return NextResponse.json({ telegramId: setting?.value || '' });
  } catch (error) {
    console.error('Error getting telegram settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении настроек Telegram' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/telegram
export async function PUT(request: NextRequest) {
  if (request.method !== 'PUT') {
    return NextResponse.json(
      { error: 'Метод не поддерживается' },
      { status: 405 }
    );
  }

  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    const { telegramId } = data;

    if (!telegramId || typeof telegramId !== 'string') {
      return NextResponse.json(
        { error: 'ID Telegram не указан или имеет неверный формат' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.upsert({
      where: { key: 'telegram_id' },
      update: { value: telegramId },
      create: {
        key: 'telegram_id',
        value: telegramId
      }
    });

    return NextResponse.json({ 
      success: true,
      telegramId: setting.value 
    });
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек Telegram' },
      { status: 500 }
    );
  }
} 