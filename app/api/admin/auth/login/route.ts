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
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

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

        const response = NextResponse.json(
          { 
            success: true,
            redirect: '/admin'
          },
          { 
            status: 200,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );

        // Устанавливаем куки с более строгими параметрами
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 24 часа
          domain: process.env.NODE_ENV === 'production' ? '62.113.41.23' : undefined
        });

        return response;
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