import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Удаляем куки auth_token
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Устанавливаем срок действия в 0 для немедленного удаления
    expires: new Date(0) // Устанавливаем дату истечения в прошлое
  });

  return response;
} 