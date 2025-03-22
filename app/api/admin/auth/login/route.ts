import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    // Получаем учетные данные администратора из базы данных
    const adminSettings = await prisma.settings.findFirst({
      where: { key: 'admin_credentials' }
    });

    if (!adminSettings) {
      // Если учетные данные не найдены, используем значения по умолчанию
      const defaultCredentials = {
        login: 'admin',
        password: await bcrypt.hash('admin', 10)
      };

      // Сохраняем значения по умолчанию в базу данных
      await prisma.settings.create({
        data: {
          key: 'admin_credentials',
          value: JSON.stringify(defaultCredentials)
        }
      });

      // Проверяем введенные данные с данными по умолчанию
      if (login === 'admin' && password === 'admin') {
        const token = jwt.sign(
          { userId: 'admin', role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const response = NextResponse.json({ success: true });
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 // 24 часа
        });

        return response;
      }
    } else {
      const adminCredentials = JSON.parse(adminSettings.value);
      
      // Проверяем логин и пароль
      if (login === adminCredentials.login) {
        const isValidPassword = await bcrypt.compare(password, adminCredentials.password);
        
        if (isValidPassword) {
          const token = jwt.sign(
            { userId: 'admin', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          const response = NextResponse.json({ success: true });
          response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 часа
          });

          return response;
        }
      }
    }

    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Ошибка при попытке входа' },
      { status: 500 }
    );
  }
} 