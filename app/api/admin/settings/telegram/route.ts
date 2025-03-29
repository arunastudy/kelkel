import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'telegramId' }
    });

    let telegramId = '';
    if (setting?.value) {
      try {
        const data = JSON.parse(setting.value);
        telegramId = data.value || '';
      } catch (e) {
        telegramId = '';
      }
    }

    return NextResponse.json({ telegramId });
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

    if (!telegramId) {
      return NextResponse.json(
        { error: 'ID Telegram не указан' },
        { status: 400 }
      );
    }

    // Очищаем ID от пробелов и проверяем формат
    const cleanTelegramId = telegramId.toString().trim();
    if (!/^\d+$/.test(cleanTelegramId)) {
      return NextResponse.json(
        { error: 'ID Telegram должен содержать только цифры' },
        { status: 400 }
      );
    }

    // Сохраняем в JSON формате
    const jsonValue = JSON.stringify({
      value: cleanTelegramId
    });

    const setting = await prisma.settings.upsert({
      where: { key: 'telegramId' },
      update: { value: jsonValue },
      create: {
        key: 'telegramId',
        value: jsonValue
      }
    });

    // Парсим значение обратно для ответа
    const savedData = JSON.parse(setting.value);

    return NextResponse.json({
      success: true,
      telegramId: savedData.value
    });
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек Telegram' },
      { status: 500 }
    );
  }
} 