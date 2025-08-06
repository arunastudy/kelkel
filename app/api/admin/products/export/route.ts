import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем все категории с их продуктами
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            isAvailable: true,
            slug: true,
            images: {
              select: {
                id: true,
                url: true
              }
            }
          }
        }
      }
    });

    // Создаем новую книгу Excel
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: "Продукты",
      Subject: "Экспорт товаров",
      Author: "Система",
      CreatedDate: new Date()
    };

    // Для каждой категории создаем отдельный лист
    for (const category of categories) {
      // Подготавливаем данные для листа
      const sheetData = category.products.map(product => ({
        'ID': product.id,
        'Название': product.name,
        'Описание': product.description || '',
        'Цена': product.price,
        'В наличии': product.isAvailable ? 'Да' : 'Нет',
        'URL': product.slug,
        'Изображения': product.images.map(img => img.url).join(', ')
      }));

      if (sheetData.length > 0) {
        // Создаем лист только если есть данные
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // Устанавливаем ширину столбцов
        const colWidths = [
          { wch: 40 }, // ID
          { wch: 50 }, // Название
          { wch: 60 }, // Описание
          { wch: 15 }, // Цена
          { wch: 15 }, // В наличии
          { wch: 30 }, // URL
          { wch: 100 }, // Изображения
        ];
        worksheet['!cols'] = colWidths;

        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      }
    }

    // Создаем общий лист со всеми продуктами
    const allProducts = categories.flatMap(category => 
      category.products.map(product => ({
        'ID': product.id,
        'Категория': category.name,
        'Название': product.name,
        'Описание': product.description || '',
        'Цена': product.price,
        'В наличии': product.isAvailable ? 'Да' : 'Нет',
        'URL': product.slug,
        'Изображения': product.images.map(img => img.url).join(', ')
      }))
    );

    if (allProducts.length > 0) {
      const allProductsWorksheet = XLSX.utils.json_to_sheet(allProducts);
      
      // Устанавливаем ширину столбцов для общего листа
      const colWidths = [
        { wch: 40 }, // ID
        { wch: 30 }, // Категория
        { wch: 50 }, // Название
        { wch: 60 }, // Описание
        { wch: 15 }, // Цена
        { wch: 15 }, // В наличии
        { wch: 30 }, // URL
        { wch: 100 }, // Изображения
      ];
      allProductsWorksheet['!cols'] = colWidths;

      // Добавляем общий лист в начало книги
      XLSX.utils.book_append_sheet(workbook, allProductsWorksheet, 'Все товары', true);
    }

    // Генерируем файл
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=products.xlsx'
      }
    });
  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: 'Ошибка при экспорте товаров' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}