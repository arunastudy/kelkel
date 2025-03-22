import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/admin/settings/credentials
export async function GET() {
  try {
    const credentials = await prisma.settings.findUnique({
      where: { key: 'admin_credentials' }
    });

    if (!credentials) {
      return NextResponse.json({ login: 'admin' });
    }

    const { login } = JSON.parse(credentials.value);
    return NextResponse.json({ login });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении учетных данных' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/credentials
export async function PUT(request: Request) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);

    // Сохраняем учетные данные
    const credentials = await prisma.settings.upsert({
      where: { key: 'admin_credentials' },
      update: {
        value: JSON.stringify({ login, password: hashedPassword })
      },
      create: {
        key: 'admin_credentials',
        value: JSON.stringify({ login, password: hashedPassword })
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении учетных данных' },
      { status: 500 }
    );
  }
} 