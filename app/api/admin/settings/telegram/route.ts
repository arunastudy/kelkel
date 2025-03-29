import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'telegram_id' }
    });

    return NextResponse.json({ telegramId: setting?.value || '' });
  } catch (error) {
    console.error('Error getting telegram settings:', error);
    return NextResponse.json({ error: 'Ошибка при получении настроек Telegram' }, { status: 500 });
  }
}

// PUT /api/admin/settings/telegram
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { telegramId } = data;

    if (!telegramId) {
      return NextResponse.json({ error: 'ID Telegram не указан' }, { status: 400 });
    }

    const cleanTelegramId = telegramId.toString().trim();
    if (!/^\d+$/.test(cleanTelegramId)) {
      return NextResponse.json({ error: 'ID Telegram должен содержать только цифры' }, { status: 400 });
    }

    const setting = await prisma.settings.upsert({
      where: { key: 'telegram_id' },
      update: { value: cleanTelegramId },
      create: {
        key: 'telegram_id',
        value: cleanTelegramId
      }
    });

    return NextResponse.json({ 
      success: true,
      telegramId: setting.value
    });
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении настроек Telegram' }, { status: 500 });
  }
} 