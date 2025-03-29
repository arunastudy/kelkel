import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings || { telegramId: '' });
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
  try {
    const data = await request.json();
    const { telegramId } = data;

    if (!telegramId) {
      return NextResponse.json(
        { error: 'ID Telegram не указан' },
        { status: 400 }
      );
    }

    // Получаем текущие настройки
    let settings = await prisma.settings.findFirst();

    if (settings) {
      // Обновляем существующие настройки
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { telegramId }
      });
    } else {
      // Создаем новые настройки, если они не существуют
      settings = await prisma.settings.create({
        data: { telegramId }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек Telegram' },
      { status: 500 }
    );
  }
} 