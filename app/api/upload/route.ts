import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const slug = formData.get('slug');

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
      if (!(file instanceof File)) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${slug}${fileNumber}${path.extname(file.name)}`;
      const filepath = path.join(process.cwd(), 'public', 'images', filename);

      await writeFile(filepath, buffer);
      urls.push(`/images/${filename}`);
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