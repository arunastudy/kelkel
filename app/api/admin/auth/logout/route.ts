import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Удаляем куки auth_token
  response.cookies.delete('auth_token'); // Используем метод delete вместо set

  // Дополнительно пытаемся удалить куки с разными параметрами
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: -1,
    expires: new Date(0)
  });

  return response;
} 