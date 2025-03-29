import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

export const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
export const DEFAULT_PRODUCT_IMAGE = '/images/product-default.jpg';
export const DEFAULT_REVIEW_IMAGE = '/images/review-default.jpg';

export const ensureImageDirectory = () => {
  const imagesDir = path.join(process.cwd(), 'public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  return imagesDir;
};

const generateUniqueFileName = (originalName: string, index: number = 0): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  const slugifiedName = slugify(nameWithoutExt, { lower: true, strict: true });
  
  const finalName = index === 0 ? slugifiedName : `${slugifiedName}-${index}`;
  return `${finalName}${ext}`;
};

export const saveImage = async (file: Blob, productName: string): Promise<string> => {
  try {
    const imagesDir = ensureImageDirectory();
    
    const originalName = (file as any).name || 'image.jpg';
    
    let fileName = generateUniqueFileName(originalName);
    let fullPath = path.join(imagesDir, fileName);
    let index = 1;
    
    while (fs.existsSync(fullPath)) {
      fileName = generateUniqueFileName(originalName, index);
      fullPath = path.join(imagesDir, fileName);
      index++;
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    fs.writeFileSync(fullPath, buffer);
    
    return `/images/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

export const deleteImage = async (imageUrl: string) => {
  try {
    if (imageUrl === DEFAULT_PRODUCT_IMAGE) {
      return;
    }

    const imagePath = path.join(process.cwd(), 'public', imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}; 