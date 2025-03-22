'use server';

import { promises as fs } from 'fs';
import path from 'path';

export async function saveImage(file: File, slug: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${slug}${ext}`;
  const publicPath = path.join(process.cwd(), 'public', 'images');
  
  // Создаем директорию, если она не существует
  await fs.mkdir(publicPath, { recursive: true });
  
  const filePath = path.join(publicPath, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `/images/${fileName}`;
}

export async function deleteImage(imageUrl: string) {
  if (!imageUrl) return;
  
  const fileName = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
} 