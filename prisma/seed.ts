import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очистка существующих данных
  await prisma.$executeRaw`TRUNCATE TABLE "Image" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Product" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;

  // Создание категорий
  const smartphones = await prisma.category.create({
    data: {
      name: 'Смартфоны',
      slug: 'smartphones',
      description: 'Современные мобильные устройства'
    }
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Ноутбуки',
      slug: 'laptops',
      description: 'Портативные компьютеры для работы и развлечений'
    }
  });

  const tablets = await prisma.category.create({
    data: {
      name: 'Планшеты',
      slug: 'tablets',
      description: 'Универсальные устройства для работы и развлечений'
    }
  });

  // Создание продуктов для каждой категории
  const createProducts = async (category: { id: string, name: string }, count: number) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
      const name = `${category.name} ${i}`;
      const product = await prisma.product.create({
        data: {
          name,
          slug: slugify(`${category.name}-${i}`, { lower: true, strict: true }),
          description: `Описание для ${category.name.toLowerCase()} ${i}`,
          price: Math.floor(Math.random() * 50000) + 30000,
          categoryId: category.id,
          isAvailable: true,
          images: {
            create: [
              {
                url: '/images/product-default.png'
              }
            ]
          }
        }
      });
      products.push(product);
    }
    return products;
  };

  await createProducts(smartphones, 5);
  await createProducts(laptops, 5);
  await createProducts(tablets, 5);

  // Хешируем новый пароль
  const hashedPassword = await hash('admin123', 10);
  
  // Обновляем учетные данные администратора
  await prisma.settings.upsert({
    where: { key: 'admin_credentials' },
    update: {
      value: JSON.stringify({ login: 'admin', password: hashedPassword })
    },
    create: {
      key: 'admin_credentials',
      value: JSON.stringify({ login: 'admin', password: hashedPassword })
    }
  });
  
  console.log('Пароль администратора успешно обновлен');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 