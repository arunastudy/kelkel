import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Новый формат конфигурации для Next.js
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const slug = formData.get('slug') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Файлы не найдены' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Не указан slug' },
        { status: 400 }
      );
    }

    const urls: string[] = [];
    let fileNumber = 1;

    for (const file of files) {
      if (!(file instanceof Blob)) {
        continue;
      }

      // Конвертируем Blob в base64
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64}`;

      // Загружаем в Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'products',
        public_id: `${slug}-${fileNumber}-${Date.now()}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });

      urls.push(result.secure_url);
      fileNumber++;
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файлов' },
      { status: 500 }
    );
  }
} 