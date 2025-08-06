import { prisma } from '@/lib/prisma';
import HomePageClient from './HomePageClient';

async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      slug: true,
    },
    take: 8,
    orderBy: {
      createdAt: 'desc'
    }
  });
  return products;
}

async function getCarouselImages() {
  const settings = await prisma.settings.findFirst({
    where: { key: 'advertising_pictures' },
    select: { value: true }
  });
  
  if (!settings?.value) return [];
  
  try {
    const value = JSON.parse(settings.value as string);
    return value.images || [];
  } catch {
    return [];
  }
}

export default async function HomePageServer() {
  const [products, carouselImages] = await Promise.all([
    getProducts(),
    getCarouselImages()
  ]);

  return (
    <HomePageClient 
      initialProducts={products} 
      initialCarouselImages={carouselImages} 
    />
  );
}