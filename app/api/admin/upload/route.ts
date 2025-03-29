import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Конвертируем Blob в base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Генерируем имя файла
    const fileName = name.toLowerCase().replace(/\s+/g, '-');

    // Загружаем в Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'products',
      public_id: `${fileName}-${Date.now()}`,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    return NextResponse.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 