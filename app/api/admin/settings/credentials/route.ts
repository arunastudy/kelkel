import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/admin/settings/credentials
export async function GET() {
  try {
    const setting = await prisma.settings.findFirst({
      where: { key: 'admin_credentials' }
    });

    if (!setting?.value) {
      return NextResponse.json({ login: '' });
    }

    const credentials = JSON.parse(setting.value);
    return NextResponse.json({ login: credentials.login });
  } catch (error) {
    console.error('Error getting credentials:', error);
    return NextResponse.json({ error: 'Ошибка при получении учетных данных' }, { status: 500 });
  }
}

// PUT /api/admin/settings/credentials
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { login, password } = data;

    if (!login) {
      return NextResponse.json({ error: 'Логин не указан' }, { status: 400 });
    }

    // Получаем текущие учетные данные
    const currentSetting = await prisma.settings.findFirst({
      where: { key: 'admin_credentials' }
    });

    let currentCredentials = { login: '', password: '' };
    if (currentSetting?.value) {
      currentCredentials = JSON.parse(currentSetting.value);
    }

    // Если пароль не предоставлен, используем существующий
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10)
      : currentCredentials.password;

    const credentials = {
      login,
      password: hashedPassword
    };

    await prisma.settings.upsert({
      where: { key: 'admin_credentials' },
      update: { value: JSON.stringify(credentials) },
      create: {
        key: 'admin_credentials',
        value: JSON.stringify(credentials)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении учетных данных' }, { status: 500 });
  }
} 