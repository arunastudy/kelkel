import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'telegram_id' }
    });

    return NextResponse.json(setting || { value: '' });
  } catch (error) {
    console.error('Error fetching telegram setting:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении настроек' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/telegram
export async function PUT(request: Request) {
  try {
    const { value } = await request.json();

    if (!value) {
      return NextResponse.json(
        { error: 'ID Telegram обязателен' },
        { status: 400 }
      );
    }

    // Валидация формата ID Telegram (только цифры и буквы)
    const telegramIdRegex = /^[a-zA-Z0-9_]{5,32}$/;
    if (!telegramIdRegex.test(value)) {
      return NextResponse.json(
        { error: 'Неверный формат ID Telegram. Используйте только буквы, цифры и знак подчеркивания (5-32 символа)' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.upsert({
      where: { key: 'telegram_id' },
      update: { value },
      create: {
        key: 'telegram_id',
        value
      }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating telegram setting:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек' },
      { status: 500 }
    );
  }
} 