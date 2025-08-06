import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductPageClient from './ProductPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true, description: true }
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      category: true,
    }
  });

  return <ProductPageClient initialProduct={product} />;
}