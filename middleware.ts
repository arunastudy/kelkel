import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isMainAdminPage = request.nextUrl.pathname === '/admin';
  const isApiAuthRoute = request.nextUrl.pathname === '/api/admin/auth/login';

  // Пропускаем запросы к API авторизации
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Получаем токен из куки
  const token = request.cookies.get('auth_token')?.value;

  // Проверяем токен
  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  // Если это главная страница админки и пользователь не авторизован,
  // разрешаем доступ для отображения формы входа
  if (isMainAdminPage && !isValidToken) {
    return NextResponse.next();
  }

  // Для всех остальных маршрутов админки проверяем авторизацию
  if (isAdminPage) {
    if (!isValidToken) {
      // Если это API запрос, возвращаем 401
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // Для остальных маршрутов перенаправляем на главную страницу админки
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Получаем текущий язык из cookie
  let language = request.cookies.get('preferred_language')?.value;

  // Если язык не установлен, используем русский по умолчанию
  if (!language || (language !== 'ru' && language !== 'ky')) {
    language = 'ru';
  }

  const response = NextResponse.next();

  // Устанавливаем cookie с языком, если его нет
  if (!request.cookies.has('preferred_language')) {
    response.cookies.set('preferred_language', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 год
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/:path*'
  ]
}; 