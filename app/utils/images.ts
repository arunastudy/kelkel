import { promises as fs } from 'fs';
import path from 'path';

export const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
export const DEFAULT_PRODUCT_IMAGE = '/images/product-default.jpg';
export const DEFAULT_REVIEW_IMAGE = '/images/review-default.jpg';

export async function ensureImageDirectory() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  }
}

export async function saveImage(file: Blob, prefix: string): Promise<string> {
  await ensureImageDirectory();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Генерируем уникальное имя файла с временной меткой
  const timestamp = Date.now();
  const fileName = `${prefix}-${timestamp}.jpg`;
  const filePath = path.join(IMAGES_DIR, fileName);

  await fs.writeFile(filePath, buffer);
  return `/images/${fileName}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || imageUrl === DEFAULT_PRODUCT_IMAGE || imageUrl === DEFAULT_REVIEW_IMAGE) {
    return;
  }

  const fileName = path.basename(imageUrl);
  const filePath = path.join(IMAGES_DIR, fileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
} 