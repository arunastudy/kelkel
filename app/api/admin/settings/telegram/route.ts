import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/settings/telegram
export async function GET() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'telegram_id' }
    });

    return new Response(
      JSON.stringify({ telegramId: setting?.value || '' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error getting telegram settings:', error);
    return new Response(
      JSON.stringify({ error: 'Ошибка при получении настроек Telegram' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// PUT /api/admin/settings/telegram
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { telegramId } = data;

    if (!telegramId) {
      return new Response(
        JSON.stringify({ error: 'ID Telegram не указан' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const cleanTelegramId = telegramId.toString().trim();
    if (!/^\d+$/.test(cleanTelegramId)) {
      return new Response(
        JSON.stringify({ error: 'ID Telegram должен содержать только цифры' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await prisma.settings.upsert({
      where: { key: 'telegram_id' },
      update: { value: cleanTelegramId },
      create: {
        key: 'telegram_id',
        value: cleanTelegramId
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return new Response(
      JSON.stringify({ error: 'Ошибка при обновлении настроек Telegram' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 