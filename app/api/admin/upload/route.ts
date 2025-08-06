import { NextRequest, NextResponse } from 'next/server';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!IMGBB_API_KEY) {
      throw new Error('IMGBB_API_KEY не найден в переменных окружения');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Конвертируем файл в base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');

    // Создаем URLSearchParams для отправки данных
    const params = new URLSearchParams();
    params.append('key', IMGBB_API_KEY);
    params.append('image', base64Image);

    // Отправляем запрос к imgbb API
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ImgBB API error:', errorData);
      throw new Error('Ошибка при загрузке изображения на imgbb');
    }

    const data = await response.json();
    
    if (!data.data?.url) {
      console.error('ImgBB response:', data);
      throw new Error('Некорректный ответ от imgbb');
    }

    // Возвращаем URL загруженного изображения
    return NextResponse.json({ 
      imageUrl: data.data.url,
      // Также возвращаем дополнительные URL, которые могут быть полезны
      thumbnailUrl: data.data.thumb?.url,
      mediumUrl: data.data.medium?.url,
      deleteUrl: data.data.delete_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}