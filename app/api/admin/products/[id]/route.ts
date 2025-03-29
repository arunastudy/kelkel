import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { uploadImage } from '@/app/utils/cloudinary';
import { DEFAULT_PRODUCT_IMAGE } from '../route';

const prisma = new PrismaClient();

interface ProductImage {
  url: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  slug?: string;
  images: ProductImage[];
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const productId = params.id;

    // Извлекаем данные из FormData
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const price = parseFloat(priceStr);
    const categoryId = formData.get('categoryId') as string;
    const isAvailableStr = formData.get('isAvailable') as string;
    const isAvailable = isAvailableStr === 'true';
    const slugFromForm = formData.get('slug') as string;
    const removeDefaultImage = formData.get('removeDefaultImage') === 'true';
    const useDefaultImage = formData.get('useDefaultImage') === 'true';
    
    // Получаем файлы изображений
    const imageFiles = formData.getAll('images');

    // Проверяем обязательные поля
    if (!name || isNaN(price) || !categoryId) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Генерируем slug из названия, если он не предоставлен
    const slug = slugFromForm || slugify(name, { lower: true, strict: true });

    // Проверяем уникальность slug
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: productId }
      } as any
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Товар с таким URL уже существует' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Указанная категория не существует' },
        { status: 400 }
      );
    }

    // Получаем текущий продукт
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Обновляем основные данные продукта
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        description,
        price,
        categoryId,
        isAvailable
      }
    });

    // Если загружены новые изображения
    const validImageFiles = imageFiles.filter(file => 
      file instanceof Blob && file.size > 0
    );

    if (validImageFiles.length > 0) {
      // Удаляем все существующие изображения
      await prisma.image.deleteMany({
        where: { productId }
      });

      // Загружаем новые изображения
      const uploadPromises = validImageFiles.map(async (file) => {
        try {
          const imageUrl = await uploadImage(file as Blob, name);
          return await prisma.image.create({
            data: {
              url: imageUrl,
              productId
            }
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          return null;
        }
      });

      await Promise.all(uploadPromises);
    } else if (useDefaultImage) {
      // Если нужно использовать изображение по умолчанию
      await prisma.image.deleteMany({
        where: { productId }
      });
      
      await prisma.image.create({
        data: {
          url: DEFAULT_PRODUCT_IMAGE,
          productId
        }
      });
    }

    // Получаем обновленный товар со всеми связанными данными
    const updatedProductWithImages = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true
      }
    });

    return NextResponse.json(updatedProductWithImages);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товара' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара не указан' },
        { status: 400 }
      );
    }

    // Проверяем существование продукта
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Сначала удаляем все связанные изображения
    await prisma.image.deleteMany({
      where: { productId }
    });

    // Затем удаляем сам продукт
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true, message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    );
  }
} 